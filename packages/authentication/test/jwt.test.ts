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
    users: Service<any>,
    protected: Service<any>
  }>;
  let user: any;
  let accessToken: string;
  let payload: any;

  beforeEach(async () => {
    app = feathers();

    const authService = new AuthenticationService(app, 'authentication', {
      entity: 'user',
      service: 'users',
      secret: 'supersecret',
      authStrategies: [ 'jwt' ]
    });

    authService.register('jwt', new JWTStrategy());

    app.use('/users', memory());
    app.use('/protected', {
      async get (id, params) {
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

    app.service('users').hooks({
      after: {
        get: [context => {
          if (context.params.provider) {
            context.result.isExternal = true;
          }

          return context;
        }]
      }
    });

    user = await app.service('users').create({
      name: 'David'
    });

    accessToken = await service.createAccessToken({}, {
      subject: `${user.id}`
    });

    payload = await service.verifyAccessToken(accessToken);
    app.setup();
  });

  it('getEntity', async () => {
    const [ strategy ] = app.service('authentication').getStrategies('jwt') as JWTStrategy[];

    let entity = await strategy.getEntity(user.id, {});

    assert.deepStrictEqual(entity, user);

    entity = await strategy.getEntity(user.id, {
      provider: 'rest'
    });

    assert.deepStrictEqual(entity, {
      ...user,
      isExternal: true
    });
  });

  describe('handleConnection', () => {
    it('adds authentication information on create', async () => {
      const connection: any = {};

      await app.service('authentication').create({
        strategy: 'jwt',
        accessToken
      }, { connection });

      assert.deepStrictEqual(connection.user, user);
      assert.deepStrictEqual(connection.authentication, {
        strategy: 'jwt',
        accessToken
      });
    });

    it('sends disconnect event when connection token expires and removes authentication', async () => {
      const connection: any = {};
      const token: string = await app.service('authentication').createAccessToken({}, {
        subject: `${user.id}`,
        expiresIn: '1s'
      });

      const result = await app.service('authentication').create({
        strategy: 'jwt',
        accessToken: token
      }, { connection });

      assert.ok(connection.authentication);

      assert.strictEqual(result.accessToken, token);

      const disconnection = await new Promise(resolve => app.once('disconnect', resolve));

      assert.strictEqual(disconnection, connection);

      assert.ok(!connection.authentication);
    });

    it('deletes authentication information on remove', async () => {
      const connection: any = {};

      await app.service('authentication').create({
        strategy: 'jwt',
        accessToken
      }, { connection });

      assert.ok(connection.authentication);

      await app.service('authentication').remove(null, {
        authentication: connection.authentication,
        connection
      });

      assert.ok(!connection.authentication);
    });

    it('does not remove if accessToken does not match', async () => {
      const connection: any = {};

      await app.service('authentication').create({
        strategy: 'jwt',
        accessToken
      }, { connection });

      assert.ok(connection.authentication);

      await app.service('authentication').remove(null, {
        authentication: {
          strategy: 'jwt',
          accessToken: await app.service('authentication').createAccessToken({}, {
            subject: `${user.id}`
          })
        },
        connection
      });

      assert.ok(connection.authentication);
    });
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
        assert.strictEqual(error.message, 'Invalid authentication information (no `strategy` set)');
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
        assert.strictEqual(error.message, `Could not find entity service`);
      }
    });

    it('fails when accessToken is not set', async () => {
      try {
        await app.service('protected').get('test', {
          provider: 'rest',
          authentication: {
            strategy: 'jwt'
          }
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'No access token');
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

      assert.strictEqual(Object.keys(result.params).length, 4);
      assert.ok(!result.params.accessToken, 'Did not merge accessToken');
      assert.deepStrictEqual(result, {
        id: 'test',
        params: merge({}, params, {
          user,
          authentication: { payload },
          authenticated: true
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

      assert.strictEqual(Object.keys(result.params).length, 3);
      assert.ok(!result.params.accessToken, 'Did not merge accessToken');
      assert.deepStrictEqual(result, {
        id: 'test',
        params: merge({}, params, {
          authentication: { payload },
          authenticated: true
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

    it('errors when `header` option is an object`', () => {
      app.get('authentication').otherJwt = {
        header: { message: 'This is wrong' }
      };

      assert.throws(() => app.service('authentication').register('otherJwt', new JWTStrategy()), {
        message: `The 'header' option for the otherJwt strategy must be a string`
      });
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
