'use strict';

var RPZService = require('../../src/rpz/RPZService.js');

describe('RPZService', function() {

    it('get returns data from db', function (done) {
        // ARRANGE
        const id = 'anyid';
        const rpz = rpzWithId(id);
        const sut = new RPZService(dbWithRpzs([rpz]));

        // ACT
        sut.get(id, (err, actualRpz) => {
            expect(err).toBe(undefined);
            expect(actualRpz).toEqual(rpz);
            done();
        });
    });

    it('get returns error from db', function (done) {
        // ARRANGE
        const expectedError = 'get error';
        const sut = new RPZService(errorDB(expectedError));

        // ACT
        sut.get('id', (err, rpz) => {
            expect(err).toBe(expectedError);
            expect(rpz).toBe(undefined);
            done();
        });
    });

    it('delete returns error if item not in db', function (done) {
        // ARRANGE
        const expectedError = 'get error';
        const sut = new RPZService(errorDB(expectedError));

        // ACT
        sut.delete('id', 'username', (err, rpz) => {
            expect(err).toBe(expectedError);
            expect(rpz).toBe(undefined);
            done();
        });
    });

    it('delete sets deleted flag', function (done) {
        // ARRANGE
        const id = 'anyid';
        const rpz = rpzWithId(id);
        const sut = new RPZService(dbWithRpzs([rpz]));

        // ACT
        sut.delete(id, 'username', (err, actualRpz) => {
            expect(err).toBe(undefined);
            expect(actualRpz.deleted).toBe(true);
            expect(actualRpz.username).toBe('username');
            done();
        });

    });

    it('list returns error from db', function (done) {
        // ARRANGE
        const expectedError = 'list error';
        const sut = new RPZService(errorDB(expectedError));

        // ACT
        sut.list((err, rpzs) => {
            expect(err).toBe(expectedError);
            expect(rpzs).toBe(undefined);
            done();
        });
    });

    it('list returns items from db in expected format', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([rpzWithId('rpz1'), rpzWithId('rpz2')]));
        const expected = [
            {id: 'rpz1', rev: 'rpz1-1'},
            {id: 'rpz2', rev: 'rpz2-1'}
        ];

        // ACT
        sut.list((err, rpzs) => {
            expect(err).toBe(undefined);
            expect(rpzs).toEqual(expected);
            done();
        });
    });

    it('listDetail returns error from db', function (done) {
        // ARRANGE
        const expectedError = 'list error';
        const sut = new RPZService(errorDB(expectedError));

        // ACT
        sut.listDetail((err, rpzs) => {
            expect(err).toBe(expectedError);
            expect(rpzs).toBe(undefined);
            done();
        });
    });

    it('listDetail returns items from db in expected format', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([rpzWithId('rpz1'), rpzWithId('rpz2')]));
        const expected = [
            rpzWithId('rpz1'),
            rpzWithId('rpz2')
        ];

        // ACT
        sut.listDetail((err, rpzs) => {
            expect(err).toBe(undefined);
            expect(rpzs).toEqual(expected);
            done();
        });
    });

    it('create greenpath', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([]), mapcloudWithLookups());
        const rpz = rpzWithId();
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err).toBe(undefined);
            expect(rpzOut.username).toEqual(username);
            expect(rpzOut.history).toEqual([]);
            expect(rpzOut.timestamp).toBeDefined();
            done();
        });
    });

    it('update greenpath', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([rpzWithId('one')]), mapcloudWithLookups());
        const rpz = rpzWithId('one');
        rpz.name = 'changed name';
        const username = 'username';

        // ACT
        sut.update('one', rpz, username, (err, rpzOut) => {
            expect(err).toBe(undefined);
            done();
        });
    });

    it('create returns error for invlaid fromDate', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([]));
        const rpz = rpzWithInvalidFromDate('one');
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err) => {
            expect(err[0].field).toEqual('fromDate');
            done();
        });
    });

    it('create returns error for invlaid toDate', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([]));
        const rpz = rpzWithInvalidToDate('one');
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err) => {
            expect(err[0].field).toEqual('toDate');
            done();
        });
    });

    it('update returns error for invlaid fromDate', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([rpzWithId('one')]));
        const rpz = rpzWithInvalidFromDate('one');
        const username = 'username';

        // ACT
        sut.update('one', rpz, username, (err) => {
            expect(err[0].field).toEqual('fromDate');
            done();
        });
    });

    it('update returns error for invlaid toDate', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([rpzWithId('one')]));
        const rpz = rpzWithInvalidToDate('one');
        const username = 'username';

        // ACT
        sut.update('one', rpz, username, (err) => {
            expect(err[0].field).toEqual('toDate');
            done();
        });
    });

    it('no postcodes or uprns returns error', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([]));
        const rpz = rpzWithPostcodes('two', []);
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err[0].field).toBe('postcodes');
            done();
        });
    });

    it('create returns error if unable to fetch validation data', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([]), errorMapcloud('mapclouderror'));

        // ACT
        sut.create(rpzWithId('1'), 'username', (err) => {
            expect(err).toEqual(['mapclouderror']);
            done();
        });
    });

    it('create postcode already used returns error', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([
            rpzWithPostcodes('one', ['G11QF'])
        ]), mapcloudWithLookups());
        const rpz = rpzWithPostcodes('two', ['G1 1QF']);
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err.length).toBe(1);
            expect(err[0].field).toBe('postcode');
            done();
        });
    });

    it('create with uprn already taken by postcode returns error', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([
            rpzWithPostcodes('one', ['G11QF'])
        ]), mapcloudWithLookups());
        const rpz = rpzWithUprns('two', ['10091788680']);
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err[0].field).toBe('uprn');
            done();
        });
    });

    it('create with uprn already taken returns error', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([
            rpzWithUprns('one', ['10091788680'])
        ]), mapcloudWithLookups());
        const rpz = rpzWithUprns('two', ['10091788680']);
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err[0].field).toBe('uprn');
            done();
        });
    });

    it('create with postcode already taken by uprn returns error', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([
            rpzWithUprns('one', ['906169837'])
        ]), mapcloudWithLookups());
        const rpz = rpzWithPostcodes('two', ['EH10 4AX']);
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err[0].field).toBe('uprn');
            done();
        });
    });

    it('create with uprn already taken returns no error if date ranges do not overlap', function (done) {
        // ARRANGE
        const sut = new RPZService(dbWithRpzs([
            rpzWithUprns('one', ['10091788680'])
        ]), mapcloudWithLookups());
        const rpz = rpzWithUprnsAndDateRange('two', '2020-01-01', '2020-02-01', ['10091788680']);
        const username = 'username';

        // ACT
        sut.create(rpz, username, (err, rpzOut) => {
            expect(err).toBe(undefined);
            done();
        });
    });

    function dbWithRpzs(items) {

        var itemsById = {};
        items.forEach(item => itemsById[item.id] = item);

        return {
            get(id, cb) {
                if (!itemsById[id]) {
                    cb('not found error');
                } else {
                    cb(undefined, itemsById[id]);
                }
            },

            insert(rpz, cb) {
                cb(undefined, rpz);
            },

            atomic(designname, updatename, id, rpz, cb) {

                console.log(id, rpz);
                if (!itemsById[id]) {
                    cb('not found error');
                } else {
                    cb(undefined, rpz);
                }
            },

            list(cb) {
                var res = {
                    rows: items.map(item => {
                        var mappedItem = {
                            id: item.id,
                            value: item
                        };
                        mappedItem.value.rev = item.id + '-1';
                        return mappedItem;
                    })
                };
                cb(undefined, res);
            },

            view(designname, viewname, cb) {
                var res = {
                    rows: items.map(item => {
                        item._id = item.id;
                        return {
                            id: item.id,
                            value: item
                        };
                    })
                };
                cb(undefined, res);
            }
        };
    }

    function errorDB(error) {
        return {
            get(id, cb) {
                cb(error, undefined);
            },

            list(cb) {
                cb(error, undefined);
            },

            view(designname, viewname, cb) {
                cb(error, undefined);
            }
        };
    }

    function rpzWithId(id) {
        return {
            id: id,
            "name": "rpzwithid-"+id,
            "fromDate": "2010-01-01",
            "toDate": "2011-01-01",
            "maxIncrease": 1.7,
            "postcodes": [],
            "uprns": ["906169837"],
            "history": []
        }
    }

    function rpzWithInvalidFromDate(id) {
        var rpz = rpzWithId(id);
        rpz.fromDate = invalidDate();
        return rpz;
    }

    function rpzWithInvalidToDate(id) {
        var rpz = rpzWithId(id);
        rpz.toDate = invalidDate();
        return rpz;
    }

    function rpzWithPostcodes(id, postcodes) {
        var rpz = rpzWithId(id);
        rpz.uprns = [];
        rpz.postcodes = postcodes;
        return rpz;
    }

    function rpzWithUprns(id, uprns) {
        var rpz = rpzWithId(id);
        rpz.uprns = uprns;
        rpz.postcodes = [];
        return rpz;
    }

    function rpzWithUprnsAndDateRange(id, fromDate, toDate, uprns) {
        var rpz = rpzWithId(id);
        rpz.uprns = uprns;
        rpz.postcodes = [];
        rpz.fromDate = fromDate;
        rpz.toDate = toDate;
        return rpz;
    }

    function invalidDate() {
        return 'invalidDate';
    }

    function errorMapcloud(err) {
        return {
            postcodeForUprn(uprn, callback) {
                callback(err);
            },

            uprnsForPostcode(postcode, callback) {
                callback(err);
            }
        }
    }

    function mapcloudWithLookups() {
        const data = [
            {
                postcode: 'G11QF',
                uprns: [ 10091788680, 906700168378, 906700168379 ]
            },

            {
                postcode: 'EH104AX',
                uprns: [ 906169837, 906169846, 906395749, 906169860, 906169869, 906169872 ]
            }
        ]
        var byPostcode = {};
        var byUprn = {};
        data.forEach(item => {
            byPostcode[item.postcode] = item;
            item.uprns.forEach(uprn => byUprn[uprn] = item);
        });

        return {
            postcodeForUprn(uprn, callback) {
                callback(undefined, {
                    uprn: uprn,
                    postcode: byUprn[uprn].postcode
                });
            },

            uprnsForPostcode(postcode, callback) {
                if (byPostcode[postcode]) {
                    callback(undefined, {
                        postcode: postcode,
                        uprns: byPostcode[postcode].uprns
                    });
                } else {
                    callback(undefined, []);
                }

            }
        }
    }

});
