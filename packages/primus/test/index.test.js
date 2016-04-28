import assert from 'assert';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import _ from 'lodash';
import { Service as todoService, verify } from 'feathers-commons/lib/test-fixture';

import services from './service.test.js';
import primus from '../src';

describe('feathers-primus', () => {
  let options = {
    socketParams: {
      user: { name: 'David' },
      provider: 'primus'
    }
  };

  before(done => {
    const errorHook = function(hook) {
      if(hook.params.query.hookError) {
        throw new Error(`Error from ${hook.method}, ${hook.type} hook`);
      }
    };
    const app = options.app = feathers()
      .configure(hooks())
      .configure(primus({
        transformer: 'websockets'
      }, function(primus) {
        options.socket = new primus.Socket('http://localhost:7888');

        primus.authorize(function (req, done) {
          req.feathers.user = { name: 'David' };
          done();
        });
      }))
      .use('todo', todoService);

    app.service('todo').before({
      get: errorHook
    });

    options.server = app.listen(7888, function(){
      app.use('tasks', todoService);
      app.service('tasks').before({
        get: errorHook
      });
      done();
    });
  });

  after(done => {
    options.socket.socket.close();
    options.server.close(done);
  });

  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib'), 'function');
  });

  it('runs primus before setup (#131)', function(done) {
    var counter = 0;
    var app = feathers()
      .configure(primus({
        transformer: 'websockets'
      }, function() {
        assert.equal(counter, 0);
        counter++;
      }))
      .use('/todos', {
        find: function(params, callback) {
          callback(null, []);
        },
        setup: function(app) {
          assert.ok(app.primus);
          assert.equal(counter, 1, 'SocketIO configuration ran first');
        }
      });

    var srv = app.listen(9119);
    srv.on('listening', function() {
      srv.close(done);
    });
  });

  it('Passes handshake as service parameters.', function(done) {
    var service = options.app.service('todo');
    var old = {
      find: service.find,
      create: service.create,
      update: service.update,
      remove: service.remove
    };

    service.find = function(params) {
      assert.deepEqual(_.omit(params, 'query'), options.socketParams,
        'Handshake parameters passed on proper position');
      old.find.apply(this, arguments);
    };

    service.create = function(data, params) {
      assert.deepEqual(_.omit(params, 'query'), options.socketParams,
        'Passed handshake parameters');
      old.create.apply(this, arguments);
    };

    service.update = function(id, data, params) {
      assert.deepEqual(params, _.extend({
        query: {
          test: 'param'
        }
      }, options.socketParams), 'Passed handshake parameters as query');
      old.update.apply(this, arguments);
    };

    options.socket.send('todo::create', {}, {}, function () {
      options.socket.send('todo::update', 1, {}, { test: 'param' }, function() {
        _.extend(service, old);
        done();
      });
    });
  });

  it('Missing parameters in socket call works. (#88)', function(done) {
    var service = options.app.service('todo');
    var old = {
      find: service.find
    };

    service.find = function(params) {
      assert.deepEqual(_.omit(params, 'query'), options.socketParams,
        'Handshake parameters passed on proper position');
      old.find.apply(this, arguments);
    };

    options.socket.send('todo::find', function () {
      _.extend(service, old);
      done();
    });
  });

  it('uses mountpath for sub-apps and calls their setup', done => {
    let server;
    const sub = feathers()
      .configure(primus({
        transformer: 'websockets'
      }, function(primus) {
        const socket = new primus.Socket('http://localhost:9876');

        const original = {
          name: 'creating'
        };

        socket.once('v1/todo created', data => {
          verify.create(original, data);
          socket.socket.close();
          server.close(done);
        });

        socket.send('v1/todo::create', original);
      }))
      .use('/todo', todoService);

      const main = feathers()
        .use('/v1', sub);

      server = main.listen(9876);
  });

  describe('Services', function() {
    services('todo', options);
  });

  describe('Dynamic services', function() {
    services('tasks', options);
  });
});
