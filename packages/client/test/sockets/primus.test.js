const primus = require('@feathersjs/primus');
const baseTests = require('@feathersjs/commons/lib/test/client');

const app = require('../fixture');
const feathers = require('../../');

describe('Primus connector', function () {
  const client = feathers();

  let socket;

  before(function (done) {
    this.server = app(function () {
      this.configure(primus({
        transformer: 'websockets'
      }, function (primus) {
        socket = new primus.Socket('http://localhost:12012');
        client.configure(feathers.primus(socket));
      }));
    }).listen(12012, done);
  });

  after(function () {
    socket.socket.close();
    this.server.close();
  });

  baseTests(client, 'todos');
});
