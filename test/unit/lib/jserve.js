// jshint maxstatements: false
// jscs:disable maximumLineLength
'use strict';

var assert = require('proclaim');

describe('lib/jserve', function () {
    var jserve;

    beforeEach(function () {

        jserve = require('../../../lib/jserve');

    });

    it('should be a function', function () {
        assert.isFunction(jserve);
    });

});
