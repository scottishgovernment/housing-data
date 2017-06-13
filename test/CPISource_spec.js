var CPISource = require('../target/src/CPISource.js');

describe('CPISource', function() {

    it('Returns error from store.latest', function (done) {

        // ARRANGE
        const source = undefined;
        const store = fakeStore('Error from latest', undefined);
        const sut = new CPISource(source, store);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toEqual('Error from latest');
            expect(data).toBeUndefined();
            done();
        });
    });

    it('Returns error from store.store', function (done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const store = fakeStore(undefined, { nextRelease: '2015-01-01'}, "Error from store", undefined);
        const sut = new CPISource(source, store);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toEqual('Error from store');
            expect(data).toBeUndefined();
            done();
        });
    });

    it('Returns error from source', function (done) {

        // ARRANGE
        const source = erroringSource('Error from source');
        const store = fakeStore(undefined, { nextRelease: '2015-01-01'}, "Error from store", undefined);
        const sut = new CPISource(source, store);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toEqual('Error from source');
            expect(data).toBeUndefined();
            done();
        });
    });

    it('Returns data from source if no data in store', function (done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const store = fakeStore(null, undefined, null, undefined);
        const sut = new CPISource(source, store);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toBeNull();
            expect(data).toBe(dataFromSource);
            done();
        });
    });

    it('Returns data from source if data in store is out of date', function (done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const dataFromStore = { nextRelease: '2017-01-01'};
        const store = fakeStore(null, dataFromStore, null, undefined);
        const sut = new CPISource(source, store);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toBeNull();
            expect(data).toBe(dataFromSource);
            done();
        });
    });

    it('Returns data from source if data on day of nextUpdate', function (done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const dataFromStore = { nextRelease: '2017-01-01'};
        const store = fakeStore(null, dataFromStore, null, undefined);
        const dateSource = {
            date: () => new Date(2017, 01, 01, 12, 0, 0, 0)
        };
        const sut = new CPISource(source, store, dateSource);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toBeNull();
            expect(data).toBe(dataFromSource);
            done();
        });
    });

    it('Returns data from store if data up to date', function (done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2016-01-01'};
        const source = fakeSource(dataFromSource);
        const dataFromStore = { nextRelease: '2018-01-01'};
        const store = fakeStore(null, dataFromStore, null, undefined);
        const sut = new CPISource(source, store);

        // ACT
        sut.get((error, data) => {
            //ASSERT
            expect(error).toBeNull();
            expect(data).toBe(dataFromStore);
            done();
        });
    });

    function fakeStore(latestError, latestData, storeError, storeData) {
        return {
            latest: function (callback) {
                callback(latestError, latestData);
            },

            store: function (cpi, callback) {
                callback(storeError, storeData);
            }
        }
    }

    function fakeSource(data) {
        return {
            get: function (callback) {
                callback(null, data);
            }
        }
    }

    function erroringSource(error) {
        return {
            get: function (callback) {
                callback(error);
            }
        }
    }

});
