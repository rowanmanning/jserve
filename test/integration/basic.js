// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var request = require('request');
var describeCall = require('./helper/describe-call');

describeCall([], function () {

    it('should serve JSON files', function (done) {
        request(this.baseUrl + '/foo.json', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{\n    "foo": "bar"\n}');
            done();
        });
    });

    it('should serve an index page', function (done) {
        request(this.baseUrl, function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            done();
        });
    });

    it('should serve a 404 page', function (done) {
        request(this.baseUrl + '/404', function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 404);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            done();
        });
    });

    it('should serve a 500 page', function (done) {
        request(this.baseUrl + '/500', function (error, response) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 500);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            done();
        });
    });

});
