const { NotAuthenticated } = require('@feathersjs/errors');

module.exports = class AuthenticationClient {
  constructor (app, options) {
    const socket = app.io || app.primus;

    this.app = app;
    this.options = options;

    if (socket) {
      this.handleSocket();
    }
  }

  get service () {
    return this.app.service(this.options.path);
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
    const { storage, storageKey } = this.options;

    return Promise.resolve(storage.setItem(storageKey, accessToken));
  }

  getJwt () {
    const { storage, storageKey } = this.options;

    return Promise.resolve(storage.getItem(storageKey));
  }

  removeJwt () {
    const { storage, storageKey } = this.options;

    return Promise.resolve(storage.removeItem(storageKey));
  }

  reset () {
    // Reset the internal authentication state
    // but not the accessToken from storage
    const authResult = this.app.get('authentication');

    this.app.set('authentication', null);

    return authResult;
  }

  reAuthenticate (force = false) {
    // Either returns the authentication state or
    // tries to re-authenticate with the stored JWT and strategy
    const authPromise = this.app.get('authentication');

    if (!authPromise || force === true) {
      return authPromise.then(() => this.getJwt()).then(accessToken => {
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
      return this.reAuthenticate();
    }

    const promise = this.service.create(authentication);

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
