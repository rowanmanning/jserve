'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

describeJserveCall([
	'--json', './alt-json'
], () => {

	it('should serve JSON files from the ./alt-json directory', async function() {
		const {status, headers, data} = await this.get('/foo.json');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.deepEqual(data, {alt: 'json'});
	});

});
