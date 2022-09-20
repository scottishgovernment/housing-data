'use strict';

/**
 * Used to update Elasticsearch CPI data using a CPIStore.
 *
 * When indexData is called it will try to fetch CPI data from elasticsearch and
 * from the CPIStore.  If either there is no data in ES or it is older than the
 * data in the CPIStore then index the newer data.
 **/
class CPIIndexer {

    constructor(elasticsearchClient) {
        this.elasticsearchClient = elasticsearchClient;
    }

    async latest() {
        return fetchDataFromElasticsearch(this.elasticsearchClient);
    }

    async store(cpi) {
        const cpiFromES = await fetchDataFromElasticsearch(this.elasticsearchClient);
        // if there is no CPI data in ES or it is out of date then
        // index the data in ES.
        if (cpiFromES == null || esOutOfDate(cpiFromES, cpi)) {
            await configureMapping(this.elasticsearchClient);
            await indexToElasticsearch(this.elasticsearchClient, cpi);
        } else {
            console.log('CPIIndexer. Elasticsearch data is up to date.');
        }
    }

}

function esOutOfDate(cpiFromES, cpiFromStore) {
    var outOfDate = cpiFromStore.releaseDate.localeCompare(cpiFromES.releaseDate) > 0;
    return outOfDate;
}

async function fetchDataFromElasticsearch(elasticsearchClient) {
    const doc = elasticsearchData();
    return elasticsearchClient.get(doc)
    .then(response => {
        return response._source;
    }).catch(error => {
        if (error.statusCode === 404) {
            console.log('CPIIndexer: No CPI data in elasticsearch (got 404)');
            return null;
        } else {
            console.log('CPIIndexer: Failed to get CPI data from elasticsearch: ', error);
            throw error;
        }
    });
}

async function configureMapping(elasticsearchClient) {
    const index = { index: 'housing-data' };
    const exists = await elasticsearchClient.indices.exists(index);
    if (!exists) {
        await elasticsearchClient.indices.create(index);
    }
    return elasticsearchClient.indices.putMapping({
        index: 'housing-data',
        body: {
            properties: {
                data: {
                    properties: {
                        value: {
                            type: 'float'
                        }
                    }
                }
            }
        }
    }).catch(err => {
        console.log('CPIIndexer. Could not put mapping', err);
    });
}

function indexToElasticsearch(elasticsearchClient, cpiData) {
    const doc = elasticsearchData(cpiData);
    return elasticsearchClient.index(doc)
    .then(() => {
        console.log('CPIIndexer: Indexed CPI data');
    }).catch(error => {
        console.log('CPIIndexer. Failed to index CPI data: ', error);
        throw error;
    });
}

// used to format document used to fetch or index cpi data
function elasticsearchData(body) {
    var data = {
        index: 'housing-data',
        id: 'cpi'
    };

    if (body) {
        data.body = body;
    }
    return data;
}

module.exports = CPIIndexer;
