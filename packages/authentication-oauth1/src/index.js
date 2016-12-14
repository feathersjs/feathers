import Debug from 'debug';
import url from 'url';
import auth from 'feathers-authentication';
import { formatter as defaultFormatter } from 'feathers-rest';
import { omit, pick, makeUrl } from 'feathers-commons';
import merge from 'lodash.merge';
import defaultHandler from './express/handler';
import DefaultVerifier from './verifier';

const debug = Debug('feathers-authentication-oauth1');

const INCLUDE_KEYS = [
  'entity',
  'service',
  'passReqToCallback'
];

const EXCLUDE_KEYS = ['Verifier', 'Strategy', 'formatter'];

export default function init (options = {}) {
  return function oauth1Auth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before feathers-authentication-oauth1?`);
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
    const oauth1Settings = merge({
      idField: `${name}Id`,
      path: `/auth/${name}`,
      session: true,
      __oauth: true,
      callbackURL: makeUrl(`/auth/${name}/callback`, app)
    }, pick(authSettings, ...INCLUDE_KEYS), providerSettings, omit(options, ...EXCLUDE_KEYS));

    if (!oauth1Settings.consumerKey) {
      throw new Error(`You must provide a 'consumerKey' in your authentication configuration or pass one explicitly`);
    }

    if (!oauth1Settings.consumerSecret) {
      throw new Error(`You must provide a 'consumerSecret' in your authentication configuration or pass one explicitly`);
    }

    const Verifier = options.Verifier || DefaultVerifier;
    const formatter = options.formatter || defaultFormatter;
    const handler = options.handler || defaultHandler(oauth1Settings);

    // register OAuth middleware
    debug(`Registering '${name}' Express OAuth middleware`);
    app.get(oauth1Settings.path, auth.express.authenticate(name));
    app.get(
      url.parse(oauth1Settings.callbackURL).pathname,
      // NOTE (EK): We register failure redirect here so that we can
      // retain the natural express middleware redirect ability like
      // you would have with vanilla passport.
      auth.express.authenticate(name, oauth1Settings),
      handler,
      auth.express.emitEvents(authSettings),
      auth.express.setCookie(authSettings),
      auth.express.successRedirect(),
      auth.express.failureRedirect(authSettings),
      formatter
    );

    app.setup = function () {
      let result = _super.apply(this, arguments);
      let verifier = new Verifier(app, oauth1Settings);

      if (!verifier.verify) {
        throw new Error(`Your verifier must implement a 'verify' function. It should have the same signature as a oauth1 passport verify callback.`);
      }

      // Register 'oauth1' strategy with passport
      debug('Registering oauth1 authentication strategy with options:', oauth1Settings);
      app.passport.use(name, new Strategy(oauth1Settings, verifier.verify.bind(verifier)));
      app.passport.options(name, oauth1Settings);

      return result;
    };
  };
}

// Exposed Modules
Object.assign(init, {
  Verifier: DefaultVerifier
});
