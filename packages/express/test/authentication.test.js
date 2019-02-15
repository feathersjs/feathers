const assert = require('assert');
const _axios = require('axios');
const feathers = require('@feathersjs/feathers');
const getApp = require('@feathersjs/authentication-local/test/fixture');
const axios = _axios.create({
  baseURL: 'http://localhost:9876/'
});
const expressify = require('../lib');

describe('@feathersjs/express/authentication', () => {
  const email = 'expresstest@authentication.com';
  const password = 'superexpress';

  let app, server, user, authResult;

  before(() => {
    const expressApp = expressify(feathers())
      .use(expressify.json())
      .configure(expressify.rest());

    app = getApp(expressApp);
    server = app.listen(9876);

    app.use('/protected', {
      get (id, params) {
        return Promise.resolve({ id, params });
      }
    });
    
    app.use(expressify.errorHandler());

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
});
