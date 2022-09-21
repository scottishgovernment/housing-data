'use strict';

var HousingDataService = require('../src/HousingDataService.js');

describe('HousingDataService', function() {

    it('uses Elasticsearch target if enabled', function (done) {
        const cfg = config(true, false)
        const targets = HousingDataService.targets(cfg);
        expect(targets.length).toBe(1);
        expect(targets[0].constructor.name).toBe('RetryingCPIIndexer');
        done();
    });

    it('uses S3 target if enabled', function (done) {
        const cfg = config(false, true)
        const targets = HousingDataService.targets(cfg);
        expect(targets.length).toBe(1);
        expect(targets[0].constructor.name).toBe('S3CPIStore');
        done();
    });

    function config(esEnabled, s3Enabled) {
        return {
            elasticsearch: {
                enabled: esEnabled
            },
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
