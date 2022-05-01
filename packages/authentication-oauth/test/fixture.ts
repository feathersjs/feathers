import { feathers } from '@feathersjs/feathers';
import express, { rest, errorHandler } from '@feathersjs/express';
import { memory } from '@feathersjs/memory';
import { AuthenticationService, JWTStrategy, AuthenticationRequest, AuthenticationParams } from '@feathersjs/authentication';
import { express as oauth, OAuthStrategy } from '../src';

export class TestOAuthStrategy extends OAuthStrategy {
  async authenticate (data: AuthenticationRequest, params: AuthenticationParams) {
    const { fromMiddleware } = params;
    const authResult = await super.authenticate(data, params);

    if (fromMiddleware) {
      authResult.fromMiddleware = fromMiddleware;
    }

    return authResult;
  }
}

export const app = express(feathers());

const port = 9876;
const auth = new AuthenticationService(app);

auth.register('jwt', new JWTStrategy());
auth.register('test', new TestOAuthStrategy());

app.configure(rest());
app.set('host', '127.0.0.1');
app.set('port', port);
app.set('authentication', {
  secret: 'supersecret',
  entity: 'user',
  service: 'users',
  authStrategies: [ 'jwt' ],
  oauth: {
    defaults: {
      transport: 'querystring'
    },
    test: {
      key: 'some-key',
      secret: 'a secret secret'
    },
    twitter: {
      key: 'twitter key',
      secret: 'some secret'
    }
  }
});

app.use((req, _res, next) => {
  req.feathers = { fromMiddleware: 'testing' };
  next();
});
app.use('/authentication', auth);
app.use('/users', memory());

app.configure(oauth());
app.use(errorHandler({ logger: null }));
