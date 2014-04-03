'use strict';

var feathers = require('../../lib/feathers');
var io = require('socket.io-client');

var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.verify;

describe('SocketIO provider', function () {
  var server, socket;

  before(function () {
    // This seems to be the only way to not get the
    // socket.io started log messing up the test output
    var oldlog = console.log;
    console.log = function () {};

    server = feathers()
      .configure(feathers.socketio(function(io) {
        io.set('log level', 0);
        io.set('authorization', function (handshakeData, callback) {
          handshakeData.user = { name: 'David' };
          callback(null, true);
        });
      }))
      .use('todo', todoService)
      .listen(7886);

    console.log = oldlog;

    socket = io.connect('http://localhost:7886');
  });

  after(function (done) {
    socket.disconnect();
    server.close(done);
  });

  describe('CRUD', function () {
    it('::find', function (done) {
      socket.emit('todo::find', {}, function (error, data) {
        verify.find(data);

        done(error);
      });
    });

    it('::get', function (done) {
      socket.emit('todo::get', 'laundry', {}, function (error, data) {
        verify.get('laundry', data);

        done(error);
      });
    });

    it('::create', function (done) {
      var original = {
        name: 'creating'
      };

      socket.emit('todo::create', original, {}, function (error, data) {
        verify.create(original, data);

        done(error);
      });
    });

    it('::update', function (done) {
      var original = {
        name: 'updating'
      };

      socket.emit('todo::update', 23, original, {}, function (error, data) {
        verify.update(23, original, data);

        done(error);
      });
    });

    it('::patch', function (done) {
      var original = {
        name: 'patching'
      };

      socket.emit('todo::patch', 25, original, {}, function (error, data) {
        verify.patch(25, original, data);

        done(error);
      });
    });

    it('::remove', function (done) {
      socket.emit('todo::remove', 11, {}, function (error, data) {
        verify.remove(11, data);

        done(error);
      });
    });
  });

  describe('Events', function () {
    it('created', function (done) {
      var original = {
        name: 'created event'
      };

      socket.once('todo created', function (data) {
        verify.create(original, data);
        done();
      });

      socket.emit('todo::create', original, {}, function () {});
    });

    it('updated', function (done) {
      var original = {
        name: 'updated event'
      };

      socket.once('todo updated', function (data) {
        verify.update(10, original, data);
        done();
      });

      socket.emit('todo::update', 10, original, {}, function () {});
    });

    it('removed', function (done) {
      socket.once('todo removed', function (data) {
        verify.remove(333, data);
        done();
      });

      socket.emit('todo::remove', 333, {}, function () {});
    });
  });

  describe('Event filtering', function() {
    it.skip('.created', function (done) {
      done();
    });

    it('.updated', function (done) {
      var original = {
        name: 'updated event'
      };

      socket.once('todo updated', function (data) {
        verify.update(10, original, data);
        done();
      });

      socket.emit('todo::update', 10, original, {}, function () {});
    });

    it.skip('.removed', function (done) {
      done();
    });
  });
});
