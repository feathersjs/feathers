import feathers from 'feathers/client';
import baseTests from 'feathers-commons/lib/test/client';

import server from './sub-app';
import primus from '../client';

describe('Sub Apps', function () {
  const app = feathers().configure(primus({}, { timeout: 500 }));
  const v1Service = app.service('api/v1/todos');
  const v2Service = app.service('api/v2/todos');

  before(function (done) {
    this.server = server(primus => {
      const connection = this.socket = new primus.Socket('http://localhost:14014');
      v1Service.connection = connection;
      v2Service.connection = connection;
    }).listen(14014);

    this.server.on('listening', done);
  });

  after(function (done) {
    this.socket.socket.close();
    this.server.close(done);
  });

  describe('First Sub App', () => {
    baseTests(v1Service);
  });

  describe('Second Sub App', () => {
    baseTests(v2Service);
  });
});
