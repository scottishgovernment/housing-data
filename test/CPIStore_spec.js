var CPIStore = require('../target/src/CPIStore.js');

describe('CPIStore', function() {

    it('returns latest if present', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .reply(200, sampleLatest());
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest(function (err, res) {
            console.log(res);
            expect(err).toBe(undefined);
            expect(res._id).toBeUndefined();
            expect(res._res).toBeUndefined();
            expect(res.title).toBe('title');
            done();
        });
    });

    it('no latest', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .reply(200, noLatest());
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest(function (err, res) {
            console.log(res);
            expect(err).toBeNull();
            expect(res).toBeNull();
            done();
        });
    });


    it('error from latest', function (done) {

        // ARRANGE
        require('nock')('http://localhost:1111/')
            .get('/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true')
            .reply(500, noLatest());
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.latest(function (err, res) {
            console.log(res);
            expect(err).toBeDefined();
            expect(res).toBeNull();
            done();
        });
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
});
