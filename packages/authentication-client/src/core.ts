import { NotAuthenticated } from '@feathersjs/errors';
import { Application } from '@feathersjs/feathers';
import { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication';

export class Storage {
  store: { [key: string]: any };

  constructor() {
    this.store = {};
  }

  getItem(key: string) {
    return this.store[key];
  }

  setItem(key: string, value: any) {
    return (this.store[key] = value);
  }

  removeItem(key: string) {
    delete this.store[key];
    return this;
  }
}

export type ClientConstructor = new (app: Application, options: AuthenticationClientOptions) => AuthenticationClient;

export interface AuthenticationClientOptions {
  storage?: Storage;
  header?: string;
  scheme?: string;
  storageKey?: string;
  jwtStrategy?: string;
  path?: string;
  Authentication?: ClientConstructor;
}

export class AuthenticationClient {
  app: Application;
  authenticated: boolean;
  options: AuthenticationClientOptions;

  constructor(app: Application, options: AuthenticationClientOptions) {
    const socket = app.io || app.primus;

    this.app = app;
    this.app.set('storage', this.app.get('storage') || options.storage);
    this.options = options;
    this.authenticated = false;

    if (socket) {
      this.handleSocket(socket);
    }
  }

  get service () {
    return this.app.service(this.options.path);
  }

  get storage () {
    return this.app.get('storage');
  }

  handleSocket (socket: any) {
    // Connection events happen on every reconnect
    const connected = this.app.io ? 'connect' : 'open';

    socket.on(connected, () => {
      // Only reconnect when `reAuthenticate()` or `authenticate()`
      // has been called explicitly first
      if (this.authenticated) {
        // Force reauthentication with the server
        this.reauthenticate(true);
      }
    });
  }

  setJwt(accessToken: string) {
    return Promise.resolve(this.storage.setItem(this.options.storageKey, accessToken));
  }

  getJwt() {
    return Promise.resolve(this.storage.getItem(this.options.storageKey));
  }

  removeJwt () {
    return Promise.resolve(this.storage.removeItem(this.options.storageKey));
  }

  reset () {
    this.app.set('authentication', null);
    this.authenticated = false;

    return Promise.resolve(null);
  }

  reauthenticate (force: boolean = false): Promise<AuthenticationResult> {
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
      }).catch(error => this.removeJwt().then(() => Promise.reject(error)));
    }

    return authPromise;
  }

  authenticate (authentication: AuthenticationRequest): Promise<AuthenticationResult> {
    if (!authentication) {
      return this.reauthenticate();
    }

    const promise = this.service.create(authentication)
      .then((authResult: AuthenticationResult) => {
        const { accessToken } = authResult;

        this.authenticated = true;
        this.app.emit('login', authResult);
        this.app.emit('authenticated', authResult);

        return this.setJwt(accessToken).then(() => authResult);
      }).catch((error: any) => this.reset().then(() => Promise.reject(error)));

    this.app.set('authentication', promise);

    return promise;
  }

  logout () {
    return this.app.get('authentication')
      .then(() => this.service.remove(null))
      .then((authResult: AuthenticationResult) => this.removeJwt()
        .then(() => this.reset())
        .then(() => {
          this.app.emit('logout', authResult);

          return authResult;
        })
      );
  }
}
