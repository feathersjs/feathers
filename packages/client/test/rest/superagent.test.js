const superagent = require('superagent');
const baseTests = require('@feathersjs/tests/lib//client');

const app = require('../fixture');
const feathers = require('../../');

describe('Superagent REST connector', function () {
  const rest = feathers.rest('http://localhost:8889');
  const client = feathers()
    .configure(rest.superagent(superagent));

  before(function (done) {
    this.server = app().listen(8889, done);
  });

  after(function (done) {
    this.server.close(done);
  });

  baseTests(client, 'todos');
});
