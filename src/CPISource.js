'use strict';

const util = require('util');

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

    get(callback) {
        this._get()
        .then(cpi => { callback(null, cpi); })
        .catch(err => { callback(err); });
    }

    async _get() {
        const latest = util.promisify(this.store.latest.bind(this.store));
        // get the most recent CPI data from the store
        const cachedCPI = await latest();

        // if we have cached cpi data and it is not out of date then return that
        if (cachedCPI && !this.dateUtils.hasDatePassed(cachedCPI.nextRelease)) {
            console.log('CPISource.  CPI data is up to date.');
            return cachedCPI;
        }
    
        const sourceGet = util.promisify(this.source.get.bind(this.source));
        const cpi = await sourceGet();
        const storePut = util.promisify(this.store.store.bind(this.store));
        await storePut(cpi);
        console.log('CPISource.  CPI data in store is up to date.');

        // tell the indexer that the data has been updated.
        this.indexer.update(() => {
            console.log('CPISource.  Updated elasticsearch.');
        });
        return cpi;
    }
}

module.exports = CPISource;
