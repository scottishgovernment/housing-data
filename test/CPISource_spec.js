var CPISource = require('../src/CPISource.js');

describe('CPISource', function() {

    it('Returns error from store.latest', function(done) {
        // ARRANGE
        const source = undefined;
        const store = fakeStore('Error from latest', undefined);
        const sut = new CPISource(source, store, anyIndexer());

        // ACT
        sut.get()
        .then(done.fail)
        .catch(error => {
            // ASSERT
            expect(error).toEqual('Error from latest');
            done();
        });
    });

    it('Returns error from store.store', function(done) {
        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const store = fakeStore(undefined, { nextRelease: '2015-01-01'}, "Error from store", undefined);
        const sut = new CPISource(source, store, anyIndexer());

        // ACT
        sut.get()
        .then(done.fail)
        .catch(error => {
            // ASSERT
            expect(error).toEqual('Error from store');
            done();
        });
    });

    it('Returns error from source', function(done) {
        // ARRANGE
        const source = erroringSource('Error from source');
        const store = fakeStore(undefined, { nextRelease: '2015-01-01'}, "Error from store", undefined);
        const sut = new CPISource(source, store, anyIndexer());

        // ACT
        sut.get()
        .then(done.fail)
        .catch(error => {
            //ASSERT
            expect(error).toEqual('Error from source');
            done();
        });
    });

    it('Returns data from source if no data in store', function(done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const store = fakeStore(null, undefined, null, undefined);
        const sut = new CPISource(source, store, anyIndexer());

        // ACT
        sut.get()
        .then(data => {
            //ASSERT
            expect(data).toBe(dataFromSource);
            done();
        })
        .catch(done.fail);
    });

    it('Returns data from source if data in store is out of date', function(done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const dataFromStore = { nextRelease: '2017-01-01'};
        const store = fakeStore(null, dataFromStore, null, undefined);
        const sut = new CPISource(source, store, anyIndexer());

        // ACT
        sut.get()
        .then(data => {
            //ASSERT
            expect(data).toBe(dataFromSource);
            done();
        })
        .catch(done.fail);
    });

    it('Returns data from source if data on day of nextUpdate', function(done) {
        // ARRANGE
        const dataFromSource = { nextRelease: '2017-01-01'};
        const source = fakeSource(dataFromSource);
        const dataFromStore = { nextRelease: '2017-01-01'};
        const store = fakeStore(null, dataFromStore, null, undefined);
        const dateSource = {
            date: () => new Date(2017, 01, 01, 12, 0, 0, 0)
        };
        const sut = new CPISource(source, store, anyIndexer(), dateSource);

        // ACT
        sut.get()
        .then(data => {
            // ASSERT
            expect(data).toBe(dataFromSource);
            done();
        })
        .catch(done.fail);
    });

    it('Returns data from store if data up to date', function(done) {

        // ARRANGE
        const dataFromSource = { nextRelease: '2016-01-01'};
        const source = fakeSource(dataFromSource);
        const dataFromStore = { nextRelease: '2040-01-01'};
        const store = fakeStore(null, dataFromStore, null, undefined);
        const sut = new CPISource(source, store, anyIndexer());

        // ACT
        sut.get()
        .then(data => {
            //ASSERT
            expect(data).toBe(dataFromStore);
            done();
        })
        .catch(done.fail);
    });

    class FakeStore {
        constructor(latestError, latestData, storeError, storeData) {
            this.latestError = latestError;
            this.latestData = latestData;
            this.storeError = storeError;
            this.storeData = storeData;
        }

        latest() {
            if (this.latestError) {
                return Promise.reject(this.latestError);
            } else {
                return Promise.resolve(this.latestData);
            }
        }

        store(cpi) {
            if (this.storeError) {
                return Promise.reject(this.storeError);
            } else {
                return Promise.resolve(this.storeData);
            }
        }
    }

    function fakeStore(latestError, latestData, storeError, storeData) {
        return new FakeStore(latestError, latestData, storeError, storeData);
    }

    class FakeSource {
        constructor(data) {
            this.data = data;
        }
        get() {
            return Promise.resolve(this.data);
        }
    }

    function fakeSource(data) {
        return new FakeSource(data);
    }

    function erroringSource(error) {
        return {
            get: function () {
                return Promise.reject(error);
            }
        }
    }

    function anyIndexer() {
        return {
            async update() {
                // noop
            }
        }
    }

});
