'use strict';

/**
 * Update CPI data using a source and addingretries.
 **/
const request = require('request');

class RetryingCPIUpdater {

    constructor(source, retryinterval) {
        this.source = source;
        this.retryinterval = retryinterval;
        this.running = false;
    }

    update(callback) {
        this.running = true;

        var sourceCallback = (err) => {
            if (err) {
                console.log('RetryingCPIUpdater. Failed to update data:', err);
                console.log('RetryingCPIUpdater. Retrying in ', this.retryinterval);
                setTimeout(() => this.source.get(sourceCallback), this.retryinterval);
                return;
            }
            this.running = false;
            callback();
        };
        this.source.get(sourceCallback);
    }

    isRunning() {
        return this.running;
    }
}

module.exports = RetryingCPIUpdater;
