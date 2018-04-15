const Debug = require('debug');
const { merge, omit, pick } = require('lodash');
const hooks = require('./hooks');
const DefaultVerifier = require('./verifier');

const passportLocal = require('passport-local');

const debug = Debug('@feathersjs/authentication-local');
const defaults = {
  name: 'local',
  usernameField: 'email',
  passwordField: 'password'
};

const KEYS = [
  'entity',
  'service',
  'passReqToCallback',
  'session'
];

function init (options = {}) {
  return function localAuth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @feathersjs/authentication-local?`);
    }

    let name = options.name || defaults.name;
    let authOptions = app.get('authentication') || {};
    let localOptions = authOptions[name] || {};

    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    const localSettings = merge({}, defaults, pick(authOptions, KEYS), localOptions, omit(options, ['Verifier']));
    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, localSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a local passport verify callback.`);
      }

      // Register 'local' strategy with passport
      debug('Registering local authentication strategy with options:', localSettings);
      app.passport.use(localSettings.name, new passportLocal.Strategy(localSettings, verifier.verify.bind(verifier)));
      app.passport.options(localSettings.name, localSettings);

      return result;
    };
  };
}

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  default: init,
  defaults,
  hooks,
  Verifier: DefaultVerifier
});
