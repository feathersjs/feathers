import assert from 'assert';
import { merge } from 'lodash';
import feathers, { Application, Service } from '@feathersjs/feathers';
// @ts-ignore
import memory from 'feathers-memory';

import { AuthenticationService, JWTStrategy, hooks } from '../src';
import { AuthenticationResult } from '../src/core';
import { ServerResponse } from 'http';
import { MockRequest } from './fixtures';

const { authenticate } = hooks;

describe('authentication/jwt', () => {
  let app: Application<{
    authentication: AuthenticationService & Service<AuthenticationResult>,
    users: Service<any>
  }>;
  let user: any;
  let accessToken: string;
  let payload: any;

  beforeEach(async () => {
    app = feathers();

    const authService = new AuthenticationService(app, 'authentication', {
      secret: 'supersecret',
      strategies: [ 'jwt' ]
    });

    authService.register('jwt', new JWTStrategy());

    app.use('/users', memory());
    app.use('/protected', {
      async get(id, params) {
        return {
          id, params
        };
      }
    });
    app.use('/authentication', authService);

    const service = app.service('authentication');

    app.service('protected').hooks({
      before: {
        all: [ authenticate('jwt') ]
      }
    });

    user = await app.service('users').create({
      name: 'David'
    });

    accessToken = await service.createJWT({}, {
      subject: `${user.id}`
    });

    payload = await service.verifyJWT(accessToken);
  });

  describe('with authenticate hook', () => {
    it('fails for protected service and external call when not set', async () => {
      try {
        await app.service('protected').get('test', {
          provider: 'rest'
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Not authenticated');
      }
    });

    it('fails for protected service and external call when not strategy', async () => {
      try {
        await app.service('protected').get('test', {
          provider: 'rest',
          authentication: {
            username: 'Dave'
          }
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Not authenticated');
      }
    });

    it('fails when entity service was not found', async () => {
      delete app.services.users;

      try {
        await app.service('protected').get('test', {
          provider: 'rest',
          authentication: {
            strategy: 'jwt',
            accessToken
          }
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, `Could not find entity service 'users'`);
      }
    });

    it('passes when authentication is set and merges params', async () => {
      const params = {
        provider: 'rest',
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      };

      const result = await app.service('protected').get('test', params);

      assert.strictEqual(Object.keys(result.params).length, 3);
      assert.ok(!result.params.accessToken, 'Did not merge accessToken');
      assert.deepStrictEqual(result, {
        id: 'test',
        params: merge({}, params, {
          user,
          authentication: { payload }
        })
      });
    });

    it('works with entity set to null', async () => {
      const params = {
        provider: 'rest',
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      };

      app.get('authentication').entity = null;

      const result = await app.service('protected').get('test', params);

      assert.strictEqual(Object.keys(result.params).length, 2);
      assert.ok(!result.params.accessToken, 'Did not merge accessToken');
      assert.deepStrictEqual(result, {
        id: 'test',
        params: merge({}, params, {
          authentication: { payload }
        })
      });
    });
  });

  describe('on authentication service', () => {
    it('authenticates but does not return a new accessToken', async () => {
      const authResult = await app.service('authentication').create({
        strategy: 'jwt',
        accessToken
      });

      assert.strictEqual(authResult.accessToken, accessToken);
      assert.deepStrictEqual(authResult.user, user);
      assert.deepStrictEqual(authResult.authentication.payload, payload);
    });

    it('errors when trying to set invalid option', () => {
      app.get('authentication').otherJwt = {
        expiresIn: 'something'
      };

      try {
        app.service('authentication').register('otherJwt', new JWTStrategy());
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, `Invalid JwtStrategy option 'authentication.otherJwt.expiresIn'. Did you mean to set it in 'authentication.jwtOptions'?`);
      }
    });
  });

  describe('parse', () => {
    const res = {} as ServerResponse;

    it('returns null when header not set', async () => {
      const req = {} as MockRequest;

      const result = await app.service('authentication').parse(req, res, 'jwt');

      assert.strictEqual(result, null);
    });

    it('parses plain Authorization header', async () => {
      const req = {
        headers: {
          authorization: accessToken
        }
      } as MockRequest;

      const result = await app.service('authentication').parse(req, res, 'jwt');

      assert.deepStrictEqual(result, {
        strategy: 'jwt',
        accessToken
      });
    });

    it('parses Authorization header with Bearer scheme', async () => {
      const req = {
        headers: {
          authorization: ` Bearer ${accessToken} `
        }
      } as MockRequest;

      const result = await app.service('authentication').parse(req, res, 'jwt');

      assert.deepStrictEqual(result, {
        strategy: 'jwt',
        accessToken
      });
    });

    it('return null when scheme does not match', async () => {
      const req = {
        headers: {
          authorization: ` Basic something`
        }
      } as MockRequest;

      const result = await app.service('authentication').parse(req, res, 'jwt');

      assert.strictEqual(result, null);
    });
  });
});
