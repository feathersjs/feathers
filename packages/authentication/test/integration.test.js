const assert = require('assert');
const axios = require('axios');
// const io = require('socket.io-client');
const app = require('./fixtures/app');

describe('authentication integration', () => {
  let server;

  before(done => {
    server = app.listen(8888);
    server.once('listening', () => done());
  });

  after(done => server.close(() => done()));

  describe('HTTP auth', () => {
    it('fails for protected route and plain request', () => {
      return axios.get('http://localhost:8888/protected/me')
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          const { response } = error;

          assert.ok(response);
          assert.strictEqual(response.status, 401);
          assert.strictEqual(response.data.name, 'NotAuthenticated');
          assert.strictEqual(response.data.message, 'Not authenticated');
        });
    });

    it('fails for protected route with wrong API key', () => {
      return axios.get('http://localhost:8888/protected/me', {
        headers: {
          'X-Api-Key': 'wrong'
        }
      })
        .then(() => assert.fail('Should never get here'))
        .catch(error => {
          const { response } = error;

          assert.ok(response);
          assert.strictEqual(response.status, 401);
          assert.strictEqual(response.data.name, 'NotAuthenticated');
          assert.strictEqual(response.data.message, 'Invalid API key');
        });
    });

    it('passes for protected route with correct API key', () => {
      return axios.get('http://localhost:8888/protected/me', {
        headers: {
          'X-Api-Key': '12345'
        }
      }).then(res => {
        const { data } = res;

        assert.deepStrictEqual(data, {
          id: 'me',
          params: {
            query: {},
            route: {},
            provider: 'rest',
            authentication: { strategy: 'api-key', apiKey: '12345' },
            user: { id: 33, name: 'David' }
          }
        });
      });
    });

    it('creates a JWT with API key authentication', () => {
      return axios.post('http://localhost:8888/authentication', {
        strategy: 'api-key',
        apiKey: '12345'
      }).then(response => {
        const { accessToken } = response.data;

        return app.service('authentication').verifyJWT(accessToken);
      }).then(encoded => {
        assert.deepStrictEqual(encoded.sub, '33');
      });
    });
  });

  describe('Socket.io connection', () => {
    // const socket = 
  });
});
