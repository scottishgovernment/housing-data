'use strict';

/**
 * Fetch CPI data from a url
 **/
const CPIParser = require('./CPIParser');
const request = require('request');

class URLCPISource {

    constructor(url) {
        this.url = url;
        this.parser = new CPIParser();
    }

    get(callback) {
        var stream = request.get(this.url);
        console.log('Fetching from ', this.url);
        this.parser.parse(stream, (error, cpi) => callback(null, cpi));
    }
}

module.exports = URLCPISource;
