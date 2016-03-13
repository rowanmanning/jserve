// jscs:disable maximumLineLength, requireArrowFunctions
'use strict';

const assert = require('proclaim');
const request = require('request');
const describeCall = require('./helper/describe-call');

describeCall([
    '--json', './alt-json'
], function () {

    it('should serve JSON files from the ./alt-json directory', function (done) {
        request(`${this.baseUrl}/foo.json`, function (error, response, body) {
            assert.isNull(error);
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.headers['content-type'], 'application/json');
            assert.strictEqual(body, '{\n    "alt": "json"\n}');
            done();
        });
    });

});
