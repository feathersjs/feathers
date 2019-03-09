const feathers = require('@feathersjs/feathers');
const Primus = require('primus');
const Emitter = require('primus-emitter');
const primusClient = require('@feathersjs/primus-client');
const primus = require('@feathersjs/primus');

const authClient = require('../../lib');
const getApp = require('./fixture');
const commonTests = require('./commons');

const port = 8998;
const baseURL = `http://localhost:${port}`;
const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    'emitter': Emitter
  }
});

describe('@feathersjs/authentication-client Primus integration', () => {
  let app, server;

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
