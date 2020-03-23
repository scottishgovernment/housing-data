'use strict';

const async = require('async');
const fs = require('fs');

/**
 * Class responsible for synching data from an rpz service with elasticsearch.
 **/
class RPZIndexer {

    constructor(rpzService, elasticsearchClient) {
        this.rpzService = rpzService;
        this.elasticsearchClient = elasticsearchClient;
    }

    index(callback) {

        fetchData(this.rpzService, this.elasticsearchClient, (err, esItems, serviceItems) => {
            if (err) {
                callback(err);
                return;
            }

            // map ES and service items by their id
            var serviceItemsById = {};
            var esItemsById = {};
            serviceItems
                .forEach(item => serviceItemsById[item.id] = item);
            esItems
                .forEach(item => esItemsById[item.id] = item);

            // calulate what items need to be inserted, updated or deleted from ES
            var toDelete = esItems
                .filter(item => !serviceItemsById[item.id]);
            var toInsert = serviceItems
                .filter(item => !esItemsById[item.id]);
            var toUpdate = serviceItems
                .filter(item => esItemsById[item.id])
                .filter(item => esItemsById[item.id]._rev !== item._rev);

            if (toDelete.length + toInsert.length + toUpdate.length === 0) {
                console.log('RPZIndexer. No updates needed.');
                callback(undefined, 'No updates needed');
            } else {
                performUpdates(this.elasticsearchClient, toDelete, toInsert, toUpdate, callback);
            }
        });
    }
}

function fetchData(rpzService, elasticsearchClient, callback) {
    async.series([
            seriesCB => ensureIndexExists(elasticsearchClient, seriesCB),
            seriesCB => fetchElasticSearchData(elasticsearchClient, seriesCB),
            seriesCB => rpzService.listDetail(seriesCB)
        ],
        (err, items) => {
            if (err) {
                callback(err);
                return;
            }
            const esItems = items[1];
            const serviceItems = items[2];
            callback(undefined, esItems, serviceItems);
        });
}

function ensureIndexExists(elasticsearchClient, callback) {

    elasticsearchClient.indices.exists({index: 'housing-data'},
        (err, exists) => {
            if (err) {
                callback(err);
                return;
            }

            if (exists === true) {
                callback(undefined);
                return;
            }

            // create the index
            const mappingFilename = __dirname + '/elasticsearchMapping.json';
            const mapping = JSON.parse(fs.readFileSync(mappingFilename));
            elasticsearchClient.indices.create({
                    index: 'housing-data',
                    body: mapping
                },

                (createErr) => {
                    callback(createErr);
                });
        });
}

function fetchElasticSearchData(elasticsearchClient, callback) {
    elasticsearchClient.search({
            index: 'housing-data',
            type: '_doc',
            size: 10000,
            q: 'type:rpz'
        },

        (err, resp) => {
            if (err) {
                callback(err);
                return;
            }
            const results = resp.hits.hits.map(hit => hit._source);
            callback(undefined, results);
        }
    );
}

function performUpdates(elasticsearchClient, toDelete, toInsert, toUpdate, callback) {
    // log the updates that are needed
    logIfNotEmpty('To delete:', toDelete);
    logIfNotEmpty('To insert:', toInsert);
    logIfNotEmpty('To update:', toUpdate);

    var bulkRequest = { body: [] };
    toInsert.forEach(item => addIndexRequests(bulkRequest, item));
    toUpdate.forEach(item => addIndexRequests(bulkRequest, item));
    toDelete.forEach(item => addDeleteRequest(bulkRequest, item));
    elasticsearchClient.bulk(bulkRequest, callback);
}

function logIfNotEmpty(msg, items) {
    if (items.length > 0) {
        const itemsString = items.map(item => item.id).join(', ');
        console.log('RPZIndexer. ', msg, itemsString);
    }
}

function addIndexRequests(bulkRequest, item) {
    bulkRequest.body.push({
        index: {
            _index: 'housing-data',
            _type: '_doc',
            _id: item.id
        }});
    item.type = 'rpz';
    bulkRequest.body.push(item);
}

function addDeleteRequest(bulkRequest, item) {
    bulkRequest.body.push({
        delete: {
            _index: 'housing-data',
            _type: '_doc',
            _id: item.id
        }});
}

module.exports = RPZIndexer;
