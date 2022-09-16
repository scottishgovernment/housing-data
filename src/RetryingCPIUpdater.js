'use strict';

/**
 * Update CPI data using a source and addingretries.
 **/
class RetryingCPIUpdater {

    constructor(source, amILiveCheck, retryinterval) {
        this.source = source;
        this.retryinterval = retryinterval;
        this.amILiveCheck = amILiveCheck;
        this.running = false;
    }

    async update() {
        this.running = true;
        console.log('RetryingCPIUpdater. Running');
        while (this.running) {
            await this.updateIfLive()
            .then(() => {
                this.running = false;
                console.log('RetryingCPIUpdater. Done.');
            })
            .catch(err => {
                console.log('RetryingCPIUpdater. Failed to update data:', err);
                console.log('RetryingCPIUpdater. Retrying in ', this.retryinterval);
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, this.retryinterval);
                });
            });
        }
    }

    async updateIfLive() {
        const live = await this.amILiveCheck.check();
        if (!live) {
            console.log('RetryingCPIUpdater. This is not the live leg.');
            return;
        }
        console.log('RetryingCPIUpdater. This is the live leg. Checking CPI data.');
        await this.source.get();
    }

    isRunning() {
        return this.running;
    }
}

module.exports = RetryingCPIUpdater;
