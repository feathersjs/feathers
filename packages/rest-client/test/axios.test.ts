import { strict as assert } from 'assert';

import axios from 'axios';
import { Server } from 'http';
import { feathers } from '@feathersjs/feathers';
import { clientTests } from '@feathersjs/tests';
import { NotAcceptable } from '@feathersjs/errors';

import createServer from './server';
import rest from '../src';

describe('Axios REST connector', function () {
  const url = 'http://localhost:8889';
  const setup = rest(url).axios(axios);
  const app = feathers().configure(setup);
  const service = app.service('todos');
  let server: Server;

  before(async () => {
    server = await createServer().listen(8889);
  });

  after(done => server.close(done));

  it('supports custom headers', async () => {
    const headers = {
      'Authorization': 'let-me-in'
    };

    const todo = await service.get(0, { headers });

    assert.deepStrictEqual(todo, {
      id: 0,
      authorization: 'let-me-in',
      text: 'some todo',
      complete: false,
      query: {}
    });
  });

  it('uses params.connection for additional options', async () => {
    const connection = {
      headers: {
        'Authorization': 'let-me-in'
      }
    };

    const todo = await service.get(0, { connection });

    assert.deepStrictEqual(todo, {
      id: 0,
      authorization: 'let-me-in',
      text: 'some todo',
      complete: false,
      query: {}
    });
  });

  it('can initialize a client instance', async () => {
    const init = rest(url).axios(axios);
    const todoService = init.service('todos');

    assert.ok(todoService instanceof init.Service, 'Returned service is a client');

    const todos = await todoService.find({});

    assert.deepStrictEqual(todos, [{
      text: 'some todo',
      complete: false,
      id: 0
    }]);
  });

  it('supports nested arrays in queries', async () => {
    const query = { test: { $in: [ '0', '1', '2' ] } };

    const data = await service.get(0, { query });

    assert.deepStrictEqual(data.query, query)
  });

  it('remove many', async () => {
    const todo: any = await service.remove(null);

    assert.strictEqual(todo.id, null);
    assert.strictEqual(todo.text, 'deleted many');
  });

  it('converts feathers errors (#50)', async () => {
    try {
      await service.get(0, { query: { feathersError: true } });
      assert.fail('Should never get here');
    } catch (error) {
      assert.ok(error instanceof NotAcceptable);
      assert.strictEqual(error.message, 'This is a Feathers error');
      assert.strictEqual(error.code, 406);
    }
  });

  it('ECONNREFUSED errors are serializable', async () => {
    const url = 'http://localhost:60000';
    const setup = rest(url).axios(axios);
    const app = feathers().configure(setup);

    try {
      await app.service('something').find();
      assert.fail('Should never get here');
    } catch(e) {
      const err = JSON.parse(JSON.stringify(e));

      assert.strictEqual(err.name, 'Unavailable');
      assert.strictEqual(err.message, 'connect ECONNREFUSED 127.0.0.1:60000');
      assert.ok(e.data.config);
    }
  });

  clientTests(service, 'todos');
});
