import Debug from 'debug';
import path from 'path';
import crypto from 'crypto';
import passport from 'passport';
import hooks from './hooks';
import token from './services/token';
import local from './services/local';
import oauth2 from './services/oauth2';
import * as middleware from './middleware';

const debug = Debug('feathers-authentication:main');
const PROVIDERS = {
  token,
  local
};

export default function(providers) {
  return function() {
    const app = this;
    let _super = app.setup;

    // Add mixin to normalize the auth token on the params
    app.mixins.push(function(service){
      service.before(hooks.normalizeAuthToken());
    });

    // REST middleware
    if (app.rest) {
      debug('registering REST authentication middleware');
      // Make the Passport user available for REST services.
      // app.use( middleware.exposeAuthenticatedUser() );
      // Get the token and expose it to REST services.
      // TODO (EK): Maybe make header key configurable
      app.use( middleware.normalizeAuthToken() );
    }

    // NOTE (EK): Currently we require token based auth so
    // if the developer didn't provide a config for our token
    // provider then we'll set up a sane default for them.
    if (providers.token === undefined) {
      providers.token = {
        secret: crypto.randomBytes(64).toString('base64')
      };
    }

    // If they didn't pass in a local provider let's set one up
    // for them with the default options.
    if (providers.local === undefined) {
      providers.local = {};
    }

    const authOptions = Object.assign({ successRedirect: '/auth/success' }, providers.local, providers.token);
    
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
    Object.keys(providers).forEach(function (key) {
      // Check to see if the key is a local or token provider
      let provider = PROVIDERS[key];
      let providerOptions = providers[key];

      // If it's not one of our own providers then determine whether it is oauth1 or oauth2
      if (!provider) {
        // Check to see if it is an oauth2 provider
        if (providerOptions.clientID && providerOptions.clientSecret) {
          provider = oauth2;
        } 
        // Check to see if it is an oauth1 provider
        else if (providerOptions.consumerKey && providerOptions.consumerSecret){
          throw new Error(`Sorry we don't support OAuth1 providers right now. Try using a ${key} OAuth2 provider.`);
        }
        else if (!provider) {
          throw new Error(`Invalid '${key}' provider configuration.\nYou need to provide your 'clientID' and 'clientSecret' if using an OAuth2 provider or your 'consumerKey' and 'consumerSecret' if using an OAuth1 provider.`);
        }
      }

      const options = Object.assign({ provider: key, endPoint: `/auth/${key}` }, providerOptions, authOptions);

      app.configure( provider(options) );
    });

    app.get(authOptions.successRedirect, function(req, res){
      res.sendFile(path.resolve(__dirname, 'public', 'auth-success.html'));
    });
  };
}

export { hooks };
