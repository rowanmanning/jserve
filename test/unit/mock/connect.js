'use strict';

const sinon = require('sinon');

const connect = module.exports = sinon.stub();
connect.mockReturn = {
	listen: sinon.stub(),
	use: sinon.stub()
};
connect.returns(connect.mockReturn);
