import { strict as assert } from 'assert';
import { app, TestOAuthStrategy } from './fixture';
import { AuthenticationService } from '@feathersjs/authentication/lib';

describe('@feathersjs/authentication-oauth/strategy', () => {
  const authService: AuthenticationService = app.service('authentication');
  const [ strategy ] = authService.getStrategies('test') as TestOAuthStrategy[];

  it('initializes, has .entityId and configuration', () => {
    assert.ok(strategy);
    assert.strictEqual(strategy.entityId, 'id');
    assert.ok(strategy.configuration.entity);
  });

  it('reads configuration from the oauth key', () => {
    const testConfigValue = Math.random();
    app.get('authentication').oauth.test.hello = testConfigValue;
    assert.strictEqual(strategy.configuration.hello, testConfigValue);
  });

  it('getRedirect', async () => {
    app.get('authentication').oauth.redirect = '/home';

    let redirect = await strategy.getRedirect({ accessToken: 'testing' });
    assert.equal(redirect, '/home#access_token=testing');

    redirect = await strategy.getRedirect({ accessToken: 'testing' }, {
      redirect: '/hi-there'
    });
    assert.strictEqual('/home/hi-there#access_token=testing', redirect);

    redirect = await strategy.getRedirect(new Error('something went wrong'));
    assert.equal(redirect, '/home#error=something%20went%20wrong');

    redirect = await strategy.getRedirect(new Error());
    assert.equal(redirect, '/home#error=OAuth%20Authentication%20not%20successful');

    app.get('authentication').oauth.redirect = '/home?';

    redirect = await strategy.getRedirect({ accessToken: 'testing' });
    assert.equal(redirect, '/home?access_token=testing');

    delete app.get('authentication').oauth.redirect;

    redirect = await strategy.getRedirect({ accessToken: 'testing' });
    assert.equal(redirect, null);

    app.get('authentication').oauth.redirect = '/#dashboard';

    redirect = await strategy.getRedirect({ accessToken: 'testing' });
    assert.equal(redirect, '/#dashboard?access_token=testing');
  });

  describe('authenticate', () => {
    it('with new user', async () => {
      const authResult = await strategy.authenticate({
        strategy: 'test',
        profile: {
          id: 'newEntity'
        }
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
        profile: {
          id: 'existingEntity'
        }
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
        profile: {
          id: 'linkedEntity'
        }
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
