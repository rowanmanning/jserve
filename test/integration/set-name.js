// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');
var request = require('request');
var describeCall = require('./helper/describe-call');

describeCall([
    '--name', 'Foo'
], function () {

    it('should serve an index page with the expected title', function (done) {
        request(this.baseUrl, function (error, response, body) {
            assert.isNull(error);
            assert.match(body, /<title>Foo<\/title>/);
            done();
        });
    });

    it('should serve a 404 page with the expected title', function (done) {
        request(this.baseUrl + '/404', function (error, response, body) {
            assert.isNull(error);
            assert.match(body, /<title>Foo Error 404: Not Found<\/title>/);
            done();
        });
    });

    it('should serve a 500 page with the expected title', function (done) {
        request(this.baseUrl + '/500', function (error, response, body) {
            assert.isNull(error);
            assert.match(body, /<title>Foo Error 500: Internal Server Error<\/title>/);
            done();
        });
    });

});
