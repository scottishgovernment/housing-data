'use strict';

/**
 * Store for CPI data.
 **/
const nano = require('nano');

class CPIStore {

    constructor(couchUrl) {
        const couch = nano(couchUrl);
        this.db = couch.db.use('ons');
    }

    async latest() {
        const parsedBody = await this.db.view('ons', 'cpi', {
            limit: 1,
            include_docs: true,
            descending: true
        });

        if (parsedBody.total_rows === 0) {
            return null;
        }
        var doc = parsedBody.rows[0].doc;
        delete doc['_id'];
        delete doc['_rev'];
        return doc;
    }

    async store(cpi) {
        const parsedBody = await this.db.view('ons', 'cpi', {
            key: cpi.releaseDate
        });

        // dont need to store this document if it already exists
        if (parsedBody.rows.length > 0) {
            return;
        }

        await this.db.insert(cpi, cpi.releaseDate);
    }

}

module.exports = CPIStore;
