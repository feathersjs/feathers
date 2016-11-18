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

export default class Passport {
  constructor (app, options) {
    this.options = options;
    this.app = app;

    if (!app.get('storage')) {
      const storage = getStorage(options.storage);
      app.set('storage', storage);
    }

    this.getJWT().then(accessToken => {
      if (accessToken) {
        app.set('accessToken', accessToken);
        app.get('storage').setItem(options.storageKey, accessToken);
      }
    });
  }

  authenticate (data = {}) {
    const app = this.app;
    let getData = Promise.resolve(data);

    // If no strategy was given let's try to authenticate with a stored JWT
    if (!data.strategy) {
      if (data.accessToken) {
        data.strategy = 'jwt';
      } else {
        getData = this.getJWT().then(accessToken => {
          if (!accessToken) {
            return Promise.reject(new errors.NotAuthenticated(`Could not find stored JWT and no authentication strategy was given`));
          }
          return { strategy: 'jwt', accessToken };
        });
      }
    }

    const handleResponse = (response) => {
      if (response.accessToken) {
        app.set('accessToken', response.accessToken);
        app.get('storage').setItem(this.options.storageKey, response.accessToken);
      }
      return Promise.resolve(response);
    };

    return getData.then(data => {
      return connected(app).then(socket => {
        if (app.rest) {
          return app.service(this.options.path).create(data).then(handleResponse);
        }

        const method = app.io ? 'emit' : 'send';

        return authenticateSocket(data, socket, method).then(handleResponse);
      });
    });
  }

  getJWT () {
    const app = this.app;
    return new Promise((resolve) => {
      const accessToken = app.get('accessToken');
      if (accessToken) {
        return resolve(accessToken);
      }
      retrieveJWT(this.options.storageKey, this.options.cookie, app.get('storage')).then(resolve);
    });
  }

  verifyJWT (data) {
    return verifyJWT(data);
  }

  logout () {
    const app = this.app;

    app.set('accessToken', null);
    clearCookie(this.options.cookie);

    // remove the accessToken from localStorage
    return Promise.resolve(app.get('storage').removeItem(this.options.storageKey)).then(() => {
      // If using sockets de-authenticate the socket
      if (app.io || app.primus) {
        const method = app.io ? 'emit' : 'send';
        const socket = app.io ? app.io : app.primus;

        return logoutSocket(socket, method);
      }
    });
  }
}
