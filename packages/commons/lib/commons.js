const utils = require('./utils');
const hooks = require('./hooks');
const args = require('./arguments');
const filterQuery = require('./filter-query');

module.exports = Object.assign({}, utils, args, { hooks, filterQuery });
