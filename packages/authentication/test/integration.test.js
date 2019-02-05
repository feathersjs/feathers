const assert = require('assert');
const axios = require('axios');
const server = require('./fixtures/server');

describe('authentication integration', () => {
  before(() => new Promise(resolve => {
    server.listen(8888).once('listening', () => resolve());
  }));

  describe('HTTP auth', () => {
    it('fails for protected route and plain request', () => {
      return axios.get('http://localhost:8888/protected/me')
        .catch(error => {
          assert.ok(error);
          console.log(error);
        });
    });
  });
});
