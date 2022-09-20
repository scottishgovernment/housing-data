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

    async latest() {
        return this.indexer.latest();
    }

    async update() {
        if (this.running) {
            return;
        }

        console.log('RetryingCPIIndexer. Running');
        this.running = true;
        while (this.running) {
            await this.indexer.indexData()
            .then(() => {
                this.running = false;
            })
            .catch(err => {
                console.log('RetryingCPIIndexer. Failed to index data:', err);
                console.log('RetryingCPIIndexer. Retrying in ', this.retryinterval);
                return new Promise((resolve, reject) => {
                    setTimeout(resolve, this.retryinterval);
                });
            });
        }
    }

    isRunning() {
        return this.running;
    }
}

module.exports = RetryingCPIIndexer;
