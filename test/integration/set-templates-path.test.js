'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

describeJserveCall([
	'--templates', './templates'
], () => {

	it('should serve an index page using templates in the ./templates directory', async function() {
		const {status, headers, data} = await this.get('/');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'text/html');
		assert.strictEqual(data, 'custom index\n');
	});

	it('should serve a 404 page using templates in the ./templates directory', async function() {
		const {status, headers, data} = await this.get('/404');
		assert.strictEqual(status, 404);
		assert.strictEqual(headers['content-type'], 'text/html');
		assert.strictEqual(data, 'custom error\n');
	});

	it('should serve a 500 page using templates in the ./templates directory', async function() {
		const {status, headers, data} = await this.get('/500');
		assert.strictEqual(status, 500);
		assert.strictEqual(headers['content-type'], 'text/html');
		assert.strictEqual(data, 'custom error\n');
	});

});
