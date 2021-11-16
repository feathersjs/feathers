import { AuthenticationClient, AuthenticationClientOptions } from './core.ts';
import * as hooks from './hooks/index.ts';
import { Application } from '../../feathers/src/index.ts';
import { Storage, MemoryStorage, StorageWrapper } from './storage.ts';

declare module '@feathersjs/feathers/lib/declarations' {
  interface Application<Services, Settings> { // eslint-disable-line
    io?: any;
    rest?: any;
    authentication: AuthenticationClient;
    authenticate: AuthenticationClient['authenticate'];
    reAuthenticate: AuthenticationClient['reAuthenticate'];
    logout: AuthenticationClient['logout'];
  }
}

export const getDefaultStorage = () => {
  try {
    return new StorageWrapper(window.localStorage);
  } catch (error: any) {}

  return new MemoryStorage();
};

export { AuthenticationClient, AuthenticationClientOptions, Storage, MemoryStorage, hooks };

export type ClientConstructor = new (app: Application, options: AuthenticationClientOptions) => AuthenticationClient;

export const defaultStorage: Storage = getDefaultStorage();

export const defaults: AuthenticationClientOptions = {
  header: 'Authorization',
  scheme: 'Bearer',
  storageKey: 'feathers-jwt',
  locationKey: 'access_token',
  locationErrorKey: 'error',
  jwtStrategy: 'jwt',
  path: '/authentication',
  Authentication: AuthenticationClient,
  storage: defaultStorage
};

const init = (_options: Partial<AuthenticationClientOptions> = {}) => {
  const options: AuthenticationClientOptions = Object.assign({}, defaults, _options);
  const { Authentication } = options;

  return (app: Application) => {
    const authentication = new Authentication(app, options);

    app.authentication = authentication;
    app.authenticate = authentication.authenticate.bind(authentication);
    app.reAuthenticate = authentication.reAuthenticate.bind(authentication);
    app.logout = authentication.logout.bind(authentication);

    app.hooks([
      hooks.authentication(),
      hooks.populateHeader()
    ]);
  };
};

export default init;

if (typeof module !== 'undefined') {
  module.exports = Object.assign(init, module.exports);
}
