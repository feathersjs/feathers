import assert from 'assert';
import feathers from 'feathers/client';
import io from 'socket.io-client';
import baseTests from 'feathers-commons/lib/test/client';

import server from './server';
import socketio from '../client';

describe('feathers-socketio/client', function() {
  const socket = io('http://localhost:9988');
  const app = feathers().configure(socketio(socket));
  const service = app.service('todos');

  before(function(done) {
    this.server = server().listen(9988, done);
  });

  after(function(done) {
    socket.disconnect();
    this.server.close(done);
  });

  it('throws an error with no connection', () => {
    try {
      feathers().configure(socketio());
      assert.ok(false);
    } catch(e) {
      assert.equal(e.message, 'Socket.io connection needs to be provided');
    }
  });

  it('app has the io attribute', () => {
    assert.ok(app.io);
  });

  baseTests(service);
});
