const request = require('request');
const baseTests = require('@feathersjs/tests/lib//client');

const app = require('../fixture');
const feathers = require('../../');

describe('node-request REST connector', function () {
  const rest = feathers.rest('http://localhost:6777');
  const client = feathers()
    .configure(rest.request(request));

  before(function (done) {
    this.server = app().listen(6777, done);
  });

  after(function (done) {
    this.server.close(done);
  });

  baseTests(client, 'todos');
});
