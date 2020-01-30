import assert from 'assert';
import feathers, { Application, Params, Service } from '@feathersjs/feathers';

import { Strategy1, Strategy2 } from '../fixtures';
import { AuthenticationService, hooks } from '../../src';
import { AuthenticationResult } from '../../src/core';

const { authenticate } = hooks;

describe('authentication/hooks/authenticate', () => {
  let app: Application<{
    authentication: AuthenticationService & Service<AuthenticationResult>,
    'auth-v2': AuthenticationService,
    users: Service<any> & { id: string }
  }>;

  beforeEach(() => {
    app = feathers();
    app.use('/authentication', new AuthenticationService(app, 'authentication', {
      entity: 'user',
      service: 'users',
      secret: 'supersecret',
      authStrategies: [ 'first' ]
    }));
    app.use('/auth-v2', new AuthenticationService(app, 'auth-v2', {
      entity: 'user',
      service: 'users',
      secret: 'supersecret',
      authStrategies: [ 'test' ]
    }));
    app.use('/users', {
      async find () {
        return [];
      },

      async get (_id: string|number, params: Params) {
        return params;
      }
    });

    const service = app.service('authentication');

    service.register('first', new Strategy1());
    service.register('second', new Strategy2());

    app.service('auth-v2').register('test', new Strategy1());

    app.service('users').hooks({
      before: {
        get: authenticate('first', 'second')
      }
    });

    app.service('users').id = 'name';
    app.setup();
  });

  it('throws an error when no strategies are passed', () => {
    try {
      // @ts-ignore
      authenticate();
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'The authenticate hook needs at least one allowed strategy');
    }
  });

  it('throws an error when not a before hook', async () => {
    const users = app.service('users');

    users.hooks({
      after: {
        all: [ authenticate('first') ]
      }
    });

    try {
      await users.find();
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'The authenticate hook must be used as a before hook');
    }
  });

  it('throws an error if authentication service is gone', async () => {
    delete app.services.authentication;

    try {
      await app.service('users').get(1, {
        authentication: {
          some: 'thing'
        }
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, `Could not find a valid authentication service`);
    }
  });

  it('authenticates with first strategy, merges params', async () => {
    const params = {
      authentication: {
        strategy: 'first',
        username: 'David'
      }
    };

    const result = await app.service('users').get(1, params);

    assert.deepStrictEqual(result, Object.assign({}, params, Strategy1.result));
  });

  it('authenticates with first strategy, keeps references alive (#1629)', async () => {
    const connection = {};
    const params = {
      connection,
      authentication: {
        strategy: 'first',
        username: 'David'
      }
    };

    app.service('users').hooks({
      after: {
        get: context => {
          context.result.params = context.params;
        }
      }
    });

    const result = await app.service('users').get(1, params);

    assert.ok(result.params.connection === connection);
  });

  it('authenticates with different authentication service', async () => {
    const params = {
      authentication: {
        strategy: 'test',
        username: 'David'
      }
    };

    app.service('users').hooks({
      before: {
        find: [authenticate({
          service: 'auth-v2',
          strategies: [ 'test' ]
        })]
      }
    });

    const result = await app.service('users').find(params);

    assert.deepStrictEqual(result, []);
  });

  it('authenticates with second strategy', async () => {
    const params = {
      authentication: {
        strategy: 'second',
        v2: true,
        password: 'supersecret'
      }
    };

    const result = await app.service('users').get(1, params);

    assert.deepStrictEqual(result, Object.assign({
      authentication: params.authentication,
      params: { authenticated: true }
    }, Strategy2.result));
  });

  it('passes for internal calls without authentication', async () => {
    const result = await app.service('users').get(1);

    assert.deepStrictEqual(result, {});
  });

  it('fails for invalid params.authentication', async () => {
    try {
      await app.service('users').get(1, {
        authentication: {
          strategy: 'first',
          some: 'thing'
        }
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Invalid Dave');
    }
  });

  it('fails for external calls without authentication', async () => {
    try {
      await app.service('users').get(1, {
        provider: 'rest'
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Not authenticated');
    }
  });

  it('passes with authenticated: true but external call', async () => {
    const params = {
      provider: 'rest',
      authenticated: true
    };
    const result = await app.service('users').get(1, params);

    assert.deepStrictEqual(result, params);
  });

  it('errors when used on the authentication service', async () => {
    const auth = app.service('authentication');

    auth.hooks({
      before: {
        create: authenticate('first')
      }
    });

    try {
      await auth.create({
        strategy: 'first',
        username: 'David'
      });
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message,
        'The authenticate hook does not need to be used on the authentication service'
      );
    }
  });
});
