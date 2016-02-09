import assert from 'assert';
import feathers from 'feathers/client';
import baseTests from 'feathers-commons/lib/test/client';

import server from './server';
import primus from '../client';

describe('feathers-primus/client', function() {
  const app = feathers().configure(primus({}));
  const service = app.service('todos');

  before(function(done) {
    this.server = server(primus => {
      service.connection = this.socket = new primus.Socket('http://localhost:12012');
    }).listen(12012);
    this.server.on('listening', () => done());
  });

  after(function(done) {
    this.socket.socket.close();
    this.server.close(done);
  });

  it('throws an error with no connection', () => {
    try {
      feathers().configure(primus());
      assert.ok(false);
    } catch(e) {
      assert.equal(e.message, 'Primus connection needs to be provided');
    }
  });

  it('app has the primus attribute', () => {
    assert.ok(app.primus);
  });

  baseTests(service);
});
