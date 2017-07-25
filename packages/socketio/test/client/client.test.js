const assert = require('assert');
const feathers = require('feathers/client');
const io = require('socket.io-client');
const baseTests = require('feathers-commons/lib/test/client');
const server = require('./server');
const socketio = require('../../lib/client');

describe('feathers-socketio/client', function () {
  const socket = io('http://localhost:9988');
  const app = feathers().configure(socketio(socket, { timeout: 500 }));
  const service = app.service('todos');

  before(function (done) {
    this.server = server().listen(9988, done);
  });

  after(function (done) {
    socket.disconnect();
    this.server.close(done);
  });

  it('throws an error with no connection', () => {
    try {
      feathers().configure(socketio());
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, 'Socket.io connection needs to be provided');
    }
  });

  it('app has the io attribute', () => {
    assert.ok(app.io);
  });

  it('throws an error when configured twice', () => {
    try {
      app.configure(socketio(socket));
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.equal(e.message, 'Only one default client provider can be configured');
    }
  });

  it('can initialize a client instance', done => {
    const init = socketio(socket);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');
    todos.find({}).then(todos => assert.deepEqual(todos, [
      {
        text: 'some todo',
        complete: false,
        id: 0
      }
    ])).then(() => done()).catch(done);
  });

  it('times out with error when using non-existent service', done => {
    app.service('not-me').create({}).catch(e => {
      assert.equal(e.message, 'Timeout of 500ms exceeded calling not-me::create');
      done();
    });
  });

  baseTests(service);
});
