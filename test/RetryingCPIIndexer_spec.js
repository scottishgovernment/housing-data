var RetryingCPIIndexer = require('../src/RetryingCPIIndexer.js');

describe('RetryingCPIIndexer', function() {

    it('retries until indexer suceeds', function (done) {
        // ARRANGE
        const indexer = indexerSuceedAfterFailures(2);
        const sut = new RetryingCPIIndexer(indexer, 100);

        // ACT
        sut.update()
        .then(() => {
            // ASSERT
            expect(indexer.getFailureCount()).toBe(2);
            expect(sut.isRunning()).toBe(false);
            done();
        })
        .catch(done.fail);
    });

    it('returns early if already running', function (done) {
        // ARRANGE
        const indexer = indexerSuceedAfterFailures(2);
        const sut = new RetryingCPIIndexer(indexer, 100);

        // ACT
        sut.update()
        .then(() => {});
        sut.update()
        .then(() => {
            expect(sut.isRunning).toBeTruthy();
            done();
        });
    });

    function indexerSuceedAfterFailures(desiredFailureCount) {
        var failureCount = 0;
        return {
            indexData: async () => {
                if (failureCount === desiredFailureCount) {
                    return 'Done';
                } else {
                    failureCount++;
                    throw 'Error';
                }
            },

            getFailureCount: () => failureCount
        }
    }
});
