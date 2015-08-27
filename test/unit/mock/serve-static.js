'use strict';

var sinon = require('sinon');

var serveStatic = module.exports = sinon.stub();
serveStatic.mockReturn = sinon.spy();
serveStatic.returns(serveStatic.mockReturn);
