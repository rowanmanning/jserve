// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var request = require('request');
var describeCall = require('./helper/describe-call');

describeCall([
    '--content-type', 'application/x-foo+json'
], function () {

    it('should serve JSON files with a "application/x-foo+json" Content-Type header', function (done) {
        request(this.baseUrl + '/foo.json', function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/x-foo+json');
            assert.strictEqual(body, '{\n    "foo": "bar"\n}');
            done();
        });
    });

});
