const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const baseTests = require('@feathersjs/commons/lib/test/client');

const server = require('./server');
const primus = require('../lib');

describe('feathers-primus/client', () => {
  let srv, socket;

  const app = feathers().configure(primus({}, { timeout: 500 }));
  const service = app.service('todos');

  before(done => {
    srv = server(primus => {
      service.connection = socket = new primus.Socket('http://localhost:12012');
    }).listen(12012);

    srv.on('listening', () => done());
  });

  after(done => {
    socket.socket.close();
    srv.close(done);
  });

  it('exports default', () => {
    assert.strictEqual(primus.default, primus);
  });

  it('throws an error with no connection', () => {
    try {
      feathers().configure(primus());
      assert.ok(false);
    } catch (e) {
      assert.strictEqual(e.message, 'Primus connection needs to be provided');
    }
  });

  it('app has the primus attribute', () => {
    assert.ok(app.primus);
  });

  it('throws an error when configured twice', () => {
    try {
      app.configure(primus({}));
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.strictEqual(e.message, 'Only one default client provider can be configured');
    }
  });

  it('can initialize a client instance', () => {
    const init = primus(service.connection);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');

    return todos.find().then(todos => assert.deepEqual(todos, [ // eslint-disable-line
      {
        text: 'some todo',
        complete: false,
        id: 0
      }
    ]));
  });

  it('times out with error when using non-existent service', () => {
    const notMe = app.service('not-me');
    // Hack because we didn't set the connection at the beginning
    notMe.connection = socket;

    return notMe.remove(1).catch(e => {
      assert.strictEqual(e.message, `Service 'not-me' not found`);
    });
  });

  baseTests(service);
});
