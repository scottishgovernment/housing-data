'use strict';

/**
 * Express app that defines endpoints for the CPI data service.
 */
const dateUtils = require('./dateUtils');

class CPIApp {

    constructor(source) {
        this.source = source;
    }

    register(expressApp) {
        expressApp.get('/cpi', (req, res) => {
            this.source.get((error, cpi) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(cpi);
                }
            });
        });

        expressApp.get('/health', (req, res) => {
            this.source.get((error, cpi) => {
                if (error) {
                    res.status(500).send({ msg: error });
                    return;
                }

                const releaseDateTodayOrBefore = dateUtils.compareWithNow(cpi.releaseDate) >= 0;
                const nextReleaseInFuture = dateUtils.compareWithNow(cpi.nextRelease) < 0;
                const ok = releaseDateTodayOrBefore && nextReleaseInFuture;
                const status = ok ? 200 : 503;
                const message = 'releaseDate: ' + cpi.releaseDate
                                + ', nextRelease: ' + cpi.nextRelease;
                res.status(status).send({
                    ok: ok,
                    message: message
                });
            });
        });
    }
}

module.exports = CPIApp;
