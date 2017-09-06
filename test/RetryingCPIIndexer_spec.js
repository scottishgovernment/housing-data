var RetryingCPIIndexer = require('../target/src/RetryingCPIIndexer.js');

describe('RetryingCPIIndexer', function() {

    it('retries until indexer suceeds', function (done) {

        // ARRANGE
        const indexer = indexerSuceedAfterFailures(2);
        const sut = new RetryingCPIIndexer(indexer, 100);

        // ACT
        sut.update(() => {
            // ASSERT
            expect(indexer.getFailureCount()).toBe(2);
            expect(sut.isRunning()).toBe(false);
            done();
        });
    });

    function indexerSuceedAfterFailures(desiredFailureCount) {
        var failureCount = 0;
        return {
            indexData : (callback) => {
                if (failureCount === desiredFailureCount) {
                    callback(undefined, 'Done');
                } else {
                    failureCount++;
                    callback('Error', undefined);
                }
            },

            getFailureCount: () => failureCount
        }
    }
});
