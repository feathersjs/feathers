const assert = require('assert');
const _axios = require('axios');
const feathers = require('@feathersjs/feathers');
const getApp = require('@feathersjs/authentication-local/test/fixture');
const { authenticate } = require('@feathersjs/authentication');

const expressify = require('../lib');
const axios = _axios.create({
  baseURL: 'http://localhost:9876/'
});

describe('@feathersjs/express/authentication', () => {
  const email = 'expresstest@authentication.com';
  const password = 'superexpress';

  let app;
  let server;
  let user;
  let authResult;

  before(() => {
    const expressApp = expressify(feathers())
      .use(expressify.json())
      .configure(expressify.rest());

    app = getApp(expressApp);
    server = app.listen(9876);

    app.use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, params });
      }
    });

    app.use('/protected', expressify.authenticate('jwt'), (req, res) => {
      res.json(req.user);
    });

    app.use(expressify.errorHandler({
      logger: false
    }));

    app.service('dummy').hooks({
      before: [ authenticate('jwt') ]
    });

    return app.service('users').create({ email, password })
      .then(result => {
        user = result;

        return axios.post('/authentication', {
          strategy: 'local',
          password,
          email
        });
      }).then(res => {
        authResult = res.data;
      });
  });

  after(done => server.close(done));

  describe('service authentication', () => {
    it('successful local authentication', () => {
      assert.ok(authResult.accessToken);
      assert.deepStrictEqual(authResult.authentication, {
        strategy: 'local'
      });
      assert.strictEqual(authResult.user.email, email);
      assert.strictEqual(authResult.user.password, undefined);
    });

    it('local authentication with wrong password fails', () => {
      return axios.post('/authentication', {
        strategy: 'local',
        password: 'wrong',
        email
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        const { data } = error.response;
        assert.strictEqual(data.name, 'NotAuthenticated');
        assert.strictEqual(data.message, 'Invalid login');
      });
    });

    it('authenticating with JWT works but returns same accessToken', () => {
      const { accessToken } = authResult;

      return axios.post('/authentication', {
        strategy: 'jwt',
        accessToken
      }).then(res => {
        const { data } = res;

        assert.strictEqual(data.accessToken, accessToken);
        assert.strictEqual(data.authentication.strategy, 'jwt');
        assert.strictEqual(data.authentication.payload.sub, user.id.toString());
        assert.strictEqual(data.user.email, email);
      });
    });

    it('can make a protected request with Authorization header', () => {
      const { accessToken } = authResult;

      return axios.get('/dummy/dave', {
        headers: {
          Authorization: accessToken
        }
      }).then(res => {
        const { data, data: { params } } = res;

        assert.strictEqual(data.id, 'dave');
        assert.deepStrictEqual(params.user, user);
        assert.strictEqual(params.authentication.accessToken, accessToken);
      });
    });

    it('errors when there are no authStrategies', () => {
      const { accessToken } = authResult;
      app.get('authentication').authStrategies = [];

      return axios.get('/dummy/dave', {
        headers: {
          Authorization: accessToken
        }
      }).then(() => assert.fail('Should never get here'))
      .catch(error => {
        assert.strictEqual(error.response.data.name, 'NotAuthenticated');
        app.get('authentication').authStrategies = [ 'jwt', 'local' ];
      });
    });

    it('can make a protected request with Authorization header and bearer scheme', () => {
      const { accessToken } = authResult;

      return axios.get('/dummy/dave', {
        headers: {
          Authorization: ` Bearer: ${accessToken}`
        }
      }).then(res => {
        const { data, data: { params } } = res;

        assert.strictEqual(data.id, 'dave');
        assert.deepStrictEqual(params.user, user);
        assert.strictEqual(params.authentication.accessToken, accessToken);
      });
    });
  });

  describe('authenticate middleware', () => {
    it('errors without valid strategies', () => {
      try {
        authenticate();
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.message, 'The authenticate hook needs at least one allowed strategy');
      }
    });

    it('protected endpoint fails when JWT is not present', () => {
      return axios.get('/protected').then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        const { data } = error.response;

        assert.strictEqual(data.name, 'NotAuthenticated');
        assert.strictEqual(data.message, 'Invalid authentication information (no `strategy` set)');
      });
    });

    it.skip('protected endpoint fails with invalid Authorization header', () => {
      return axios.get('/protected', {
        headers: {
          Authorization: 'Bearer: something wrong'
        }
      }).then(() => {
        assert.fail('Should never get here');
      }).catch(error => {
        const { data } = error.response;

        assert.strictEqual(data.name, 'NotAuthenticated');
        assert.strictEqual(data.message, 'Not authenticated');
      });
    });

    it('can request protected endpoint with JWT present', () => {
      return axios.get('/protected', {
        headers: {
          Authorization: `Bearer ${authResult.accessToken}`
        }
      }).then(res => {
        const { data } = res;

        assert.strictEqual(data.email, user.email);
        assert.strictEqual(data.id, user.id);
        assert.strictEqual(data.password, undefined, 'Passed provider information');
      });
    });
  });
});
