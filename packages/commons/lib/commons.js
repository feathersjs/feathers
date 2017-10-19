const utils = require('./utils');
const hooks = require('./hooks');
const args = require('./arguments');

module.exports = Object.assign({}, utils, args, { hooks });
