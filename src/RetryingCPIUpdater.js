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

    update(callback) {
        this.running = true;
        var sourceCallback = (err) => {
            if (!err) {
                this.running = false;
                callback();
                return;
            }

            console.log('RetryingCPIUpdater. Failed to update data:', err);
            console.log('RetryingCPIUpdater. Retrying in ', this.retryinterval);
            setTimeout(() => { this.updateIfLive(sourceCallback); }, this.retryinterval);
        };

        // only if this is the live leg
        this.updateIfLive(sourceCallback);
    }

    updateIfLive(callback) {
        this.amILiveCheck.check()
        .then(live => {
            if (!live) {
                console.log('RetryingCPIUpdater. This is not the live leg.');
                callback();
                return;
            }
            this.source.get()
            .then(() => { callback(); })
            .catch(callback);
        }).catch(error => {
            console.log('RetryingCPIUpdater. Could not determine if this is the live leg');
            callback(error);
        });
    }

    isRunning() {
        return this.running;
    }
}

module.exports = RetryingCPIUpdater;
