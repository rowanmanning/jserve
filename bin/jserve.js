#!/usr/bin/env node
'use strict';

var chalk = require('chalk');
var jserve = require('../');
var path = require('path');
var pkg = require('../package.json');
var program = require('commander');

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

if (program.indentation) {
    if (/^\d+$/.test(program.indentation)) {
        program.indentation = parseInt(program.indentation, 10);
    }
    else if (/^\\*t$/.test(program.indentation)) {
        program.indentation = '\t';
    }
}

if (program.json && !/^[\/\~]/.test(program.json)) {
    program.json = path.resolve(process.cwd(), program.json);
}

if (program.templates && !/^[\/\~]/.test(program.templates)) {
    program.templates = path.resolve(process.cwd(), program.templates);
}

var app = jserve({
    contentType: program.contentType,
    indentation: program.indentation,
    log: {
        debug: logDebug,
        error: logError,
        info: logInfo
    },
    name: program.name,
    path: program.json,
    port: program.port,
    templatesPath: program.templates
});

app.start();

function logDebug () {
    arguments[0] = chalk.grey(arguments[0]);
    console.log.apply(console, arguments);
}

function logError () {
    arguments[0] = chalk.red(arguments[0]);
    console.error.apply(console, arguments);
}

function logInfo () {
    console.log.apply(console, arguments);
}
