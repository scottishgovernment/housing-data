var CPIStore = require('../src/CPIStore.js');
const { MockAgent, setGlobalDispatcher, getGlobalDispatcher } = require('undici');

describe('CPIStore', function() {

    let mockAgent;
    let mockPool;
    let originalDispatcher;

    beforeEach(function() {
        originalDispatcher = getGlobalDispatcher();
        mockAgent = new MockAgent();
        setGlobalDispatcher(mockAgent);
        mockAgent.disableNetConnect();
        mockPool = mockAgent.get('http://localhost:1111');
    });

    afterEach(async function() {
        await mockAgent.close();
        setGlobalDispatcher(originalDispatcher);
    });

    it('returns latest if present', function (done) {

        // ARRANGE
        mockPool.intercept({
            path: '/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true',
            method: 'GET'
        }).reply(200, JSON.stringify(sampleLatest()), {
            headers: { 'content-type': 'application/json' }
        });
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
        mockPool.intercept({
            path: '/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true',
            method: 'GET'
        }).reply(200, JSON.stringify(noLatest()), {
            headers: { 'content-type': 'application/json' }
        });
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
        mockPool.intercept({
            path: '/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true',
            method: 'GET'
        }).replyWithError(new Error('connection error'));
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
        mockPool.intercept({
            path: '/ons/_design/ons/_view/cpi?limit=1&include_docs=true&descending=true',
            method: 'GET'
        }).reply(500, JSON.stringify({}), {
            headers: { 'content-type': 'application/json' }
        });
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
        mockPool.intercept({
            path: '/ons/_design/ons/_view/cpi?key=%22date%22',
            method: 'GET'
        }).reply(200, JSON.stringify(sampleLatest()), {
            headers: { 'content-type': 'application/json' }
        });
        const sut = new CPIStore('http://localhost:1111/');

        // ACT
        sut.store(cpi)
        .then(done)
        .catch(done.fail);
    });

    it('store item, error from couch on get', function (done) {

        // ARRANGE
        var cpi = sampleCpi();
        mockPool.intercept({
            path: '/ons/_design/ons/_view/cpi?key=%22date%22',
            method: 'GET'
        }).reply(500, JSON.stringify({}), {
            headers: { 'content-type': 'application/json' }
        });
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
