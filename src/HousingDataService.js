'use strict';

var express = require('express');
var expressApp = express();
var http = require('http');

/**
 * Housing data service.

 * This class wires together the components that implement the service,
 * and starts the HTTP server.
 */
class HousingDataService {

    constructor(config) {
        // create tand register the CPIApp
        const CPIStore = require('./CPIStore');
        const CPISource = require('./CPISource');
        const URLCPISource = require('./URLCPISource');
        const CPIHealth = require('./CPIHealth');
        const CPIApp = require('./CPIApp');

        const store = new CPIStore(config.couch.url);
        const onsSource = new URLCPISource(config.ons.cpiUrl);
        const source = new CPISource(onsSource, store);
        const health = new CPIHealth();
        const cpiApp = new CPIApp(source, health);
        cpiApp.register(expressApp);
    }

    run() {
        const server = expressApp.listen(9094);
        const host = server.address().address;
        const port = server.address().port;
        console.log('Server listening at http://%s:%s', host, port);
    }
}

module.exports = HousingDataService;
