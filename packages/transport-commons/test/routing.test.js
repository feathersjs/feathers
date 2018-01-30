const assert = require('assert');
const feathers = require('@feathersjs/feathers');
const routing = require('../lib/routing');

describe('app.router', () => {
  let app;

  beforeEach(() => {
    app = feathers().configure(routing());

    app.use('/my/service', {
      get (id) {
        return Promise.resolve({ id });
      }
    });
  });

  it('has app.lookup and ROUTER symbol', () => {
    assert.equal(typeof app.lookup, 'function');
    assert.ok(app[routing.ROUTER]);
  });

  it('returns null when nothing is found', () => {
    const result = app.lookup('me/service');

    assert.equal(result, null);
  });

  it('can look up and strips slashes', () => {
    const result = app.lookup('my/service');

    assert.equal(result.service, app.service('/my/service'));
  });

  it('can look up with id', () => {
    const result = app.lookup('/my/service/1234');

    assert.equal(result.service, app.service('/my/service'));
    assert.deepEqual(result.params, {
      __id: '1234'
    });
  });

  it('can look up with params, id and special characters', () => {
    const path = '/test/:first/my/:second';

    app.use(path, {
      get (id) {
        return { id };
      }
    });

    const result = app.lookup('/test/me/my/::special/testing');

    assert.equal(result.service, app.service(path));
    assert.deepEqual(result.params, {
      __id: 'testing',
      first: 'me',
      second: '::special'
    });
  });
});
