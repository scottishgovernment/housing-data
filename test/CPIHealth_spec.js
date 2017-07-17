var CPIHealth = require('../target/src/CPIHealth.js');

describe('CPIHealth', function() {

    it('greenpath returns expected json', function (done) {

        // ARRANGE
        const source = greenPathSource();
        const dateSource = {
            date: () => new Date(2017, 05, 20, 12, 0, 0, 0)
        }
        const sut = new CPIHealth(dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(true);
                expect(status).toBe(200);
                done();
            }
        };

        // ACT
        sut.health(source, res);
    });

    it('error from source returns expected json', function (done) {

        // ARRANGE
        const source = errorSource();
        const sut = new CPIHealth();
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(500);
                done();
            }
        };

        // ACT
        sut.health(source, res);
    });

    it('out of date date returns expected json', function (done) {

        // ARRANGE
        const source = outOfDateSource();
        const dateSource = {
            date: () => new Date(2017, 06, 20, 12, 0, 0, 0)
        }
        const sut = new CPIHealth(dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(503);
                done();
            }
        };

        // ACT
        sut.health(source, res);
    });

    it('date of next release before threshold returns expected json', function (done) {

        // ARRANGE
        const source = dateOfNextReleaseDateSource();
        const dateSource = {
            date: () => new Date(2017, 06, 20, 6, 0, 0, 0)
        }
        const sut = new CPIHealth(dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(true);
                expect(status).toBe(200);
                done();
            }
        };

        // ACT
        sut.health(source, res);
    });

    it('date of next release after threshold returns expected json', function (done) {

        // ARRANGE
        const source = dateOfNextReleaseDateSource();
        const dateSource = {
            date: () => new Date(2017, 06, 20, 16, 0, 0, 0)
        }
        const sut = new CPIHealth(dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(503);
                done();
            }
        };

        // ACT
        sut.health(source, res);
    });

    function errorSource() {
        return {
            get: function (callback) {
                callback('games up the pole', undefined);
            }
        }
    }

    function greenPathSource() {
        return {
            get: function (callback) {
                callback(undefined, {
                    releaseDate: '2017-06-01',
                    nextRelease: '2017-07-01'
                });
            }
        }
    }

    function outOfDateSource() {
        return {
            get: function (callback) {
                callback(undefined, {
                    releaseDate: '2016-06-01',
                    nextRelease: '2016-07-01'
                });
            }
        }
    }

    function dateOfNextReleaseDateSource() {
        return {
            get: function (callback) {
                callback(undefined, {
                    releaseDate: '2016-06-01',
                    nextRelease: '2016-06-20'
                });
            }
        }
    }
});
