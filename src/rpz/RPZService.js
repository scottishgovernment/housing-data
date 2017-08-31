'use strict';

/**

TODO:
    api tests

    CPI Updater does not work in the case where there is no data in ES and
    up to date cpi datae

**/

/**
 * RPZService backed by couchdb.
 **/
const async = require('async');
const moment = require('moment');
const DATE_TIME_FORMAT = 'YYYY-MM-DD';

class RPZService {

    constructor(rpzDB, mapcloud) {
        this.rpzDB = rpzDB;
        this.mapcloud = mapcloud;
    }

    /**
     * Get a rent pressure zone via its id.
     **/
    get(id, callback) {
        this.rpzDB.get(id, callback);
    }

    /**
     * Delete a rent pressure zone via its id.
     **/
    delete(id, username, callback) {

        // fetch the item by its id
        this.rpzDB.get(id, (err, rpz) => {
            if (err) {
                callback(err, rpz);
                return;
            }

            // set the deleted flag and then save it
            rpz.deleted = true;
            rpz.username = username;
            rpz.timestamp = Date.now();
            this.rpzDB.atomic('rpz', 'update', id, rpz, callback);
        });
    }

    /**
     * List the non deleted rent pressure zones, id and revisions.
     **/
    list(callback) {
        this.rpzDB.list((err, results) => {
            if (err) {
                callback(err);
                return;
            }
            callback(undefined,
                results.rows
                    .filter(row => row.id !== '_design/rpz')
                    .map(row => {
                        return {
                            id: row.id,
                            rev: row.value.rev
                        };
                    }));
        });
    }

    /**
     * List the non deleted rent pressure zones returning detail
     **/
    listDetail(callback) {

        this.rpzDB.view('rpz', 'rpz', (err, results) => {
            if (err) {
                callback(err);
                return;
            }

            callback(undefined,
                results.rows
                    .filter(row => row.id !== '_design/rpz')
                    .map(row => {
                        row.value.id = row.value._id;
                        delete row.value._id;
                        return row.value;
                    }));
        });
    }

    /**
     * Create a rent pressure zone.
     **/
    create(rpz, username, callback) {
        rpz.postcodes = rpz.postcodes.map(pc => pc.toUpperCase());
        this.validate(undefined, rpz, (errors) => {
            if (errors.length > 0) {
                callback(errors);
                return;
            }
            rpz.username = username;
            rpz.timestamp = Date.now();
            rpz.history = [];

            this.rpzDB.insert(rpz, callback);
        });
    }

    /**
     * Update a rent pressure zone
     **/
    update(id, rpz, username, callback) {
        rpz.postcodes = rpz.postcodes.map(pc => pc.toUpperCase());
        this.validate(id, rpz, (errors) => {
            if (errors.length > 0) {
                callback(errors);
                return;
            }
            rpz.username = username;
            rpz.timestamp = Date.now();
            rpz.history = [];
            this.rpzDB.atomic('rpz', 'update', id, rpz, callback);
        });
    }

    validate(id, rpz, callback) {
        var errors = [];
        validateDates(rpz, errors);

        // must specify at least one uprn or postcodesForUprns
        if (rpz.postcodes.length + rpz.uprns.length === 0) {
            errors.push({
                field: 'postcodes',
                message: 'Must specify at least one Postcode or UPRN'
            });
        }

        if (errors.length > 0) {
            callback(errors);
            return;
        }

        fetchValidationData(rpz, this,
            (err, postcodesForUprns, uprnsForPostcodes, existing) => {
                if (err) {
                    callback(err);
                    return;
                }

                // map existing RPZ's by postcodes and uprns.
                var existingByPostcode = {};
                var existingByUPRN = {};

                var rpzFromDate = moment(rpz.fromDate, DATE_TIME_FORMAT);
                var rpzToDate = moment(rpz.toDate, DATE_TIME_FORMAT);

                existing
                    // only include rpz's whose date range overlaps with this one
                    .filter(res => {
                        var resFromDate = moment(res.fromDate, DATE_TIME_FORMAT);
                        var resToDate = moment(res.toDate, DATE_TIME_FORMAT);
                        return resFromDate >= rpzFromDate && resFromDate <= rpzToDate ||
                            resToDate <= rpzFromDate && resToDate <= rpzToDate;
                    })

                    // do not include this rpz
                    .filter(res => res.id !== id)

                    // map them by postcode and uprn
                    .forEach(existingRpz => {
                        existingRpz.postcodes.forEach(pc => existingByPostcode[pc] = existingRpz);
                        existingRpz.uprns.forEach(uprn => existingByUPRN[uprn] = existingRpz);
                    });

                validateNewPostcodesDoNotClash(rpz, errors, existingByPostcode, postcodesForUprns);
                validateNewUPRNsDoNotClash(rpz, errors, existingByUPRN, uprnsForPostcodes);
                callback(errors);
            });
    }
}

function validateDates(rpz, errors) {
    const parsedFromDate = moment(rpz.fromDate, DATE_TIME_FORMAT);
    if (!parsedFromDate.isValid()) {
        errors.push({
            field: 'fromDate',
            value: rpz.fromDate,
            message: 'Invalid from date'
        });
    }

    const parsedToDate = moment(rpz.toDate, DATE_TIME_FORMAT);
    if (!parsedToDate.isValid()) {
        errors.push({
            field: 'toDate',
            value: rpz.toDate,
            message: 'Invalid to date'
        });
    }
}

function fetchValidationData(rpz, service, callback) {
    async.series(
        [
            // lookup postcodes for all uprns
            seriesCb => async.concat(rpz.uprns,
                (uprn, cb) => service.mapcloud.postcodeForUprn(uprn, cb), seriesCb),

            // lookup the uprns for postcodes
            seriesCb => async.concat(rpz.postcodes,
                (pc, cb) => service.mapcloud.uprnsForPostcode(pc, cb), seriesCb),

            // get existing rpz's
            seriesCb => service.listDetail(seriesCb)
        ],

        (err, results) => {

            if (err) {
                callback([err]);
                return;
            }

            const postcodesForUprns = results[0];
            const uprnsForPostcodes = results[1];
            const existing = results[2];

            callback(undefined, postcodesForUprns, uprnsForPostcodes, existing);
        });
}

function validateNewPostcodesDoNotClash(rpz, errors, existingByPostcode, postcodesForUprns) {

    // do any of the new postcodes clash with an existing postcode?
    rpz.postcodes.forEach(postcode => {
        var clash = existingByPostcode[postcode];
        if (clash) {
            errors.push({
                field: 'postcode',
                value: postcode,
                clash: clash._id,
                message: 'This postcode is already used by RPZ: ' + clash.name
            });
        }
    });

    // does the postcode of any new UPRN clash with an existing one?
    postcodesForUprns.forEach(postcodeAndUprn => {
        var clash = existingByPostcode[postcodeAndUprn.postcode];
        if (clash) {
            errors.push({
                field: 'uprn',
                value: postcodeAndUprn.uprn,
                clash: clash._id,
                message: 'This UPRN is within a postcode that is already used in an RPZ: ' + clash.name
            });
        }
    });
}

function validateNewUPRNsDoNotClash(rpz, errors, existingByUPRN, uprnsForPostcodes) {
    rpz.uprns.forEach(uprn => {
        var clash = existingByUPRN[uprn];
        if (clash) {
            errors.push({
                field: 'uprn',
                value: uprn,
                clash: clash._id,
                message: 'This UPRN is already used by RPZ: ' + clash.name
            });
        }
    });

    uprnsForPostcodes.forEach(uprnsForPostcode => {
        uprnsForPostcode.uprns.forEach(uprn => {
            var clash = existingByUPRN[uprn];
            if (clash) {
                errors.push({
                    field: 'uprn',
                    value: uprnsForPostcode.postcode,
                    clash: clash._id,
                    message: 'This postcode contains a UPRN that is already used by RPZ: ' + clash.name
                });
            }
        });
    });
}


module.exports = RPZService;
