import { AuthenticationStrategy, AuthenticationBase } from './core';
import { Application, Service } from '@feathersjs/feathers';

export class AuthenticationBaseStrategy implements AuthenticationStrategy {
  authentication?: AuthenticationBase;
  app?: Application;
  name?: string;

  setAuthentication (auth: AuthenticationBase) {
    this.authentication = auth;
  }

  setApplication (app: Application) {
    this.app = app;
  }

  setName (name: string) {
    this.name = name;
  }

  get configuration () {
    return this.authentication.configuration[this.name];
  }

  get entityService (): Service<any> {
    const { service } = this.configuration;

    if (!service) {
      return null;
    }

    return this.app.service(service) || null;
  }
}
