'use strict';

/**
 * Index CPI data with retries.
 **/
const request = require('request');

class RetryingCPIIndexer {

    constructor(indexer, retryinterval) {
        this.indexer = indexer;
        this.retryinterval = retryinterval;
        this.running = false;
    }

    update(callback) {
        this.running = true;
console.log('RetryingCPIIndexer!!!!');
        var indexerCallback = (err) => {
            if (err) {
                console.log('RetryingCPIIndexer. Failed to index data:', err);
                console.log('RetryingCPIIndexer. Retrying in ', this.retryinterval);
                setTimeout(() => this.indexer.indexData(indexerCallback), this.retryinterval);
                return;
            }
            this.running = false;
            callback();
        };
        this.indexer.indexData(indexerCallback);
    }

    isRunning() {
        return this.running;
    }
}

module.exports = RetryingCPIIndexer;
