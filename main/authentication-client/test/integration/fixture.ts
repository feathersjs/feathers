import { authenticate } from '@feathersjs/authentication';
import { HookContext, Application } from '@feathersjs/feathers';
import { memory } from '@feathersjs/memory';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy, hooks } from '@feathersjs/authentication-local';

const { hashPassword, protect } = hooks;

export default (app: Application) => {
  const authentication = new AuthenticationService(app);

  app.set('authentication', {
    entity: 'user',
    service: 'users',
    secret: 'supersecret',
    authStrategies: [ 'local', 'jwt' ],
    local: {
      usernameField: 'email',
      passwordField: 'password'
    }
  });

  authentication.register('jwt', new JWTStrategy());
  authentication.register('local', new LocalStrategy());

  app.use('/authentication', authentication);
  app.use('/users', memory({
    paginate: {
      default: 10,
      max: 20
    }
  }));

  app.service('users').hooks({
    before: {
      create: hashPassword('password')
    },
    after: protect('password')
  });

  app.use('/dummy', {
    find (params) {
      return Promise.resolve(params);
    }
  });

  app.service('dummy').hooks({
    before: authenticate('jwt')
  });

  app.service('users').hooks({
    before (context: HookContext) {
      if (context.id !== undefined && context.id !== null) {
        context.id = parseInt(context.id as string, 10);
      }

      return context;
    }
  });

  return app;
};
