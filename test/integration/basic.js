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

    it('should serve JavaScript files', function (done) {
        request(this.baseUrl + '/requires', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{\n    "require": true,\n    "foo1": {\n        "foo": "bar"\n    },\n    "foo2": {\n        "foo": "bar"\n    },\n    "foo3": {\n        "foo": "bar"\n    }\n}');
            done();
        });
    });

    it('should serve JavaScript files in sub-directories', function (done) {
        request(this.baseUrl + '/subdir/requires', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{\n    "require": true,\n    "foo": {\n        "foo": "bar"\n    },\n    "bar": {\n        "bar": "baz"\n    }\n}');
            done();
        });
    });

    it('should serve an index page', function (done) {
        request(this.baseUrl, function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            assert.match(body, /<title>JServe<\/title>/);
            done();
        });
    });

    it('should serve a 404 page', function (done) {
        request(this.baseUrl + '/404', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 404);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            assert.match(body, /<title>JServe Error 404: Not Found<\/title>/);
            done();
        });
    });

    it('should serve a 500 page', function (done) {
        request(this.baseUrl + '/500', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 500);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            assert.match(body, /<title>JServe Error 500: Internal Server Error<\/title>/);
            done();
        });
    });

});
