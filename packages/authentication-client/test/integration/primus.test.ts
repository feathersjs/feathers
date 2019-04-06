// @ts-ignore
import Primus from 'primus';
// @ts-ignore
import Emitter from 'primus-emitter';
import feathers, { Application } from '@feathersjs/feathers';
import primusClient from '@feathersjs/primus-client';
import primus from '@feathersjs/primus';

import authClient from '../../src';
import getApp from './fixture';
import commonTests from './commons';

const port = 8998;
const baseURL = `http://localhost:${port}`;
const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    emitter: Emitter
  }
});

describe('@feathersjs/authentication-client Primus integration', () => {
  let app: Application;
  let server: any;

  before(() => {
    app = getApp(feathers().configure(primus({
      transformer: 'websockets'
    })));

    server = app.listen(port);
  });

  after(() => server.close());

  commonTests(() => app, () => {
    return feathers()
      .configure(primusClient(new Socket(baseURL), { timeout: 1000 }))
      .configure(authClient());
  }, {
    email: 'primusauth@feathersjs.com',
    password: 'secrets',
    provider: 'primus'
  });
});
