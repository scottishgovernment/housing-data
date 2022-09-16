'use strict';

const prettyCron = require('prettycron');

/**
 * Schedule regular update to the CPI data.
 **/
class HousingScheduler {

    constructor(cpiUpdater, cpiUpdaterCrontab, scheduler) {
        this.cpiUpdater = cpiUpdater;
        this.cpiUpdaterCrontab = cpiUpdaterCrontab;
        this.scheduler = scheduler;
    }

    schedule() {
        console.log('Housingcheduler. Scheduling regular updates.');
        console.log('HousingScheduler. Crontab for cpi update: ',
            this.cpiUpdaterCrontab,
            ' (' + prettyCron.toString(this.cpiUpdaterCrontab) + ').',
            ' Next run: ', prettyCron.getNext(this.cpiUpdaterCrontab));

        this.scheduler.scheduleJob(this.cpiUpdaterCrontab, () => {
            const nextUpdate = prettyCron.getNext(this.cpiUpdaterCrontab);
            if (this.cpiUpdater.isRunning()) {
                console.log('HousingScheduler. CPI update job is already running. Next run: ', nextUpdate);
                return;
            }
            this.cpiUpdater.update()
            .then(() => {
                console.log('HousingScheduler. Finished CPI update job. Next run: ', nextUpdate);
            });
        });
    }
}

module.exports = HousingScheduler;
