'use strict';

/**
 * A source of CPI data.
 *
 * Data is cached using a 'CPIStore'.  Data is refreshed if the nextRelease date
 * has passed.
 **/
class CPISource {

    constructor(source, store, targets, dateSource) {
        this.source = source;
        this.store = store;
        this.targets = targets;
        this.dateUtils = require('./dateUtils')(dateSource);
    }

    async get() {
        var cpi;

        // get the most recent CPI data from the store
        const cachedCPI = await this.store.latest();
        // if we have cached cpi data and it is not out of date then use that
        if (cachedCPI && !this.dateUtils.hasDatePassed(cachedCPI.nextRelease)) {
            console.log('CPISource.  CPI data is up to date.');
            cpi = cachedCPI;
        } else {
            cpi = await this.source.get();
            await this.store.store(cpi);
            console.log('CPISource.  CPI data in store is up to date.');
        }

        for (const target of this.targets) {
            await this.syncTarget(target, cpi);
        }

        return cpi;
    }

    async syncTarget(target, cpi) {
        const targetName = target.constructor.name;
        console.log(`Processing target ${targetName}`);
        const latest = await target.latest()
        .catch(err => {
            console.log('CPISource. Could not determine last release date.', err);
            return null;
        });

        if (latest && latest.releaseDate) {
            console.log('CPISource. Latest release date', latest.releaseDate);
        } else {
            console.log('CPISource. Unknown release date');
        }

        if (!latest || !latest.releaseDate || latest.releaseDate < cpi.releaseDate) {
            await target.store(cpi)
            .then(() => console.log('CPISource.  Updated '))
            .catch(err => {
                console.log('CPISource. Indexing failed');
                throw err;
            });
        }
    }

}

module.exports = CPISource;
