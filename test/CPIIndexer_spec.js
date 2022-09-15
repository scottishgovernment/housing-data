'use strict';
var CPIIndexer = require('../src/CPIIndexer.js');

describe('CPIIndexer', function(done) {

    it('out of date data in ES is updated', function (done) {
        // ARRANGE
        const elasticsearch = elasticsearchWithData(cpiWithReleaseDate('2010-01-01'));
        const store = storeWithData(cpiWithReleaseDate('2011-01-01'));
        const sut = new CPIIndexer(elasticsearch, store);

        // ACT
        sut.indexData()
        .then(() => {
            // ASSERT
            // the data from the store should have been indexed
            expect(elasticsearch.indexed.body.releaseDate).toBe('2011-01-01');
            done();
        })
        .catch(done.fail);
    });

    it('404 from ES results in new data being indexed in ES', function (done) {
        // ARRANGE
        const elasticsearch = elasticsearchWithNoData();
        const store = storeWithData(cpiWithReleaseDate('2011-01-01'));
        const sut = new CPIIndexer(elasticsearch, store);

        // ACT
        sut.indexData()
        .then(() => {
            // ASSERT
            // the data from the store should have been indexed
            expect(elasticsearch.indexed.body.releaseDate).toBe('2011-01-01');
            done();
        })
        .catch(done.fail);
    });

    it('up to date data in elasticsearch is not updated', function (done) {
        // ARRANGE
        const elasticsearch = elasticsearchWithData(cpiWithReleaseDate('2010-01-01'));
        const store = storeWithData(cpiWithReleaseDate('2010-01-01'));
        const sut = new CPIIndexer(elasticsearch, store);

        // ACT
        sut.indexData()
        .then(() => {
            // ASSERT
            // the data from the store should have been indexed
            expect(elasticsearch.indexed).toBe(undefined);
            done();
        })
        .catch(done.fail);
    });

    it('failure to conect to ES returned by callback', function (done) {
        // ARRANGE
        const ESerr = {
            statusCode: 500,
            msg: 'ES error'
        };
        const elasticsearch = failingGetElasticsearch(ESerr);
        const sut = new CPIIndexer(elasticsearch);

        // ACT
        sut.indexData()
        .then(done.fail)
        .catch(err => {
            // ASSERT
            expect(err).toBe(ESerr);
            done();
        });
    });

    it('error from store returned by callback', function (done) {
        // ARRANGE
        const elasticsearch = elasticsearchWithData(cpiWithReleaseDate('2010-01-01'));
        const storeErr = {
            msg: 'error'
        };
        const store = failingStore(storeErr);
        const sut = new CPIIndexer(elasticsearch, store);

        // ACT
        sut.indexData()
        .then(done.fail)
        .catch(err => {
            // ASSERT
            // the data from the store should have been indexed
            expect(err).toBe(storeErr);
            done();
        });
    });


    it('error from ES index call returned by callback', function (done) {
        // ARRANGE
        const indexErr = {
            msg: 'error'
        };
        const elasticsearch = failingIndexElasticsearch(cpiWithReleaseDate('2010-01-01'), indexErr);
        const store = storeWithData(cpiWithReleaseDate('2011-01-01'));
        const sut = new CPIIndexer(elasticsearch, store);

        // ACT
        sut.indexData()
        .then(done.fail)
        .catch(err => {
            // ASSERT
            expect(err).toBe(indexErr);
            done();
        });
    });

    // elasticsearch that returns expected data and remembers what go tindexes
    function elasticsearchWithData(data) {
        return {
            indexed: undefined,

            get: async function(doc) {
                return {
                    _source: data
                };
            },

            indices: {
                exists: async function() {
                    return true;
                },
                create: async function() {
                    // noop
                },
                putMapping: async function(client) {
                    // noop
                }
            },

            index: async function (doc) {
                this.indexed = doc;
                return data;
            }

        };
    }

    function elasticsearchWithNoData() {
        return {
            indexed: undefined,

            get: async function(doc) {
                throw {
                    statusCode: 404
                };
            },

            indices: {
                exists: async function() {
                    return false;
                },
                create: async function() {
                    // noop
                },
                putMapping: async function(client) {
                    // noop
                }
            },

            index: async function(doc) {
                this.indexed = doc;
                return {};
            }

        };
    }

    function failingGetElasticsearch(err) {
        return {
            indexed: undefined,

            get: async function(doc) {
                throw err;
            }

        }
    }

    function failingIndexElasticsearch(getData, err) {
        return {
                get: async function(doc) {
                    return {
                        _source: getData
                    };
                },

                indices: {
                    exists: async function() {
                        return false;
                    },
                    create: async function() {
                        // noop
                    },    
                    putMapping: async function(client) {
                        // noop
                    }
                },

                index: async function(doc) {
                    throw err;
                }
        }
    }

    function storeWithData(data) {
        return {
            latest: () => Promise.resolve(data)
        }
    }

    function failingStore(err) {
        return {
            latest: () => Promise.reject(err)
        }
    }

    function cpiWithReleaseDate(date) {
        return {
            releaseDate: date
        }
    }
});
