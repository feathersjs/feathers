var superagent = require('superagent');
var app = require('../resources/fixture');
var baseTests = require('../resources/base');
var SuperAgentService = require('../../lib/rest/superagent').Service;

describe('Superagent REST connector', function() {
  var service = SuperAgentService._create('todos',  {
    base: 'http://localhost:8889',
    connection: superagent
  });

  before(function(done) {
    this.server = app().listen(8889, done);
  });

  after(function(done) {
    this.server.close(done);
  });

  baseTests(service);
});