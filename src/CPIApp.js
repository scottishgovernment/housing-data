'use strict';

/**
 * Express app that defines endpoints for the CPI data service.
 */
const dateUtils = require('./dateUtils')();

class CPIApp {

    constructor(source, healthchecker) {
        this.source = source;
        this.healthchecker = healthchecker;
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
            this.healthchecker.health(this.source, res);
        });
    }
}

module.exports = CPIApp;
