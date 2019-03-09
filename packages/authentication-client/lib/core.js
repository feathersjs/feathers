const { NotAuthenticated } = require('@feathersjs/errors');

exports.Storage = class Storage {
  constructor () {
    this.store = {};
  }

  getItem (key) {
    return this.store[key];
  }

  setItem (key, value) {
    return (this.store[key] = value);
  }

  removeItem (key) {
    delete this.store[key];
    return this;
  }
};

exports.AuthenticationClient = class AuthenticationClient {
  constructor (app, options) {
    const socket = app.io || app.primus;

    this.app = app;
    this.app.set('storage', this.app.get('storage') || options.storage);
    this.options = options;

    if (socket) {
      this.handleSocket();
    }
  }

  get service () {
    return this.app.service(this.options.path);
  }

  get storage () {
    return this.app.get('storage');
  }

  handleSocket (socket) {
    // Connection events happen on every reconnect
    const connected = this.app.io ? 'connect' : 'open';
  
    socket.on(connected, () => {
      // Only reconnect when `reAuthenticate()` or `authenticate()`
      // has been called explicitly first
      if (this.app.get('authentication')) {
        // Force reauthentication with the server
        this.reAuthenticate(true);
      }
    });
  }

  setJwt (accessToken) {
    return Promise.resolve(this.storage.setItem(this.options.storageKey, accessToken));
  }

  getJwt () {
    return Promise.resolve(this.storage.getItem(this.options.storageKey));
  }

  removeJwt () {
    return Promise.resolve(this.storage.removeItem(this.options.storageKey));
  }

  reset () {
    // Reset the internal authentication state
    // but not the accessToken from storage
    const authResult = this.app.get('authentication');

    this.app.set('authentication', null);

    return authResult;
  }

  reauthenticate (force = false) {
    // Either returns the authentication state or
    // tries to re-authenticate with the stored JWT and strategy
    const authPromise = this.app.get('authentication');

    if (!authPromise || force === true) {
      return this.getJwt().then(accessToken => {
        if (!accessToken) {
          throw new NotAuthenticated('No accessToken found in storage');
        }

        return this.authenticate({
          strategy: this.options.jwtStrategy,
          accessToken
        });
      });
    }

    return authPromise;
  }

  authenticate (authentication) {
    if (!authentication) {
      return this.reauthenticate();
    }

    const promise = this.service.create(authentication)
      .then(authResult => {
        const { accessToken } = authResult;

        if (accessToken) {
          return this.setJwt(accessToken).then(() => authResult);
        }

        return authResult;
      });

    this.app.set('authentication', promise);

    return promise;
  }

  logout () {
    return this.app.get('authentication')
      .then(() => this.service.remove(null))
      .then(() => this.removeJwt())
      .then(() => this.reset());
  }
};
