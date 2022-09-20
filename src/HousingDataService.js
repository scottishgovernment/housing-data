'use strict';

var elasticsearch = require('elasticsearch');
var nodeSchedule = require('node-schedule');
var express = require('express');
var expressApp = express();

/**
 * Housing data service.
 *
 * Wires together the CPI code to create the reguired endpoints and
 * scheduled tasks.
 */
class HousingDataService {

    constructor(config) {
        const ElasticsearchLogger = require('./ElasticsearchLogger');
        config.elasticsearch.log = ElasticsearchLogger;
        const elasticsearchClient = new elasticsearch.Client(config.elasticsearch);

        const AmILiveCheck = require('./AmILiveCheck');
        const HousingScheduler = require('./HousingScheduler');
        const CPIStore = require('./CPIStore');
        const CPISource = require('./CPISource');
        const HousingHealth = require('./HousingHealth');
        const CPIApp = require('./CPIApp');
        const CPIIndexer = require('./CPIIndexer');
        const URLCPISource = require('./URLCPISource');
        const RetryingCPIUpdater = require('./RetryingCPIUpdater');
        const RetryingCPIIndexer = require('./RetryingCPIIndexer');

        const amILiveCheck = new AmILiveCheck();
        const store = new CPIStore(config.couch.url);
        const onsSource = new URLCPISource(config.cpi.source.url);
        const indexer = new CPIIndexer(elasticsearchClient);
        this.retryingIndexer = new RetryingCPIIndexer(indexer, config.cpi.update.retryinterval);
        const source = new CPISource(onsSource, store, this.retryingIndexer);

        const health = new HousingHealth(store, config.cpi.graceperiod, elasticsearchClient);

        this.retryingUpdater =
            new RetryingCPIUpdater(source, amILiveCheck, config.cpi.update.retryinterval);
        this.scheduler =
            new HousingScheduler(
                this.retryingUpdater,
                config.cpi.update.crontab,
                nodeSchedule);

        const cpiApp = new CPIApp(source, health);
        cpiApp.register(expressApp);
    }

    run() {
        const server = expressApp.listen(9094);
        const host = server.address().address;
        const port = server.address().port;
        console.log('Server listening at http://%s:%s', host, port);

        // on startup, update the ons data, then schedule regular updates.
        this.retryingUpdater.update()
        .then(() => this.scheduler.schedule());
    }
}

module.exports = HousingDataService;
