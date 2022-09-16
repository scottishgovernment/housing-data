'use strict';

/**
 * A source of CPI data.
 *
 * Data is cached using a 'CPIStore'.  Data is refreshed if the nextRelease date
 * has passed.
 **/
class CPISource {

    constructor(source, store, indexer, dateSource) {
        this.source = source;
        this.store = store;
        this.indexer = indexer;
        this.dateUtils = require('./dateUtils')(dateSource);
    }

    async get() {
        // get the most recent CPI data from the store
        const cachedCPI = await this.store.latest();

        // if we have cached cpi data and it is not out of date then return that
        if (cachedCPI && !this.dateUtils.hasDatePassed(cachedCPI.nextRelease)) {
            console.log('CPISource.  CPI data is up to date.');
            return cachedCPI;
        }

        const cpi = await this.source.get();
        await this.store.store(cpi);
        console.log('CPISource.  CPI data in store is up to date.');

        // tell the indexer that the data has been updated.
        await this.indexer.update()
        .then(() => {
            console.log('CPISource.  Updated elasticsearch.');
        })
        .catch(err => {
            console.log('CPISource. Indexing failed', err);
        });

        return cpi;
    }
}

module.exports = CPISource;
