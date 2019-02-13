const assert = require('assert');
const { merge } = require('lodash');
const feathers = require('@feathersjs/feathers');
const memory = require('feathers-memory');
const authentication = require('../lib');
const { AuthenticationService, JWTStrategy } = authentication;

describe('authentication/jwt', () => {
  let app, user, accessToken, payload;

  beforeEach(() => {
    app = feathers();

    const authService = new AuthenticationService(app, 'authentication', {
      secret: 'supersecret',
      strategies: [ 'jwt' ]
    });

    authService.register('jwt', new JWTStrategy());

    app.use('/users', memory());
    app.use('/protected', {
      get (id, params) {
        return Promise.resolve({
          id, params
        });
      }
    });
    app.use('/authentication', authService);

    const service = app.service('authentication');

    app.service('protected').hooks({
      before: authentication.authenticate('jwt')
    });

    return app.service('users').create({
      name: 'David'
    }).then(result => {
      user = result;
      return service.createJWT({}, {
        subject: `${result.id}`
      }).then(at => {
        accessToken = at;

        return service.verifyJWT(at);
      }).then(decoded => {
        payload = decoded;
      });
    });
  });

  describe('with authenticate hook', () => {
    it('fails for protected service and external call when not set', () => {
      return app.service('protected').get('test', {
        provider: 'rest'
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Not authenticated');
      });
    });

    it('fails for protected service and external call when not strategy', () => {
      return app.service('protected').get('test', {
        provider: 'rest',
        authentication: {
          username: 'Dave'
        }
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, 'Not authenticated');
      });
    });

    it('fails when entity service was not found', () => {
      delete app.services.users;

      return app.service('protected').get('test', {
        provider: 'rest',
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        assert.strictEqual(error.name, 'NotAuthenticated');
        assert.strictEqual(error.message, `Could not find entity service 'users'`);
      });
    });

    it('passes when authentication is set and merges params', () => {
      const params = {
        provider: 'rest',
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      };

      return app.service('protected').get('test', params).then(result => {
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
    });

    it('works with entity set to null', () => {
      const params = {
        provider: 'rest',
        authentication: {
          strategy: 'jwt',
          accessToken
        }
      };

      app.get('authentication').entity = null;

      return app.service('protected').get('test', params).then(result => {
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
  });

  describe('on authentication service', () => {
    it('authenticates but does not return a new accessToken', () => {
      return app.service('authentication').create({
        strategy: 'jwt',
        accessToken
      }).then(authResult => {
        assert.strictEqual(authResult.accessToken, accessToken);
        assert.deepStrictEqual(authResult.user, user);
        assert.deepStrictEqual(authResult.authentication.payload, payload);
      });
    });
  });

  describe('parse', () => {
    it('returns null when header not set', () => {
      return app.service('authentication').parse({}, {}, 'jwt')
        .then(result => {
          assert.strictEqual(result, null);
        });
    });

    it('parses plain Authorization header', () => {
      return app.service('authentication').parse({
        headers: {
          authorization: accessToken
        }
      }, {}, 'jwt').then(result => {
        assert.deepStrictEqual(result, {
          strategy: 'jwt',
          accessToken
        });
      });
    });

    it('parses Authorization header with Bearer scheme', () => {
      return app.service('authentication').parse({
        headers: {
          authorization: ` Bearer ${accessToken} `
        }
      }, {}, 'jwt').then(result => {
        assert.deepStrictEqual(result, {
          strategy: 'jwt',
          accessToken
        });
      });
    });

    it('return null when scheme does not match', () => {
      return app.service('authentication').parse({
        headers: {
          authorization: ` Basic something`
        }
      }, {}, 'jwt').then(result => {
        assert.strictEqual(result, null);
      });
    });
  });
});
