// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var request = require('request');
var describeCall = require('./helper/describe-call');

describeCall([
    '--indentation', '2'
], function () {

    it('should serve JSON files with 2-space indentation', function (done) {
        request(this.baseUrl + '/foo.json', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{\n  "foo": "bar"\n}');
            done();
        });
    });

});

describeCall([
    '--indentation', '\\t'
], function () {

    it('should serve JSON files with tab indentation', function (done) {
        request(this.baseUrl + '/foo.json', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{\n\t"foo": "bar"\n}');
            done();
        });
    });

});

describeCall([
    '--indentation', ''
], function () {

    it('should serve JSON files with no indentation', function (done) {
        request(this.baseUrl + '/foo.json', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{"foo":"bar"}');
            done();
        });
    });

});
