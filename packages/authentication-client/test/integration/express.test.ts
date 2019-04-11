import axios from 'axios';
import feathers, { Application as FeathersApplication } from '@feathersjs/feathers';
import * as express from '@feathersjs/express';
import rest from '@feathersjs/rest-client';

import authClient from '../../src';
import getApp from './fixture';
import commonTests from './commons';

describe.only('@feathersjs/authentication-client Express integration', () => {
  let app: express.Application;
  let server: any;

  before(() => {
    const restApp = express.default(feathers())
      .use(express.json())
      .configure(express.rest())
      .use(express.parseAuthentication('jwt'));
    app = getApp(restApp as unknown as FeathersApplication) as express.Application;
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
