import assert from 'assert';
import _ from 'lodash';
import feathers from 'feathers';
import hooks from 'feathers-hooks';
import io from 'socket.io-client';
import request from 'request';
import { Service as todoService } from 'feathers-commons/lib/test-fixture';

import testService from './service.test.js';
import socketio from '../src';

describe('feathers-socketio', () => {
  let options = {
    socketParams: {
      user: { name: 'David' },
      provider: 'socketio'
    }
  };

  before(done => {
    const errorHook = function (hook) {
      if (hook.params.query.hookError) {
        throw new Error(`Error from ${hook.method}, ${hook.type} hook`);
      }
    };

    const app = options.app = feathers()
      .configure(hooks())
      .configure(socketio(function (io) {
        io.use(function (socket, next) {
          socket.feathers.user = { name: 'David' };
          next();
        });
      }))
      .use('/todo', todoService);

    app.service('todo').before({
      get: errorHook
    });

    options.server = app.listen(7886, function () {
      app.use('/tasks', todoService);
      app.service('tasks').before({
        get: errorHook
      });
    });

    const socket = options.socket = io('http://localhost:7886');
    socket.on('connect', () => done());
  });

  after(done => {
    options.socket.disconnect();
    options.server.close(done);
  });

  it('is CommonJS compatible', () => assert.equal(typeof require('../lib'), 'function'));

  it('runs io before setup (#131)', done => {
    let counter = 0;
    let app = feathers()
      .configure(socketio(function () {
        assert.equal(counter, 0);
        counter++;
      }))
      .use('/todos', {
        find (params, callback) {
          callback(null, []);
        },
        setup (app) {
          assert.ok(app.io);
          assert.equal(counter, 1, 'SocketIO configuration ran first');
        }
      });

    let srv = app.listen(8887).on('listening', () => srv.close(done));
  });

  it('can set MaxListeners', done => {
    let app = feathers()
      .configure(socketio(function (io) {
        io.sockets.setMaxListeners(100);
      }));

    let srv = app.listen(8987).on('listening', () => {
      assert.equal(app.io.sockets.getMaxListeners(), 100);
      srv.close(done);
    });
  });

  it('can set options (#12)', done => {
    let app = feathers()
      .configure(socketio({
        path: '/test/'
      }, io => assert.ok(io)));

    let srv = app.listen(8987).on('listening', () => {
      // eslint-disable-next-line handle-callback-err
      request('http://localhost:8987/test/socket.io.js', (err, res) => {
        assert.equal(res.statusCode, 200);
        srv.close(done);
      });
    });
  });

  it('passes handshake as service parameters', done => {
    let service = options.app.service('todo');
    let old = {
      find: service.find,
      create: service.create,
      update: service.update,
      remove: service.remove
    };

    service.find = function (params) {
      assert.deepEqual(_.omit(params, 'query'), options.socketParams, 'Handshake parameters passed on proper position');
      old.find.apply(this, arguments);
    };

    service.create = function (data, params) {
      assert.deepEqual(_.omit(params, 'query'), options.socketParams, 'Passed handshake parameters');
      old.create.apply(this, arguments);
    };

    service.update = function (id, data, params) {
      assert.deepEqual(params, _.extend({
        query: {
          test: 'param'
        }
      }, options.socketParams), 'Passed handshake parameters as query');
      old.update.apply(this, arguments);
    };

    options.socket.emit('todo::create', {}, {}, function () {
      options.socket.emit('todo::update', 1, {}, { test: 'param' }, function () {
        _.extend(service, old);
        done();
      });
    });
  });

  it('missing parameters in socket call works (#88)', done => {
    let service = options.app.service('todo');
    let old = {
      find: service.find
    };

    service.find = function (params) {
      assert.deepEqual(_.omit(params, 'query'), options.socketParams, 'Handshake parameters passed on proper position');
      old.find.apply(this, arguments);
    };

    options.socket.emit('todo::find', function () {
      _.extend(service, old);
      done();
    });
  });

  describe('Services', () => testService('todo', options));
  describe('Dynamic Services', () => testService('tasks', options));
});
