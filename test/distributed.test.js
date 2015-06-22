var assert = require('assert');
var client = require('feathers-client');
var io = require('socket.io-client');
var feathers = require('../lib/feathers');

describe('Distributed Feathers applications test', function () {
  before(function(done) {
    var app = feathers()
      .configure(feathers.socketio())
      .use('todos', {
        create: function(data, params, callback) {
          data.id = 42;
          callback(null, data);
        }
      });

    app.listen(8888, done);
  });

  it('passes created event between servers', function (done) {
    var socket = io('http://localhost:8888');
    var remoteApp = client().configure(client.socketio(socket));
    var todo = { text: 'Created on alpha server', complete: false };
    var beta = feathers()
      .configure(feathers.rest())
      .use('todos', remoteApp.service('todos'));

    beta.listen(9999, function() {
      beta.service('todos').on('created', function(newTodo) {
        assert.deepEqual(newTodo, {
          id: 42,
          text: 'Created on alpha server',
          complete: false
        });
        done();
      });

      socket.emit('todos::create', todo);
    });
  });
});
