var request = require('request');
var app = require('../resources/fixture');
var baseTests = require('../resources/base');
var RequestService = require('../../lib/rest/request').Service;

describe('node-request REST connector', function() {
  var service = RequestService._create('todos', {
    base: 'http://localhost:6777',
    connection: request
  });

  before(function(done) {
    this.server = app().listen(6777, done);
  });

  after(function(done) {
    this.server.close(done);
  });

  baseTests(service);
});
