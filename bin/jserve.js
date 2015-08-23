#!/usr/bin/env node
'use strict';

var jserve = require('../');

var app = jserve({
    log: {
        error: console.error.bind(console),
        info: console.log.bind(console)
    }
});

app.start();
