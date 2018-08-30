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

function init (options = {}) {
  return function jwtAuth () {
    const app = this;
    const _super = app.setup;
    const { ExtractJwt, Strategy } = passportJwt;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @feathersjs/authentication-jwt?`);
    }

    const authOptions = app.get('auth') || app.get('authentication') || {};
    const jwtOptions = authOptions[options.name] || {};
    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    const jwtSettings = merge({}, defaults, pick(authOptions, KEYS), jwtOptions, omit(options, ['Verifier']));

    if (typeof jwtSettings.header !== 'string') {
      throw new Error(`You must provide a 'header' in your authentication configuration or pass one explicitly`);
    }

    const extractors = [
      ExtractJwt.fromAuthHeaderWithScheme('jwt'),
      ExtractJwt.fromAuthHeaderAsBearerToken(),
      ExtractJwt.fromHeader(jwtSettings.header.toLowerCase()),
      ExtractJwt.fromBodyField(jwtSettings.bodyKey)
    ];

    if (authOptions.cookie && authOptions.cookie.name) {
      extractors.push(function (req) {
        if (req && req.cookies) {
          return req.cookies[authOptions.cookie.name];
        }

        return null;
      });
    }

    let Verifier = DefaultVerifier;
    let strategyOptions = merge({
      secretOrKey: jwtSettings.secret,
      jwtFromRequest: ExtractJwt.fromExtractors(extractors)
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
}

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  defaults,
  default: init,
  ExtractJwt: passportJwt.ExtractJwt,
  Verifier: DefaultVerifier
});
