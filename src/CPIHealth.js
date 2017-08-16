'use strict';

var moment = require('moment');

/**
 * Health check logic.
 **/
class CPIHealth {

    constructor(gracePeriod, elasticsearch, elasticsearchConfig, dateSource) {
        this.gracePeriod = gracePeriod;
        this.elasticsearch = elasticsearch;
        this.elasticsearchConfig = elasticsearchConfig;
        this.dateSource = require('./dateUtils')(dateSource).dateSource;
    }

    health(store, res) {

        store.latest((error, cpi) => {
            if (error) {
                res.status(500);
                res.send({ ok:false, message: error });
                return;
            }

            if (!cpi) {
                res.status(500);
                res.send({ ok:false, message: 'No CPI data in store' });
                return;
            }

            var ok = true;
            var messages = [];

            // decide if the data is out of date or not
            var lastAcceptableDate = moment(cpi.nextRelease)
                                        .add(moment.duration(this.gracePeriod));

            if (lastAcceptableDate.isBefore(this.dateSource.date())) {
                messages.push('Next release date has passed. Grace period: ' + this.gracePeriod);
                ok = false;
            }

            // check the elasticsearch health
            var esConfig = Object.assign({}, this.elasticsearchConfig);
            const elasticsearchClient = new this.elasticsearch.Client(esConfig);
            elasticsearchClient.cat.health((esError, esHealth) => {

                if (esError) {
                    ok = false;
                    messages.push('Unable to contact elasticsearch:' + esError.message || esError);
                } else {
                    // parse the health info
                    const parts = esHealth.split(' ');
                    if (parts.length < 4 || (parts[3] !== 'green' && parts[3] !== 'yellow')) {
                        ok = false;
                    }
                }

                const status = ok ? 200 : 503;
                messages.push('releaseDate: ' + cpi.releaseDate);
                messages.push('nextRelease: ' + cpi.nextRelease);

                res.status(status);
                res.send({
                    ok: ok,
                    message: messages ? messages.join('; ') : ''
                });

            });
        });
    }
}

module.exports = CPIHealth;
