'use strict';

const sinon = require('sinon');

const serveStatic = module.exports = sinon.stub();
serveStatic.mockReturn = sinon.spy();
serveStatic.returns(serveStatic.mockReturn);
