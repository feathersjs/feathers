import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import DefaultVerifier from './verifier';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

const debug = Debug('feathers-authentication-jwt');
const defaults = {
  name: 'jwt'
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

export default function init (options = {}) {
  return function jwtAuth () {
    const app = this;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-jwt?`);
    }

    // NOTE (EK): Pull from global auth config to support legacy auth for an easier transition.
    let jwtSettings = merge(defaults, pick(app.get('auth') || {}, KEYS), omit(options, ['Verifier']));

    if (typeof jwtSettings.header !== 'string') {
      throw new Error(`You must provide a 'header' in your authentication configuration or pass one explicitly`);
    }

    if (typeof jwtSettings.secret !== 'string') {
      throw new Error(`You must provide a 'secret' in your authentication configuration or pass one explicitly`);
    }

    let Verifier = DefaultVerifier;
    let strategyOptions = merge({
      secretOrKey: jwtSettings.secret,
      jwtFromRequest: ExtractJwt.fromHeader(jwtSettings.header.toLowerCase())
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

    let verifier = new Verifier(app, jwtSettings);

    if (!verifier.verify) {
      throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a jwt passport verify callback.`);
    }

    // Register 'jwt' strategy with passport
    debug('Registering jwt authentication strategy with options:', strategyOptions);
    app.passport.use(jwtSettings.name, new JWTStrategy(strategyOptions, verifier.verify.bind(verifier)));
  };
}

// Exposed Modules
Object.assign(init, {
  defaults,
  ExtractJwt,
  Verifier: DefaultVerifier
});
