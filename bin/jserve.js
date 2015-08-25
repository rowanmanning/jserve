#!/usr/bin/env node
'use strict';

var jserve = require('../');

var app = jserve({
    log: {
        debug: console.log.bind(console),
        error: console.error.bind(console),
        info: console.log.bind(console),
        warn: console.error.bind(console)
    }
});

app.start();
