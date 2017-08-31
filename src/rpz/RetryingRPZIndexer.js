'use strict';

/**
 * Adds rety behaviour to the RPZIndexer. Also ensures that it only run on live leg.
 **/
class RetryingRPZIndexer {

    constructor(rpzIndexer, amILiveCheck, retryinterval) {
        this.rpzIndexer = rpzIndexer;
        this.amILiveCheck = amILiveCheck;
        this.retryinterval = retryinterval;
    }

    index(callback) {
        this.running = true;

        var indexerCallback = (err) => {
            if (!err) {
                this.running = false;
                callback();
                return;
            }

            console.log('RetryingRPZIndexer. Failed to index data:', err);
            console.log('RetryingRPZIndexer. Retrying in ', this.retryinterval);
            setTimeout(() => this.updateIfLive(indexerCallback), this.retryinterval);
        };

        // only if this is the live leg
        this.updateIfLive(indexerCallback);
    }

    updateIfLive(callback) {
        this.amILiveCheck.check((error, live) => {
            if (!live) {
                console.log('RetryingRPZIndexer. This is not the live leg.');
                callback();
                return;
            }
            this.rpzIndexer.index(callback);
        });
    }

    isRunning() {
        return this.running;
    }
}


module.exports = RetryingRPZIndexer;
