import { NotAuthenticated } from '@feathersjs/errors';
import { Application, Params } from '@feathersjs/feathers';

import { AuthenticationStrategy, AuthenticationRequest } from '../src/core';
import { AuthenticationService } from '../src/service';
import { IncomingMessage } from 'http';

export interface MockRequest extends IncomingMessage {
  isDave?: boolean;
  isV2?: boolean;
}

export class Strategy1 implements AuthenticationStrategy {
  static result = {
    user: {
      id: 123,
      name: 'Dave'
    }
  };

  name?: string;
  app?: Application;
  authentication?: AuthenticationService;

  setName(name: string) {
    this.name = name;
  }

  setApplication(app: Application) {
    this.app = app;
  }

  setAuthentication(authentication: AuthenticationService) {
    this.authentication = authentication;
  }

  async authenticate(authentication: AuthenticationRequest) {
    if (authentication.username === 'David' || authentication.both) {
      return Strategy1.result;
    }

    throw new NotAuthenticated('Invalid Dave');
  }

  async parse(req: MockRequest) {
    if (req.isDave) {
      return Strategy1.result;
    }

    return null;
  }
}

export class Strategy2 implements AuthenticationStrategy {
  static result = {
    user: {
      name: 'V2',
      version: 2
    }
  };

  authenticate(authentication: AuthenticationRequest, params: Params) {
    const isV2 = authentication.v2 === true && authentication.password === 'supersecret';

    if (isV2 || authentication.both) {
      return Promise.resolve(Object.assign({ params, authentication }, Strategy2.result));
    }

    return Promise.reject(new NotAuthenticated('Invalid v2 user'));
  }

  async parse(req: MockRequest) {
    if (req.isV2) {
      return Strategy2.result;
    }

    return null;
  }
}
