'use strict';

/**
 * Parser for the CPI data from ONS.
 **/
class CPIHealth {

    constructor(dateSource) {
        this.dateUtils = require('./dateUtils')(dateSource);
    }

    health(source, res) {
        source.get((error, cpi) => {
            if (error) {
                res.status(500);
                res.send({ ok:false, msg: error });
                return;
            }

            const releaseDateTodayOrBefore = this.dateUtils.compareWithNow(cpi.releaseDate) >= 0;
            const nextReleaseInFuture = this.dateUtils.compareWithNow(cpi.nextRelease) < 0;
            const ok = releaseDateTodayOrBefore && nextReleaseInFuture;

            console.log(cpi.releaseDate, cpi.nextRelease);
            console.log(releaseDateTodayOrBefore, nextReleaseInFuture);

        console.log(ok);
            const status = ok ? 200 : 503;
            console.log(status);
            const message = 'releaseDate: ' + cpi.releaseDate
                            + ', nextRelease: ' + cpi.nextRelease;
            res.status(status);
            res.send({
                ok: ok,
                message: message
            });
        });
    }
}

module.exports = CPIHealth;
