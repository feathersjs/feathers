const io = require('socket.io-client');
const feathers = require('@feathersjs/feathers');
const socketio = require('@feathersjs/socketio');
const socketioClient = require('@feathersjs/socketio-client');

const authClient = require('../../lib');
const getApp = require('./fixture');
const commonTests = require('./commons');

describe('@feathersjs/authentication-client Socket.io integration', () => {
  let app;

  before(() => {
    app = getApp(feathers().configure(socketio()));

    app.listen(9777);
  });

  after(done => app.io.close(() => done()));

  commonTests(() => app, () => {
    return feathers()
      .configure(socketioClient(io('http://localhost:9777')))
      .configure(authClient());
  }, {
    email: 'socketioauth@feathersjs.com',
    password: 'secretive',
    provider: 'socketio'
  });
});
