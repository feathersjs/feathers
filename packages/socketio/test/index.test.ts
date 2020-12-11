import { strict as assert } from 'assert';
import feathers, { Application, HookContext, NullableId, Params } from '@feathersjs/feathers';
import express from '@feathersjs/express';
import { omit, extend } from 'lodash';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Server } from 'http';
import { Service } from '@feathersjs/tests/lib/fixture';
import { Socket } from 'socket.io-client';

import methodTests from './methods';
import eventTests from './events';
import socketio from '../src';
import { FeathersSocket, NextFunction } from '../src/middleware.js';

describe('@feathersjs/socketio', () => {
  let app: Application;
  let server: Server;
  let socket: Socket;

  const socketParams: any = {
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
    const errorHook = (hook: HookContext) => {
      if (hook.params.query.hookError) {
        throw new Error(`Error from ${hook.method}, ${hook.type} hook`);
      }
    };

    app = feathers()
      .configure(socketio(io => {
        io.use(function (socket: FeathersSocket, next: NextFunction) {
          socket.feathers.user = { name: 'David' };
          socketParams.headers = socket.feathers.headers;

          const { channel } = socket.handshake.query as any;

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

    server = app.listen(7886);
    server.once('listening', () => {
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

  it('runs io before setup (#131)', done => {
    let counter = 0;
    const app = feathers().configure(socketio(() => {
      assert.strictEqual(counter, 0);
      counter++;
    }));

    const srv: Server = app.listen(8887).on('listening', () => srv.close(done));
  });

  it('can set MaxListeners', done => {
    const app = feathers().configure(socketio(io =>
      io.sockets.setMaxListeners(100)
    ));

    const srv = app.listen(8987).on('listening', () => {
      assert.strictEqual((app as any).io.sockets.getMaxListeners(), 100);
      srv.close(done);
    });
  });

  it('expressified app works', done => {
    const data = { message: 'Hello world' };
    const app = express(feathers())
      .configure(socketio())
      .use('/test', (_req, res) => res.json(data));

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
    const application = feathers().configure(socketio({
      path: '/test/'
    }, ioInstance => assert.ok(ioInstance)));

    const srv = application.listen(8987).on('listening', async () => {
      const { status } = await axios('http://localhost:8987/test/socket.io.js');

      assert.strictEqual(status, 200);
      srv.close(done);
    });
  });

  it('passes handshake as service parameters', done => {
    const service = app.service('todo');
    const old = {
      create: service.create,
      update: service.update
    };

    service.create = function (_data: any, params: Params) {
      assert.deepStrictEqual(omit(params, 'query', 'route', 'connection'), socketParams, 'Passed handshake parameters');
      return old.create.apply(this, arguments);
    };

    service.update = function (_id: NullableId, _data: any, params: Params) {
      assert.deepStrictEqual(params, extend({
        route: {},
        connection: socketParams,
        query: {
          test: 'param'
        }
      }, socketParams), 'Passed handshake parameters as query');
      return old.update.apply(this, arguments);
    };

    socket.emit('create', 'todo', {}, (error: any) => {
      assert.ok(!error);

      socket.emit('update', 'todo', 1, {}, {
        test: 'param'
      }, (error: any) => {
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
    const service = app.service('todo');
    const old = { find: service.find };

    service.find = function (params: Params) {
      assert.deepStrictEqual(omit(params, 'query', 'route', 'connection'), socketParams, 'Handshake parameters passed on proper position');
      return old.find.apply(this, arguments);
    };

    socket.emit('find', 'todo', (error: any) => {
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
