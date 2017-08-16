'use strict';

/**
 * Store for CPI data.
 **/
const http = require('http');
const request = require('request');

class CPIStore {

    constructor(couchUrl) {
        this.couchUrl = couchUrl;
    }

    latest(callback) {
        const url = this.couchUrl + 'ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true';
        request(url, (error, response, body) => {
            if (error) {
                callback(error);
                return;
            }

            var parsedBody = JSON.parse(body);
            if (parsedBody.total_rows > 0) {
                var doc = parsedBody.rows[0].doc;
                delete doc['_id'];
                delete doc['_rev'];
                callback(undefined, doc);
            } else {
                callback(null, null);
            }
        });
    }

    store(cpi, callback) {
        const url = this.couchUrl + 'ons/_design/ons/_view/cpi?key="' + cpi.releaseDate + '"';
        request(url, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                callback(error);
                return;
            }

            var parsedBody = JSON.parse(body);
            if (parsedBody.rows.length > 0) {
                // dont need to store this document as it already exists
                callback();
                return;
            }

            // post the new document
            postToCouch(this, cpi, callback);
        });
    }
}

function postToCouch(store, cpi, callback) {
    var options = {
        uri: store.couchUrl + 'ons',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        json: cpi
    };
    request(options, (error, response, body) => callback(error, body));
}

module.exports = CPIStore;
