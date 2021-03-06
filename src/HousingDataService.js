'use strict';

var elasticsearch = require('elasticsearch');
var async = require('async');
var nano = require('nano')('http://localhost:5984');
var nodeSchedule = require('node-schedule');
var express = require('express');
var bodyParser = require('body-parser');
var expressApp = express();
var http = require('http');
expressApp.use(bodyParser.urlencoded({ extended: false }));
expressApp.use(bodyParser.json());

/**
 * Housing data service.
 *
 * Wires together the CPI and RPZ code to create the reguired endpoints and
 * scheduled tasks/
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
        const Europa = require('./rpz/Europa.js');
        const RPZApp = require('./rpz/RPZApp');
        const RPZService = require('./rpz/RPZService');
        const RPZIndexer = require('./rpz/RPZIndexer');
        const RetryingRPZIndexer = require('./rpz/RetryingRPZIndexer');

        const amILiveCheck = new AmILiveCheck();
        const europa = new Europa(config.europa);
        const rpzDB = nano.use('rpz');
        const rpzService = new RPZService(rpzDB, europa);
        const rpzIndexer = new RPZIndexer(rpzService, elasticsearchClient);
        this.retryingRPZIndexer
            = new RetryingRPZIndexer(
                rpzIndexer,
                amILiveCheck,
                config.rpz.index.retryinterval);

        const store = new CPIStore(config.couch.url);
        const onsSource = new URLCPISource(config.cpi.source.url);
        const indexer = new CPIIndexer(elasticsearchClient, store);
        const retryingIndexer = new RetryingCPIIndexer(indexer, config.cpi.update.retryinterval);
        const source = new CPISource(onsSource, store, retryingIndexer);

        const health = new HousingHealth(
            rpzDB, store, config.cpi.graceperiod, elasticsearchClient);

        this.retryingUpdater =
            new RetryingCPIUpdater(source, amILiveCheck, config.cpi.update.retryinterval);
        this.scheduler =
            new HousingScheduler(
                this.retryingUpdater,
                config.cpi.update.crontab,
                this.retryingRPZIndexer,
                config.rpz.index.crontab,
                nodeSchedule);

        const cpiApp = new CPIApp(source, health);
        cpiApp.register(expressApp);

        const rpzApp = new RPZApp(rpzService, this.retryingRPZIndexer);
        rpzApp.register(expressApp);
    }

    run() {
        const server = expressApp.listen(9094);
        const host = server.address().address;
        const port = server.address().port;
        console.log('Server listening at http://%s:%s', host, port);

        // on startup, update the ons and rpz data, then schedule regular updates.
        async.parallel(
            [
                cb => this.retryingUpdater.update(cb),
                cb => this.retryingRPZIndexer.index(cb)
            ],
            // initial update is finsihed, scheule regular updates
            () => this.scheduler.schedule());
    }
}

module.exports = HousingDataService;
