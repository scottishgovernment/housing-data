var RPZApp = require('../../src/rpz/RPZApp.js');
require('jasmine-beforeall');
var express = require('express');
var request = require('supertest');


describe('RPZApp', function() {

    var rpzApp;
    var rpzService;
    var rpzIndexer;
    var srv;

    beforeAll(function() {
        rpzService = jasmine.createSpyObj('service', ['get', 'delete', 'listDetail', 'create', 'update']);
        rpzIndexer = jasmine.createSpyObj('indexer', ['index']);
        var express = require('express');
        var app = express();
        app.use(function(err, req, res, next) {
            console.error(err.stack);
            next();
        });

        rpzApp = new RPZApp(rpzService, rpzIndexer);
        rpzApp.register(app);
        srv = app.listen();
    });

    beforeEach(function() {
        rpzService.get.reset();
        rpzService.delete.reset();
        rpzService.listDetail.reset();
        rpzService.create.reset();
        rpzService.update.reset();
        rpzIndexer.index.reset();
    });

    afterAll(function() {
        srv.close();
    });

    it('index should return 200 for OK', function (done) {
        rpzIndexer.index.andCallFake(indexOK);
        request(srv)
            .get('/rpz/index')
            .expect(() => expect(rpzIndexer.index).toHaveBeenCalled())
            .expect(200)
            .end(done);
    });

    it('index should return 500 for ERROR', function (done) {
        rpzIndexer.index.andCallFake(indexError);
        request(srv)
            .get('/rpz/index')
            .expect(() => expect(rpzIndexer.index).toHaveBeenCalled())
            .expect(500)
            .end(done);
    });

    it('list should return 200 for OK', function (done) {
        rpzService.listDetail.andCallFake(listOK);
        request(srv)
            .get('/rpz')
            .expect(() => expect(rpzService.listDetail).toHaveBeenCalled())
            .expect(200)
            .end(done);
    });

    it('list should return 500 for ERROR', function (done) {
        rpzService.listDetail.andCallFake(listError);
        request(srv)
            .get('/rpz')
            .expect(() => expect(rpzService.listDetail).toHaveBeenCalled())
            .expect(500)
            .end(done);
    });

    it('get should return 200 for OK', function (done) {
        rpzService.get.andCallFake(getOK);
        request(srv)
            .get('/rpz/111')
            .expect(() => expect(rpzService.get).toHaveBeenCalled())
            .expect(200)
            .end(done);
    });

    it('get should return 500 for ERROR', function (done) {
        rpzService.get.andCallFake(getError);
        request(srv)
            .get('/rpz/111')
            .expect(() => expect(rpzService.get).toHaveBeenCalled())
            .expect(500)
            .end(done);
    });

    it('post should return 200 for OK', function (done) {
        rpzService.create.andCallFake(createOK);
        request(srv)
            .post('/rpz')
            .expect(() => expect(rpzService.create).toHaveBeenCalled())
            .expect(200)
            .end(done);
    });

    it('post should return 400 for ERROR', function (done) {
        rpzService.create.andCallFake(createError);
        request(srv)
            .post('/rpz')
            .expect(() => expect(rpzService.create).toHaveBeenCalled())
            .expect(400)
            .end(done);
    });

    it('put should return 200 for OK', function (done) {
        rpzService.update.andCallFake(updateOK);
        request(srv)
            .put('/rpz/111')
            .expect(() => expect(rpzService.update).toHaveBeenCalled())
            .expect(200)
            .end(done);
    });

    it('put should return 400 for ERROR', function (done) {
        rpzService.update.andCallFake(updateError);
        request(srv)
            .put('/rpz/111')
            .expect(() => expect(rpzService.update).toHaveBeenCalled())
            .expect(400)
            .end(done);
    });

    it('delete should return 200 for OK', function (done) {
        rpzService.delete.andCallFake(deleteOK);
        request(srv)
            .delete('/rpz/111')
            .expect(() => expect(rpzService.delete).toHaveBeenCalled())
            .expect(200)
            .end(done);
    });

    it('delete should return 500 for ERROR', function (done) {
        rpzService.delete.andCallFake(deleteError);
        request(srv)
            .delete('/rpz/111')
            .expect(() => expect(rpzService.delete).toHaveBeenCalled())
            .expect(500)
            .end(done);
    });

    function indexOK(callback) {
        callback(undefined, 'OK');
    }

    function indexError(callback) {
        callback('ERROR', undefined);
    }

    function listOK(callback) {
        callback(undefined, 'OK');
    }

    function listError(callback) {
        callback('ERROR', undefined);
    }

    function getOK(id, callback) {
        callback(undefined, 'OK');
    }

    function getError(id, callback) {
        callback('ERROR', undefined);
    }

    function createOK(rpz, username, callback) {
        callback(undefined, 'OK');
    }

    function createError(rpz, username, callback) {
        callback('ERROR', undefined);
    }

    function updateOK(id, rpz, username, callback) {
        callback(undefined, 'OK');
    }

    function updateError(id, rpz, username, callback) {
        callback('ERROR', undefined);
    }

    function deleteOK(id, username, callback) {
        callback(undefined, 'OK');
    }

    function deleteError(id, username, callback) {
        callback('ERROR', undefined);
    }
});
