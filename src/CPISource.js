'use strict';

/**
 * A source of CPI data.
 *
 * Data is cached using a 'CPIStore'.  Data is refreshed if the nextRelease date
 * has passed.
 **/
const request = require('request');

class CPISource {

    constructor(source, store, indexer, dateSource) {
        this.source = source;
        this.store = store;
        this.indexer = indexer;
        this.dateUtils = require('./dateUtils')(dateSource);
    }

    get(callback) {
        // get the most recent CPI data from the store
        this.store.latest((latestStoreError, cachedCPI) => {
            if (latestStoreError) {
                callback(latestStoreError);
                return;
            }

            // if we have cached cpi data and it is not out of date then return that
            if (cachedCPI && !this.dateUtils.hasDatePassed(cachedCPI.nextRelease)) {
                console.log('CPISource.  CPI data is up to date.');
                callback(null, cachedCPI);
                return;
            }

            // fetch and store the most recent data from source
            this.source.get((sourceError, cpi) => {
                if (sourceError) {
                    callback(sourceError);
                    return;
                }

                this.store.store(cpi, storeError => {
                    if (storeError) {
                        callback(storeError);
                    } else {
                        console.log('CPISource.  CPI data in store is up to date.');

                        // tell the indexer that the data has been updated.
                        this.indexer.update(() => {
                            console.log('CPISource.  Updated elasticsearch.');
                        });

                        callback(null, cpi);
                    }
                });
            });
        });
    }
}

module.exports = CPISource;
