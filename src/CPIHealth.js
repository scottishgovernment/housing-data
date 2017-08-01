'use strict';

var duration = require('date-duration');

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
                res.send({ ok:false, msg: error });
                return;
            }

            if (!cpi) {
                res.status(500);
                res.send({ ok:false, msg: 'No CPI data in store' });
                return;
            }

            var ok = true;

            // decide if the data is out of date or not
            var nextReleaseDate = Date.parse(cpi.nextRelease);
            var lastAcceptableDate = duration.default(this.gracePeriod).addTo(nextReleaseDate);
            let now = this.dateSource.date();
            if (now > lastAcceptableDate) {
                ok = false;
            }

            // check the elasticsearch health
            var esConfig = Object.assign({}, this.elasticsearchConfig);
            const elasticsearchClient = new this.elasticsearch.Client(esConfig);
            elasticsearchClient.cat.health((esError, esHealth) => {
                var messages = [];
                messages.push(esHealth);
                if (esError) {
                    ok = false;
                    messages.push('Unable to contact elasticsearch:', esError);
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
                    messages: messages
                });

            });
        });
    }
}

module.exports = CPIHealth;
