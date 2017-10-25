const Debug = require('debug');
const merge = require('lodash.merge');
const omit = require('lodash.omit');
const pick = require('lodash.pick');
const DefaultVerifier = require('./verifier');
const passportJwt = require('passport-jwt');

const debug = Debug('@feathersjs/authentication-jwt');
const defaults = {
  name: 'jwt',
  bodyKey: 'accessToken'
};

const KEYS = [
  'secret',
  'header',
  'entity',
  'service',
  'passReqToCallback',
  'session',
  'jwt'
];

module.exports = function init (options = {}) {
  return function jwtAuth () {
    const app = this;
    const _super = app.setup;
    const { ExtractJwt, Strategy } = passportJwt;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @feathersjs/authentication-jwt?`);
    }

    let authOptions = app.get('auth') || app.get('authentication') || {};
    let jwtOptions = authOptions[options.name] || {};

    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    let jwtSettings = merge({}, defaults, pick(authOptions, KEYS), jwtOptions, omit(options, ['Verifier']));

    if (typeof jwtSettings.header !== 'string') {
      throw new Error(`You must provide a 'header' in your authentication configuration or pass one explicitly`);
    }

    if (typeof jwtSettings.secret === 'undefined') {
      throw new Error(`You must provide a 'secret' in your authentication configuration or pass one explicitly`);
    }

    let Verifier = DefaultVerifier;
    let strategyOptions = merge({
      secretOrKey: jwtSettings.secret,
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderWithScheme('jwt'),
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromHeader(jwtSettings.header.toLowerCase()),
        ExtractJwt.fromBodyField(jwtSettings.bodyKey)
      ])
    }, jwtSettings.jwt, omit(jwtSettings, ['jwt', 'header', 'secret']));

    // Normalize algorithm key
    if (!strategyOptions.algorithms && strategyOptions.algorithm) {
      strategyOptions.algorithms = Array.isArray(strategyOptions.algorithm) ? strategyOptions.algorithm : [strategyOptions.algorithm];
      delete strategyOptions.algorithm;
    }

    // Support passing a custom verifier
    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, jwtSettings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a jwt passport verify callback.`);
      }

      // Register 'jwt' strategy with passport
      debug('Registering jwt authentication strategy with options:', strategyOptions);
      app.passport.use(jwtSettings.name, new Strategy(strategyOptions, verifier.verify.bind(verifier)));
      app.passport.options(jwtSettings.name, jwtSettings);

      return result;
    };
  };
};

// Exposed Modules
Object.assign(module.exports, {
  defaults,
  ExtractJwt: passportJwt.ExtractJwt,
  Verifier: DefaultVerifier
});
