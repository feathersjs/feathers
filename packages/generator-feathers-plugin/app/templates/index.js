// import errors from 'feathers-errors';
const debug = require('debug')('<%= name %>');

module.exports = function init () {
  debug('Initializing <%= name %> plugin');
  return '<%= name %>';
};
