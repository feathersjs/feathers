const assert = require('assert');
const feathers = require('@feathersjs/feathers');

const authentication = require('../../lib');
const { Strategy1, Strategy2 } = require('../fixtures');
const { AuthenticationService, authenticate } = authentication;

describe('authentication/hooks/authenticate', () => {
  let app;

  beforeEach(() => {
    app = feathers();
    app.use('/authentication', new AuthenticationService(app, 'authentication', {
      secret: 'supersecret'
    }));
    app.use('/auth-v2', new AuthenticationService(app, 'auth-v2', {
      secret: 'supersecret'
    }));
    app.use('/users', {
      id: 'name',
      find () {
        return Promise.resolve([]);
      },
      get (id, params) {
        return Promise.resolve(params);
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

    app.setup();
  });

  it('throws an error when no strategies are passed', () => {
    try {
      authentication.authenticate();
      assert.fail('Should never get here');
    } catch (error) {
      assert.strictEqual(error.message, 'The authenticate hook needs at least one allowed strategy');
    }
  });

  it('throws an error when not a before hook', () => {
    const users = app.service('users');

    users.hooks({
      after: authenticate('first')
    });

    users.find().then(() => {
      assert.fail('Should never get here');
    }).catch(error => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'The authenticate hook must be used as a before hook');
    });
  });

  it('throws an error if authentication service is gone', () => {
    delete app.services.authentication;

    return app.service('users').get(1, {
      authentication: {
        some: 'thing'
      }
    }).then(() => {
      assert.fail('Should never get here');
    }).catch(error => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, `Could not find authentication service at 'authentication'`);
    });
  });

  it('authenticates with first strategy, merges params', () => {
    const params = {
      authentication: {
        strategy: 'first',
        username: 'David'
      }
    };

    return app.service('users').get(1, params).then(result => {
      assert.deepStrictEqual(result, Object.assign({}, params, Strategy1.result));
    });
  });

  it('authenticates with different authentication service', () => {
    const params = {
      authentication: {
        strategy: 'first',
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

    return app.service('users').find(1, params).then(result => {
      assert.deepStrictEqual(result, []);
    });
  });

  it('authenticates with second strategy', () => {
    const params = {
      authentication: {
        strategy: 'second',
        v2: true,
        password: 'supersecret'
      }
    };

    return app.service('users').get(1, params).then(result => {
      assert.deepStrictEqual(result, Object.assign({}, params, Strategy2.result));
    });
  });

  it('passes for internal calls without authentication', () => {
    return app.service('users').get(1).then(result => {
      assert.deepStrictEqual(result, {});
    });
  });

  it('fails for invalid params.authentication', () => {
    return app.service('users').get(1, {
      authentication: {
        some: 'thing'
      }
    }).then(() => {
      assert.fail('Should never get here');
    }).catch(error => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Invalid Dave');
    });
  });

  it('fails for external calls without authentication', () => {
    return app.service('users').get(1, {
      provider: 'rest'
    }).then(() => {
      assert.fail('Should never get here');
    }).catch(error => {
      assert.strictEqual(error.name, 'NotAuthenticated');
      assert.strictEqual(error.message, 'Not authenticated');
    });
  });

  it('errors when used on the authentication service', () => {
    const auth = app.service('authentication');

    auth.hooks({
      before: {
        create: authenticate('first')
      }
    });

    return auth.create({
      strategy: 'first',
      username: 'David'
    }).then(() => {
      assert.fail('Should never get here');
    }).catch(error => {
      assert.strictEqual(error.message,
        'The authenticate hook does not need to be used on the authentication service'
      );
    });
  });
});
