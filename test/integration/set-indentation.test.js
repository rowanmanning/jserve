'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

const transformResponse = [data => data];

describeJserveCall([
	'--indentation', '2'
], () => {

	it('should serve JSON files with 2-space indentation', async function() {
		const {status, headers, data} = await this.get('/foo.json', {transformResponse});
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.strictEqual(data, '{\n  "foo": "bar"\n}');
	});

});

describeJserveCall([
	'--indentation', '\\t'
], () => {

	it('should serve JSON files with tab indentation', async function() {
		const {status, headers, data} = await this.get('/foo.json', {transformResponse});
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.strictEqual(data, '{\n\t"foo": "bar"\n}');
	});

});

describeJserveCall([
	'--indentation', ''
], () => {

	it('should serve JSON files with no indentation', async function() {
		const {status, headers, data} = await this.get('/foo.json', {transformResponse});
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.strictEqual(data, '{"foo":"bar"}');
	});

});
