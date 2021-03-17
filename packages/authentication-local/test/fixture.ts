import { feathers } from '@feathersjs/feathers';
import { memory, Service as MemoryService } from '@feathersjs/adapter-memory';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';

import { LocalStrategy, hooks } from '../src';
const { hashPassword, protect } = hooks;

export type ServiceTypes = {
  authentication: AuthenticationService;
  users: MemoryService;
}

export function createApplication (app = feathers<ServiceTypes>()) {
  const authentication = new AuthenticationService(app);

  app.set('authentication', {
    entity: 'user',
    service: 'users',
    secret: 'supersecret',
    authStrategies: [ 'local', 'jwt' ],
    parseStrategies: [ 'jwt' ],
    local: {
      usernameField: 'email',
      passwordField: 'password'
    }
  });

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('authentication', authentication);
  app.use('users', memory({
    multi: [ 'create' ],
    paginate: {
      default: 10,
      max: 20
    }
  }));

  app.service('users').hooks({
    before: {
      create: [ hashPassword('password') ]
    },
    after: {
      all: [ protect('password') ],
      get: [context => {
        if (context.params.provider) {
          context.result.fromGet = true;
        }

        return context;
      }]
    }
  });

  return app;
}
