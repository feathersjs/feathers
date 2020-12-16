import superagent from 'superagent';
import { setupTests } from '@feathersjs/tests/src/client';

import * as feathers from '../../dist/feathers';
import app from '../fixture';

describe('Superagent REST connector', function () {
  const rest = feathers.rest('http://localhost:8889');
  const client = feathers.default()
    .configure(rest.superagent(superagent));

  before(function (done) {
    this.server = app().listen(8889, done);
  });

  after(function (done) {
    this.server.close(done);
  });

  setupTests(client, 'todos');
});
