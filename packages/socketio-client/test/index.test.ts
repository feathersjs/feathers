import { strict as assert } from 'assert';
import { Server } from 'http';
import { CustomMethod, feathers } from '@feathersjs/feathers';
import { io, Socket } from 'socket.io-client';
import { clientTests } from '@feathersjs/tests';

import { createServer } from './server';
import socketio, { SocketService } from '../src';

type ServiceTypes = {
  '/': SocketService,
  'todos': SocketService & CustomMethod<'customMethod'>,
  [key: string]: any;
}

describe('@feathersjs/socketio-client', () => {
  const app = feathers<ServiceTypes>();

  let socket: Socket;
  let server: Server;

  before(done => {
    createServer().listen(9988).then(srv => {
      server = srv;
      server.once('listening', () => {
        socket = io('http://localhost:9988');
        app.configure(socketio(socket));
        done();
      });
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
      await app.service('not/me').create({});
      assert.fail('Should never get here');
    } catch(e) {
      assert.strictEqual(e.message, 'Service \'not/me\' not found')
    }
  });

  it('calls .customMethod', async () => {
    const service = app.service('todos').methods('customMethod');
    const result = await service.customMethod({ message: 'hi' });

    assert.deepStrictEqual(result, {
      data: { message: 'hi' },
      provider: 'socketio',
      type: 'customMethod'
    });
  });

  clientTests(app, 'todos');
  clientTests(app, '/');
});
