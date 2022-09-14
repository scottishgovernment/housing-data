'use strict';

var moment = require('moment');
var async = require('async');

/**
 * Health check logic.
 **/
class HousingHealth {

    constructor(
            rpzDB,
            cpiStore,
            gracePeriod,
            elasticsearchClient,
            dateSource) {

        this.rpzDB = rpzDB;
        this.cpiStore = cpiStore;
        this.gracePeriod = gracePeriod;
        this.elasticsearchClient = elasticsearchClient;
        this.dateSource = require('./dateUtils')(dateSource).dateSource;
    }

    health(res) {
        async.parallel([
            cb => checkRPZDesignDocHealth(this.rpzDB, cb),
            cb => checkCPIDataHealth(this.cpiStore, this.gracePeriod, this.dateSource, cb),
            cb => checkElasticsearchHealth(this.elasticsearchClient, cb)
        ],
        (err, results) => {
            var ok = true;
            var messages = [];
            results.forEach(result => {
                ok = ok && result.ok;
                Array.prototype.push.apply(messages, result.messages);
            });

            const status = ok ? 200 : 503;
            res.status(status);
            res.send({
                ok: ok,
                message: messages ? messages.join('; ') : ''
            });
        });
    }
}

function checkRPZDesignDocHealth(rpzDB, callback) {
    rpzDB.head('_design/rpz', err => {
        if (err) {
            callback(undefined, {
                ok: false,
                messages: ['failed to get rpz design doc']
            });
        } else {
            callback(undefined, { ok: true, messages: [] });
        }
    });
}

function checkCPIDataHealth(cpiStore, gracePeriod, dateSource, callback) {
    cpiStore.latest()
    .then(cpi => {
        if (!cpi) {
            return { ok:false, messages: ['No CPI data in store'] };
        }

        var ok = true;
        var messages = [];
        messages.push('releaseDate: ' + cpi.releaseDate);
        messages.push('nextRelease: ' + cpi.nextRelease);

        // decide if the data is out of date or not
        var lastAcceptableDate = moment(cpi.nextRelease)
                                    .add(moment.duration(gracePeriod));
        if (lastAcceptableDate.isBefore(dateSource.date())) {
            messages.push('Next release date has passed. Grace period: ' + gracePeriod);
            ok = false;
        }
        return { ok: ok, messages: messages };
    }).catch(error => {
        return { ok:false, messages: [error] };
    }).then(health => {
        callback(null, health);
    });
}

function checkElasticsearchHealth(elasticsearchClient, callback) {

    var messages = [];
    var ok = true;

    // check the elasticsearch health
    elasticsearchClient.cat.health({ format: 'json'}, (esError, esHealth) => {
        if (esError) {
            ok = false;
            messages.push('Unable to contact elasticsearch:' + esError.message || esError);
        } else {
            // parse the health info
            if (esHealth.length !== 1) {
                ok = false;
                messages.push('Unexpected data from elastic search health:' + JSON.stringify(esHealth));
            } else {
                ok = esHealth[0].status === 'green' || esHealth[0].status === 'yellow';
                if (!ok) {
                    messages.push('Elasticsearch health status is ' + esHealth.status);
                }
            }
        }
        callback(undefined, { ok: ok, messages: messages });
    });
}

module.exports = HousingHealth;
