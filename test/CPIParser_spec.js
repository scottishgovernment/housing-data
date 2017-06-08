var CPIParser = require('../target/src/CPIParser.js');

describe('CPIParser', function() {

    it('canParseSample', function (done) {

        // ARRANGE
        var sut = new CPIParser();
        var inputStream = require('fs').createReadStream('test/sampleCPI.csv');

        // ACT
        sut.parse(inputStream, (error, cpiData) => {
          // ASSERT

          // should contains expected metedata
          expect(cpiData.cdid).toBe('D7BT');
          expect(cpiData.datasetId).toBe('MM23');
          expect(cpiData.releaseDate).toBe('2017-05-16');
          expect(cpiData.nextRelease).toBe('2017-06-13');

          // the first and last rows are as expected
          expect(cpiData.data[0].year).toBe(1988);
          expect(cpiData.data[0].month).toBe(1);
          expect(cpiData.data[0].value).toBe(48.4);

          expect(cpiData.data[cpiData.data.length - 1].year).toBe(2017);
          expect(cpiData.data[cpiData.data.length - 1].month).toBe(4);
          expect(cpiData.data[cpiData.data.length - 1].value).toBe(102.9);

          done();
        });
    });

    it('error from empty file', function (done) {

        // ARRANGE
        var sut = new CPIParser();
        var inputStream = require('fs').createReadStream('test/empty.csv');

        // ACT
        sut.parse(inputStream, (error, cpiData) => {
          // ASSERT

          // should contains expected metedata
          expect(cpiData).toBe(undefined);
          expect(error).toBeDefined()
          done();
        });
    });

});
