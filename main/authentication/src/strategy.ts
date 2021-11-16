import { AuthenticationStrategy, AuthenticationBase } from './core.ts';
import { Application, Service } from '../../feathers/src/index.ts';

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

  get entityService (): Service | null {
    const { service } = this.configuration;

    if (!service) {
      return null;
    }

    return this.app.service(service) || null;
  }
}
