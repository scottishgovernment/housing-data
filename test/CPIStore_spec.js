var CPIStore = require('../src/CPIStore.js');

describe('CPIStore', function() {

    const nock = require('nock');

    it('returns latest if present', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .reply(200, sampleLatest());
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest()
        .then(res => {
            expect(res._id).toBeUndefined();
            expect(res._res).toBeUndefined();
            expect(res.title).toBe('title');
            done();
        })
        .catch(done.fail);
    });

    it('no latest', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .reply(200, noLatest());
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest()
        .then(res => {
            expect(res).toBeNull();
            done();
        })
        .catch(done.fail);
    });

    it('error from latest', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .replyWithError({});
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest()
        .then(done.fail)
        .catch(err => {
            expect(err).toBeDefined();
            done();
        });
    });

    it('500 from latest', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .reply(500, {});
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest()
        .then(done.fail)
        .catch(err => {
            expect(err).toBeDefined();
            done();
        });
    });


    it('store item, item already exists', function (done) {

        // ARRANGE
        var cpi = sampleCpi();
        nock('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?key=%22date%22')
            .reply(200, sampleLatest);
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.store(cpi)
        .then(done)
        .catch(done.fail);
    });

    it('store item, error from couch on get', function (done) {

        // ARRANGE
        var cpi = sampleCpi();
        nock('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?key=%22date%22')
            .reply(500, {});
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.store(cpi)
        .then(done.fail)
        .catch(() => { done(); })
    });


    function sampleLatest() {
        return {

            total_rows: 3,
            rows: [
                {
                    doc: {
                        _id: 'deleteme',
                        _rev: 'deleteme',
                        title: 'title'
                    }
                }
            ]

        };
    }

    function noLatest() {
        return {
            total_rows: 0,
            rows: [
            ]
        };
    }

    function sampleCpi() {
        return {
            releaseDate: 'date'
        }
    }
});
