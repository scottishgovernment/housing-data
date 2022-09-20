'use strict';

var HousingHealth = require('../src/HousingHealth.js');

describe('HousingHealth', function() {

    it('greenpath returns expected json', function (done) {
        // ARRANGE
        const dateSource = {
           date: () => new Date(2017, 5, 20, 12, 0, 0, 0)
       };
        const sut = new HousingHealth(greenPathStore(), 'PT12H', dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(true);
                expect(status).toBe(200);
            }
        };

        // ACT
        sut.health(res)
        .then(() => done());
    });

    it('error from source returns expected json', function (done) {

        // ARRANGE
        const sut = new HousingHealth(errorStore(), 'PT12H');
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(503);
            }
        };

        // ACT
        sut.health(res)
        .then(() => done());
    });

    it('no data in store returns expected json', function (done) {

        // ARRANGE
        const sut = new HousingHealth(noDataStore(), 'PT12H');
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(503);
            }
        };

        // ACT
        sut.health(res)
        .then(() => done());
    });

    it('out of date date returns expected json', function (done) {

        // ARRANGE
        const dateSource = {
            date: () => new Date(2017, 6, 20, 12, 0, 0, 0)
        }
        const sut = new HousingHealth(
            outOfDateStore(), 'PT12H', dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(503);
            }
        };

        // ACT
        sut.health(res)
        .then(() => done());
    });


    it('date of next release before threshold returns expected json', function (done) {

        // ARRANGE
        const dateSource = {
            date: () => new Date(2017, 5, 20, 10, 0, 0, 0)// note that the month is zero based
        }
        const sut = new HousingHealth(
            dateOfNextReleaseDateStore(), 'PT12H', dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(true);
                expect(status).toBe(200);
            }
        };

        // ACT
        sut.health(res)
        .then(() => done());
    });

    it('date of next release after threshold returns expected json', function (done) {

        // ARRANGE
        const dateSource = {
            date: () => new Date(2017, 5, 20, 12, 1, 0, 0)// note that the month is zero based
        }
        const sut = new HousingHealth(
            dateOfNextReleaseDateStore(), 'PT12H', dateSource);
        var status;
        var res = {
            status: s => status = s,
            send: json => {
                // ASSERT
                expect(json.ok).toBe(false);
                expect(status).toBe(503);
            }
        };

        // ACT
        sut.health(res)
        .then(() => done());
    });

    function errorStore() {
        return {
            latest: async function() {
                throw 'games up the pole';
            }
        }
    }

    function noDataStore() {
        return {
            latest: async function() {
                return null;
            }
        }
    }

    function greenPathStore() {
        return {
            latest: async function() {
                return {
                    releaseDate: '2017-06-01',
                    nextRelease: '2017-07-01'
                };
            }
        }
    }

    function outOfDateStore() {
        return {
            latest: async function() {
                return {
                    releaseDate: '2016-06-01',
                    nextRelease: '2016-07-01'
                };
            }
        }
    }

    function dateOfNextReleaseDateStore() {
        return {
            latest: async function() {
                return {
                    releaseDate: '2017-06-01',
                    nextRelease: '2017-06-20'
                };
            }
        }
    }

});
