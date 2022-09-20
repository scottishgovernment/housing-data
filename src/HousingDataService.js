'use strict';

var elasticsearch = require('elasticsearch');
var nodeSchedule = require('node-schedule');
var express = require('express');
var expressApp = express();

const CPIIndexer = require('./CPIIndexer');
const RetryingCPIIndexer = require('./RetryingCPIIndexer');

/**
 * Housing data service.
 *
 * Wires together the CPI code to create the reguired endpoints and
 * scheduled tasks.
 */
class HousingDataService {

    constructor(config) {
        const AmILiveCheck = require('./AmILiveCheck');
        const HousingScheduler = require('./HousingScheduler');
        const CPIStore = require('./CPIStore');
        const CPISource = require('./CPISource');
        const HousingHealth = require('./HousingHealth');
        const CPIApp = require('./CPIApp');
        const URLCPISource = require('./URLCPISource');
        const RetryingCPIUpdater = require('./RetryingCPIUpdater');

        const amILiveCheck = new AmILiveCheck();
        const store = new CPIStore(config.couch.url);
        const onsSource = new URLCPISource(config.cpi.source.url);

        const targets = this.targets(config);
        const source = new CPISource(onsSource, store, targets);
        const health = new HousingHealth(store, config.cpi.graceperiod);

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

    targets(config) {
        var targets = [];
        const ElasticsearchLogger = require('./ElasticsearchLogger');
        config.elasticsearch.log = ElasticsearchLogger;
        const elasticsearchClient = new elasticsearch.Client(config.elasticsearch);
        const indexer = new CPIIndexer(elasticsearchClient);
        const retryingIndexer = new RetryingCPIIndexer(indexer, config.cpi.update.retryinterval);
        targets.push(retryingIndexer);
        return targets;
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
