const makeDebug = require('debug');

const {
  createJWT,
  verifyJWT
} = require('../utils');

const debug = makeDebug('@feathersjs/authentication:passport:initialize');

module.exports = function initialize (options = {}) {
  // const app = this;

  debug('Initializing custom passport initialize', options);

  // Do any special feathers passport initialization here. We may need this
  // to support different engines.
  return function (passport) {
    // NOTE (EK): This is called by passport.initialize() when calling
    // app.configure(authentication()).

    // Expose our JWT util functions globally
    passport._feathers = {};
    passport.createJWT = createJWT;
    passport.verifyJWT = verifyJWT;
    passport.options = function (name, strategyOptions) {
      if (!name) {
        return passport._feathers;
      }

      if (typeof name === 'string' && !strategyOptions) {
        return passport._feathers[name];
      }

      if (typeof name === 'string' && strategyOptions) {
        debug(`Setting ${name} strategy options`, strategyOptions);
        passport._feathers[name] = Object.assign({}, strategyOptions);
      }
    };
  };
};
