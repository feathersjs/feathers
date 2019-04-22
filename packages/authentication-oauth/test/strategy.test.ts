import { strict as assert } from 'assert';
import { app, TestOAuthStrategy } from './fixture';
import { AuthenticationService } from '@feathersjs/authentication/lib';

describe('@feathersjs/authentication-oauth/strategy', () => {
  const authService: AuthenticationService = app.service('authentication');
  const [strategy] = authService.getStrategies('test') as TestOAuthStrategy[];

  it('initializes, has .entityId and configuration', () => {
    assert.ok(strategy);
    assert.strictEqual(strategy.entityId, 'id');
    assert.ok(strategy.configuration.entity);
  });

  it('getProfile', async () => {
    const data = { id: 'getProfileTest' };
    const profile = await strategy.getProfile(data, {});

    assert.deepEqual(profile, data);
  });

  describe('authenticate', () => {
    it('errors when strategy is not set', async () => {
      try {
        await strategy.authenticate({
          id: 'newEntity'
        }, {});
        assert.fail('Should never get here');
      } catch (error) {
        assert.equal(error.name, 'NotAuthenticated');
        assert.equal(error.message, 'Not authenticated');
      }
    });

    it('with new user', async () => {
      const authResult = await strategy.authenticate({
        strategy: 'test',
        id: 'newEntity'
      }, {});

      assert.deepEqual(authResult, {
        authentication: { strategy: 'test' },
        user: { testId: 'newEntity', id: authResult.user.id }
      });
    });

    it('with existing user and already linked strategy', async () => {
      const existingUser = await app.service('users').create({
        testId: 'existingEntity',
        name: 'David'
      });
      const authResult = await strategy.authenticate({
        strategy: 'test',
        id: 'existingEntity'
      }, {});

      assert.deepEqual(authResult, {
        authentication: { strategy: 'test' },
        user: existingUser
      });
    });

    it('links user with existing authentication', async () => {
      const user = await app.service('users').create({
        name: 'David'
      });
      const jwt = await authService.createAccessToken({}, {
        subject: `${user.id}`
      });

      const authResult = await strategy.authenticate({
        strategy: 'test',
        id: 'linkedEntity'
      }, {
        authentication: {
          strategy: 'jwt',
          accessToken: jwt
        }
      });

      assert.deepEqual(authResult, {
        authentication: { strategy: 'test' },
        user: { id: user.id, name: user.name, testId: 'linkedEntity' }
      });
    });
  });
});
