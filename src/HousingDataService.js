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
        const CPIIndexer = require('./CPIIndexer');
        const elasticsearch = require('elasticsearch');
        const elasticsearchConfig = config.elasticsearch;
        const RetryingCPIUpdater = require('./RetryingCPIUpdater');
        const RetryingCPIIndexer = require('./RetryingCPIIndexer');
        const CPIUpdateScheduler = require('./CPIUpdateScheduler');

        const store = new CPIStore(config.couch.url);
        const onsSource = new URLCPISource(config.cpi.source.url);
        const indexer = new CPIIndexer(elasticsearch, elasticsearchConfig, store);
        const retryingIndexer = new RetryingCPIIndexer(indexer, config.cpi.update.retryinterval);
        const source = new CPISource(onsSource, store, retryingIndexer);
        const health = new CPIHealth(config.cpi.graceperiod, elasticsearch, elasticsearchConfig);

        const schedule = require('node-schedule');
        this.retryingUpdater =
            new RetryingCPIUpdater(source, config.cpi.update.retryinterval);
        this.scheduler =
            new CPIUpdateScheduler(
                this.retryingUpdater,
                config.cpi.update.crontab,
                schedule);

        const cpiApp = new CPIApp(source, store, health);
        cpiApp.register(expressApp);
    }

    run() {
        const server = expressApp.listen(9094);
        const host = server.address().address;
        const port = server.address().port;
        console.log('Server listening at http://%s:%s', host, port);

        // on startup, update the ons data, index it and then schedule regular updates.
        this.retryingUpdater.update(() => {
            this.scheduler.schedule();
        });
    }
}

module.exports = HousingDataService;
