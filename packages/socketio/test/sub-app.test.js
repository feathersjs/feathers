const feathers = require('feathers/client');
const io = require('socket.io-client');
const baseTests = require('feathers-commons/lib/test/client');
const server = require('./sub-app');
const socketio = require('../client');

describe('Sub Apps', function () {
  const socket = io('http://localhost:6060');
  const app = feathers().configure(socketio(socket));
  const v1Service = app.service('api/v1/todos');
  const v2Service = app.service('api/v2/todos');

  before(function (done) {
    this.server = server().listen(6060, done);
  });

  after(function (done) {
    socket.disconnect();
    this.server.close(done);
  });

  describe('First Sub App', () => {
    baseTests(v1Service);
  });

  describe('Second Sub App', () => {
    baseTests(v2Service);
  });
});
