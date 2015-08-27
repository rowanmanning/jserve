// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var request = require('request');
var describeCall = require('./helper/describe-call');

describeCall([
    '--templates', './templates'
], function () {

    it('should serve an index page using templates in the ./templates directory', function (done) {
        request(this.baseUrl, function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            assert.strictEqual(body, 'custom index\n');
            done();
        });
    });

    it('should serve a 404 page using templates in the ./templates directory', function (done) {
        request(this.baseUrl + '/404', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 404);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            assert.strictEqual(body, 'custom error\n');
            done();
        });
    });

    it('should serve a 500 page using templates in the ./templates directory', function (done) {
        request(this.baseUrl + '/500', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 500);
            assert.strictEqual(response.headers['content-type'], 'text/html');
            assert.strictEqual(body, 'custom error\n');
            done();
        });
    });

});
