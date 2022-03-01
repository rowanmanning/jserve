'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

describeJserveCall([
	'--content-type', 'application/x-foo+json'
], () => {

	it('should serve JSON files with a "application/x-foo+json" Content-Type header', async function() {
		const {status, headers, data} = await this.get('/foo.json');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/x-foo+json');
		assert.deepEqual(data, {foo: 'bar'});
	});

});
