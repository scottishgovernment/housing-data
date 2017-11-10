'use strict';

var Mapcloud = require('../../target/src/rpz/Mapcloud.js');
var nock = require('nock');
describe('Mapcloud', function() {

    it('postcodeForUprn network error returned as expected', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        const error = { msg:'expectedError'};
        var scope = nock(config.url)
            .get('/address/addressbase/uprn?addrformat=2&uprn=111')
            .replyWithError(error);

        // ACT
        sut.postcodeForUprn('111', (err, data) => {
            // ASSERT
            expect(err).toBe(error);
            done();
        });
    });

    it('postcodeForUprn 404 returned as expected', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        var scope = nock(config.url)
            .get('/address/addressbase/uprn?addrformat=2&uprn=111')
            .reply(404);

        // ACT
        sut.postcodeForUprn('111', (err, data) => {
            // ASSERT
            expect(err.statusCode).toBe(404);
            done();
        });
    });

    it('postcodeForUprn 0 results returns an error', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        var scope = nock(config.url)
            .get('/address/addressbase/uprn?addrformat=2&uprn=111')
            .reply(200, { totalResults: 0 });

        // ACT
        sut.postcodeForUprn('111', (err, data) => {
            // ASSERT
            expect(err).toBe('Unexpected results count for uprn : 111 0');
            done();
        });
    });

    it('postcodeForUprn greenpath', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        var scope = nock(config.url)
            .get('/address/addressbase/uprn?addrformat=2&uprn=111')
            .reply(200, { totalResults: 1, results: [{postcode:'EH10 4AX'}]});

        // ACT
        sut.postcodeForUprn('111', (err, data) => {
            // ASSERT
            expect(err).toBe(undefined);
            expect(data).toEqual({ uprn: '111', postcode: 'EH10 4AX' });
            done();
        });
    });

    it('uprnForPostcode network error returned as expected', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        const error = { msg:'expectedError'};
        var scope = nock(config.url)
            .get('/address/addressbase/postcode?pc=EH104AX')
            .replyWithError(error);

        // ACT
        sut.uprnsForPostcode('EH104AX', (err, data) => {
            // ASSERT
            expect(err).toBe(error);
            done();
        });
    });

    it('uprnForPostcode 404 error returned as expected', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        const error = { msg:'expectedError'};
        var scope = nock(config.url)
            .get('/address/addressbase/postcode?pc=EH104AX')
            .reply(404);

        // ACT
        sut.uprnsForPostcode('EH104AX', (err, data) => {
            // ASSERT
            expect(err.statusCode).toBe(404);
            done();
        });
    });

    it('uprnForPostcode greenpath', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Mapcloud(config)
        var scope = nock(config.url)
            .get('/address/addressbase/postcode?pc=EH104AX')
            .reply(200, { totalResults: 3, results: [
                    {uprn:'111'},
                    {uprn:'222'},
                    {uprn:'333'},
                ]});

        // ACT
        sut.uprnsForPostcode('EH104AX', (err, data) => {
            // ASSERT
            expect(data).toEqual(
                {
                    postcode: 'EH104AX',
                    uprns: ['111', '222', '333']
                });
            done();
        });
    });

    function anyConfig() {
        return {
            user: 'useername',
            password: 'password',
            url: 'http://url.com/'
        };
    }
});
