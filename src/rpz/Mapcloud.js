'use strict';

const request = require('request');
const async = require('async');

/**
 * Provides access to the mapcloud web service.
 **/
class Mapcloud {

    constructor(config) {
        this.baseUrl = config.url;
        this.auth = {
            'auth': {
                'user': config.user,
                'pass': config.password,
                'sendImmediately': false
            }
        };
    }

    postcodeForUprn(uprn, callback) {
        const url = this.baseUrl + 'address/addressbase/uprn?addrformat=2&uprn=' + uprn;
        mapcloudRequest(url, this.auth, (error, data) => {
            if (error) {
                callback(error);
                return;
            }

            if (data.totalResults !== 1) {
                callback('Unexpected results count for uprn : ' + uprn + ' ' + data.totalResults);
                return;
            }
            callback(undefined, { uprn: uprn, postcode: data.results[0].postcode});
        });
    }

    uprnsForPostcode(postcode, callback) {
        const url = this.baseUrl + 'address/addressbase/postcode?pc=' + postcode;
        mapcloudRequest(url, this.auth, (error, data) => {
            if (error) {
                callback(error);
                return;
            }
            callback(undefined, { postcode: postcode, uprns: data.results.map(r => r.uprn)});
        });
    }
}

function mapcloudRequest(url, auth, callback) {
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

module.exports = Mapcloud;
