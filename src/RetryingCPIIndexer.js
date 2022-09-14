'use strict';

/**
 * Index CPI data with retries.
 **/
class RetryingCPIIndexer {

    constructor(indexer, retryinterval) {
        this.indexer = indexer;
        this.retryinterval = retryinterval;
        this.running = false;
    }

    update(callback) {
        if (this.running) {
            callback();
            return;
        }

        this.running = true;
        const attempt = () => {
            this.indexer.indexData()
            .then(() => {
                this.running = false;
                callback();
            })
            .catch(err => {
                console.log('RetryingCPIIndexer. Failed to index data:', err);
                console.log('RetryingCPIIndexer. Retrying in ', this.retryinterval);
                setTimeout(attempt, this.retryinterval);
            });
        };
        attempt();
    }

    isRunning() {
        return this.running;
    }
}

module.exports = RetryingCPIIndexer;
