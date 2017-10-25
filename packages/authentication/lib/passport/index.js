const initialize = require('./initialize');
const authenticate = require('./authenticate');
const makeDebug = require('debug');

const debug = makeDebug('@feathersjs/authentication:passport');

module.exports = function feathersPassport (options) {
  const app = this;

  debug('Initializing Feathers passport adapter');

  return {
    initialize: initialize.call(app, options),
    authenticate: authenticate.call(app, options)
  };
};
