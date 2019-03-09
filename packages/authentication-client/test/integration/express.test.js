const axios = require('axios');
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const rest = require('@feathersjs/rest-client');

const authClient = require('../../lib');
const getApp = require('./fixture');
const commonTests = require('./commons');

describe('@feathersjs/authentication-client Express integration', () => {
  let app, server;

  before(() => {
    const restApp = express(feathers())
      .use(express.json())
      .configure(express.rest())
      .use(express.parseAuthentication('jwt'));
    app = getApp(restApp);
    app.use(express.errorHandler());

    server = app.listen(9776);
  });

  after(done => server.close(() => done()));

  commonTests(() => app, () => {
    return feathers()
      .configure(rest('http://localhost:9776').axios(axios))
      .configure(authClient());
  }, {
    email: 'expressauth@feathersjs.com',
    password: 'secret',
    provider: 'rest'
  });
});
