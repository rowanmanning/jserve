'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

describeJserveCall([
	'--port', '31020'
], () => {

	it('should serve JSON files on port 31020', async function() {
		const {status, headers, data} = await this.get('/foo.json');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.deepEqual(data, {foo: 'bar'});
	});

});
