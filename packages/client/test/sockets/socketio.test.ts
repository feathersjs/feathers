import { io } from 'socket.io-client';
import socketio from '@feathersjs/socketio';
import { setupTests } from '@feathersjs/tests/src/client';

import * as feathers from '../../dist/feathers';
import app from '../fixture';

describe('Socket.io connector', function () {
  const socket = io('http://localhost:9988');
  const client = feathers.default()
    .configure(feathers.socketio(socket));

  before(function (done) {
    this.server = app(app => app.configure(socketio())).listen(9988, done);
  });

  after(function (done) {
    socket.once('disconnect', () => {
      this.server.close();
      done();
    });
    socket.disconnect();
  });

  setupTests(client, 'todos');
});
