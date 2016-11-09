import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
import hooks from './hooks';
import DefaultVerifier from './verifier';
import { Strategy as LocalStrategy } from 'passport-local';

const debug = Debug('feathers-authentication-local');
const defaults = {
  name: 'local',
  entity: 'user',
  service: 'users',
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true,
  session: false
};

export default function init(options = {}) {
  return function localAuth() {
    const app = this;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-local?`);
    }

    // NOTE (EK): Pull from global auth config to support legacy
    // auth for an easier transition.
    const authSettings = app.get('auth') || {};
    const localSettings = merge(defaults, authSettings.local, omit(options, ['Verifier']));
    let Verifier = DefaultVerifier;

    if (options.Verifier) {
      Verifier = options.Verifier;
    }

    let verifier = new Verifier(app, localSettings);

    if (!verifier.verify) {
      throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a local passport verify callback.`)
    }

    // Set local options back on global auth config
    authSettings.local = localSettings;
    app.set('auth', authSettings);

    // Register 'local' strategy with passport
    debug('Registering local authentication strategy with options:', localSettings);
    app.passport.use(localSettings.name, new LocalStrategy(localSettings, verifier.verify.bind(verifier)));
  };
}

// Exposed Modules
Object.assign(init, {
  defaults,
  hooks,
  Verifier: DefaultVerifier
});