'use strict';

var sinon = require('sinon');

var connect = module.exports = sinon.stub();
connect.mockReturn = {
    listen: sinon.stub(),
    use: sinon.stub()
};
connect.returns(connect.mockReturn);
