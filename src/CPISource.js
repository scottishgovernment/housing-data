'use strict';

/**
 * A source of CPI data.  Caches data in couch but ensures that we use up to data
 * information acording to the next release date.
 **/
const request = require('request');

class CPISource {

    constructor(source, store) {
        this.source = source;
        this.store = store;
    }

    get(callback) {
        // get the most recent CPI data from the store
        this.store.latest((error, cachedCPI) => {
            if (error) {
                callback(error);
                return;
            }

            // if we hava cached cpi data and it is not out of date then return that
            if (cachedCPI && !outOfDate(cachedCPI)) {
                callback(null, cachedCPI);
                return;
            }

            // fetch and store the most recent data from source
            this.source.get((error, cpi) => {
                this.store.store(cpi, error => {
                    if (error) {
                        callback(error);
                    } else {
                        callback(null, cpi);
                    }
                });
            });
        });
    }
}

function outOfDate(cpi) {
    const now = new Date();
    const nowDate = [
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate()
    ].join('-');
    return nowDate.localeCompare(cpi.nextRelease) >= 0;
}

module.exports = CPISource;
