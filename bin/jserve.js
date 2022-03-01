#!/usr/bin/env node
'use strict';

const chalk = require('chalk');
const jserve = require('../');
const path = require('path');
const pkg = require('../package.json');
const program = require('commander');

program
	.version(pkg.version)
	.usage('[options]')
	.option(
		'-p, --port <port>',
		'the port to run on. Default: 3000'
	)
	.option(
		'-j, --json <path>',
		'the path to look for JSON files in. Default: ./json'
	)
	.option(
		'-c, --content-type <content-type>',
		'the Content-Type header to send when serving JSON. Default: application/json'
	)
	.option(
		'-i, --indentation <level>',
		'The number of spaces or tabs to use for JSON indentation. Default: 4'
	)
	.option(
		'-t, --templates <path>',
		'The path to look for template files in'
	)
	.option(
		'-n, --name <name>',
		'The name of the server, used in template headings. Default: JServe',
		'JServe'
	)
	.parse(process.argv);

const opts = program.opts();

if (opts.indentation) {
	if (/^\d+$/.test(opts.indentation)) {
		opts.indentation = parseInt(opts.indentation, 10);
	} else if (/^\\*t$/.test(opts.indentation)) {
		opts.indentation = '\t';
	}
}

if (opts.json && !/^[/~]/.test(opts.json)) {
	opts.json = path.resolve(process.cwd(), opts.json);
}

if (opts.templates && !/^[/~]/.test(opts.templates)) {
	opts.templates = path.resolve(process.cwd(), opts.templates);
}

const app = jserve({
	contentType: opts.contentType,
	indentation: opts.indentation,
	log: {
		debug: logDebug,
		error: logError,
		info: logInfo
	},
	name: opts.name,
	path: opts.json,
	port: opts.port,
	templatesPath: opts.templates
});

app.start();

function logDebug(...args) {
	args[0] = chalk.grey(args[0]);
	console.log(...args);
}

function logError(...args) {
	args[0] = chalk.red(args[0]);
	console.log(...args);
}

function logInfo(...args) {
	console.log(...args);
}
