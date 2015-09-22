'use strict';

var childProcess = require('child_process');
var path = require('path');

module.exports = describeCall;

function describeCall (args, describeBlock) {
    // jshint validthis: true, maxstatements: false
    describe.call(this, 'jserve ' + args.join(' '), function () {

        before(function (done) {

            var stdout = '';
            var stderr = '';

            process.env.PORT = '31019';
            var definedPort = null;
            var portMatches = args.join(' ').match(/(^|\s)(--port|-p)\s+(\d+)(\s|$)/);
            if (portMatches && portMatches[3]) {
                definedPort = portMatches[3];
            }
            this.baseUrl = 'http://localhost:' + (definedPort || process.env.PORT);

            // Only call done once
            function callDone () {
                if (typeof done === 'function') {
                    done.apply(this, arguments);
                    done = null;
                }
            }

            // Set up a process
            this.process = childProcess.spawn(__dirname + '/../../../bin/jserve.js', args, {
                cwd: path.resolve(__dirname, '..', 'mock')
            });

            this.process.stdout.on('data', function (data) {
                stdout += data.toString();
                // Listen for the startup
                if (data.toString().indexOf('started on') !== -1) {
                    callDone();
                }
            });

            this.process.stderr.on('data', function (data) {
                stderr += data.toString();
            });

            // Listen for the process exit
            this.process.on('close', function (code) {
                callDone(new Error('child process exited with code ' + code + '\n' + stderr));
            });
        });

        after(function () {
            this.process.kill();
        });

        // Call the original describe block
        describeBlock.call(this);

    });
}
