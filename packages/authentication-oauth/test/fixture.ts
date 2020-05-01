import feathers, { Params } from '@feathersjs/feathers';
import express, { rest, errorHandler } from '@feathersjs/express';
import { AuthenticationService, JWTStrategy, AuthenticationRequest } from '@feathersjs/authentication';
import { express as oauth, OAuthStrategy } from '../src';

// @ts-ignore
import memory from 'feathers-memory';

export class TestOAuthStrategy extends OAuthStrategy {
  async getProfile (data: AuthenticationRequest, _params: Params) {
    if (!data.id) {
      throw new Error('Data needs an id');
    }

    return data;
  }

  async authenticate (data: AuthenticationRequest, params: Params) {
    const { fromMiddleware } = params;
    const authResult = await super.authenticate(data, params);

    if (fromMiddleware) {
      authResult.fromMiddleware = fromMiddleware;
    }

    return authResult;
  }
}

const port = 3000;
const app = express(feathers());
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
      transport: 'query'
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

export { app };
