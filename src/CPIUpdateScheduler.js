'use strict';

const prettyCron = require('prettycron');

/**
 * Schedule regular update to the ONS data and the data contained in elasticsearch.
 **/
class CPIUpdateScheduler {

    constructor(updater, updaterCrontab, scheduler) {
        this.updater = updater;
        this.updaterCrontab = updaterCrontab;
        this.scheduler = scheduler;
    }

    schedule() {
        console.log('CPIUpdateScheduler. Scheduling regular updates.');
        console.log('CPIUpdateScheduler. Crontab for update: ',
            this.updaterCrontab,
            ' (' + prettyCron.toString(this.updaterCrontab) + ').',
            ' Next run: ', prettyCron.getNext(this.updaterCrontab));

        this.scheduler.scheduleJob(this.updaterCrontab, () => {
            const nextUpdate = prettyCron.getNext(this.updaterCrontab);
            if (this.updater.isRunning()) {
                console.log('CPIUpdateScheduler. Update job is already running. Next run: ', nextUpdate);
                return;
            }
            this.updater.update(() => {
                console.log('CPIUpdateScheduler. Finished update job. Next run: ', nextUpdate);
            });
        });
    }
}

module.exports = CPIUpdateScheduler;
