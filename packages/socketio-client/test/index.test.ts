import { strict as assert } from 'assert';
import { Server } from 'http';
import feathers from '@feathersjs/feathers';
import io from 'socket.io-client';
import { setupTests } from '@feathersjs/tests/lib/client';

import { createServer } from './server';
import socketio from '../src';

describe('@feathersjs/socketio-client', () => {
  const app = feathers();

  let socket: SocketIOClient.Socket;
  let server: Server;

  before(done => {
    server = createServer().listen(9988);
    server.once('listening', () => {
      socket = io('http://localhost:9988');
      app.configure(socketio(socket));
      done();
    });
  });

  after(done => {
    socket.disconnect();
    server.close(done);
  });

  it('throws an error with no connection', () => {
    try {
      // @ts-ignore
      feathers().configure(socketio());
      assert.ok(false);
    } catch (e) {
      assert.strictEqual(e.message,
        'Socket.io connection needs to be provided'
      );
    }
  });

  it('app has the io attribute', () => {
    assert.ok((app as any).io);
  });

  it('throws an error when configured twice', () => {
    try {
      app.configure(socketio(socket));
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'Only one default client provider can be configured');
    }
  });

  it('can initialize a client instance', async () => {
    const init = socketio(socket);
    const totoService = init.service('todos');

    assert.ok(totoService instanceof init.Service, 'Returned service is a client');

    const todos = await totoService.find();

    assert.deepEqual(todos, [{
      text: 'some todo',
      complete: false,
      id: 0
    }]);
  });

  it('return 404 for non-existent service', async () => {
    try {
      await app.service('not-me').create({});
      assert.fail('Should never get here');
    } catch(e) {
      assert.strictEqual(e.message, 'Service \'not-me\' not found')
    }
  });

  setupTests(app, 'todos');
  setupTests(app, '/');
});
