const assert = require('assert');
const feathers = require('../../lib');

describe('`error` hooks', () => {
  describe('on direct service method errors', () => {
    const errorMessage = 'Something else went wrong';
    const app = feathers().use('/dummy', {
      get () {
        return Promise.reject(new Error('Something went wrong'));
      }
    });
    const service = app.service('dummy');

    afterEach(() => service.__hooks.error.get = []);

    it('basic error hook', () => {
      service.hooks({
        error: {
          get (hook) {
            assert.strictEqual(hook.type, 'error');
            assert.strictEqual(hook.id, 'test');
            assert.strictEqual(hook.method, 'get');
            assert.strictEqual(hook.app, app);
            assert.strictEqual(hook.error.message, 'Something went wrong');
          }
        }
      });

      return service.get('test').then(() => {
        throw new Error('Should never get here');
      }).catch(() => true);
    });

    it('can change the error', () => {
      service.hooks({
        error: {
          get (hook) {
            hook.error = new Error(errorMessage);
          }
        }
      });

      return service.get('test').catch(error => {
        assert.strictEqual(error.message, errorMessage);
      });
    });

    it('throwing an error', () => {
      service.hooks({
        error: {
          get () {
            throw new Error(errorMessage);
          }
        }
      });

      return service.get('test').catch(error => {
        assert.strictEqual(error.message, errorMessage);
      });
    });

    it('rejecting a promise', () => {
      service.hooks({
        error: {
          get () {
            return Promise.reject(new Error(errorMessage));
          }
        }
      });

      return service.get('test').catch(error => {
        assert.strictEqual(error.message, errorMessage);
      });
    });

    it('calling `next` with error', () => {
      service.hooks({
        error: {
          get () {
            throw new Error(errorMessage);
          }
        }
      });

      return service.get('test').catch(error => {
        assert.strictEqual(error.message, errorMessage);
      });
    });

    it('can chain multiple hooks', () => {
      service.hooks({
        error: {
          get: [
            function (hook) {
              hook.error = new Error(errorMessage);
              hook.error.first = true;
            },

            function (hook) {
              hook.error.second = true;

              return Promise.resolve(hook);
            },

            function (hook) {
              hook.error.third = true;

              return hook;
            }
          ]
        }
      });

      return service.get('test').catch(error => {
        assert.strictEqual(error.message, errorMessage);
        assert.ok(error.first);
        assert.ok(error.second);
        assert.ok(error.third);
      });
    });

    it('setting `hook.result` will return result', () => {
      const data = {
        message: 'It worked'
      };

      service.hooks({
        error: {
          get (hook) {
            hook.result = data;
          }
        }
      });

      return service.get(10)
        .then(result => assert.deepStrictEqual(result, data));
    });

    it('allows to set `context.result = null` in error hooks (#865)', () => {
      const app = feathers().use('/dummy', {
        get () {
          return Promise.reject(new Error('Damnit'));
        }
      });

      app.service('dummy').hooks({
        error: {
          get (context) {
            context.result = null;
          }
        }
      });

      return app.service('dummy').get(1)
        .then(result => assert.strictEqual(result, null));
    });

    it('uses the current hook object if thrown in a service method', () => {
      const app = feathers().use('/dummy', {
        get () {
          return Promise.reject(new Error('Something went wrong'));
        }
      });

      const service = app.service('dummy');

      service.hooks({
        before (hook) {
          return { ...hook, id: 42 };
        },
        error (hook) {
          assert.strictEqual(hook.id, 42);
        }
      });

      return service.get(1).then(
        () => assert.fail('Should never get here'),
        error => assert.strictEqual(error.message, 'Something went wrong')
      );
    });
  });

  describe('error in hooks', () => {
    const errorMessage = 'before hook broke';

    let app;
    let service;

    beforeEach(() => {
      app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({
            id, text: `You have to do ${id}`
          });
        }
      });

      service = app.service('dummy');
    });

    it('in before hook', () => {
      service.hooks({
        before () {
          throw new Error(errorMessage);
        }
      }).hooks({
        error (hook) {
          assert.strictEqual(hook.error.hook.type, 'before',
            'Original hook still set'
          );
          assert.strictEqual(hook.id, 'dishes');
          assert.strictEqual(hook.error.message, errorMessage);
        }
      });

      return service.get('dishes')
        .then(() => {
          throw new Error('Should never get here');
        })
        .catch(error => assert.strictEqual(error.message, errorMessage));
    });

    it('in after hook', () => {
      service.hooks({
        after () {
          throw new Error(errorMessage);
        },

        error (hook) {
          assert.strictEqual(hook.error.hook.type, 'after',
            'Original hook still set'
          );
          assert.strictEqual(hook.id, 'dishes');
          assert.deepStrictEqual(hook.original.result, {
            id: 'dishes',
            text: 'You have to do dishes'
          });
          assert.strictEqual(hook.error.message, errorMessage);
        }
      });

      return service.get('dishes')
        .then(() => {
          throw new Error('Should never get here');
        })
        .catch(error => assert.strictEqual(error.message, errorMessage));
    });

    it('uses the current hook object if thrown in a hook and sets hook.original', () => {
      service.hooks({
        after (hook) {
          hook.modified = true;

          throw new Error(errorMessage);
        },

        error (hook) {
          assert.ok(hook.modified);
          assert.strictEqual(hook.original.type, 'after');
        }
      });

      return service.get('laundry')
        .then(() => {
          throw new Error('Should never get here');
        })
        .catch(error => assert.strictEqual(error.message, errorMessage));
    });
  });

  it('Error in before hook causes inter-service calls to have wrong hook context (https://github.com/feathersjs/feathers/issues/841)', () => {
    const app = feathers();

    let service1Params;
    let service2Params;

    app.use('/service1', {
      find () {
        return Promise.resolve({ message: 'service1 success' });
      }
    });

    app.service('service1').hooks({
      before (context) {
        service1Params = context.params;
        return Promise.reject(new Error('Error in service1 before hook'));
      }
    });

    app.use('/service2', {
      find (params) {
        return app.service('/service1').find({}).then(() => {
          return { message: 'service2 success' };
        });
      }
    });

    app.service('service2').hooks({
      before (context) {
        service2Params = context.params;
        context.params.foo = 'bar';
      },
      error (context) {
        assert.ok(service1Params !== context.params);
        assert.ok(service2Params === context.params);
        assert.strictEqual(context.path, 'service2');
        assert.strictEqual(context.params.foo, 'bar');
      }
    });

    return app.service('/service2').find().catch(error => {
      assert.strictEqual(error.message, 'Error in service1 before hook');
    });
  });
});
