import assert from 'assert';
import feathers from 'feathers/client';
import baseTests from 'feathers-commons/lib/test/client';

import server from './server';
import primus from '../../src/client';

describe('feathers-primus/client', function () {
  const app = feathers().configure(primus({}, { timeout: 500 }));
  const service = app.service('todos');

  before(function (done) {
    this.server = server(primus => {
      service.connection = this.socket = new primus.Socket('http://localhost:12012');
    }).listen(12012);
    this.server.on('listening', () => done());
  });

  after(function (done) {
    this.socket.socket.close();
    this.server.close(done);
  });

  it('throws an error with no connection', function () {
    try {
      feathers().configure(primus());
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, 'Primus connection needs to be provided');
    }
  });

  it('app has the primus attribute', function () {
    assert.ok(app.primus);
  });

  it('throws an error when configured twice', function () {
    try {
      app.configure(primus({}));
      assert.ok(false, 'Should never get here');
    } catch (e) {
      assert.equal(e.message, 'Only one default client provider can be configured');
    }
  });

  it('can initialize a client instance', function (done) {
    const init = primus(service.connection);
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

  it('times out with error when using non-existent service', function (done) {
    const notMe = app.service('not-me');
    // Hack because we didn't set the connection at the beginning
    notMe.connection = this.socket;

    notMe.remove(1).catch(e => {
      assert.equal(e.message, 'Timeout of 500ms exceeded calling not-me::remove');
      done();
    }).catch(done);
  });

  baseTests(service);
});
