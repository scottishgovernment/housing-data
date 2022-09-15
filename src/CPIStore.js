'use strict';

/**
 * Store for CPI data.
 **/
const http = require('http');
const got = require('got');

class CPIStore {

    constructor(couchUrl) {
        this.couchUrl = couchUrl;
    }

    async latest() {
        const url = this.couchUrl + 'ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true';
        const parsedBody = await got.get(url).json();
        if (parsedBody.total_rows === 0) {
            return null;
        }
        var doc = parsedBody.rows[0].doc;
        delete doc['_id'];
        delete doc['_rev'];
        return doc;
    }

    async store(cpi) {
        const url = this.couchUrl + 'ons/_design/ons/_view/cpi?key="' + cpi.releaseDate + '"';
        const parsedBody = await got.get(url, { retry: 0 }).json();

        // dont need to store this document if it already exists
        if (parsedBody.rows.length > 0) {
            return;
        }

        await this.postToCouch(cpi);
    }

    async postToCouch(cpi) {
        const uri = this.couchUrl + 'ons';
        await got.post(uri, {
            json: cpi
        });
    }

}

module.exports = CPIStore;
