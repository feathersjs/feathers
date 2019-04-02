import assert from 'assert';
import { LocalStrategy } from '../src';
// @ts-ignore
import getApp from './fixture';
import { Application } from '@feathersjs/feathers';

describe('@feathersjs/authentication-local/strategy', () => {
  const password = 'localsecret';
  const email = 'localtester@feathersjs.com';

  let app: Application;
  let user: any;

  beforeEach(() => {
    app = getApp();

    return app.service('users')
      .create({ email, password })
      .then((createdUser: any) => {
        user = createdUser;
      });
  });

  it('throw error when configuration is not set', () => {
    const auth = app.service('authentication');

    try {
      auth.register('something', new LocalStrategy());
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message,
        `'something' authentication strategy requires a 'usernameField' setting`
      );
    }
  });

  it('fails when entity not found', () => {
    const authService = app.service('authentication');
    return authService.create({
      strategy: 'local',
      email: 'not in database',
      password
    }).then(() => {
      assert.fail('Should never get here');
    }).catch((error: Error) => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Invalid login');
    });
  });

  it('strategy fails when strategy is different', () => {
    const [ local ] = app.service('authentication').getStrategies('local');
    return local.authenticate({
      strategy: 'not-me',
      password: 'dummy',
      email
    }).then(() => {
      assert.fail('Should never get here');
    }).catch((error: Error) => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Invalid login');
    });
  });

  it('fails when password is wrong', () => {
    const authService = app.service('authentication');
    return authService.create({
      strategy: 'local',
      email,
      password: 'dummy'
    }).then(() => {
      assert.fail('Should never get here');
    }).catch((error: Error) => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Invalid login');
    });
  });

  it('fails when password field is not available', () => {
    const userEmail = 'someuser@localtest.com';
    const authService = app.service('authentication');

    return app.service('users').create({
      email: userEmail
    }).then(() => authService.create({
      strategy: 'local',
      password: 'dummy',
      email: userEmail
    })).then(() => {
      assert.fail('Should never get here');
    }).catch((error: Error) => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Invalid login');
    });
  });

  it('authenticates an existing user', () => {
    const authService = app.service('authentication');
    return authService.create({
      strategy: 'local',
      email,
      password
    }).then((authResult: any) => {
      const { accessToken } = authResult;

      assert.ok(accessToken);
      assert.strictEqual(authResult.user.email, email);

      return authService.verifyJWT(accessToken);
    }).then((decoded: any) => {
      assert.strictEqual(decoded.sub, `${user.id}`);
    });
  });

  it('returns safe result when params.provider is set, works without pagination', () => {
    const authService = app.service('authentication');
    return authService.create({
      strategy: 'local',
      email,
      password
    }, {
      provider: 'rest',
      paginate: false
    }).then((authResult: any) => {
      const { accessToken } = authResult;

      assert.ok(accessToken);
      assert.strictEqual(authResult.user.email, email);
      assert.strictEqual(authResult.user.passsword, undefined);

      return authService.verifyJWT(accessToken);
    }).then((decoded: any) => {
      assert.strictEqual(decoded.sub, `${user.id}`);
    });
  });
});
