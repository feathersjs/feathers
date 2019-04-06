import assert from 'assert';
import feathers, { Application } from '@feathersjs/feathers';

import client, { AuthenticationClient } from '../src';

describe('@feathersjs/authentication-client', () => {
  const accessToken = 'testing';
  const user = {
    name: 'Test User'
  };
  let app: Application;

  beforeEach(() => {
    app = feathers();

    app.configure(client());
    app.use('/authentication', {
      create (data) {
        return Promise.resolve({
          accessToken,
          data,
          user
        });
      },

      remove (id) {
        return Promise.resolve({ id });
      }
    });
    app.use('dummy', {
      find (params) {
        return Promise.resolve(params);
      }
    });
  });

  it('initializes', () => {
    assert.ok(app.authentication instanceof AuthenticationClient);
    assert.strictEqual(app.get('storage'), app.authentication.storage);
    assert.strictEqual(typeof app.authenticate, 'function');
    assert.strictEqual(typeof app.logout, 'function');
  });

  it('setJwt, getJwt, removeJwt', () => {
    const auth = app.authentication;
    const token = 'hi';

    return auth.setJwt(token)
      .then(() => auth.getJwt())
      .then(res => assert.strictEqual(res, token))
      .then(() => auth.removeJwt())
      .then(() => auth.getJwt())
      .then(res => assert.strictEqual(res, undefined));
  });

  it('authenticate, authentication hook, login event', () => {
    const data = {
      strategy: 'testing'
    };

    const promise = new Promise(resolve => {
      app.once('login', resolve);
    });

    app.authenticate(data);

    return promise.then(result => {
      assert.deepStrictEqual(result, {
        accessToken,
        data,
        user
      });

      return app.authentication.getJwt();
    }).then(at => {
      assert.strictEqual(at, accessToken, 'Set accessToken in storage');

      return Promise.resolve(app.get('storage').getItem('feathers-jwt'));
    }).then(at => {
      assert.strictEqual(at, accessToken, 'Set accessToken in storage');

      return app.service('dummy').find();
    }).then(result => {
      assert.deepStrictEqual(result.accessToken, accessToken);
      assert.deepStrictEqual(result.user, user);
    });
  });

  it('logout event', () => {
    const promise = new Promise(resolve => app.once('logout', resolve));

    app.authenticate({
      strategy: 'testing'
    }).then(() => app.logout());

    return promise.then(result => {
      assert.deepStrictEqual(result, { id: null });
    });
  });

  describe('reauthenticate', () => {
    it('fails when no token in storage', () => {
      return app.authentication.reauthenticate().then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.message, 'No accessToken found in storage');
      });
    });

    it('reauthenticates when token is in storage', () => {
      const data = {
        strategy: 'testing'
      };

      app.authenticate(data).then(result => {
        assert.deepStrictEqual(result, {
          accessToken,
          data,
          user
        });

        return result;
      }).then(() => app.authentication.reauthenticate())
        .then(() =>
          app.authentication.reset()
        ).then(() => {
          return Promise.resolve(app.get('storage').getItem('feathers-jwt'));
        }).then(at => {
          assert.strictEqual(at, accessToken, 'Set accessToken in storage');

          return app.authentication.reauthenticate();
        }).then(at => {
          assert.deepStrictEqual(at, {
            accessToken,
            data: { strategy: 'jwt', accessToken: 'testing' },
            user
          });

          return app.logout();
        }).then(() => {
          return Promise.resolve(app.get('storage').getItem('feathers-jwt'));
        }).then(at => {
          assert.ok(!at);
          assert.ok(!app.get('authentication'));
        });
    });
  });
});
