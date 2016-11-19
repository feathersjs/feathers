import Debug from 'debug';
import merge from 'lodash.merge';
import omit from 'lodash.omit';
import pick from 'lodash.pick';
import auth from 'feathers-authentication';
import { formatter as defaultFormatter } from 'feathers-rest';
import url from './url';
import { parse } from 'url';
import defaultHandler from './express/handler';
import DefaultVerifier from './verifier';

const debug = Debug('feathers-authentication-oauth2');

const KEYS = [
  'entity',
  'service',
  'passReqToCallback',
  'session'
];

export default function init (options = {}) {
  return function oauth2Auth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-oauth2?`);
    }

    let { name, Strategy } = options;

    if (!name) {
      throw new Error(`You must provide a strategy 'name'.`);
    }

    if (!Strategy) {
      throw new Error(`You must provide a passport 'Strategy' instance.`);
    }

    const authSettings = app.get('auth') || {};

    // Attempt to pull options from the global auth config
    // for this provider.
    const providerSettings = authSettings[name] || {};
    const oauth2Settings = merge({
      idField: `${name}Id`,
      path: `/auth/${name}`,
      callbackURL: url(app, `/auth/${name}/callback`)
    }, pick(authSettings, KEYS), providerSettings, omit(options, ['Verifier', 'Strategy', 'formatter']));

    if (!oauth2Settings.clientID) {
      throw new Error(`You must provide a 'clientID' in your authentication configuration or pass one explicitly`);
    }

    if (!oauth2Settings.clientSecret) {
      throw new Error(`You must provide a 'clientSecret' in your authentication configuration or pass one explicitly`);
    }

    const Verifier = options.Verifier || DefaultVerifier;
    const formatter = options.formatter || defaultFormatter;
    const handler = options.handler || defaultHandler(oauth2Settings);

    // register OAuth middleware
    debug(`Registering '${name}' Express OAuth middleware`);
    app.get(oauth2Settings.path, auth.express.authenticate(name));
    app.get(
      parse(oauth2Settings.callbackURL).pathname,
      // NOTE (EK): We register failure redirect here so that we can
      // retain the natural express middleware redirect ability like
      // you would have with vanilla passport.
      auth.express.authenticate(name, { failureRedirect: oauth2Settings.failureRedirect }),
      handler,
      auth.express.emitEvents(authSettings),
      auth.express.setCookie(authSettings),
      auth.express.successRedirect(),
      auth.express.failureRedirect(authSettings),
      formatter
    );

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, oauth2Settings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a oauth2 passport verify callback.`);
      }

      // Register 'oauth2' strategy with passport
      debug('Registering oauth2 authentication strategy with options:', oauth2Settings);
      app.passport.use(name, new Strategy(oauth2Settings, verifier.verify.bind(verifier)));

      return result;
    };
  };
}

// Exposed Modules
Object.assign(init, {
  Verifier: DefaultVerifier,
  url: url
});
