'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

describeJserveCall([], () => {

	it('serves JSON files', async function() {
		const {status, headers, data} = await this.get('/foo.json');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.deepEqual(data, {foo: 'bar'});
	});

	it('serves JavaScript files', async function() {
		const {status, headers, data} = await this.get('/requires');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.deepEqual(data, {require: true,
			foo1: {foo: 'bar'},
			foo2: {foo: 'bar'},
			foo3: {foo: 'bar'}
		});
	});

	it('serves JavaScript files in sub-directories', async function() {
		const {status, headers, data} = await this.get('/subdir/requires');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'application/json');
		assert.deepEqual(data, {require: true,
			foo: {foo: 'bar'},
			bar: {bar: 'baz'}
		});
	});

	it('serves an index page', async function() {
		const {status, headers, data} = await this.get('/');
		assert.strictEqual(status, 200);
		assert.strictEqual(headers['content-type'], 'text/html');
		assert.match(data, /<title>JServe<\/title>/);
	});

	it('serves a 404 page', async function() {
		const {status, headers, data} = await this.get('/404');
		assert.strictEqual(status, 404);
		assert.strictEqual(headers['content-type'], 'text/html');
		assert.match(data, /<title>JServe Error 404: Not Found<\/title>/);
	});

	it('serves a 500 page', async function() {
		const {status, headers, data} = await this.get('/500');
		assert.strictEqual(status, 500);
		assert.strictEqual(headers['content-type'], 'text/html');
		assert.match(data, /<title>JServe Error 500: Internal Server Error<\/title>/);
	});

});
