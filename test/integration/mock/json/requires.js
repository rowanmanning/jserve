'use strict';

module.exports = {
    require: true,
    foo1: require(__dirname + '/foo'),
    foo2: require('./foo'),
    foo3: require('../../mock/json/foo')
};
