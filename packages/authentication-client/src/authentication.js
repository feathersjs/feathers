import errors from 'feathers-errors';
import {
   connected,
   authenticateSocket,
   logoutSocket,
   retrieveJWT,
   getStorage,
   clearCookie,
   verifyJWT
 } from './utils';

export default class Authentication {
  constructor (app, options) {
    this.options = options;
    this.app = app;

    if (!app.get('storage')) {
      const storage = getStorage(options.storage);
      app.set('storage', storage);
    }

    this.getJWT().then(token => {
      if (token) {
        app.set('token', token);
        app.get('storage').setItem(options.tokenKey, token);
      }
    });
  }

  authenticate (options = {}) {
    const app = this.app;
    const globalOptions = this.options;
    let getOptions = Promise.resolve(options);

    // If no type was given let's try to authenticate with a stored JWT
    if (!options.type) {
      if (options.token) {
        options.type = 'token';
      } else {
        getOptions = this.getJWT().then(token => {
          if (!token) {
            return Promise.reject(new errors.NotAuthenticated(`Could not find stored JWT and no authentication type was given`));
          }
          return { type: 'token', token };
        });
      }
    }

    const handleResponse = function (response) {
      if (response.token) {
        app.set('token', response.token);
        app.get('storage').setItem(globalOptions.tokenKey, response.token);
      }
      return Promise.resolve(response);
    };

    return getOptions.then(options => {
      let endpoint;

      if (options.type === 'local') {
        endpoint = globalOptions.localEndpoint;
      } else if (options.type === 'token') {
        endpoint = globalOptions.tokenEndpoint;
      } else {
        throw new Error(`Unsupported authentication 'type': ${options.type}`);
      }

      return connected(app).then(socket => {
        // TODO (EK): Handle OAuth logins
        // If we are using a REST client
        if (app.rest) {
          return app.service(endpoint).create(options).then(handleResponse);
        }

        const method = app.io ? 'emit' : 'send';

        return authenticateSocket(options, socket, method).then(handleResponse);
      });
    });
  }

  getJWT () {
    const app = this.app;
    return new Promise((resolve) => {
      const token = app.get('token');
      if (token) {
        return resolve(token);
      }
      retrieveJWT(this.options.tokenKey, this.options.cookie, app.get('storage')).then(resolve);
    });
  }

  verifyJWT (data) {
    return verifyJWT(data);
  }

  logout () {
    const app = this.app;

    app.set('token', null);
    clearCookie(this.options.cookie);

    // remove the token from localStorage
    return Promise.resolve(app.get('storage').removeItem(this.options.tokenKey)).then(() => {
      // If using sockets de-authenticate the socket
      if (app.io || app.primus) {
        const method = app.io ? 'emit' : 'send';
        const socket = app.io ? app.io : app.primus;

        return logoutSocket(socket, method);
      }
    });
  }
}
