var RetryingCPIUpdater = require('../src/RetryingCPIUpdater.js');

describe('RetryingCPIUpdater', function() {

    it('retries until indexer suceeds', function (done) {

        // ARRANGE
        const source = sourceSuceedAfterFailures(2);
        const sut = new RetryingCPIUpdater(source, amILiveCheck(true), 100);

        // ACT
        sut.update()
        .then(() => {
            // ASSERT
            expect(source.getFailureCount()).toBe(2);
            expect(sut.isRunning()).toBe(false);
            done();
        })
        .catch(done.fail);
    });

    it('does not retry if not live leg', function (done) {

        // ARRANGE
        const source = sourceSuceedAfterFailures(100);
        const sut = new RetryingCPIUpdater(source, amILiveCheckValues([true, true, true]), 100);

        // ACT
        sut.update()
        .then(() => {
            // ASSERT
            expect(source.getFailureCount()).toBe(3);
            expect(sut.isRunning()).toBe(false);
            done();
        })
        .catch(done.fail);
    });

    function amILiveCheck(isLive) {
        return {
            check: async function() {
                return isLive;
            }
        }
    }

    function amILiveCheckValues(values, calls) {
        return {
            amILiveCalls: 0,

            check: async function() {
                return values[this.amILiveCalls++];
            }
        }
    }

    function sourceSuceedAfterFailures(desiredFailureCount) {
        var failureCount = 0;
        return {
            get: () => {
                if (failureCount === desiredFailureCount) {
                    return Promise.resolve('Done');
                } else {
                    failureCount++;
                    return Promise.reject('Error');
                }
            },

            getFailureCount: () => failureCount
        }
    }
});
