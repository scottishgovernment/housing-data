'use strict';

var moment = require('moment');
var async = require('async');

/**
 * Health check logic.
 **/
class HousingHealth {

    constructor(
            rpzDB,
            mapcloud,
            cpiStore,
            gracePeriod,
            elasticsearch,
            elasticsearchConfig,
            dateSource) {

        this.rpzDB = rpzDB;
        this.mapcloud = mapcloud;
        this.cpiStore = cpiStore;
        this.gracePeriod = gracePeriod;
        this.elasticsearch = elasticsearch;
        this.elasticsearchConfig = elasticsearchConfig;
        this.dateSource = require('./dateUtils')(dateSource).dateSource;
    }

    health(res) {
        async.parallel([
            cb => checkRPZDesignDocHealth(this.rpzDB, cb),
            cb => checkMapcloudHealth(this.mapcloud, cb),
            cb => checkCPIDataHealth(this.cpiStore, this.gracePeriod, this.dateSource, cb),
            cb => checkElasticsearchHealth(this.elasticsearch, this.elasticsearchConfig, cb)
        ],
        (err, results) => {
            var ok = true;
            var messages = [];
            results.forEach(result => {
                ok = ok && result.ok;
                Array.prototype.push.apply(messages, result.messages);
            });

            const status = ok ? 200 : 503;
            res.status(status);
            res.send({
                ok: ok,
                message: messages ? messages.join('; ') : ''
            });
        });
    }
}

function checkRPZDesignDocHealth(rpzDB, callback) {
    rpzDB.head('_design/rpz', err => {
        if (err) {
            callback(undefined, {
                ok: false,
                messages: ['failed to get rpz design doc']
            });
        } else {
            callback(undefined, { ok: true, messages: [] });
        }
    });
}

function checkMapcloudHealth(mapcloud, callback) {
    // lookup the uprn for VQ
    mapcloud.postcodeForUprn('906423149', err => {
        if (err) {
            callback(undefined, {
                ok: false,
                messages: [err]
            });
        } else {
            callback(undefined, { ok: true, messages: [] });
        }
    });
}


function checkCPIDataHealth(cpiStore, gracePeriod, dateSource, callback) {

    cpiStore.latest((error, cpi) => {
        if (error) {
            callback(undefined, { ok:false, messages: [error] });
            return;
        }

        if (!cpi) {
            callback(undefined, { ok:false, messages: ['No CPI data in store'] });
            return;
        }

        var ok = true;
        var messages = [];
        messages.push('releaseDate: ' + cpi.releaseDate);
        messages.push('nextRelease: ' + cpi.nextRelease);

        // decide if the data is out of date or not
        var lastAcceptableDate = moment(cpi.nextRelease)
                                    .add(moment.duration(gracePeriod));
        if (lastAcceptableDate.isBefore(dateSource.date())) {
            messages.push('Next release date has passed. Grace period: ' + gracePeriod);
            ok = false;
        }

        callback(undefined, { ok: ok, messages: [] });
    });
}

function checkElasticsearchHealth(elasticsearch, elasticsearchConfig, callback) {

    var messages = [];
    var ok = true;

    // check the elasticsearch health
    var esConfig = Object.assign({}, elasticsearchConfig);
    const elasticsearchClient = new elasticsearch.Client(esConfig);
    elasticsearchClient.cat.health((esError, esHealth) => {
        if (esError) {
            ok = false;
            messages.push('Unable to contact elasticsearch:' + esError.message || esError);
        } else {
            // parse the health info
            const parts = esHealth.split(' ');
            if (parts.length < 4 || (parts[3] !== 'green' && parts[3] !== 'yellow')) {
                ok = false;
            }
        }
        callback(undefined, { ok: ok, messages: messages });
    });
}

module.exports = HousingHealth;
