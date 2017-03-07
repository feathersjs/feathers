import errors from 'feathers-errors';
import decode from 'jwt-decode';
import Debug from 'debug';
import { Storage, payloadIsValid, getCookie, clearCookie } from './utils';

const debug = Debug('feathers-authentication-client');

export default class Passport {
  constructor (app, options) {
    if (app.passport) {
      throw new Error('You have already registered authentication on this client app instance. You only need to do it once.');
    }

    Object.assign(this, {
      options,
      app,
      payloadIsValid,
      getCookie,
      clearCookie,
      storage: app.get('storage') || this.getStorage(options.storage)
    });

    this.setJWT = this.setJWT.bind(this);

    app.set('storage', this.storage);
    this.getJWT().then(this.setJWT);

    this.setupSocketListeners();
  }

  setupSocketListeners () {
    const app = this.app;
    const socket = app.io || app.primus;
    const emit = app.io ? 'emit' : 'send';
    const reconnected = app.io ? 'reconnect' : 'reconnected';

    if (!socket) {
      return;
    }

    socket.on(reconnected, () => {
      debug('Socket reconnected');

      // If socket was already authenticated then re-authenticate
      // it with the server automatically.
      if (socket.authenticated) {
        const data = {
          strategy: this.options.jwtStrategy,
          accessToken: app.get('accessToken')
        };
        this.authenticateSocket(data, socket, emit)
          .then(this.setJWT)
          .catch(error => {
            debug('Error re-authenticating after socket reconnect', error);
            socket.authenticated = false;
            app.emit('reauthentication-error', error);
          });
      }
    });

    const socketUpgradeHandler = () => {
      socket.io.engine.on('upgrade', () => {
        debug('Socket upgrading');

        // If socket was already authenticated then re-authenticate
        // it with the server automatically.
        if (socket.authenticated) {
          const data = {
            strategy: this.options.jwtStrategy,
            accessToken: app.get('accessToken')
          };

          this.authenticateSocket(data, socket, emit)
            .then(this.setJWT)
            .catch(error => {
              debug('Error re-authenticating after socket upgrade', error);
              socket.authenticated = false;
              app.emit('reauthentication-error', error);
            });
        }
      });
    };

    if (socket.io && socket.io.engine) {
      socketUpgradeHandler();
    } else {
      socket.on('connect', socketUpgradeHandler);
    }
  }

  connected () {
    const app = this.app;

    if (app.rest) {
      return Promise.resolve();
    }

    const socket = app.io || app.primus;

    if (!socket) {
      return Promise.reject(new Error(`It looks like your client connection has not been configured.`));
    }

    if ((app.io && socket.connected) || (app.primus && socket.readyState === 3)) {
      debug('Socket already connected');
      return Promise.resolve(socket);
    }

    return new Promise((resolve, reject) => {
      const connected = app.primus ? 'open' : 'connect';
      const disconnect = app.io ? 'disconnect' : 'end';
      const timeout = setTimeout(() => {
        debug('Socket connection timed out');
        reject(new Error('Socket connection timed out'));
      }, this.options.timeout);

      debug('Waiting for socket connection');

      const handleDisconnect = () => {
        debug('Socket disconnected before it could connect');
        socket.authenticated = false;
      };

      // If disconnect happens before `connect` the promise will be rejected.
      socket.once(disconnect, handleDisconnect);
      socket.once(connected, () => {
        debug('Socket connected');
        debug(`Removing ${disconnect} listener`);
        socket.removeListener(disconnect, handleDisconnect);
        clearTimeout(timeout);
        resolve(socket);
      });
    });
  }

  authenticate (credentials = {}) {
    const app = this.app;
    let getCredentials = Promise.resolve(credentials);

    // If no strategy was given let's try to authenticate with a stored JWT
    if (!credentials.strategy) {
      if (credentials.accessToken) {
        credentials.strategy = this.options.jwtStrategy;
      } else {
        getCredentials = this.getJWT().then(accessToken => {
          if (!accessToken) {
            return Promise.reject(new errors.NotAuthenticated(`Could not find stored JWT and no authentication strategy was given`));
          }
          return { strategy: this.options.jwtStrategy, accessToken };
        });
      }
    }

    return getCredentials.then(credentials => {
      return this.connected(app).then(socket => {
        if (app.rest) {
          return app.service(this.options.path).create(credentials).then(this.setJWT);
        }

        const emit = app.io ? 'emit' : 'send';
        return this.authenticateSocket(credentials, socket, emit).then(this.setJWT);
      });
    }).then(payload => {
      app.emit('authenticated', payload);
      return payload;
    });
  }

  // Returns a promise that authenticates a socket
  authenticateSocket (credentials, socket, emit) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        debug('authenticateSocket timed out');
        reject(new Error('Authentication timed out'));
      }, this.options.timeout);

      debug('Attempting to authenticate socket');
      socket[emit]('authenticate', credentials, (error, data) => {
        if (error) {
          return reject(error);
        }

        clearTimeout(timeout);
        socket.authenticated = true;
        debug('Socket authenticated!');

        resolve(data);
      });
    });
  }

  logoutSocket (socket, emit) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        debug('logoutSocket timed out');
        reject(new Error('Logout timed out'));
      }, this.options.timeout);

      socket[emit]('logout', error => {
        clearTimeout(timeout);
        socket.authenticated = false;

        if (error) {
          return reject(error);
        }

        resolve();
      });
    });
  }

  logout () {
    const app = this.app;

    app.set('accessToken', null);
    this.clearCookie(this.options.cookie);

    // remove the accessToken from localStorage
    return Promise.resolve(app.get('storage').removeItem(this.options.storageKey)).then(() => {
      // If using sockets de-authenticate the socket
      if (app.io || app.primus) {
        const method = app.io ? 'emit' : 'send';
        const socket = app.io ? app.io : app.primus;

        return this.logoutSocket(socket, method);
      }
    }).then(result => {
      app.emit('logout', result);

      return result;
    });
  }

  setJWT (data) {
    const accessToken = (data && data.accessToken) ? data.accessToken : data;

    if (accessToken) {
      this.app.set('accessToken', accessToken);
      this.app.get('storage').setItem(this.options.storageKey, accessToken);
    }

    return Promise.resolve(data);
  }

  getJWT () {
    const app = this.app;
    return new Promise((resolve) => {
      const accessToken = app.get('accessToken');

      if (accessToken) {
        return resolve(accessToken);
      }

      return Promise.resolve(this.storage.getItem(this.options.storageKey))
        .then(jwt => {
          let token = jwt || this.getCookie(this.options.cookie);

          if (token && token !== 'null' && !this.payloadIsValid(decode(token))) {
            token = undefined;
          }

          return resolve(token);
        });
    });
  }

  // Pass a jwt token, get back a payload if it's valid.
  verifyJWT (token) {
    if (typeof token !== 'string') {
      return Promise.reject(new Error('Token provided to verifyJWT is missing or not a string'));
    }

    try {
      let payload = decode(token);

      if (this.payloadIsValid(payload)) {
        return Promise.resolve(payload);
      }

      return Promise.reject(new Error('Invalid token: expired'));
    } catch (error) {
      return Promise.reject(new Error('Cannot decode malformed token.'));
    }
  }

  // Returns a storage implementation
  getStorage (storage) {
    if (storage) {
      return storage;
    }

    return new Storage();
  }
}
