import Debug from 'debug';
import jwt from 'jsonwebtoken';
import hooks from '../hooks';
import commonHooks from 'feathers-hooks';
import errors from 'feathers-errors';

const debug = Debug('feathers-authentication:token');

// Provider specific config
const defaults = {
  payload: [],
  passwordField: 'password',
  issuer: 'feathers',
  algorithm: 'HS256',
  expiresIn: '1d', // 1 day
};

/**
 * Verifies that a JWT token is valid. This is a private hook.
 *
 * @param  {Object} options - An options object
 * @param {String} options.secret - The JWT secret
 */
let _verifyToken = function(options = {}){
  const secret = options.secret;

  return function(hook) {
    return new Promise(function(resolve, reject){
      // If it was an internal call just skip
      if (!hook.params.provider) {
        hook.params.data = hook.data;
        return resolve(hook);
      }

      const token = hook.params.token;

      jwt.verify(token, secret, options, function (error, payload) {
        if (error) {
          // Return a 401 if the token has expired.
          return reject(new errors.NotAuthenticated(error));
        }

        // Normalize our params with the token in it.
        hook.data = payload;
        hook.params.data = Object.assign({}, hook.data, payload, { token });
        hook.params.query = Object.assign({}, hook.params.query, { token });
        resolve(hook);
      });
    });
  };
};

export class Service {
  constructor(options = {}) {
    this.options = options;
  }

  // GET /auth/token
  // This is sort of a dummy route that we are using just to verify
  // that our token is correct by running our verifyToken hook. It
  // doesn't refresh our token it just returns our existing one with
  // our user data.
  // find(params) {
  //   if (params.data && params.data.token) {
  //     const token = params.data.token;
  //     delete params.data.token;

  //     return Promise.resolve({
  //       token: token,
  //       data: params.data
  //     });
  //   }

  //   return Promise.reject(new errors.GeneralError('Something weird happened'));
  // }

  // GET /auth/token/refresh
  get(id, params) {
    if (id !== 'refresh') {
      return Promise.reject(new errors.NotFound());
    }

    const options = this.options;
    const data = params;
    // Our before hook determined that we had a valid token or that this
    // was internally called so let's generate a new token with the user
    // id and return both the ID and the token.
    return new Promise(function(resolve){
      jwt.sign(data, options.secret, options, token => {
        return resolve( Object.assign(data, { token }) );
      });
    });
  }

  // POST /auth/token
  create(user) {
    const options = this.options;

    const data = {
      [options.idField]: user[options.idField]
    };

    // Add any additional payload fields
    options.payload.forEach(field => data[field] = user[field]);

    // Our before hook determined that we had a valid token or that this
    // was internally called so let's generate a new token with the user
    // id and return both the ID and the token.
    return new Promise(function(resolve){
      jwt.sign(data, options.secret, options, token => {
        return resolve( Object.assign(data, { token }) );
      });
    });
  }

  setup() {
    // prevent regular service events from being dispatched
    if (typeof this.filter === 'function') {
      this.filter(() => false);
    }
  }
}

export default function(options){
  options = Object.assign({}, defaults, options);

  debug('configuring token authentication service with options', options);

  return function() {
    const app = this;

    // Initialize our service with any options it requires
    app.use(options.tokenEndpoint, new Service(options));

    // Get our initialize service to that we can bind hooks
    const tokenService = app.service(options.tokenEndpoint);

    // Set up our before hooks
    tokenService.before({
      create: [_verifyToken(options)],
      find: [_verifyToken(options)],
      get: [_verifyToken(options)]
    });

    tokenService.after({
      create: [
        hooks.populateUser(options),
        commonHooks.remove(options.passwordField, () => true)
      ],
      find: [
        hooks.populateUser(options),
        commonHooks.remove(options.passwordField, () => true)
      ],
      get: [
        hooks.populateUser(options),
        commonHooks.remove(options.passwordField, () => true)
      ]
    });
  };
}
