import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
// import hooks from './hooks';
import DefaultVerifier from './verifier';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

const debug = Debug('feathers-authentication-jwt');
const defaults = {
  name: 'jwt',
  entity: 'user',
  service: 'users',
  passReqToCallback: true,
  session: false
};

export default function init (options = {}) {
  return function jwtAuth () {
    const app = this;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-jwt?`);
    }

    // NOTE (EK): Pull from global auth config to support legacy
    // auth for an easier transition.
    const authSettings = app.get('auth') || {};

    let { secret, header } = authSettings;

    if (options.header) {
      header = options.header;
    }

    if (typeof header !== 'string') {
      throw new Error(`You must provide a 'header' in your authentication configuration or pass one explicitly`);
    }

    let jwtSettings = merge(defaults, authSettings.jwt, omit(options, ['Verifier']));
    let strategyOptions = merge({
      secretOrKey: secret,
      jwtFromRequest: ExtractJwt.fromHeader(header.toLowerCase()),
      passReqToCallback: defaults.passReqToCallback,
      session: defaults.session
    }, authSettings.jwt, omit(options, ['Verifier']));
    let Verifier = DefaultVerifier;

    if (!strategyOptions.secretOrKey) {
      throw new Error(`You must provide a 'secret' in your authentication configuration or pass one explicitly`);
    }

    // Normalize algorithm key
    if (!strategyOptions.algorithms && strategyOptions.algorithm) {
      strategyOptions.algorithms = Array.isArray(strategyOptions.algorithm) ? strategyOptions.algorithm : [strategyOptions.algorithm];
    }

    // Support passing a custom verifier
    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    let verifier = new Verifier(app, jwtSettings);

    if (!verifier.verify) {
      throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a jwt passport verify callback.`);
    }

    // Set jwt options back on global auth config
    authSettings.jwt = jwtSettings;
    app.set('auth', authSettings);

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
