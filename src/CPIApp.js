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

         expressApp.get('/healthcheck', (req, res) => {
             this.source.get((error, cpi) => {
                 if (error) {
                     res.status(500).send({ msg: error });
                 } else {
                    var problems = [];

                    // now >= cpiReleaseDate
                    const releaseDateTodayOrBefore = dateUtils.compareWithNow(cpi.releaseDate) >= 0;
                    if (!releaseDateTodayOrBefore) {
                        problems.push('Release date should be today or before: ' + cpi.releaseDate);
                    }

                    // nextRelease < now
                    const nextReleaseInFuture = dateUtils.compareWithNow(cpi.nextRelease) < 0;
                    if (!nextReleaseInFuture) {
                        problems.push('Next release should be in the future: ' + cpi.nextRelease);
                    }

                    res.json({
                        message: problems.length === 0 ? 'OK': 'Problems',
                        details: problems
                    });
                 }
             });
         });
     }
}

module.exports = CPIApp;
