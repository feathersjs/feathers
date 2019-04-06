import io from 'socket.io-client';
import feathers, { Application } from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio';
import socketioClient from '@feathersjs/socketio-client';

import authClient from '../../src';
import getApp from './fixture';
import commonTests from './commons';

describe('@feathersjs/authentication-client Socket.io integration', () => {
  let app: Application;

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
