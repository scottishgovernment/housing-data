'use strict';

var HousingHealth = require('../src/HousingHealth.js');

describe('HousingHealth', function() {

    it('greenpath returns expected json', function (done) {
        // ARRANGE
        const dateSource = {
           date: () => new Date(2017, 5, 20, 12, 0, 0, 0)
       };
        const sut = new HousingHealth(
            greenPathStore(), 'PT12H', healthyElasticsearch(), dateSource);
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
        sut.health(res);
    });

    it('error from source returns expected json', function (done) {

        // ARRANGE
        const sut = new HousingHealth(
            errorStore(), 'PT12H', healthyElasticsearch());
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
        sut.health(res);
    });

    it('no data in store returns expected json', function (done) {

        // ARRANGE
        const sut = new HousingHealth(
            noDataStore(), 'PT12H', healthyElasticsearch());
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
        sut.health(res);
    });

    it('out of date date returns expected json', function (done) {

        // ARRANGE
        const dateSource = {
            date: () => new Date(2017, 6, 20, 12, 0, 0, 0)
        }
        const sut = new HousingHealth(
            outOfDateStore(), 'PT12H', healthyElasticsearch(), dateSource);
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
        sut.health(res);
    });


    it('date of next release before threshold returns expected json', function (done) {

        // ARRANGE
        const dateSource = {
            date: () => new Date(2017, 5, 20, 10, 0, 0, 0)// note that the month is zero based
        }
        const sut = new HousingHealth(
            dateOfNextReleaseDateStore(), 'PT12H', healthyElasticsearch(), dateSource);
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
        sut.health(res);
    });

    it('date of next release after threshold returns expected json', function (done) {

        // ARRANGE
        const dateSource = {
            date: () => new Date(2017, 5, 20, 12, 1, 0, 0)// note that the month is zero based
        }
        const sut = new HousingHealth(
            dateOfNextReleaseDateStore(), 'PT12H', healthyElasticsearch(), dateSource);
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
        sut.health(res);
    });


    it('stopped elasticsearch returns expected json', function (done) {
        // ARRANGE
        const sut = new HousingHealth(
            greenPathStore(), 'PT12H', stoppedElasticsearch());

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
        sut.health(res);
    });

    it('unhealthly elasticsearch returns expected json', function (done) {
        // ARRANGE
        const sut = new HousingHealth(
            greenPathStore(), 'PT12H', unhealthlyElasticsearch());
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
        sut.health(res);
    });

    it('badly formed elasticsearch health returns expected json', function (done) {
        // ARRANGE
        const sut = new HousingHealth(
            greenPathStore(), 'PT12H', malformedHealthElasticsearch());
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
        sut.health(res);
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

    function stoppedElasticsearch() {
        return {
            cat : {
                health: function (params, callback) {
                    callback("error", undefined)
                }
            }
        }
    }

    function elasticsearchWithHealth(health) {
        return {
            cat: {
                health: function (params, callback) {
                    callback(undefined, [{ status : health }]);
                }
            }
        };
    }

    function healthyElasticsearch() {
        return elasticsearchWithHealth("green");
    }

    function unhealthlyElasticsearch() {
        return elasticsearchWithHealth("red");
    }

    function malformedHealthElasticsearch() {
        return {
            cat: {
                health: function (params, callback) {
                    callback(undefined, "malformedhealth")
                }
            }
        };
    }
});
