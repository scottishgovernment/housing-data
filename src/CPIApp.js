'use strict';

/**
 * Express app that defines endpoints for the CPI data service.
 */
class CPIApp {

    constructor(source, healthchecker) {
        this.source = source;
        this.healthchecker = healthchecker;
    }

    register(expressApp) {
        expressApp.get('/cpi', (req, res) => {
            this.source.get()
            .then(cpi => {
                res.json(cpi);
            }).catch(error => {
                res.status(500).send(error);
            });
        });

        expressApp.get('/health', (req, res) => {
            this.healthchecker.health(res);
        });
    }
}

module.exports = CPIApp;
