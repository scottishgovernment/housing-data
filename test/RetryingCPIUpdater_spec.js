var RetryingCPIUpdater = require('../target/src/RetryingCPIUpdater.js');

describe('RetryingCPIUpdater', function() {

    it('retries until indexer suceeds', function (done) {

        // ARRANGE
        const source = sourceSuceedAfterFailures(2);
        const sut = new RetryingCPIUpdater(source, amILiveCheck(true), 100);

        // ACT
        sut.update(() => {
            // ASSERT
            expect(source.getFailureCount()).toBe(2);
            expect(sut.isRunning()).toBe(false);
            done();
        });
    });

    it('does not retry if not live leg', function (done) {

        // ARRANGE
        const source = sourceSuceedAfterFailures(100);
        const sut = new RetryingCPIUpdater(source, amILiveCheckValues([true, true, true]), 100);

        // ACT
        sut.update(() => {
            // ASSERT
            expect(source.getFailureCount()).toBe(3);
            expect(sut.isRunning()).toBe(false);
            done();
        });
    });

    function amILiveCheck(isLive) {
        return {
            check: function (callback) {
                callback(undefined, isLive);
            }
        }
    }

    function amILiveCheckValues(values, calls) {
        return {
            amILiveCalls: 0,

            check: function (callback) {
                callback(undefined, values[this.amILiveCalls++]);
            }
        }
    }

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
