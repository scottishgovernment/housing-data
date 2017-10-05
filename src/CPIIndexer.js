'use strict';

const config = require('config-weaver').config();

/**
 * Used to update Elasticsearch CPI data using a CPIStore.
 *
 * When indexData is called it will try to fetch CPI data from elasticsearch and
 * from the CPIStore.  If either there is no data in ES or it is older than the
 * data in the CPIStore then index the newer data.
 **/
class CPIIndexer {

    constructor(elasticsearchClient, store) {
        this.elasticsearchClient = elasticsearchClient;
        this.store = store;
    }

    indexData(callback) {
        fetchDataFromElasticsearch(this.elasticsearchClient,
            (fetchESErr, cpiFromES) => {
                // if we were able to talk to ES but it does not contain any CPI
                // data the status code will be 404
                const noCPIDataInES = fetchESErr && fetchESErr.statusCode === 404;
                if (fetchESErr && !noCPIDataInES) {
                   callback(fetchESErr);
                   return;
                }

                // get data from the store
                this.store.latest((storeError, cpiFromStore) => {
                    if (storeError) {
                        callback(storeError);
                        return;
                    }

                    // if there is no CPI data in ES or it is out of date then
                    // index the data in ES.
                    if (noCPIDataInES || esOutOfDate(cpiFromES, cpiFromStore)) {
                        indexToElasticsearch(
                            this.elasticsearchClient,
                            cpiFromStore,
                            callback);
                    } else {
                        console.log('CPIIndexer. Elasticsearch data is up to date.');
                        callback();
                    }
                });
            }
        );
    }
}

function esOutOfDate(cpiFromES, cpiFromStore) {
    var outOfDate = cpiFromStore.releaseDate.localeCompare(cpiFromES.releaseDate) > 0;
    return outOfDate;
}

function fetchDataFromElasticsearch(elasticsearchClient, callback) {
    const doc = elasticsearchData();
    elasticsearchClient.get(doc, (error, response) => {
        if (error) {
            if (error.statusCode === 404) {
                console.log('CPIIndexer: No CPI data in elasticsearch (got 404)');
            } else {
                console.log('CPIIndexer: Failed to get CPI data from elasticsearch: ', response, error);
            }
            callback(error, undefined);
            return;
        }
        callback(undefined, response._source);
    });
}

function indexToElasticsearch(elasticsearchClient, cpiData, callback) {
    const doc = elasticsearchData(cpiData);
    elasticsearchClient.index(doc, (error) => {
        if (error) {
            console.log('CPIIndexer. Failed to index CPI data: ', error);
        } else {
            console.log('CPIIndexer: Indexed CPI data');
        }
        callback(error);
    });
}

// used to format document used to fetch or index cpi data
function elasticsearchData(body) {
    var data = {
        index: 'housing-data',
        type: 'cpi',
        id: 'cpi'
    };

    if (body) {
        data.body = body;
    }
    return data;
}

module.exports = CPIIndexer;
