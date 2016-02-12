import Debug from 'debug';
import errors from 'feathers-errors';
import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy } from 'passport-local';
import { exposeConnectMiddleware } from '../../middleware';
import { successfulLogin } from '../../middleware';

const debug = Debug('feathers-authentication:local');
const defaults = {
  userEndpoint: '/users',
  usernameField: 'email',
  passwordField: 'password',
  userProperty: passport._userProperty || 'user',
  localEndpoint: '/auth/local',
  tokenEndpoint: '/auth/token'
};

export class Service {
  constructor(options = {}) {
    this.options = options;
  }

  checkCredentials(username, password, done) {
    const params = {
      internal: true,
      query: {
        [this.options.usernameField]: username
      }
    };

    // Look up the user
    this.app.service(this.options.userEndpoint)
      .find(params)
      .then(users => {
        // Paginated services return the array of results in the data attribute.
        let user = users[0] || users.data && users.data[0];

        // Handle bad username.
        if (!user) {
          return done(null, false);
        }

        return user;
      })
      .then(user => {
        // Check password
        bcrypt.compare(password, user[this.options.passwordField], function(error, result) {
          // Handle 500 server error.
          if (error) {
            return done(error);
          }
          // Successful login.
          if (result) {
            return done(null, user);
          }
          // Handle bad password.
          return done(null, false);
        });
      })
      .catch(done);
  }

  // POST /auth/local
  create(data, params) {
    const options = this.options;
    let app = this.app;

    // Validate username and password, then generate a JWT and return it
    return new Promise(function(resolve, reject){    
      let middleware = passport.authenticate('local', { session: false }, function(error, user) {
        if (error) {
          return reject(error);
        }

        // Login failed.
        if (!user) {
          return reject(new errors.NotAuthenticated('Invalid login.'));
        }

        // Login was successful. Generate and send token.
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

      middleware(params.req);
    });
  }

  setup(app) {
    // attach the app object to the service context
    // so that we can call other services
    this.app = app;
  }
}

export default function(options){
  options = Object.assign({}, defaults, options);
  debug('configuring local authentication service with options', options);

  return function() {
    const app = this;

    // Initialize our service with any options it requires
    app.use(options.localEndpoint, exposeConnectMiddleware, new Service(options), successfulLogin(options));

    // Get our initialize service to that we can bind hooks
    const localService = app.service(options.localEndpoint);
    
    // Register our local auth strategy and get it to use the passport callback function
    passport.use(new Strategy(options, localService.checkCredentials.bind(localService)));
  };
}
