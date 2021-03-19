import fetch from 'node-fetch';
import { Server } from 'http';
import { setupTests } from '@feathersjs/tests/src/client';

import * as feathers from '../../dist/feathers';
import app from '../fixture';

describe('fetch REST connector', function () {
  let server: Server;
  const rest = feathers.rest('http://localhost:8889');
  const client = feathers.default()
    .configure(rest.fetch(fetch));

  before(async () => {
    server = await app().listen(8889);
  });

  after(function (done) {
    server.close(done);
  });

  setupTests(client, 'todos');
});
