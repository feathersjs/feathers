var feathers = require('feathers');
var app = require('../resources/fixture');
var baseTests = require('../resources/base');
var PrimusService = require('../../lib/sockets').primus.Service;

describe('Primus connector', function() {
  var service = PrimusService._create('todos',  {});
  var socket;

  before(function(done) {
    this.server = app(function() {
      this.configure(feathers.primus({
        transformer: 'websockets'
      }, function(primus) {
        service.connection = socket = new primus.Socket('http://localhost:12012');
      }));
    }).listen(12012, done);
  });

  after(function(done) {
    socket.socket.close();
    this.server.close(done);
  });

  baseTests(service);
});