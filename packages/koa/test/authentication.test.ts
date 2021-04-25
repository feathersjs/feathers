import { strict as assert } from 'assert';
import _axios from 'axios';
import { Server } from 'http';
import { AuthenticationResult } from '@feathersjs/authentication';

import app from './app.fixture';

const axios = _axios.create({
  baseURL: 'http://localhost:9776/'
});

describe('@feathersjs/koa/authentication', () => {
  const email = 'koatest@authentication.com';
  const password = 'superkoa';

  let server: Server;
  let authResult: AuthenticationResult;
  let user: any;

  before(async () => {
    server = await app.listen(9776);
    user = await app.service('users').create({ email, password });
    authResult = (await axios.post('/authentication', {
      strategy: 'local',
      password,
      email
    })).data;
  });

  after(done => server.close(done));

  describe('service authentication', () => {
    it('successful local authentication', () => {
      assert.ok(authResult.accessToken);
      assert.strictEqual(authResult.user.email, email);
      assert.strictEqual(authResult.user.password, undefined);
    });

    it('local authentication with wrong password fails', async () => {
      try {
        await axios.post('/authentication', {
          strategy: 'local',
          password: 'wrong',
          email
        });
        assert.fail('Should never get here');
      } catch (error) {
        const { data } = error.response;
        assert.strictEqual(data.name, 'NotAuthenticated');
        assert.strictEqual(data.message, 'Invalid login');
      }
    });

    it('authenticating with JWT works but returns same accessToken', async () => {
      const { accessToken } = authResult;

      const { data } = await axios.post('/authentication', {
        strategy: 'jwt',
        accessToken
      });

      assert.strictEqual(data.accessToken, accessToken);
      assert.strictEqual(data.authentication.strategy, 'jwt');
      assert.strictEqual(data.authentication.payload.sub, user.id.toString());
      assert.strictEqual(data.user.email, email);
    });

    it('can make a protected request with Authorization header', async () => {
      const { accessToken } = authResult;

      const { data } = await axios.get('/dummy/dave', {
        headers: {
          Authorization: accessToken
        }
      });

      assert.strictEqual(data.id, 'dave');
      assert.deepStrictEqual(data.params.user, user);
      assert.strictEqual(data.params.authentication.accessToken, accessToken);
    });

    it('errors when there are no authStrategies and parseStrategies', async () => {
      const { accessToken } = authResult;

      app.get('authentication').authStrategies = [];
      delete app.get('authentication').parseStrategies;

      try {
        await axios.get('/dummy/dave', {
          headers: {
            Authorization: accessToken
          }
        });
        assert.fail('Should never get here');
      } catch (error) {
        assert.strictEqual(error.response.data.name, 'NotAuthenticated');
        app.get('authentication').authStrategies = [ 'jwt', 'local' ];
      }
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
});
