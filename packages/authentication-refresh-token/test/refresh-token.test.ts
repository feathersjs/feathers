import assert from 'assert';
import jwt from 'jsonwebtoken';
import feathers, { Application, Service } from '@feathersjs/feathers';
// @ts-ignore
import memory from 'feathers-memory';

import { AuthenticationResult } from '../../authentication/src';
import { RefreshTokenAuthenticationService } from '../src';
import { Strategy1 } from './fixtures';

describe('authentication/refresh-token-service', () => {
  let refreshToken: string;
  let accessToken: string;
  let userId: string;

  let app: Application<{
    authentication: RefreshTokenAuthenticationService &
      Service<AuthenticationResult>;
    users: Service<any>;
    'refresh-tokens': Service<any>;
  }>;

  before(() => {
    app = feathers();
    app.use(
      '/authentication',
      new RefreshTokenAuthenticationService(app, 'authentication', {
        entity: 'user',
        entityId: 'id',
        service: 'users',
        secret: 'supersecret',
        authStrategies: ['first'],
        'refresh-token': {
          secret: 'super secret',
          service: 'refresh-tokens',
          entity: 'refreshToken',
          entityId: 'id',
          jwtOptions: {
            header: { typ: 'refresh' }, // default type: refresh
            audience: 'https://yourdomain.com', // The resource server where the token is processed
            issuer: 'feathers', // The issuing server, application or resource
            algorithm: 'HS256',
            expiresIn: '360d' //default expiration settings after 360 days
          }
        }
      })
    );
    app.use('/users', memory());
    app.use('/refresh-tokens', memory());

    app.service('authentication').register('first', new Strategy1());
  });

  describe('create refresh-token', () => {
    it('creates a valid accessToken and refreshToken and includes strategy result', async () => {
      const service = app.service('authentication');
      const result = await service.create({
        strategy: 'first',
        username: 'David'
      });

      const refreshTokenSettings =
        service.configuration['refresh-token'].jwtOptions;
      const refreshTokenDecoded = jwt.decode(result.refreshToken);

      if (typeof refreshTokenDecoded === 'string') {
        throw new Error('Unexpected decoded refresh-token JWT type');
      }

      refreshToken = result?.refreshToken;
      accessToken = result?.accessToken;
      userId = result?.user?.id;

      assert.ok(result.refreshToken);
      assert.strictEqual(
        refreshTokenDecoded.aud,
        refreshTokenSettings.audience
      );
      assert.strictEqual(refreshTokenDecoded.iss, refreshTokenSettings.issuer);
    });
  });

  describe('patch refresh-token', () => {
    it('failed to refresh access-token with invalid refresh-token', async () => {
      try {
        await app.service('authentication').patch(null, {
          id: userId,
          refreshToken: 'somevalue'
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, 'Error');
      }
    });

    it('can refresh access-token with valid refresh-token', async () => {
      const authResult = await app.service('authentication').patch(null, {
        id: userId,
        refreshToken
      });
      assert.notEqual(authResult.accessToken, accessToken);
    });
  });

  describe('remove refresh-token', () => {
    it('can remove with authentication strategy set', async () => {
      const authResult = await app.service('authentication').remove(null, {
        authentication: {
          strategy: 'first',
          username: 'David'
        },
        query: {
          refreshToken
        }
      });

      assert.deepStrictEqual(authResult, Strategy1.result);
    });
  });

  describe('renew access-token with invalid refresh-token', () => {
    it('fail when refresh access-token with deleted refresh-token', async () => {
      try {
        await app.service('authentication').patch(null, {
          id: userId,
          refreshToken
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, 'Error');
      }
    });
  });

  describe('setup', () => {
    it('errors when there is no refresh-token secret', () => {
      delete app.get('authentication')['refresh-token'].secret;

      try {
        app.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(
          error.message,
          `A 'secret' must be provided in your refresh-token authentication configuration`
        );
      }
    });

    it('throws an error if refresh-token service name is not set', () => {
      const otherApp = feathers();

      otherApp.use(
        '/authentication',
        new RefreshTokenAuthenticationService(otherApp, 'authentication', {
          entity: 'user',
          entityId: 'id',
          service: 'users',
          secret: 'supersecret',
          authStrategies: ['first'],
          'refresh-token': {
            secret: 'super secret',
            entity: 'refreshToken',
            entityId: 'id',
            jwtOptions: {
              header: { typ: 'refresh' }, // default type: refresh
              audience: 'https://yourdomain.com', // The resource server where the token is processed
              issuer: 'feathers', // The issuing server, application or resource
              algorithm: 'HS256',
              expiresIn: '360d' //default expiration settings after 360 days
            }
          }
        })
      );
      otherApp.use('/users', {
        async get() {
          return {};
        }
      });

      try {
        otherApp.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(
          error.message,
          `The 'service' option is not set in the refresh-token authentication configuration`
        );
      }
    });

    it('throws an error if refresh-token entity service does not exist', () => {
      const otherApp = feathers();

      otherApp.use(
        '/authentication',
        new RefreshTokenAuthenticationService(otherApp, 'authentication', {
          entity: 'user',
          entityId: 'id',
          service: 'users',
          secret: 'supersecret',
          authStrategies: ['first'],
          'refresh-token': {
            secret: 'super secret',
            service: 'refresh-tokens',
            entity: 'refreshToken',
            entityId: 'id',
            jwtOptions: {
              header: { typ: 'refresh' }, // default type: refresh
              audience: 'https://yourdomain.com', // The resource server where the token is processed
              issuer: 'feathers', // The issuing server, application or resource
              algorithm: 'HS256',
              expiresIn: '360d' //default expiration settings after 360 days
            }
          }
        })
      );
      otherApp.use('/users', {
        async get() {
          return {};
        }
      });

      try {
        otherApp.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(
          error.message,
          `The 'refresh-token' entity service does not exist`
        );
      }
    });

    it('throws an error if entity service exists but has no `id`', () => {
      const otherApp = feathers();

      otherApp.use(
        '/authentication',
        new RefreshTokenAuthenticationService(otherApp, 'authentication', {
          entity: 'user',
          entityId: 'id',
          service: 'users',
          secret: 'supersecret',
          authStrategies: ['first'],
          'refresh-token': {
            secret: 'super secret',
            service: 'refresh-tokens',
            entity: 'refreshToken',
            jwtOptions: {
              header: { typ: 'refresh' }, // default type: refresh
              audience: 'https://yourdomain.com', // The resource server where the token is processed
              issuer: 'feathers', // The issuing server, application or resource
              algorithm: 'HS256',
              expiresIn: '360d' //default expiration settings after 360 days
            }
          }
        })
      );

      otherApp.use('/users', {
        async get() {
          return {};
        }
      });
      otherApp.use('/refresh-tokens', {
        async get() {
          return {};
        }
      });

      try {
        otherApp.setup();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(
          error.message,
          `The 'refresh-tokens' service does not have an 'id' property and no 'entityId' option is set.`
        );
      }
    });
  });
});
