const Debug = require('debug');
const auth = require('@feathersjs/authentication');
const rest = require('@feathersjs/express/rest');

const { makeUrl, _ } = require('@feathersjs/commons');
const { omit, pick } = _;

const merge = require('lodash.merge');
const defaultHandler = require('./express/handler');
const defaultErrorHandler = require('./express/error-handler');
const DefaultVerifier = require('./verifier');

const debug = Debug('@feathersjs/authentication-oauth1');

const INCLUDE_KEYS = [
  'entity',
  'service',
  'passReqToCallback'
];

const EXCLUDE_KEYS = ['Verifier', 'Strategy', 'formatter'];

function init (options = {}) {
  return function oauth1Auth () {
    const app = this;
    const _super = app.setup;

    if (!app.passport) {
      throw new Error(`Can not find app.passport. Did you initialize feathers-authentication before @feathersjs/authentication-oauth1?`);
    }

    let { name, Strategy } = options;

    if (!name) {
      throw new Error(`You must provide a strategy 'name'.`);
    }

    if (!Strategy) {
      throw new Error(`You must provide a passport 'Strategy' instance.`);
    }

    const authSettings = app.get('auth') || app.get('authentication') || {};

    // Attempt to pull options from the global auth config
    // for this provider.
    const providerSettings = authSettings[name] || {};
    const oauth1Settings = merge({
      idField: `${name}Id`,
      path: `/auth/${name}`,
      session: true,
      __oauth: true
    }, pick(authSettings, ...INCLUDE_KEYS), providerSettings, omit(options, ...EXCLUDE_KEYS));

    // Set callback defaults based on provided path
    oauth1Settings.callbackPath = oauth1Settings.callbackPath || `${oauth1Settings.path}/callback`;
    oauth1Settings.callbackURL = oauth1Settings.callbackURL || makeUrl(oauth1Settings.callbackPath, app);
    oauth1Settings.makeQuery = oauth1Settings.makeQuery || function(profile, options) {
      return { [options.idField]: profile.id }; // facebookId: profile.id
    };

    if (!oauth1Settings.consumerKey) {
      throw new Error(`You must provide a 'consumerKey' in your authentication configuration or pass one explicitly`);
    }

    if (!oauth1Settings.consumerSecret) {
      throw new Error(`You must provide a 'consumerSecret' in your authentication configuration or pass one explicitly`);
    }

    const Verifier = options.Verifier || DefaultVerifier;
    const formatter = options.formatter || rest.formatter;
    const handler = options.handler || defaultHandler(oauth1Settings);
    const errorHandler = defaultErrorHandler(oauth1Settings);

    // register OAuth middleware
    debug(`Registering '${name}' Express OAuth middleware`);
    app.get(oauth1Settings.path, auth.express.authenticate(name, oauth1Settings));
    app.get(
      oauth1Settings.callbackPath,
      // NOTE (EK): We register failure redirect here so that we can
      // retain the natural express middleware redirect ability like
      // you would have with vanilla passport.
      auth.express.authenticate(name, oauth1Settings),
      handler,
      errorHandler,
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

module.exports = init;

// Exposed Modules
Object.assign(module.exports, {
  default: init,
  Verifier: DefaultVerifier
});
