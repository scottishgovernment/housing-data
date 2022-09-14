var URLCPISource = require('../src/URLCPISource.js');

describe('URLCPISource', function() {

    it('can fetch cpi data', function (done) {

        // // ARRANGE
        var sut = new URLCPISource('https://www.ons.gov.uk/generator?format=csv&uri=/economy/inflationandpriceindices/timeseries/d7bt/mm23');

        // ACT
        sut.get((error, data) => {
            expect(error).toBe(null);
            expect(data.data.length).toBeGreaterThan(1);
            done();
        });
    });
});
