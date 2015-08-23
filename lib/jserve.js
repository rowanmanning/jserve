'use strict';

var connect = require('connect');
var extend = require('extend');
var path = require('path');

module.exports = jserve;
module.exports.defaults = {
    contentType: 'application/json',
    log: {
        debug: /* istanbul ignore next */ function () {},
        error: /* istanbul ignore next */ function () {},
        info: /* istanbul ignore next */ function () {},
        warn: /* istanbul ignore next */ function () {}
    },
    paths: [
        path.join(process.cwd(), 'json')
    ],
    port: process.env.PORT || 3000
};

function jserve (options) {
    options = defaultOptions(options);
    var self = {

        // Instance properties
        connect: connect(),
        log: options.log,
        port: options.port,

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
    return self;
}

function defaultOptions (options) {
    return extend(true, {}, module.exports.defaults, options);
}
