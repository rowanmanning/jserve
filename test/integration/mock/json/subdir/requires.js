'use strict';

console.log(module.require);

module.exports = {
    require: true,
    foo: require('../foo'),
    bar: require('./bar')
};
