import { memory } from '@feathersjs/memory';
import { feathers, Params, HookContext } from '@feathersjs/feathers';
import { authenticate, AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { LocalStrategy, hooks } from '@feathersjs/authentication-local';

import { koa, rest, bodyParser, errorHandler } from '../src';

const { protect, hashPassword } = hooks;
const app = koa(feathers());
const authService = new AuthenticationService(app);

app.use(errorHandler());
app.use(bodyParser());
app.configure(rest());
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

authService.register('jwt', new JWTStrategy());
authService.register('local', new LocalStrategy());

app.use('/authentication', authService);
app.use('/users', memory({
  paginate: {
    default: 10,
    max: 20
  }
}));

app.service('users').hooks({
  before: {
    create: [
      hashPassword('password')
    ]
  },
  after: {
    all: [protect('password')],
    get: [(context: HookContext) => {
      if (context.params.provider) {
        context.result.fromGet = true;
      }

      return context;
    }]
  }
});

app.use('/dummy', {
  async get (id: string, params: Params) {
    return { id, params };
  }
});

app.service('dummy').hooks({
  before: [authenticate('jwt')]
});

export default app;
