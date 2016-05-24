import errors from 'feathers-errors';
import * as hooks from './hooks';
import {
  connected,
  authenticateSocket,
  logoutSocket,
  getJWT,
  getStorage,
  clearCookie
} from './utils';

const defaults = {
  cookie: 'feathers-jwt',
  tokenKey: 'feathers-jwt',
  localEndpoint: '/auth/local',
  tokenEndpoint: '/auth/token'
};

export default function(opts = {}) {
  const config = Object.assign({}, defaults, opts);

  return function() {
    const app = this;

    if(!app.get('storage')) {
      app.set('storage', getStorage(config.storage));
    }

    app.authenticate = function(options = {}) {
      const storage = this.get('storage');
      let getOptions = Promise.resolve(options);

      // If no type was given let's try to authenticate with a stored JWT
      if (!options.type) {
        getOptions = getJWT(config.tokenKey, config.cookie, this.get('storage')).then(token => {
          if (!token) {
            return Promise.reject(new errors.NotAuthenticated(`Could not find stored JWT and no authentication type was given`));
          }

          return { type: 'token', token };
        });
      }

      const handleResponse = function (response) {
        app.set('token', response.token);
        app.set('user', response.data);

        return Promise.resolve(storage.setItem(config.tokenKey, response.token))
          .then(() => response);
      };

      return getOptions.then(options => {
        let endPoint;

        if (options.type === 'local') {
          endPoint = config.localEndpoint;
        } else if (options.type === 'token') {
          endPoint = config.tokenEndpoint;
        } else {
          throw new Error(`Unsupported authentication 'type': ${options.type}`);
        }

        return connected(app).then(socket => {
          // TODO (EK): Handle OAuth logins
          // If we are using a REST client
          if (app.rest) {
            return app.service(endPoint).create(options).then(handleResponse);
          }

          const method = app.io ? 'emit' : 'send';

          return authenticateSocket(options, socket, method).then(handleResponse);
        });
      });
    };

    // Set our logout method with the correct socket context
    app.logout = function() {
      app.set('user', null);
      app.set('token', null);

      clearCookie(config.cookie);

      // remove the token from localStorage
      return Promise.resolve(app.get('storage').removeItem(config.tokenKey)).then(() => {
        // If using sockets de-authenticate the socket
        if (app.io || app.primus) {
          const method = app.io ? 'emit' : 'send';
          const socket = app.io ? app.io : app.primus;

          return logoutSocket(socket, method);
        }
      });
    };

    // Set up hook that adds token and user to params so that
    // it they can be accessed by client side hooks and services
    app.mixins.push(function(service) {
      if (typeof service.before !== 'function' || typeof service.after !== 'function') {
        throw new Error(`It looks like feathers-hooks isn't configured. It is required before running feathers-authentication.`);
      }

      service.before(hooks.populateParams(config));
    });

    // Set up hook that adds authorization header for REST provider
    if (app.rest) {
      app.mixins.push(function(service) {
        service.before(hooks.populateHeader(config));
      });
    }
  };
}
