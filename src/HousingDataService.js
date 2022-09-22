'use strict';

var nodeSchedule = require('node-schedule');
var express = require('express');
var expressApp = express();

const S3CPIStore = require('./S3CPIStore');

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

        const targets = HousingDataService.targets(config);
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

    static targets(config) {
        var targets = [];
        if (config.s3.enabled) {
            const s3Target = new S3CPIStore(
                config.s3.region,
                config.s3.target);
            targets.push(s3Target);
        }
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
