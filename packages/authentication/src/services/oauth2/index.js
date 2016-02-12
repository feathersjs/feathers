import Debug from 'debug';
import errors from 'feathers-errors';
import passport from 'passport';
import { exposeConnectMiddleware } from '../../middleware';
import { successfulLogin } from '../../middleware';

const debug = Debug('feathers-authentication:oauth2');
const defaults = {
  successRedirect: '/auth/success',
  passwordField: 'password',
  userEndpoint: '/users',
  tokenEndpoint: '/auth/token',
  passReqToCallback: true,
  callbackSuffix: 'callback',
  permissions: {}
};

export class Service {
  constructor(options = {}) {
    this.options = options;
  }

  oauthCallback(req, accessToken, refreshToken, profile, done) {
    let app = this.app;
    const options = this.options;
    const params = {
      internal: true,
      query: {
        // facebookId: profile.id
        [`${options.provider}Id`]: profile.id
      }
    };

    // console.log('Authenticating', accessToken, refreshToken, profile);

    // Find or create the user since they could have signed up via facebook.
    app.service(options.userEndpoint)
      .find(params)
      .then(users => {
        // Paginated services return the array of results in the data attribute.
        let user = users[0] || users.data && users.data[0];

        // If user found return them
        if (user) {
          return done(null, user);
        }

        // No user found so we need to create one.
        // 
        // TODO (EK): This is where we should look at req.user and see if we
        // can consolidate profiles. We might want to give the developer a hook
        // so that they can control the consolidation strategy.
        profile._json.accessToken = accessToken;

        let data = Object.assign({
          [`${options.provider}Id`]: profile.id,
          [`${options.provider}`]: profile._json
        });
        
        return app.service(options.userEndpoint).create(data, { internal: true }).then(user => {
          return done(null, user);
        }).catch(done);
      }).catch(done);
  }

  // GET /auth/facebook
  find(params) {    
    // Authenticate via your provider. This will redirect you to authorize the application.
    const authOptions = Object.assign({session: false}, this.options.permissions);
    return passport.authenticate(this.options.provider, authOptions)(params.req, params.res);
  }

  // For GET /auth/facebook/callback
  get(id, params) {
    const options = this.options;
    const authOptions = Object.assign({session: false}, options.permissions);
    let app = this.app;
    
    // TODO (EK): Make this configurable
    if (id !== 'callback') {
      return Promise.reject(new errors.NotFound());
    }

    return new Promise(function(resolve, reject){
    
      let middleware = passport.authenticate(options.provider, authOptions, function(error, user) {
        if (error) {
          return reject(error);
        }

        // Login failed.
        if (!user) {
          return reject(new errors.NotAuthenticated(`An error occurred logging in with ${options.provider}`));
        }

        // Login was successful. Clean up the user object for the response.
        // TODO (EK): Maybe the id field should be configurable
        const payload = {
          id: user.id !== undefined ? user.id : user._id
        };

        // Get a new JWT and the associated user from the Auth token service and send it back to the client.
        return app.service(options.tokenEndpoint)
                  .create(payload, { internal: true })
                  .then(resolve)
                  .catch(reject);
      });

      middleware(params.req, params.res);
    });
  }

  // // POST /auth/facebook /auth/facebook::
  // create(data, params) {
  //   // TODO (EK): This should be for token based auth
  //   const options = this.options;
    
  //   // Authenticate via facebook, then generate a JWT and return it
  //   return new Promise(function(resolve, reject){
  //     let middleware = passport.authenticate('facebook-token', { session: false }, function(error, user) {
  //       if (error) {
  //         return reject(error);
  //       }

  //       // Login failed.
  //       if (!user) {
  //         return reject(new errors.NotAuthenticated(options.loginError));
  //       }

  //       // Login was successful. Generate and send token.
  //       user = Object.assign({}, user = !user.toJSON ? user : user.toJSON());
  //       delete user[options.passwordField];

  //       // TODO (EK): call this.app.service('/auth/token').create() instead
  //       const token = jwt.sign(user, options.secret, options);

  //       return resolve({
  //         token: token,
  //         data: user
  //       });
  //     });

  //     middleware(params.req);
  //   });
  // }

  setup(app) {
    // attach the app object to the service context
    // so that we can call other services
    this.app = app;
  }
}

export default function(options){
  options = Object.assign({}, defaults, options);

  if (!options.provider) {
    throw new Error('You need to pass a `provider` for your authentication provider');
  }

  if (!options.endPoint) {
    throw new Error(`You need to provide an 'endPoint' for your ${options.provider} provider`);
  }

  if (!options.strategy) {
    throw new Error(`You need to provide a Passport 'strategy' for your ${options.provider} provider`);
  }

  options.callbackURL = options.callbackURL || `${options.endPoint}/${options.callbackSuffix}`;

  debug(`configuring ${options.provider} OAuth2 service with options`, options);

  return function() {
    const app = this;
    const Strategy = options.strategy;

    // Initialize our service with any options it requires
    app.use(options.endPoint, exposeConnectMiddleware, new Service(options), successfulLogin(options));

    // Get our initialized service
    const service = app.service(options.endPoint);
    
    // Register our Passport auth strategy and get it to use our passport callback function
    passport.use(new Strategy(options, service.oauthCallback.bind(service)));
  };
}
