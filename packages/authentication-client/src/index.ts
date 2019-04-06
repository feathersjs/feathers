import { AuthenticationClient, Storage, AuthenticationClientOptions } from './core';
import * as hooks from './hooks';
import { Application } from '@feathersjs/feathers';
import { AuthenticationResult, AuthenticationRequest } from '@feathersjs/authentication';

declare module '@feathersjs/feathers' {
  interface Application<ServiceTypes = any> {
    io?: any;
    rest?: any;
    primus?: any;
    authentication: AuthenticationClient;
    authenticate (authentication?: AuthenticationRequest): Promise<AuthenticationResult>;
    reauthenticate (force: boolean): Promise<AuthenticationResult>;
    logout (): Promise<AuthenticationResult>;
  }
}

export type ClientConstructor = new (app: Application, options: AuthenticationClientOptions) => AuthenticationClient;

export const defaults: AuthenticationClientOptions = {
  header: 'Authorization',
  scheme: 'Bearer',
  storageKey: 'feathers-jwt',
  jwtStrategy: 'jwt',
  path: '/authentication',
  Authentication: AuthenticationClient
};

const init = (_options: AuthenticationClientOptions = {}) => {
  const options: AuthenticationClientOptions = Object.assign({}, {
    storage: new Storage()
  }, defaults, _options);
  const { Authentication } = options;

  return (app: Application) => {
    const authentication = new Authentication(app, options);

    app.authentication = authentication;
    app.authenticate = authentication.authenticate.bind(authentication);
    app.reauthenticate = authentication.reauthenticate.bind(authentication);
    app.logout = authentication.logout.bind(authentication);

    app.hooks({
      before: {
        all: [
          hooks.authentication(),
          hooks.populateHeader()
        ]
      }
    });
  };
};

export { AuthenticationClient, AuthenticationClientOptions, Storage, hooks };
export default init;

if (typeof module !== 'undefined') {
  module.exports = Object.assign(init, module.exports);
}
