'use strict';

const prettyCron = require('prettycron');

/**
 * Schedule regular update to the CPI and RPZ data.
 **/
class HousingScheduler {

    constructor(cpiUpdater, cpiUpdaterCrontab, rpzIndexer, rpzIndexerCrontab, scheduler) {
        this.cpiUpdater = cpiUpdater;
        this.cpiUpdaterCrontab = cpiUpdaterCrontab;
        this.rpzIndexer = rpzIndexer;
        this.rpzIndexerCrontab = rpzIndexerCrontab;
        this.scheduler = scheduler;
    }

    schedule() {
        console.log('Housingcheduler. Scheduling regular updates.');
        console.log('HousingScheduler. Crontab for cpi update: ',
            this.cpiUpdaterCrontab,
            ' (' + prettyCron.toString(this.cpiUpdaterCrontab) + ').',
            ' Next run: ', prettyCron.getNext(this.cpiUpdaterCrontab));

        console.log('HousingScheduler. Crontab for rpz indexer: ',
                this.rpzIndexerCrontab,
                ' (' + prettyCron.toString(this.rpzIndexerCrontab) + ').',
                ' Next run: ', prettyCron.getNext(this.rpzIndexerCrontab));

        this.scheduler.scheduleJob(this.cpiUpdaterCrontab, () => {
            const nextUpdate = prettyCron.getNext(this.cpiUpdaterCrontab);
            if (this.cpiUpdater.isRunning()) {
                console.log('HousingScheduler. CPI update job is already running. Next run: ', nextUpdate);
                return;
            }
            this.cpiUpdater.update(
                () => console.log('HousingScheduler. Finished CPI update job. Next run: ', nextUpdate)
            );
        });

        this.scheduler.scheduleJob(this.rpzIndexerCrontab, () => {
            const nextUpdate = prettyCron.getNext(this.rpzIndexerCrontab);
            this.rpzIndexer.index(
                () => console.log('HousingScheduler. Finished RPZ index job. Next run: ', nextUpdate)
            );
        });
    }
}

module.exports = HousingScheduler;
