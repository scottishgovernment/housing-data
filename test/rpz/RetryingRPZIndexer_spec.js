var RetryingRPZIndexer = require('../../target/src/rpz/RetryingRPZIndexer.js');

describe('RetryingRPZIndexer', function() {

    it('retries until indexer suceeds', function (done) {

        // ARRANGE
        const indexer = indexerSuceedAfterFailures(2);
        const amILive = live();
        const sut = new RetryingRPZIndexer(indexer, amILive, 100);

        // ACT
        sut.index(() => {
            // ASSERT
            expect(indexer.getFailureCount()).toBe(2);
            expect(sut.isRunning()).toBe(false);
            done();
        });
    });

    it('does not run if not live', function (done) {

        // ARRANGE
        const indexer = indexerSuceedAfterFailures(100);
        const amILive = notlive();
        const sut = new RetryingRPZIndexer(indexer, amILive, 100);

        // ACT
        sut.index(() => {
            // ASSERT
            expect(indexer.getFailureCount()).toBe(0);
            expect(sut.isRunning()).toBe(false);
            done();
        });
    });

    function indexerSuceedAfterFailures(desiredFailureCount) {
        var failureCount = 0;
        return {
            index : (callback) => {
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

    function live() {
        return {
            check(callback) {
                callback(undefined, true);
            }
        }
    }

    function notlive() {
        return {
            check(callback) {
                callback(undefined, false);
            }
        }
    }
});
