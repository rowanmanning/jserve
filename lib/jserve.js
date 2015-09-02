'use strict';

var connect = require('connect');
var extend = require('extend');
var fs = require('fs');
var glob = require('glob');
var hogan = require('hogan.js');
var path = require('path');
var serveStatic = require('serve-static');
var statusMessages = require('statuses');
var url = require('url');
var vm = require('vm');

module.exports = jserve;
module.exports.defaults = {
    contentType: 'application/json',
    indentation: 4,
    log: {
        debug: /* istanbul ignore next */ function () {},
        error: /* istanbul ignore next */ function () {},
        info: /* istanbul ignore next */ function () {}
    },
    path: path.join(process.cwd(), 'json'),
    port: process.env.PORT || 3000,
    templatesPath: path.resolve(__dirname, '..', 'template')
};

function jserve (options) {
    options = defaultOptions(options);
    var self = {

        // Instance properties
        connect: connect(),
        log: options.log,
        port: options.port,
        templates: {},

        // Initialise the application
        init: function () {
            self.initTemplates();
            self.connect.use(self.serveStaticFiles);
            self.connect.use(self.logRequest);
            self.connect.use(self.removeExtension);
            self.connect.use(self.serveIndex);
            self.connect.use(self.serveJson);
            self.connect.use(self.handleNotFoundError);
            self.connect.use(self.handleServerError);
        },

        // Initialise the application templates
        initTemplates: function () {
            self.templates = {
                error: hogan.compile(loadTemplate('error')),
                index: hogan.compile(loadTemplate('index'))
            };
            function loadTemplate (name) {
                var templatePath = path.resolve(options.templatesPath, name + '.html');
                return fs.readFileSync(templatePath, 'utf-8');
            }
        },

        // Middleware to log the request
        logRequest: function (request, response, next) {
            self.log.debug('Request to "%s"', request.url);
            next();
        },

        // Middleware to remove JSON and JS file extensions
        removeExtension: function (request, response, next) {
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
        serveIndex: function (request, response, next) {
            if (request.path !== '/') {
                return next();
            }
            glob(options.path + '/**/*.{js,json}', function (error, files) {
                if (error) {
                    return next(error);
                }
                response.writeHead(200, {
                    'Content-Type': 'text/html'
                });
                response.end(self.templates.index.render({
                    files: files.map(self.buildFileObject)
                }));
            });
        },

        // Middleware to serve up JSON
        serveJson: function (request, response, next) {
            var jsonPath = null;
            var loadData = null;
            try {
                jsonPath = require.resolve(path.join(options.path, request.path));
            } catch (error) {
                return next();
            }
            if (/.json$/.test(jsonPath)) {
                loadData = self.loadJsonFile;
            }
            else {
                loadData = self.loadJavaScriptFile;
            }
            loadData(jsonPath, function (error, jsonData) {
                if (error) {
                    return next(error);
                }
                response.writeHead(200, {
                    'Content-Type': options.contentType
                });
                response.end(JSON.stringify(jsonData, null, options.indentation));
            });
        },

        // Serve up a resolved JSON file
        loadJsonFile: function (jsonPath, done) {
            fs.readFile(jsonPath, 'utf-8', function (error, fileContents) {
                if (error) {
                    return done(error);
                }
                try {
                    var jsonData = JSON.parse(fileContents);
                    return done(null, jsonData);
                } catch (error) {
                    return done(error);
                }
            });
        },

        // Serve up a resolved JavaScript file
        loadJavaScriptFile: function (jsonPath, done) {
            fs.readFile(jsonPath, 'utf-8', function (error, fileContents) {
                if (error) {
                    return done(error);
                }
                Object.keys(require.cache).forEach(function (cachePath) {
                    if (cachePath.indexOf(options.path) === 0) {
                        delete require.cache[cachePath];
                    }
                });
                try {
                    var jsonData = loadSandboxedJavaScript(jsonPath, options.path, fileContents);
                    return done(null, jsonData);
                } catch (error) {
                    return done(error);
                }
            });
        },

        // Middleware to serve template static files
        serveStaticFiles: serveStatic(path.join(options.templatesPath, 'public'), {
            index: false
        }),

        // Middleware to handle not found errors
        handleNotFoundError: function (request, response, next) {
            var error = new Error(statusMessages[404]);
            error.status = 404;
            next(error);
        },

        // Middleware to handle server errors
        handleServerError: function (error, request, response, next) {
            // jshint unused: false
            if (error.status !== 404) {
                self.log.error(error.stack);
            }
            var statusCode = (error.status || 500);
            var statusMessage = statusMessages[statusCode] || 'Error';
            response.writeHead(statusCode, {
                'Content-Type': 'text/html'
            });
            response.end(self.templates.error.render({
                is404: (error.status === 404),
                statusCode: statusCode,
                statusMessage: statusMessage,
                stackTrace: error.stack
            }));
        },

        // Build a file object from a path
        buildFileObject: function (filePath) {
            var extension = path.extname(filePath);
            var fileUrl = filePath.replace(options.path, '').replace(extension, '');
            var name = fileUrl.replace(/^\//, '');
            return {
                name: name,
                nameSplit: name.split('/'),
                url: fileUrl,
                extension: extension.substr(1).toLowerCase(),
                fullPath: filePath
            };
        },

        // Start the application
        start: function (done) {
            done = done || function () {};
            self.connect.listen(self.port, function (error) {
                if (error) {
                    self.log.error(error.stack);
                    done(error);
                    return process.exit(1);
                }
                self.log.info('JServe started on http://localhost:%d', self.port);
                done();
            });
            return self;
        }

    };
    self.init();
    return self;
}

function defaultOptions (options) {
    return extend(true, {}, module.exports.defaults, options);
}

function loadSandboxedJavaScript (fileName, directoryName, fileContents) {
    var sandbox = {
        __dirname: directoryName,
        __filename: fileName,
        console: console,
        module: {
            exports: {}
        },
        require: createSandboxedRequire(directoryName)
    };
    return vm.runInNewContext(fileContents, sandbox);
}

function createSandboxedRequire (scopePath) {
    function scopedResolve (requirePath) {
        if (requirePath.indexOf('.') === 0) {
            requirePath = path.join(scopePath, requirePath);
        }
        return require.resolve(requirePath);
    }
    function scopedRequire (requirePath) {
        return require(scopedResolve(requirePath));
    }
    scopedRequire.resolve = scopedResolve;
    return scopedRequire;
}
