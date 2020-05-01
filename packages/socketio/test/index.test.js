const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const assert = require('assert');
const omit = require('lodash/omit');
const extend = require('lodash/extend');
const io = require('socket.io-client');
const axios = require('axios');
const { Service } = require('@feathersjs/tests/lib/fixture');

const methodTests = require('./methods.js');
const eventTests = require('./events');
const socketio = require('../lib');

describe('@feathersjs/socketio', () => {
  let app;
  let server;
  let socket;

  const socketParams = {
    user: { name: 'David' },
    provider: 'socketio'
  };
  const options = {
    get app () {
      return app;
    },

    get socket () {
      return socket;
    }
  };

  before(done => {
    const errorHook = function (hook) {
      if (hook.params.query.hookError) {
        throw new Error(`Error from ${hook.method}, ${hook.type} hook`);
      }
    };

    app = feathers()
      .configure(socketio(function (io) {
        io.use(function (socket, next) {
          socket.feathers.user = { name: 'David' };
          socketParams.headers = socket.feathers.headers;

          const { channel } = socket.handshake.query;

          if (channel) {
            socket.feathers.channel = channel;
          }

          next();
        });
      }))
      .use('/todo', Service);

    app.service('todo').hooks({
      before: {
        get: errorHook
      }
    });

    server = app.listen(7886, function () {
      app.use('/tasks', Service);
      app.service('tasks').hooks({
        before: {
          get: errorHook
        }
      });
    });

    socket = io('http://localhost:7886');
    socket.on('connect', () => done());
  });

  after(done => {
    socket.disconnect();
    server.close(done);
  });

  it('exports default', () => {
    assert.strictEqual(socketio, socketio.default);
  });

  it('runs io before setup (#131)', done => {
    let counter = 0;
    let app = feathers().configure(socketio(() => {
      assert.strictEqual(counter, 0);
      counter++;
    }));

    let srv = app.listen(8887).on('listening', () => srv.close(done));
  });

  it('can set MaxListeners', done => {
    let app = feathers().configure(socketio(io =>
      io.sockets.setMaxListeners(100)
    ));

    let srv = app.listen(8987).on('listening', () => {
      assert.strictEqual(app.io.sockets.getMaxListeners(), 100);
      srv.close(done);
    });
  });

  it('expressified app works', done => {
    const data = { message: 'Hello world' };
    const app = express(feathers())
      .configure(socketio())
      .use('/test', (req, res) => res.json(data));
    
    const srv = app.listen(8992).on('listening', async () => {
      const response = await axios({
        url: 'http://localhost:8992/socket.io/socket.io.js'
      });

      assert.strictEqual(response.status, 200);

      const res = await axios({
        url: 'http://localhost:8992/test'
      });

      assert.deepStrictEqual(res.data, data);
      srv.close(done);
    });
  });

  it('can set options (#12)', done => {
    let application = feathers().configure(socketio({
      path: '/test/'
    }, ioInstance => assert.ok(ioInstance)));

    let srv = application.listen(8987).on('listening', async () => {
      const { status } = await axios('http://localhost:8987/test/socket.io.js');

      assert.strictEqual(status, 200);
      srv.close(done);
    });
  });

  it('passes handshake as service parameters', done => {
    let service = app.service('todo');
    let old = {
      create: service.create,
      update: service.update
    };

    service.create = function (data, params) {
      assert.deepStrictEqual(omit(params, 'query', 'route', 'connection'), socketParams, 'Passed handshake parameters');
      return old.create.apply(this, arguments);
    };

    service.update = function (id, data, params) {
      assert.deepStrictEqual(params, extend({
        route: {},
        connection: socketParams,
        query: {
          test: 'param'
        }
      }, socketParams), 'Passed handshake parameters as query');
      return old.update.apply(this, arguments);
    };

    socket.emit('create', 'todo', {}, error => {
      assert.ok(!error);

      socket.emit('update', 'todo', 1, {}, {
        test: 'param'
      }, error => {
        assert.ok(!error);
        extend(service, old);
        done();
      });
    });
  });

  it('connection and disconnect events (#1243, #1238)', (done) => {
    const mySocket = io('http://localhost:7886?channel=dctest');

    app.once('connection', connection => {
      assert.strictEqual(connection.channel, 'dctest');
      app.once('disconnect', disconnection => {
        assert.strictEqual(disconnection.channel, 'dctest');
        done();
      });
      setTimeout(() => mySocket.close(), 100);
    });

    assert.ok(mySocket);
  });

  it('missing parameters in socket call works (#88)', done => {
    let service = app.service('todo');
    let old = { find: service.find };

    service.find = function (params) {
      assert.deepStrictEqual(omit(params, 'query', 'route', 'connection'), socketParams, 'Handshake parameters passed on proper position');
      return old.find.apply(this, arguments);
    };

    socket.emit('find', 'todo', error => {
      assert.ok(!error);
      extend(service, old);
      done();
    });
  });

  describe('Service method calls', () => {
    describe('(\'method\', \'service\')  event format', () => {
      describe('Service', () => methodTests('todo', options));
      describe('Dynamic Service', () => methodTests('todo', options));
    });
  });

  describe('Service events', () => {
    describe('Service', () => eventTests('todo', options));
    describe('Dynamic Service', () => eventTests('tasks', options));
  });
});
