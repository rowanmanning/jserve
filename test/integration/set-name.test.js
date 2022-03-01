'use strict';

const {assert} = require('chai');
const describeJserveCall = require('./helper/describe-jserve-call');

describeJserveCall([
	'--name', 'Foo'
], () => {

	it('should serve an index page with the expected title', async function() {
		const {data} = await this.get('/');
		assert.match(data, /<title>Foo<\/title>/);
	});

	it('should serve a 404 page with the expected title', async function() {
		const {data} = await this.get('/404');
		assert.match(data, /<title>Foo Error 404: Not Found<\/title>/);
	});

	it('should serve a 500 page with the expected title', async function() {
		const {data} = await this.get('/500');
		assert.match(data, /<title>Foo Error 500: Internal Server Error<\/title>/);
	});

});
