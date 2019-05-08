const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const { JSDOM } = require('jsdom');
const jquery = require('jquery');
const baseTests = require('@feathersjs/tests/lib//client');
const errors = require('@feathersjs/errors');
const server = require('./server');
const rest = require('../lib/index');

describe('jQuery REST connector', function () {
  const url = 'http://localhost:7676';
  const { window } = new JSDOM();
  const setup = rest(url).jquery(jquery(window));
  const app = feathers().configure(setup);
  const service = app.service('todos');

  before(function (done) {
    this.server = server().listen(7676);
    this.server.on('listening', () => done());
  });

  after(function () {
    this.server.close();
  });

  baseTests(service);

  it('supports custom headers', () => {
    let headers = {
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
      headers: {
        'Authorization': 'let-me-in'
      }
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
    const init = rest(url).jquery(service.connection);
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
        assert.deepStrictEqual(error.data, { data: true });
        assert.ok(error.response);
      });
  });
});
