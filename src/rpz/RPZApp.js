'use strict';

/**
 * Express app that defines endpoints for the RPZ data service.
 */
class RPZApp {

    constructor(service, indexer) {
        this.service = service;
        this.indexer = indexer;
    }

    register(expressApp) {
        expressApp.get('/rpz/index', (req, res) => {
            this.indexer.index((error, data) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(data);
                }
            });
        });

        expressApp.get('/rpz', (req, res) => {
            this.service.listDetail((error, zones) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(zones);
                }
            });
        });

        expressApp.get('/rpz/:id', (req, res) => {
            const id = req.params.id;
            this.service.get(id, (error, rpz) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(rpz);
                }
            });
        });

        expressApp.post('/rpz', (req, res) => {
            const rpz = req.body;
            this.service.create(rpz, username(req), (error, data) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(data.id);
                }
            });
        });

        expressApp.put('/rpz/:id', (req, res) => {
            const id = req.params.id;
            const rpz = req.body;
            this.service.update(id, rpz, username(req), (error, result) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(result);
                }
            });
        });

        expressApp.delete('/rpz/:id', (req, res) => {
            const id = req.params.id;
            this.service.delete(id, username(req), (error, rpz) => {
                if (error) {
                    res.status(500).send(error);
                } else {
                    res.json(rpz);
                }
            });
        });
    }
}

function username(req) {
    return req.get('X-User')
        ? req.get('X-User')
        : 'unauthenticated';
}

module.exports = RPZApp;
