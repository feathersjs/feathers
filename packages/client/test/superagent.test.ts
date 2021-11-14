import superagent from 'superagent';
import { clientTests } from '@feathersjs/tests';
import { Server } from 'http';

import * as feathers from '../dist/feathers';
import app from './fixture';

describe('Superagent REST connector', function () {
  let server: Server;
  const rest = feathers.rest('http://localhost:8889');
  const client = feathers.default()
    .configure(rest.superagent(superagent));

  before(async () => {
    server = await app().listen(8889);
  });

  after(function (done) {
    server.close(done);
  });

  clientTests(client, 'todos');
});
