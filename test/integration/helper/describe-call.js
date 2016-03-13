// jscs:disable requireArrowFunctions
'use strict';

const childProcess = require('child_process');
const path = require('path');

module.exports = describeCall;

function describeCall (args, describeBlock) {
    // jshint validthis: true
    const argString = args.join(' ');
    describe(`jserve ${argString}`, () => {

        before(function (done) {

            let stdout = '';
            let stderr = '';

            process.env.PORT = '31019';
            let definedPort = null;
            const portMatches = argString.match(/(^|\s)(--port|-p)\s+(\d+)(\s|$)/);
            if (portMatches && portMatches[3]) {
                definedPort = portMatches[3];
            }
            definedPort = definedPort || process.env.PORT;
            this.baseUrl = `http://localhost:${definedPort}`;

            // Only call done once
            function callDone () {
                if (typeof done === 'function') {
                    done.apply(this, arguments);
                    done = null;
                }
            }

            // Set up a process
            this.process = childProcess.spawn(`${__dirname}/../../../bin/jserve.js`, args, {
                cwd: path.resolve(__dirname, '..', 'mock')
            });

            this.process.stdout.on('data', data => {
                stdout += data.toString();
                // Listen for the startup
                if (data.toString().indexOf('started on') !== -1) {
                    callDone();
                }
            });

            this.process.stderr.on('data', data => {
                stderr += data.toString();
            });

            // Listen for the process exit
            this.process.on('close', code => {
                callDone(new Error(`child process exited with code ${code}\n${stderr}`));
            });
        });

        after(function () {
            this.process.kill();
        });

        // Call the original describe block
        describeBlock.call(this);

    });
}
