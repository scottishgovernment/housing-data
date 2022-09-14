'use strict';

/**
 * Fetch CPI data from a url
 **/
const CPIParser = require('./CPIParser');
const util = require('util');
const request = require('request');

class URLCPISource {

    constructor(url) {
        this.url = url;
        this.parser = new CPIParser();
    }

    get(callback) {
        this._get()
        .then(cpi => { callback(null, cpi); })
        .catch(err => { callback(err, null); });
    }

    async _get() {
        console.log(`Fetching ${this.url}`);
        const parse = util.promisify(this.parser.parse.bind(this.parser));
        var stream = request.get(this.url);
        return await parse(stream);
    }

}

module.exports = URLCPISource;
