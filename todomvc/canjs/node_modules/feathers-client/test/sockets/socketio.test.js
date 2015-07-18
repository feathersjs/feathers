var io = require('socket.io-client');
var feathers = require('feathers');
var app = require('../resources/fixture');
var baseTests = require('../resources/base');
var SocketIOService = require('../../lib/sockets').socketio.Service;

describe('Socket.io connector', function() {
  var socket = io('http://localhost:9988');
  var service = SocketIOService._create('todos',  {
    connection: socket
  });

  before(function(done) {
    this.server = app(function() {
      this.configure(feathers.socketio());
    }).listen(9988, done);
  });

  after(function(done) {
    socket.disconnect();
    this.server.close(done);
  });

  baseTests(service);
});