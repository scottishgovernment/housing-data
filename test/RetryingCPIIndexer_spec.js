var RetryingCPIIndexer = require('../src/RetryingCPIIndexer.js');

describe('RetryingCPIIndexer', function() {

    it('retries until indexer suceeds', function (done) {
        // ARRANGE
        const indexer = indexerSuceedAfterFailures(2);
        const cpi = {};
        const sut = new RetryingCPIIndexer(indexer, 100);

        // ACT
        sut.store(cpi)
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
        const cpi = {};
        const sut = new RetryingCPIIndexer(indexer, 100);

        // ACT
        sut.store(cpi)
        .then(() => {});
        sut.store(cpi)
        .then(() => {
            expect(sut.isRunning).toBeTruthy();
            done();
        });
    });

    function indexerSuceedAfterFailures(desiredFailureCount) {
        var failureCount = 0;
        return {
            store: async () => {
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
