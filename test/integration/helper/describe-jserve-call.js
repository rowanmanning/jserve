'use strict';

const axios = require('axios').default;
const childProcess = require('child_process');
const path = require('path');

module.exports = function describeJserveCall(args, describeBlock) {
	const argumentString = args.join(' ');
	describe(`jserve ${argumentString}`, () => {

		before(function(done) {

			this.stdout = '';
			this.stderr = '';

			process.env.PORT = '31019';
			let definedPort = null;
			const portMatches = argumentString.match(/(^|\s)(--port|-p)\s+(\d+)(\s|$)/);
			if (portMatches && portMatches[3]) {
				definedPort = portMatches[3];
			}
			definedPort = definedPort || process.env.PORT;

			const http = axios.create({
				baseURL: `http://localhost:${definedPort}`,
				validateStatus: () => true
			});
			this.get = http.get;

			// Only call done once
			function callDone(...doneArguments) {
				if (typeof done === 'function') {
					done.apply(this, doneArguments);
					done = null;
				}
			}

			// Set up a process
			this.process = childProcess.spawn(`${__dirname}/../../../bin/jserve.js`, args, {
				cwd: path.resolve(__dirname, '..', 'mock')
			});

			this.process.stdout.on('data', data => {
				this.stdout += data.toString();
				// Listen for the startup
				if (data.toString().indexOf('started on') !== -1) {
					callDone();
				}
			});

			this.process.stderr.on('data', data => {
				this.stderr += data.toString();
			});

			// Listen for the process exit
			this.process.on('close', code => {
				callDone(new Error(`child process exited with code ${code}\n${this.stderr}`));
			});
		});

		after(function() {
			this.process.kill();
		});

		// Call the original describe block
		describeBlock.call(this);

	});
};
