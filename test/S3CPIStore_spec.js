var S3CPIStore = require('../src/S3CPIStore.js');

describe('S3CPIStore', function() {

    it('parses the target configuration value', function () {
        const sut = new S3CPIStore('eu-west-1', 's3://mybucket/path/to/cpi.json');
        expect(sut.bucket).toBe('mybucket');
        expect(sut.key).toBe('/path/to/cpi.json');
    });

    it('rejects invalid target configuration value', function (done) {
        try {
            const sut = new S3CPIStore('eu-west-1', 'http://mybucket/path/to/cpi.json');
            done.fail();
        } catch (e) {
            done();
        }
    });

});
