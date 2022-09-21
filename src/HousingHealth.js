'use strict';

var moment = require('moment');
var async = require('async');

/**
 * Health check logic.
 **/
class HousingHealth {

    constructor(
            cpiStore,
            gracePeriod,
            dateSource) {

        this.cpiStore = cpiStore;
        this.gracePeriod = gracePeriod;
        this.dateSource = require('./dateUtils')(dateSource).dateSource;
    }

    async health(res) {
        const cpiHealth = await checkCPIDataHealth(
            this.cpiStore,
            this.gracePeriod,
            this.dateSource);
        const { ok, messages } = cpiHealth;
        const status = ok ? 200 : 503;
        res.status(status);
        res.send({
            ok: ok,
            message: messages ? messages.join('; ') : ''
        });
    }
}

async function checkCPIDataHealth(cpiStore, gracePeriod, dateSource) {
    return cpiStore.latest()
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
        return { ok: false, messages: [error] };
    });
}

module.exports = HousingHealth;
