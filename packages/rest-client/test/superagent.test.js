const assert = require('assert');
const superagent = require('superagent');
const feathers = require('@feathersjs/feathers');
const baseTests = require('@feathersjs/tests/lib//client');
const errors = require('@feathersjs/errors');
const server = require('./server');
const rest = require('../lib/index');

describe('Superagent REST connector', function () {
  const url = 'http://localhost:8889';
  const setup = rest(url).superagent(superagent);
  const app = feathers().configure(setup);
  const service = app.service('todos');

  before(function (done) {
    this.server = server().listen(8889, done);
  });

  after(function (done) {
    this.server.close(done);
  });

  baseTests(service);

  it('supports custom headers', () => {
    const headers = {
      'Authorization': 'let-me-in'
    };

    return service.get(0, { headers }).then(todo =>
      assert.deepStrictEqual(todo, {
        id: 0,
        authorization: 'let-me-in',
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('supports params.connection', () => {
    const connection = {
      'Authorization': 'let-me-in'
    };

    return service.get(0, { connection }).then(todo =>
      assert.deepStrictEqual(todo, {
        id: 0,
        authorization: 'let-me-in',
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('can initialize a client instance', () => {
    const init = rest(url).superagent(superagent);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');

    return todos.find({}).then(todos =>
      assert.deepStrictEqual(todos, [
        {
          text: 'some todo',
          complete: false,
          id: 0
        }
      ])
    );
  });

  it('supports nested arrays in queries', () => {
    const query = { test: { $in: [ '0', '1', '2' ] } };

    return service.get(0, { query }).then(data =>
      assert.deepStrictEqual(data.query, query)
    );
  });

  it('remove many', () => {
    return service.remove(null).then(todo => {
      assert.strictEqual(todo.id, null);
      assert.strictEqual(todo.text, 'deleted many');
    });
  });

  it('converts feathers errors (#50)', () => {
    return service.get(0, { query: { feathersError: true } })
      .catch(error => {
        assert.ok(error instanceof errors.NotAcceptable);
        assert.strictEqual(error.message, 'This is a Feathers error');
        assert.strictEqual(error.code, 406);
        assert.ok(error.response);
      });
  });
});
