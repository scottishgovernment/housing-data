var RetryingCPIUpdater = require('../target/src/RetryingCPIUpdater.js');

describe('RetryingCPIUpdater', function() {

    it('retries until indexer suceeds', function (done) {

        // ARRANGE
        const source = sourceSuceedAfterFailures(2);
        const sut = new RetryingCPIUpdater(source, 100);

        // ACT
        sut.update(() => {
            // ASSERT
            expect(source.getFailureCount()).toBe(2);
            expect(sut.isRunning()).toBe(false);
            done();
        });
    });

    function sourceSuceedAfterFailures(desiredFailureCount) {
        var failureCount = 0;
        return {
            get : (callback) => {
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
