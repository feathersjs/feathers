'use strict';

var feathers = require('../../lib/feathers');
var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.verify;

describe('Primus provider', function () {
  var server, socket;

  before(function () {
    server = feathers()
      .configure(feathers.primus({
        transformer: 'socket.io'
      }, function(primus) {
        socket = new primus.Socket('http://localhost:7888');
      }))
      .use('todo', todoService)
      .listen(7888);
  });

  after(function (done) {
    socket.socket.disconnect();
    server.close(done);
  });

  describe('CRUD', function () {
    it('::find', function (done) {
      socket.send('todo::find', {}, function (error, data) {
        verify.find(data);

        done(error);
      });
    });

    it('::get', function (done) {
      socket.send('todo::get', 'laundry', {}, function (error, data) {
        verify.get('laundry', data);

        done(error);
      });
    });

    it('::create', function (done) {
      var original = {
        name: 'creating'
      };

      socket.send('todo::create', original, {}, function (error, data) {
        verify.create(original, data);

        done(error);
      });
    });

    it('::update', function (done) {
      var original = {
        name: 'updating'
      };

      socket.send('todo::update', 23, original, {}, function (error, data) {
        verify.update(23, original, data);

        done(error);
      });
    });

    it('::remove', function (done) {
      socket.send('todo::remove', 11, {}, function (error, data) {
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

      socket.on('todo created', function (data) {
        verify.create(original, data);
        done();
      });

      socket.send('todo::create', original, {}, function () {});
    });

    it('updated', function (done) {
      var original = {
        name: 'updated event'
      };

      socket.on('todo updated', function (data) {
        verify.update(10, original, data);
        done();
      });

      socket.send('todo::update', 10, original, {}, function () {});
    });

    it('removed', function (done) {
      socket.on('todo removed', function (data) {
        verify.remove(333, data);
        done();
      });

      socket.send('todo::remove', 333, {}, function () {});
    });
  });
});
