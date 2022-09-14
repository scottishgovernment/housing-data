'use strict';

var Europa = require('../../src/rpz/Europa.js');
var nock = require('nock');
describe('Europa', function() {

    it('postcodeForUprn network error returned as expected', function (done) {
        // ARRANGE
        const config = anyConfig();
        const sut = new Europa(config)
        const error = { msg:'expectedError'};
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&uprn=111')
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
        const sut = new Europa(config)
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&uprn=111')
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
        const sut = new Europa(config)
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&uprn=111')
            .reply(200, { metadata : { count : 0 } });

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
        const sut = new Europa(config)
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&uprn=111')
            .reply(200,
                {
                    metadata : { count : 1 },
                    results: [
                        {
                            address: [
                                {
                                    lpi_postcode: "EH10 4AX"
                                }
                            ]
                        }
                    ]
                }
            );

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
        const sut = new Europa(config)
        const error = { msg:'expectedError'};
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&addresstype=dpa&postcode=EH104AX')
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
        const sut = new Europa(config)
        const error = { msg:'expectedError'};
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&addresstype=dpa&postcode=EH104AX')
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
        const sut = new Europa(config)
        var scope = nock(config.url)
            .get('/os/abpr/address?fieldset=all&addresstype=dpa&postcode=EH104AX')
            .reply(200,
                {
                    metadata : { count : 2 },
                    results: [
                        {
                            address: [
                                {
                                    uprn:'111'
                                },

                                {
                                    uprn:'222'
                                },
                                
                                {
                                    uprn:'333'
                                }
                            ]
                        }
                    ]
                }
            );

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
