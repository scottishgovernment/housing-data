'use strict';

/**
 * Express app that defines endpoints for the CPI data service.
 */
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
     }
}

module.exports = CPIApp;
