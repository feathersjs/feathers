const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const io = require('socket.io-client');
const baseTests = require('@feathersjs/tests/lib//client');

const server = require('./server');
const socketio = require('../lib');

describe('@feathersjs/socketio-client', () => {
  const app = feathers();

  let socket;

  before(function (done) {
    this.server = server().listen(9988, () => {
      socket = io('http://localhost:9988');
      app.configure(socketio(socket));
      done();
    });
  });

  after(function (done) {
    socket.disconnect();
    this.server.close(done);
  });

  it('exports default', () =>
    assert.strictEqual(socketio.default, socketio)
  );

  it('throws an error with no connection', () => {
    try {
      feathers().configure(socketio());
      assert.ok(false);
    } catch (e) {
      assert.strictEqual(e.message,
        'Socket.io connection needs to be provided'
      );
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
      assert.strictEqual(e.message, 'Only one default client provider can be configured');
    }
  });

  it('can initialize a client instance', () => {
    const init = socketio(socket);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');

    return todos.find().then(todos => assert.deepStrictEqual(todos, [{
      text: 'some todo',
      complete: false,
      id: 0
    }]));
  });

  it('return 404 for non-existent service', () => {
    return app.service('not-me').create({}).catch(e =>
      assert.strictEqual(e.message, 'Service \'not-me\' not found')
    );
  });

  baseTests(app, 'todos');
  baseTests(app, '/');
});
