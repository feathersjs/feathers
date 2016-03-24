import Debug from 'debug';
import path from 'path';
import crypto from 'crypto';
import passport from 'passport';
import hooks from './hooks';
import token from './services/token';
import local from './services/local';
import oauth2 from './services/oauth2';
import * as middleware from './middleware';

function isObject (item) {
  return (typeof item === 'object' && !Array.isArray(item) && item !== null);
}

const debug = Debug('feathers-authentication:main');
const PROVIDERS = {
  token,
  local
};

// Options that apply to any provider
const defaults = {
  idField: '_id',
  successRedirect: '/auth/success',
  failureRedirect: '/auth/failure',
  tokenEndpoint: '/auth/token',
  localEndpoint: '/auth/local',
  userEndpoint: '/users',
  header: 'authorization',
  cookie: 'feathers-jwt'
};

export default function auth(config = {}) {
  return function() {
    const app = this;
    let _super = app.setup;

    // NOTE (EK): Currently we require token based auth so
    // if the developer didn't provide a config for our token
    // provider then we'll set up a sane default for them.
    if (!config.token) {
      config.token = {
        secret: crypto.randomBytes(64).toString('base64')
      };
    }

    // If they didn't pass in a local provider let's set one up
    // for them with the default options.
    if (config.local === undefined) {
      config.local = {};
    }

    // Merge and flatten options
    const authOptions = Object.assign({}, defaults, app.get('auth'), config);

    // If we should redirect on success and the redirect route is the same as the
    // default then we'll set up a route handler. Otherwise we'll leave it to the developer
    // to set up their own custom route handler.
    if (authOptions.successRedirect === defaults.successRedirect) {
      debug(`Setting up successRedirect route: ${authOptions.successRedirect}`);
      
      app.get(authOptions.successRedirect, function(req, res){
        res.sendFile(path.resolve(__dirname, 'public', 'auth-success.html'));
      });
    }

    // If we should redirect on failure and the redirect route is the same as the
    // default then we'll set up a route handler. Otherwise we'll leave it to the developer
    // to set up their own custom route handler.
    if (authOptions.failureRedirect === defaults.failureRedirect) {
      debug(`Setting up failureRedirect route: ${authOptions.failureRedirect}`);

      app.get(authOptions.failureRedirect, function(req, res){
        res.sendFile(path.resolve(__dirname, 'public', 'auth-fail.html'));
      });
    }

    // Set the options on the app
    app.set('auth', authOptions);

    // REST middleware
    if (app.rest) {
      debug('registering REST authentication middleware');
      // Make the Passport user available for REST services.
      // app.use( middleware.exposeAuthenticatedUser() );

      // Get the token and expose it to REST services.
      app.use( middleware.normalizeAuthToken(authOptions) );
    }
    
    app.use(passport.initialize());

    app.setup = function() {
      let result = _super.apply(this, arguments);

      // Socket.io middleware
      if (app.io) {
        debug('registering Socket.io authentication middleware');
        app.io.on('connection', middleware.setupSocketIOAuthentication(app, authOptions));
      }

      // Primus middleware
      if (app.primus) {
        debug('registering Primus authentication middleware');
        app.primus.on('connection', middleware.setupPrimusAuthentication(app, authOptions));
      }

      return result;
    };

    // Merge all of our options and configure the appropriate service
    Object.keys(config).forEach(function (key) {
      
      // Because we are iterating through all the keys we might
      // be dealing with a config param and not a provider config
      // If that's the case we don't need to merge params and we
      // shouldn't try to set up a service for this key.
      if (!isObject(config[key])) {
        return;
      }

      // Check to see if the key is a local or token provider
      let provider = PROVIDERS[key];
      let providerOptions = config[key];

      // If it's not one of our own providers then determine whether it is oauth1 or oauth2
      if (!provider && isObject(providerOptions)) {
        // Check to see if it is an oauth2 provider
        if (providerOptions.clientID && providerOptions.clientSecret) {
          provider = oauth2;
        } 
        // Check to see if it is an oauth1 provider
        else if (providerOptions.consumerKey && providerOptions.consumerSecret){
          throw new Error(`Sorry we don't support OAuth1 providers right now. Try using a ${key} OAuth2 provider.`);
        }

        providerOptions = Object.assign({ provider: key, endPoint: `/auth/${key}` }, providerOptions);
      }
      
      const options = Object.assign({}, authOptions, providerOptions);
      
      app.configure( provider(options) );
    });

    // Register error handling middleware for redirecting to support
    // redirecting on authentication failure.
    app.use(middleware.failedLogin(authOptions));
  };
}

auth.hooks = hooks;
