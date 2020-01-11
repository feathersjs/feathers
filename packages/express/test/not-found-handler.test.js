const { strict: assert } = require('assert');
const errors = require('@feathersjs/errors');

const handler = require('../lib/not-found-handler');

describe('not-found-handler', () => {
  it('is CommonJS compatible', () => {
    assert.equal(typeof require('../lib/not-found-handler'), 'function');
  });

  it('is import compatible', () => {
    assert.equal(typeof handler, 'function');
  });

  it('returns NotFound error', done => {
    handler()({
      url: 'some/where',
      headers: {}
    }, {}, function (error) {
      assert.ok(error instanceof errors.NotFound);
      assert.equal(error.message, 'Page not found');
      assert.deepEqual(error.data, {
        url: 'some/where'
      });
      done();
    });
  });

  it('returns NotFound error with URL when verbose', done => {
    handler({ verbose: true })({
      url: 'some/where',
      headers: {}
    }, {}, function (error) {
      assert.ok(error instanceof errors.NotFound);
      assert.equal(error.message, 'Page not found: some/where');
      assert.deepEqual(error.data, {
        url: 'some/where'
      });
      done();
    });
  });
});
