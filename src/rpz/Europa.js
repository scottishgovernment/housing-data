'use strict';

const request = require('request');
const async = require('async');

/**
 * Provides access to the europa web service.
 **/
class Europa {

    constructor(config) {
        this.baseUrl = config.url;
    }

    postcodeForUprn(uprn, callback) {
        const url = this.baseUrl + 'os/abpr/address?fieldset=all&uprn=' + uprn;
        europaRequest(url, this.auth, (error, data) => {
            if (error) {
                callback(error);
                return;
            }
            if (data.metadata.count < 1) {
                callback('Unexpected results count for uprn : ' + uprn + ' ' + data.metadata.count);
                return;
            }
            var postcode = data.results[0].address[0].lpi_postcode;
            callback(undefined, { uprn: uprn, postcode: postcode});
        });
    }

    uprnsForPostcode(postcode, callback) {
        const url = this.baseUrl + 'os/abpr/address?fieldset=all&addresstype=dpa&postcode=' + postcode;
        europaRequest(url, this.auth, (error, data) => {
            if (error) {
                callback(error);
                return;
            }
            if (data.metadata.count === 0) {
                callback(undefined, { postcode: postcode, uprns: []});
                return;
            }

            var uprns = data.results[0].address.map(r => r.uprn);
            callback(undefined, { postcode: postcode, uprns: uprns});
        });
    }
}

function europaRequest(url, auth, callback) {
    request(url, auth,
        (error, response, body) => {
            if (error) {
                callback(error);
                return;
            }

            if (response.statusCode !== 200) {
                callback({
                    statusCode: response.statusCode,
                    statusMessage: response.statusMessage
                });
                return;
            }

            const result = JSON.parse(body);
            callback(undefined, result);
        });
}

module.exports = Europa;
