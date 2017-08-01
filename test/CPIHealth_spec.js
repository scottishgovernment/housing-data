'use strict';

var CPIHealth = require('../target/src/CPIHealth.js');

describe('CPIHealth', function() {

    it('greenpath returns expected json', function (done) {
        // ARRANGE
        const store = greenPathStore();
        const elasticsearch = healthyElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 5, 20, 12, 0, 0, 0)
        };
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('error from source returns expected json', function (done) {

        // ARRANGE
        const store = errorStore();
        const elasticsearch = healthyElasticsearch();
        const sut = new CPIHealth('PT12H', elasticsearch, {});
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
        sut.health(store, res);
    });

    it('no data in store returns expected json', function (done) {

        // ARRANGE
        const store = noDataStore();
        const elasticsearch = healthyElasticsearch();
        const sut = new CPIHealth('PT12H', elasticsearch, {});
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
        sut.health(store, res);
    });

    it('out of date date returns expected json', function (done) {

        // ARRANGE
        const store = outOfDateStore();
        const elasticsearch = healthyElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 6, 20, 12, 0, 0, 0)
        }
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('date of next release before threshold returns expected json', function (done) {

        // ARRANGE
        const store = dateOfNextReleaseDateStore();
        const elasticsearch = healthyElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 5, 20, 10, 0, 0, 0)// note that the month is zero based
        }
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('date of next release after threshold returns expected json', function (done) {

        // ARRANGE
        const store = dateOfNextReleaseDateStore();
        const elasticsearch = healthyElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 5, 20, 13, 0, 0, 0)// note that the month is zero based
        }
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('date of next release after threshold returns expected json', function (done) {

        // ARRANGE
        const store = dateOfNextReleaseDateStore();
        const elasticsearch = healthyElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 6, 20, 16, 0, 0, 0)
        }
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('stopped elasticsearch returns expected json', function (done) {
        // ARRANGE
        const store = greenPathStore();
        const elasticsearch = stoppedElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 5, 20, 12, 0, 0, 0)
        };
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('unhealthly elasticsearch returns expected json', function (done) {
        // ARRANGE
        const store = greenPathStore();
        const elasticsearch = unhealthlyElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 5, 20, 12, 0, 0, 0)
        };
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });

    it('badlt formed elasticsearch health returns expected json', function (done) {
        // ARRANGE
        const store = greenPathStore();
        const elasticsearch = malformedHealthElasticsearch();
        const dateSource = {
            date: () => new Date(2017, 5, 20, 12, 0, 0, 0)
        };
        const sut = new CPIHealth('PT12H', elasticsearch, {}, dateSource);
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
        sut.health(store, res);
    });


    function errorStore() {
        return {
            latest: function (callback) {
                callback('games up the pole', undefined);
            }
        }
    }

    function noDataStore() {
        return {
            latest: function (callback) {
                callback(undefined, undefined);
            }
        }
    }

    function greenPathStore() {
        return {
            latest: function (callback) {
                callback(undefined, {
                    releaseDate: '2017-06-01',
                    nextRelease: '2017-07-01'
                });
            }
        }
    }

    function outOfDateStore() {
        return {
            latest: function (callback) {
                callback(undefined, {
                    releaseDate: '2016-06-01',
                    nextRelease: '2016-07-01'
                });
            }
        }
    }

    function dateOfNextReleaseDateStore() {
        return {
            latest: function (callback) {
                callback(undefined, {
                    releaseDate: '2017-06-01',
                    nextRelease: '2017-06-20'
                });
            }
        }
    }

    function stoppedElasticsearch() {
        var es = {
            Client: class Client {
                constructor() {
                    this.cat = {
                        health: function (callback) {
                            callback("error", undefined)
                        }
                    }
                }
            }
        };
        return es;
    }

    function elasticsearchWithHealth(health) {
        var es = {
            Client: class Client {
                constructor() {
                    this.cat = {
                        health: function (callback) {
                            callback(undefined, "1501228724 08:58:44 govscot-lgv " + health +" 1 1 15 15 0 0 0 0 - 100.0%\n")
                        }
                    }
                }
            }
        };
        return es;
    }

    function healthyElasticsearch() {
        return elasticsearchWithHealth("green");
    }


    function unhealthlyElasticsearch() {
        return elasticsearchWithHealth("red");
    }

    function malformedHealthElasticsearch() {
        var es = {
            Client: class Client {
                constructor() {
                    this.cat = {
                        health: function (callback) {
                            callback(undefined, "malformedhealth")
                        }
                    }
                }
            }
        };
        return es;
    }
});
