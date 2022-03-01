// jscs:disable maximumLineLength
'use strict';

const {assert} = require('chai');
const mockery = require('mockery');
const path = require('path');
const sinon = require('sinon');

describe('lib/jserve', () => {
	let connect;
	let extend;
	let fs;
	let glob;
	let hogan;
	let jserve;
	let serveStatic;
	let statusMessages;
	let vm;

	beforeEach(() => {

		connect = require('../mock/connect');
		mockery.registerMock('connect', connect);

		extend = sinon.spy(require('extend'));
		mockery.registerMock('extend', extend);

		fs = require('../mock/fs');
		mockery.registerMock('fs', fs);

		glob = require('../mock/glob');
		mockery.registerMock('glob', glob);

		hogan = require('../mock/hogan');
		mockery.registerMock('hogan.js', hogan);

		serveStatic = require('../mock/serve-static');
		mockery.registerMock('serve-static', serveStatic);

		statusMessages = {
			404: 'foo',
			500: 'bar',
			567: 'baz'
		};
		mockery.registerMock('statuses', statusMessages);

		vm = require('../mock/vm');
		mockery.registerMock('vm', vm);

		jserve = require('../../../lib/jserve');

	});

	it('should be a function', () => {
		assert.isFunction(jserve);
	});

	it('should have a `defaults` property', () => {
		assert.isObject(jserve.defaults);
	});

	describe('.defaults', () => {
		let defaults;

		beforeEach(() => {
			defaults = jserve.defaults;
		});

		it('should have a `contentType` property', () => {
			assert.strictEqual(defaults.contentType, 'application/json');
		});

		it('should have a `description` property', () => {
			assert.strictEqual(defaults.description, 'View JSON files by clicking the file names below:');
		});

		it('should have an `indentation` property', () => {
			assert.strictEqual(defaults.indentation, 4);
		});

		it('should have a `log` property', () => {
			assert.isObject(defaults.log);
		});

		it('should have a `log.debug` method', () => {
			assert.isFunction(defaults.log.debug);
		});

		it('should have a `log.error` method', () => {
			assert.isFunction(defaults.log.error);
		});

		it('should have a `log.info` method', () => {
			assert.isFunction(defaults.log.info);
		});

		it('should have a `middleware` property', () => {
			assert.deepEqual(defaults.middleware, []);
		});

		it('should have a `name` property', () => {
			assert.strictEqual(defaults.name, 'JServe');
		});

		it('should have a `path` property', () => {
			assert.strictEqual(defaults.path, path.join(process.cwd(), '/json'));
		});

		it('should have a `port` property', () => {
			assert.strictEqual(defaults.port, process.env.PORT || 3000);
		});

		it('should have a `templatesPath` property', () => {
			assert.strictEqual(defaults.templatesPath, path.resolve(__dirname, '..', '..', '..', 'template'));
		});

	});

	describe('jserve()', () => {
		let errorTemplate;
		let indexTemplate;
		let jserveApp;
		let middleware1;
		let middleware2;
		let options;
		let userOptions;

		beforeEach(() => {
			middleware1 = sinon.spy();
			middleware2 = sinon.spy();

			userOptions = {
				contentType: 'foo-content-type',
				description: 'foo-description',
				indentation: 3,
				log: {
					debug: sinon.spy(),
					error: sinon.spy(),
					info: sinon.spy()
				},
				middleware: [
					middleware1,
					middleware2
				],
				name: 'foo-name',
				path: path.resolve(`${__dirname}/../mock`),
				port: 1234,
				templatesPath: '/can-haz-templates'
			};

			fs.readFileSync.withArgs(path.resolve('/can-haz-templates/index.html'), 'utf-8').returns('index content');
			fs.readFileSync.withArgs(path.resolve('/can-haz-templates/error.html'), 'utf-8').returns('error content');

			errorTemplate = {
				render: sinon.stub()
			};
			indexTemplate = {
				render: sinon.stub()
			};

			hogan.compile.withArgs('error content').returns(errorTemplate);
			hogan.compile.withArgs('index content').returns(indexTemplate);

			jserveApp = jserve(userOptions);
			options = extend.firstCall.returnValue;
		});

		it('should default the options', () => {
			assert.calledOnce(extend);
			assert.isTrue(extend.firstCall.args[0]);
			assert.isObject(extend.firstCall.args[1]);
			assert.strictEqual(extend.firstCall.args[2], jserve.defaults);
			assert.strictEqual(extend.firstCall.args[3], userOptions);
		});

		it('should create a Connect application', () => {
			assert.calledOnce(connect);
		});

		it('should load and compile the HTML templates, storing in the `templates` property', () => {
			assert.calledTwice(hogan.compile);
			assert.calledWithExactly(hogan.compile, 'error content');
			assert.calledWithExactly(hogan.compile, 'index content');
			assert.strictEqual(jserveApp.templates.error, errorTemplate);
			assert.strictEqual(jserveApp.templates.index, indexTemplate);
		});

		it('should create a serve-static middleware with the expected options', () => {
			assert.calledOnce(serveStatic);
			assert.alwaysCalledWith(serveStatic, path.resolve('/can-haz-templates/public'));
			assert.deepEqual(serveStatic.firstCall.args[1], {
				index: false
			});
		});

		it('should use the `logRequest` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.logRequest);
		});

		it('should use the `serveStaticFiles` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.serveStaticFiles);
		});

		it('should use the `removeExtension` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.removeExtension);
		});

		it('should use all of the middleware in `options.middleware` in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, middleware1);
			assert.calledWith(connect.mockReturn.use, middleware2);
		});

		it('should use the `serveIndex` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.serveIndex);
		});

		it('should use the `serveJson` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.serveJson);
		});

		it('should use the `handleNotFoundError` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.handleNotFoundError);
		});

		it('should use the `handleServerError` method as middleware in the Connect application', () => {
			assert.calledWith(connect.mockReturn.use, jserveApp.handleServerError);
		});

		it('should use the middleware in the correct order', () => {
			assert.callOrder(
				connect.mockReturn.use.withArgs(jserveApp.serveStaticFiles),
				connect.mockReturn.use.withArgs(jserveApp.logRequest),
				connect.mockReturn.use.withArgs(jserveApp.removeExtension),
				connect.mockReturn.use.withArgs(middleware1),
				connect.mockReturn.use.withArgs(middleware2),
				connect.mockReturn.use.withArgs(jserveApp.serveIndex),
				connect.mockReturn.use.withArgs(jserveApp.serveJson),
				connect.mockReturn.use.withArgs(jserveApp.handleNotFoundError),
				connect.mockReturn.use.withArgs(jserveApp.handleServerError)
			);
		});

		it('should return an object (jserve application)', () => {
			assert.isObject(jserveApp);
		});

		describe('jserve application', () => {

			it('should have a `connect` property set to the created Connect application', () => {
				assert.strictEqual(jserveApp.connect, connect.mockReturn);
			});

			it('should have a `log` property set to the `log` option', () => {
				assert.strictEqual(jserveApp.log, options.log);
			});

			it('should have a `port` property set to the `port` option', () => {
				assert.strictEqual(jserveApp.port, options.port);
			});

			it('should have a `logRequest` method', () => {
				assert.isFunction(jserveApp.logRequest);
			});

			describe('.logRequest()', () => {
				let next;
				let request;

				beforeEach(() => {
					next = sinon.spy();
					request = {
						url: 'foo'
					};
					jserveApp.logRequest(request, {}, next);
				});

				it('should log the request', () => {
					assert.calledWithExactly(options.log.debug, 'Request to "%s"', 'foo');
				});

				it('should callback', () => {
					assert.calledOnce(next);
				});

			});

			it('should have a `removeExtension` method', () => {
				assert.isFunction(jserveApp.removeExtension);
			});

			describe('.removeExtension()', () => {
				let next;
				let request;
				let response;

				beforeEach(() => {
					next = sinon.spy();
					request = {
						url: 'http://localhost/foo/bar.json?a=b'
					};
					response = {
						writeHead: sinon.spy(),
						end: sinon.spy()
					};
					jserveApp.removeExtension(request, response, next);
				});

				it('should store the URL path on the request', () => {
					assert.strictEqual(request.path, '/foo/bar.json');
				});

				it('should redirect the request to the equivalent path without an extension', () => {
					assert.calledOnce(response.writeHead);
					assert.calledWith(response.writeHead, 301);
					assert.deepEqual(response.writeHead.firstCall.args[1], {
						Location: 'http://localhost/foo/bar?a=b'
					});
					assert.calledOnce(response.end);
					assert.calledWithExactly(response.end);
				});

				it('should not callback', () => {
					assert.notCalled(next);
				});

				it('should callback if no file extension is present', () => {
					request.url = 'http://localhost/foo/bar?a=b';
					jserveApp.removeExtension(request, response, next);
					assert.calledOnce(next);
				});

			});

			it('should have a `serveIndex` method', () => {
				assert.isFunction(jserveApp.serveIndex);
			});

			describe('.serveIndex()', () => {
				let files;
				let globPattern;
				let html;
				let next;
				let request;
				let response;

				beforeEach(() => {
					files = [
						'foo-file',
						'bar-file',
						'baz-file'
					];
					jserveApp.buildFileObject = sinon.stub();
					jserveApp.buildFileObject.withArgs('foo-file').returns('foo-built-file');
					jserveApp.buildFileObject.withArgs('bar-file').returns('bar-built-file');
					jserveApp.buildFileObject.withArgs('baz-file').returns('baz-built-file');
					globPattern = `${options.path}/**/*.{js,json}`;
					glob.withArgs(globPattern).yields(null, files);
					html = '<p>index content</p>';
					indexTemplate.render.returns(html);
					next = sinon.spy();
					request = {
						path: '/'
					};
					response = {
						writeHead: sinon.spy(),
						end: sinon.spy()
					};
					jserveApp.serveIndex(request, response, next);
				});

				it('should glob for files', () => {
					assert.calledOnce(glob);
					assert.calledWith(glob, globPattern);
				});

				it('should call `buildFileObject` with each file that the glob returns', () => {
					assert.calledThrice(jserveApp.buildFileObject);
					assert.calledWith(jserveApp.buildFileObject, 'foo-file');
					assert.calledWith(jserveApp.buildFileObject, 'bar-file');
					assert.calledWith(jserveApp.buildFileObject, 'baz-file');
				});

				it('should render the index page with the expected context', () => {
					assert.calledOnce(indexTemplate.render);
					assert.deepEqual(indexTemplate.render.firstCall.args[0], {
						name: 'foo-name',
						description: 'foo-description',
						files: [
							'foo-built-file',
							'bar-built-file',
							'baz-built-file'
						]
					});
				});

				it('should set the response status to 200', () => {
					assert.calledOnce(response.writeHead);
					assert.calledWith(response.writeHead, 200);
				});

				it('should set the Content-Type header to "text/html"', () => {
					assert.calledOnce(response.writeHead);
					assert.isObject(response.writeHead.firstCall.args[1]);
					assert.strictEqual(response.writeHead.firstCall.args[1]['Content-Type'], 'text/html');
				});

				it('should send the render output', () => {
					assert.calledOnce(response.end);
					assert.calledWithExactly(response.end, html);
				});

				it('should callback with an error if the glob fails', () => {
					const error = new Error('...');
					glob.withArgs(globPattern).yields(error);
					jserveApp.serveIndex(request, response, next);
					assert.calledOnce(next);
					assert.calledWithExactly(next, error);
				});

				it('should callback if the request path is not "/"', () => {
					request.path = '/foo';
					jserveApp.serveIndex(request, response, next);
					assert.calledOnce(next);
				});

			});

			it('should have a `serveJson` method', () => {
				assert.isFunction(jserveApp.serveJson);
			});

			describe('.serveJson()', () => {
				let next;
				let request;
				let response;

				beforeEach(() => {
					next = sinon.spy();
					request = {};
					response = {
						writeHead: sinon.spy(),
						end: sinon.spy()
					};
				});

				describe('with a JSON file', () => {

					beforeEach(() => {
						request.path = '/foo/bar';
						jserveApp.serveJson(request, response, next);
					});

					it('should send a 200 status code', () => {
						assert.calledOnce(response.writeHead);
						assert.calledWith(response.writeHead, 200);
					});

					it('should send a Content-Type header based on the `contentType` option', () => {
						assert.isObject(response.writeHead.firstCall.args[1]);
						assert.strictEqual(response.writeHead.firstCall.args[1]['Content-Type'], options.contentType);
					});

					it('should send the json output as a string (respecting the `indentation` option)', () => {
						assert.calledOnce(response.end);
						assert.calledWithExactly(response.end, '{\n   "foo": "bar"\n}');
					});

					it('should not callback', () => {
						assert.notCalled(next);
					});

					it('should callback if the requested file does not exist', () => {
						request.path = '/foo/not-a-file';
						jserveApp.serveJson(request, response, next);
						assert.calledOnce(next);
					});

					it('should callback with an error if the file contains errors', () => {
						request.path = '/foo/json-error';
						jserveApp.serveJson(request, response, next);
						assert.calledOnce(next);
						assert.instanceOf(next.firstCall.args[0], Error);
					});

				});

				describe('with a JavaScript file', () => {

					beforeEach(() => {
						request.path = '/foo/baz';
						jserveApp.serveJson(request, response, next);
					});

					it('should send a 200 status code', () => {
						assert.calledOnce(response.writeHead);
						assert.calledWith(response.writeHead, 200);
					});

					it('should send a Content-Type header based on the `contentType` option', () => {
						assert.isObject(response.writeHead.firstCall.args[1]);
						assert.strictEqual(response.writeHead.firstCall.args[1]['Content-Type'], options.contentType);
					});

					it('should send the json output as a string (respecting the `indentation` option)', () => {
						assert.calledOnce(response.end);
						assert.calledWithExactly(response.end, '{\n   "bar": "baz"\n}');
					});

					it('should not callback', () => {
						assert.notCalled(next);
					});

					it('should callback if the requested file does not exist', () => {
						request.path = '/foo/not-a-file';
						jserveApp.serveJson(request, response, next);
						assert.calledOnce(next);
					});

				});

			});

			it('should have a `serveStaticFiles` method set to the created serve-static middleware', () => {
				assert.strictEqual(jserveApp.serveStaticFiles, serveStatic.mockReturn);
			});

			it('should have a `handleNotFoundError` method', () => {
				assert.isFunction(jserveApp.handleNotFoundError);
			});

			describe('.handleNotFoundError()', () => {
				let next;

				beforeEach(() => {
					next = sinon.spy();
					jserveApp.handleNotFoundError({}, {}, next);
				});

				it('should callback with a 404 error object', () => {
					assert.calledOnce(next);
					assert.instanceOf(next.firstCall.args[0], Error);
					assert.strictEqual(next.firstCall.args[0].status, 404);
					assert.strictEqual(next.firstCall.args[0].message, statusMessages[404]);
				});

			});

			it('should have a `handleServerError` method', () => {
				assert.isFunction(jserveApp.handleServerError);
			});

			describe('.handleServerError()', () => {
				let error;
				let html;
				let response;

				beforeEach(() => {
					error = {
						stack: 'stack',
						status: 567
					};
					html = '<p>error html</p>';
					response = {
						end: sinon.spy(),
						writeHead: sinon.spy()
					};
					errorTemplate.render.returns(html);
					jserveApp.handleServerError(error, {}, response);
				});

				it('should log the error stack', () => {
					assert.calledWith(jserveApp.log.error, 'stack');
				});

				it('should not log the error stack if the error status is 404', () => {
					error.status = 404;
					jserveApp.log.error.resetHistory();
					jserveApp.handleServerError(error, {}, response);
					assert.notCalled(jserveApp.log.error);
				});

				it('should render the error page with the expected context', () => {
					assert.calledOnce(errorTemplate.render);
					assert.deepEqual(errorTemplate.render.firstCall.args[0], {
						name: 'foo-name',
						description: 'foo-description',
						is404: false,
						statusCode: error.status,
						statusMessage: statusMessages[error.status],
						stackTrace: error.stack
					});
				});

				it('should set the response status based on the error status', () => {
					assert.calledOnce(response.writeHead);
					assert.calledWith(response.writeHead, error.status);
				});

				it('should set the Content-Type header to "text/html"', () => {
					assert.calledOnce(response.writeHead);
					assert.isObject(response.writeHead.firstCall.args[1]);
					assert.strictEqual(response.writeHead.firstCall.args[1]['Content-Type'], 'text/html');
				});

				it('should send the render output', () => {
					assert.calledOnce(response.end);
					assert.calledWithExactly(response.end, html);
				});

				it('should default the status code to 500 if the error does not have one', () => {
					delete error.status;
					errorTemplate.render.resetHistory();
					response.writeHead.resetHistory();
					jserveApp.handleServerError(error, {}, response);
					assert.calledWith(response.writeHead, 500);
					assert.strictEqual(errorTemplate.render.firstCall.args[0].statusCode, 500);
					assert.strictEqual(errorTemplate.render.firstCall.args[0].statusMessage, statusMessages[500]);
				});

				it('should default the status message to "Error" if the status code is not known', () => {
					error.status = 678;
					errorTemplate.render.resetHistory();
					jserveApp.handleServerError(error, {}, response);
					assert.strictEqual(errorTemplate.render.firstCall.args[0].statusMessage, 'Error');
				});

			});

			it('should have a `buildFileObject` method', () => {
				assert.isFunction(jserveApp.buildFileObject);
			});

			describe('.buildFileObject()', () => {

				it('should return the expected object when called with a file path', () => {
					assert.deepEqual(jserveApp.buildFileObject(`${options.path}/foo/bar/baz.JSON`), {
						extension: 'json',
						fullPath: `${options.path}/foo/bar/baz.JSON`,
						name: 'foo/bar/baz',
						nameSplit: [
							'foo',
							'bar',
							'baz'
						],
						url: '/foo/bar/baz'
					});
				});

			});

			it('should have a `start` method', () => {
				assert.isFunction(jserveApp.start);
			});

			describe('.start()', () => {
				let returnValue;

				beforeEach(() => {
					jserveApp.connect.listen.yields(null);
					returnValue = jserveApp.start();
				});

				it('should start the Connect application with `options.port`', () => {
					assert.calledOnce(jserveApp.connect.listen);
					assert.calledWith(jserveApp.connect.listen, options.port);
				});

				it('should return the calling application', () => {
					assert.strictEqual(returnValue, jserveApp);
				});

				it('should exit the process if the Connect application fails to start', () => {
					const error = new Error('...');
					let processExitCalls = 0;
					sinon.stub(process, 'exit');
					jserveApp.connect.listen.resetHistory();
					jserveApp.connect.listen.yields(error);
					jserveApp.start();
					processExitCalls = process.exit.withArgs(1).callCount;
					process.exit.restore();
					assert.strictEqual(processExitCalls, 1);
				});

				it('should callback if one is provided', () => {
					const callback = sinon.spy();
					returnValue = jserveApp.start(callback);
					assert.calledOnce(callback);
				});

			});

		});

	});

});
