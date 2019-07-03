const assert = require('assert');
const feathers = require('../../lib');

describe('`finally` hooks', () => {
  it('runs after `after` hooks, app level last', () => {
    const app = feathers().use('/dummy', {
      get (id) {
        return Promise.resolve({ id });
      }
    });

    app.hooks({
      finally (hook) {
        hook.result.chain.push('app finally');
      }
    });

    const service = app.service('dummy');

    service.hooks({
      finally (hook) {
        hook.result.chain.push('service finally');
      },
      after (hook) {
        hook.result.chain = [ 'service after' ];
      }
    });

    return service.get(42).then(data => {
      assert.deepStrictEqual(data, {
        id: 42,
        chain: [ 'service after', 'service finally', 'app finally' ]
      });
    });
  });

  it('runs after `error` hooks, app level last', () => {
    const app = feathers().use('/dummy', {
      get (id) {
        return Promise.reject(new Error(`${id} is not the answer`));
      }
    });

    app.hooks({
      finally (hook) {
        hook.error.chain.push('app finally');
      }
    });

    const service = app.service('dummy');

    service.hooks({
      finally (hook) {
        hook.error.chain.push('service finally');
      }
    });

    service.hooks({
      error (hook) {
        hook.error.chain = [ 'service error' ];
      }
    });

    return service.get(42).then(
      () => assert(false, 'Should never get here'),
      error => {
        assert.deepStrictEqual(error.chain, [
          'service error',
          'service finally',
          'app finally'
        ]);
        assert.deepStrictEqual(error.message, '42 is not the answer');
      }
    );
  });

  it('runs once, sets error if throws', () => {
    const app = feathers().use('/dummy', {
      get (id) {
        return Promise.resolve({ id });
      }
    });

    const service = app.service('dummy');

    let count = 0;

    service.hooks({
      error (hook) {
        assert.fail('Should never get here (error hook)');
      },
      finally: [
        function (hook) {
          assert.strictEqual(++count, 1, 'This should be called only once');
          throw new Error('This did not work');
        },
        function (hook) {
          assert.fail('Should never get here (second finally hook)');
        }
      ]
    });

    return service.get(42).then(
      () => assert.fail('Should never get here (result resolve)'),
      error => assert.strictEqual(error.message, 'This did not work')
    );
  });
});
