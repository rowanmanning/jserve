'use strict';

const connect = require('connect');
const extend = require('extend');
const fs = require('fs');
const glob = require('glob');
const hogan = require('hogan.js');
const path = require('path');
const serveStatic = require('serve-static');
const status = require('statuses');
const url = require('url');

module.exports = jserve;
module.exports.defaults = {
	contentType: 'application/json',
	description: 'View JSON files by clicking the file names below:',
	indentation: 4,
	log: {
		debug: noop,
		error: noop,
		info: noop
	},
	middleware: [],
	name: 'JServe',
	path: path.join(process.cwd(), 'json'),
	port: process.env.PORT || 3000,
	templatesPath: path.resolve(__dirname, '..', 'template')
};

function jserve(options) {
	options = defaultOptions(options);
	const self = {

		// Instance properties
		connect: connect(),
		log: options.log,
		port: options.port,
		templates: {},

		// Initialise the application
		init() {
			self.initTemplates();
			self.connect.use(self.serveStaticFiles);
			self.connect.use(self.logRequest);
			self.connect.use(self.removeExtension);
			options.middleware.forEach(self.connect.use.bind(self.connect));
			self.connect.use(self.serveIndex);
			self.connect.use(self.serveJson);
			self.connect.use(self.handleNotFoundError);
			self.connect.use(self.handleServerError);
		},

		// Initialise the application templates
		initTemplates() {
			self.templates = {
				error: hogan.compile(loadTemplate('error')),
				index: hogan.compile(loadTemplate('index'))
			};
			function loadTemplate(name) {
				const templatePath = path.resolve(options.templatesPath, `${name}.html`);
				return fs.readFileSync(templatePath, 'utf-8');
			}
		},

		// Middleware to log the request
		logRequest(request, response, next) {
			self.log.debug('Request to "%s"', request.url);
			next();
		},

		// Middleware to remove JSON and JS file extensions
		removeExtension(request, response, next) {
			request.path = url.parse(request.url).pathname;
			if (/\.js(on)?$/i.test(request.path)) {
				response.writeHead(301, {
					Location: request.url.replace(/\.js(on)?\b/i, '')
				});
				return response.end();
			}
			next();
		},

		// Middleware to serve up the index
		serveIndex(request, response, next) {
			if (request.path !== '/') {
				return next();
			}
			glob(`${options.path}/**/*.{js,json}`, (error, files) => {
				if (error) {
					return next(error);
				}
				response.writeHead(200, {
					'Content-Type': 'text/html'
				});
				response.end(self.templates.index.render({
					name: options.name,
					description: options.description,
					files: files.map(self.buildFileObject)
				}));
			});
		},

		// Middleware to serve up JSON
		serveJson(request, response, next) {
			let jsonPath = null;
			let jsonData = null;
			try {
				jsonPath = require.resolve(path.join(options.path, request.path));
			} catch (error) {
				return next();
			}
			Object.keys(require.cache).forEach(cachePath => {
				if (cachePath.indexOf(options.path) === 0) {
					delete require.cache[cachePath];
				}
			});
			try {
				jsonData = require(jsonPath);
				response.writeHead(200, {
					'Content-Type': options.contentType
				});
				response.end(JSON.stringify(jsonData, null, options.indentation));
			} catch (error) {
				return next(error);
			}
		},

		// Middleware to serve template static files
		serveStaticFiles: serveStatic(path.join(options.templatesPath, 'public'), {
			index: false
		}),

		// Middleware to handle not found errors
		handleNotFoundError(request, response, next) {
			const error = new Error(status.message[404]);
			error.status = 404;
			next(error);
		},

		// Middleware to handle server errors
		// eslint-disable-next-line no-unused-vars
		handleServerError(error, request, response, next) {
			if (error.status !== 404) {
				self.log.error(error.stack);
			}
			const statusCode = (error.status || 500);
			const statusMessage = status.message[statusCode] || 'Error';
			response.writeHead(statusCode, {
				'Content-Type': 'text/html'
			});
			response.end(self.templates.error.render({
				name: options.name,
				description: options.description,
				is404: (error.status === 404),
				statusCode,
				statusMessage,
				stackTrace: error.stack
			}));
		},

		// Build a file object from a path
		buildFileObject(filePath) {
			const extension = path.extname(filePath);
			const fileUrl = filePath.replace(options.path, '').replace(extension, '');
			const name = fileUrl.replace(/^\//, '');
			return {
				name,
				nameSplit: name.split('/'),
				url: fileUrl,
				extension: extension.substr(1).toLowerCase(),
				fullPath: filePath
			};
		},

		// Start the application
		start(done) {
			done = done || function() {};
			self.connect.listen(self.port, error => {
				if (error) {
					self.log.error(error.stack);
					done(error);
					return process.exit(1);
				}
				self.log.info('%s started on http://localhost:%d', options.name, self.port);
				done();
			});
			return self;
		}

	};
	self.init();
	return self;
}

function defaultOptions(options) {
	return extend(true, {}, module.exports.defaults, options);
}

/* istanbul ignore next */
function noop() {}
