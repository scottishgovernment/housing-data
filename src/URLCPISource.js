'use strict';

/**
 * Fetch CPI data from a url
 **/
const CPIParser = require('./CPIParser');
const util = require('util');
const got = require('got');

class URLCPISource {

    constructor(url) {
        this.url = url;
        this.parser = new CPIParser();
    }

    async get() {
        console.log(`Fetching ${this.url}`);
        const parse = util.promisify(this.parser.parse.bind(this.parser));
        const stream = got.stream.get(this.url);
        return await parse(stream);
    }

}

module.exports = URLCPISource;
