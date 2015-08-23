// jshint maxstatements: false
// jscs:disable maximumLineLength, disallowMultipleVarDecl
'use strict';

var assert = require('proclaim');
var mockery = require('mockery');
var sinon = require('sinon');

describe('lib/jserve', function () {
    var connect, extend, jserve;

    beforeEach(function () {

        connect = require('../mock/connect');
        mockery.registerMock('connect', connect);

        extend = sinon.spy(require('extend'));
        mockery.registerMock('extend', extend);

        jserve = require('../../../lib/jserve');

    });

    it('should be a function', function () {
        assert.isFunction(jserve);
    });

    it('should have a `defaults` property', function () {
        assert.isObject(jserve.defaults);
    });

    describe('.defaults', function () {
        var defaults;

        beforeEach(function () {
            defaults = jserve.defaults;
        });

        it('should have a `contentType` property', function () {
            assert.strictEqual(defaults.contentType, 'application/json');
        });

        it('should have a `log` property', function () {
            assert.isObject(defaults.log);
        });

        it('should have a `log.debug` method', function () {
            assert.isFunction(defaults.log.debug);
        });

        it('should have a `log.error` method', function () {
            assert.isFunction(defaults.log.error);
        });

        it('should have a `log.info` method', function () {
            assert.isFunction(defaults.log.info);
        });

        it('should have a `log.warn` method', function () {
            assert.isFunction(defaults.log.warn);
        });

        it('should have a `paths` property', function () {
            assert.isArray(defaults.paths);
            assert.lengthEquals(defaults.paths, 1);
            assert.strictEqual(defaults.paths[0], process.cwd() + '/json');
        });

        it('should have a `port` property', function () {
            assert.strictEqual(defaults.port, process.env.PORT || 3000);
        });

    });

    describe('jserve()', function () {
        var jserveApp, options, userOptions;

        beforeEach(function () {
            userOptions = {
                contentType: 'foo',
                log: {
                    debug: sinon.spy(),
                    error: sinon.spy(),
                    info: sinon.spy(),
                    warn: sinon.spy()
                },
                paths: [
                    'foo',
                    'bar'
                ],
                port: 1234
            };
            jserveApp = jserve(userOptions);
            options = extend.firstCall.returnValue;
        });

        it('should default the options', function () {
            assert.calledOnce(extend);
            assert.isTrue(extend.firstCall.args[0]);
            assert.isObject(extend.firstCall.args[1]);
            assert.strictEqual(extend.firstCall.args[2], jserve.defaults);
            assert.strictEqual(extend.firstCall.args[3], userOptions);
        });

        it('should create a Connect application', function () {
            assert.calledOnce(connect);
        });

        it('should return an object (jserve application)', function () {
            assert.isObject(jserveApp);
        });

        describe('jserve application', function () {

            it('should have a `connect` property set to the created Connect application', function () {
                assert.strictEqual(jserveApp.connect, connect.mockReturn);
            });

            it('should have a `log` property set to the `log` option', function () {
                assert.strictEqual(jserveApp.log, options.log);
            });

            it('should have a `port` property set to the `port` option', function () {
                assert.strictEqual(jserveApp.port, options.port);
            });

            it('should have a `start` method', function () {
                assert.isFunction(jserveApp.start);
            });

            describe('.start()', function () {
                var returnValue;

                beforeEach(function () {
                    jserveApp.connect.listen.yields(null);
                    returnValue = jserveApp.start();
                });

                it('should start the Connect application with `options.port`', function () {
                    assert.calledOnce(jserveApp.connect.listen);
                    assert.calledWith(jserveApp.connect.listen, options.port);
                });

                it('should return the calling application', function () {
                    assert.strictEqual(returnValue, jserveApp);
                });

                it('should exit the process if the Connect application fails to start', function () {
                    var error = new Error('...');
                    var processExitCalls = 0;
                    sinon.stub(process, 'exit');
                    jserveApp.connect.listen.reset();
                    jserveApp.connect.listen.yields(error);
                    jserveApp.start();
                    processExitCalls = process.exit.withArgs(1).callCount;
                    process.exit.restore();
                    assert.strictEqual(processExitCalls, 1);
                });

                it('should callback if one is provided', function () {
                    var callback = sinon.spy();
                    returnValue = jserveApp.start(callback);
                    assert.calledOnce(callback);
                });

            });

        });

    });

});
