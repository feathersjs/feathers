const fetch = require('node-fetch');
const assert = require('assert');
const feathers = require('feathers/client');
const errors = require('feathers-errors');
const baseTests = require('feathers-commons/lib/test/client');
const server = require('./server');
const rest = require('../lib/index');

describe('fetch REST connector', function () {
  const url = 'http://localhost:8889';
  const setup = rest(url).fetch(fetch);
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
    let headers = {
      'Authorization': 'let-me-in'
    };

    return service.get(0, { headers }).then(todo =>
      assert.deepEqual(todo, {
        id: 0,
        text: 'some todo',
        complete: false,
        query: {}
      })
    );
  });

  it('handles errors properly', () => {
    return service.get(-1, {}).catch(error =>
      assert.equal(error.code, 404)
    );
  });

  it('supports nested arrays in queries', () => {
    const query = { test: { $in: [ 0, 1, 2 ] } };

    return service.get(0, { query }).then(data =>
      assert.deepEqual(data.query, query)
    );
  });

  it('can initialize a client instance', () => {
    const init = rest(url).fetch(fetch);
    const todos = init.service('todos');

    assert.ok(todos instanceof init.Service, 'Returned service is a client');

    return todos.find({}).then(todos =>
      assert.deepEqual(todos, [
        {
          text: 'some todo',
          complete: false,
          id: 0
        }
      ])
    );
  });

  it('remove many', () => {
    return service.remove(null).then(todo => {
      assert.equal(todo.id, null);
      assert.equal(todo.text, 'deleted many');
    });
  });

  it('converts feathers errors (#50)', () => {
    return service.get(0, { query: { feathersError: true } }).catch(error => {
      assert.ok(error instanceof errors.NotAcceptable);
      assert.equal(error.message, 'This is a Feathers error');
      assert.equal(error.code, 406);
      assert.deepEqual(error.data, { data: true });
      assert.ok(error.response);
    });
  });

  it('returns null for 204 responses', () => {
    return service.remove(0, { query: { noContent: true } })
      .then(response =>
        assert.strictEqual(response, null)
      );
  });
});
