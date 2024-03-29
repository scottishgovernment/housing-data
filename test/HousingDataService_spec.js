'use strict';

var HousingDataService = require('../src/HousingDataService.js');

describe('HousingDataService', function() {

    it('uses S3 target if enabled', function (done) {
        const cfg = config(true)
        const targets = HousingDataService.targets(cfg);
        expect(targets.length).toBe(1);
        expect(targets[0].constructor.name).toBe('S3CPIStore');
        done();
    });

    it('uses no targets if none enabled', function (done) {
        const cfg = config(false)
        const targets = HousingDataService.targets(cfg);
        expect(targets.length).toBe(0);
        done();
    });

    function config(s3Enabled) {
        return {
            s3: {
                enabled: s3Enabled,
                target: s3Enabled ? 's3://bucket/housing/cpi.json' : undefined
            },
            cpi: {
                update: {
                    retryInterval: 10000
                }
            }
        }
    }

});
