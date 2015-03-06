'use strict';

var assert = require('assert');
var _ = require('lodash');

var feathers = require('../../lib/feathers');
var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.verify;

describe('Primus provider', function () {
  var server, socket, app,
    socketParams = {
      user: { name: 'David' },
      provider: 'websockets'
    };

  before(function () {
    app = feathers()
      .configure(feathers.primus({
        transformer: 'websockets'
      }, function(primus) {
        socket = new primus.Socket('http://localhost:7888');

        primus.authorize(function (req, done) {
          req.feathers = socketParams;
          done();
        });
      }))
      .use('todo', todoService);

    server = app.listen(7888, function(){
      app.use('tasks', todoService);
    });
  });

  after(function (done) {
    socket.socket.close();
    server.close(done);
  });

  it('Passes handshake as service parameters.', function(done) {
    var service = app.service('todo');
    var old = {
      find: service.find,
      create: service.create,
      update: service.update,
      remove: service.remove
    };

    service.find = function(params) {
      assert.deepEqual(_.omit(params, 'query'), socketParams, 'Handshake parameters passed on proper position');
      old.find.apply(this, arguments);
    };

    service.create = function(data, params) {
      assert.deepEqual(_.omit(params, 'query'), socketParams, 'Passed handshake parameters');
      old.create.apply(this, arguments);
    };

    service.update = function(id, data, params) {
      assert.deepEqual(params, _.extend({
        query: {
          test: 'param'
        }
      }, socketParams), 'Passed handshake parameters as query');
      old.update.apply(this, arguments);
    };

    socket.send('todo::create', {}, {}, function () {
      socket.send('todo::update', 1, {}, { test: 'param' }, function() {
        _.extend(service, old);
        done();
      });
    });
  });

  it('Missing parameters in socket call works. (#88)', function(done) {
    var service = app.service('todo');
    var old = {
      find: service.find
    };

    service.find = function(params) {
      assert.deepEqual(_.omit(params, 'query'), socketParams, 'Handshake parameters passed on proper position');
      old.find.apply(this, arguments);
    };

    socket.send('todo::find', function () {
      _.extend(service, old);
      done();
    });
  });

  describe('Services', function() {
    it('invalid arguments cause an error', function (done) {
      socket.send('todo::find', 1, {}, function(error) {
        assert.equal(error.message, 'Too many arguments for \'find\' service method');
        done();
      });
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

      it('::create without parameters and callback', function (done) {
        var original = {
          name: 'creating'
        };

        socket.send('todo::create', original);

        socket.once('todo created', function(data) {
          verify.create(original, data);

          done();
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

      it('::patch', function (done) {
        var original = {
          name: 'patching'
        };

        socket.send('todo::patch', 25, original, {}, function (error, data) {
          verify.patch(25, original, data);

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

        socket.once('todo created', function (data) {
          verify.create(original, data);
          done();
        });

        socket.send('todo::create', original, {}, function () {});
      });

      it('updated', function (done) {
        var original = {
          name: 'updated event'
        };

        socket.once('todo updated', function (data) {
          verify.update(10, original, data);
          done();
        });

        socket.send('todo::update', 10, original, {}, function () {});
      });

      it('patched', function(done) {
        var original = {
          name: 'patched event'
        };

        socket.once('todo patched', function (data) {
          verify.patch(12, original, data);
          done();
        });

        socket.send('todo::patch', 12, original, {}, function () {});
      });

      it('removed', function (done) {
        socket.once('todo removed', function (data) {
          verify.remove(333, data);
          done();
        });

        socket.send('todo::remove', 333, {}, function () {});
      });
    });

    describe('Event filtering', function() {
      it('.created', function (done) {
        var service = app.service('todo');
        var original = { description: 'created event test' };
        var oldCreated = service.created;

        service.created = function(data, params, callback) {
          assert.deepEqual(params, socketParams);
          verify.create(original, data);

          callback(null, _.extend({ processed: true }, data));
        };

        socket.send('todo::create', original, {}, function() {});

        socket.once('todo created', function (data) {
          service.created = oldCreated;
          // Make sure Todo got processed
          verify.create(_.extend({ processed: true }, original), data);
          done();
        });
      });

      it('.updated', function (done) {
        var original = {
          name: 'updated event'
        };

        socket.once('todo updated', function (data) {
          verify.update(10, original, data);
          done();
        });

        socket.send('todo::update', 10, original, {}, function () {});
      });

      it('.removed', function (done) {
        var service = app.service('todo');
        var oldRemoved = service.removed;

        service.removed = function(data, params, callback) {
          assert.deepEqual(params, socketParams);

          if(data.id === 23) {
            // Only dispatch with given id
            return callback(null, data);
          }

          callback(null, false);
        };

        socket.send('todo::remove', 1, {}, function() {});
        socket.send('todo::remove', 23, {}, function() {});

        socket.on('todo removed', function (data) {
          service.removed = oldRemoved;
          assert.equal(data.id, 23);
          done();
        });
      });
    });
  });

  describe('Dynamic services', function() {
    describe('CRUD', function () {
      it('::find', function (done) {
        socket.send('tasks::find', {}, function (error, data) {
          verify.find(data);

          done(error);
        });
      });

      it('::get', function (done) {
        socket.send('tasks::get', 'laundry', {}, function (error, data) {
          verify.get('laundry', data);

          done(error);
        });
      });

      it('::create', function (done) {
        var original = {
          name: 'creating'
        };

        socket.send('tasks::create', original, {}, function (error, data) {
          verify.create(original, data);

          done(error);
        });
      });

      it('::update', function (done) {
        var original = {
          name: 'updating'
        };

        socket.send('tasks::update', 23, original, {}, function (error, data) {
          verify.update(23, original, data);

          done(error);
        });
      });

      it('::patch', function (done) {
        var original = {
          name: 'patching'
        };

        socket.send('tasks::patch', 25, original, {}, function (error, data) {
          verify.patch(25, original, data);

          done(error);
        });
      });

      it('::remove', function (done) {
        socket.send('tasks::remove', 11, {}, function (error, data) {
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

        socket.once('tasks created', function (data) {
          verify.create(original, data);
          done();
        });

        socket.send('tasks::create', original, {}, function () {});
      });

      it('updated', function (done) {
        var original = {
          name: 'updated event'
        };

        socket.once('tasks updated', function (data) {
          verify.update(10, original, data);
          done();
        });

        socket.send('tasks::update', 10, original, {}, function () {});
      });

      it('patched', function(done) {
        var original = {
          name: 'patched event'
        };

        socket.once('tasks patched', function (data) {
          verify.patch(12, original, data);
          done();
        });

        socket.send('tasks::patch', 12, original, {}, function () {});
      });

      it('removed', function (done) {
        socket.once('tasks removed', function (data) {
          verify.remove(333, data);
          done();
        });

        socket.send('tasks::remove', 333, {}, function () {});
      });
    });

    describe('Event filtering', function() {
      it('.created', function (done) {
        var service = app.service('tasks');
        var original = { description: 'created event test' };
        var oldCreated = service.created;

        service.created = function(data, params, callback) {
          assert.deepEqual(params, socketParams);
          verify.create(original, data);

          callback(null, _.extend({ processed: true }, data));
        };

        socket.send('tasks::create', original, {}, function() {});

        socket.once('tasks created', function (data) {
          service.created = oldCreated;
          // Make sure Todo got processed
          verify.create(_.extend({ processed: true }, original), data);
          done();
        });
      });

      it('.updated', function (done) {
        var original = {
          name: 'updated event'
        };

        socket.once('tasks updated', function (data) {
          verify.update(10, original, data);
          done();
        });

        socket.send('tasks::update', 10, original, {}, function () {});
      });

      it('.removed', function (done) {
        var service = app.service('tasks');
        var oldRemoved = service.removed;

        service.removed = function(data, params, callback) {
          assert.deepEqual(params, socketParams);

          if(data.id === 23) {
            // Only dispatch with given id
            return callback(null, data);
          }

          callback(null, false);
        };

        socket.send('tasks::remove', 1, {}, function() {});
        socket.send('tasks::remove', 23, {}, function() {});

        socket.on('tasks removed', function (data) {
          service.removed = oldRemoved;
          assert.equal(data.id, 23);
          done();
        });
      });
    });
  });
});
