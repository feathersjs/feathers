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

    afterEach(() => service.__hooks.error.get.pop());

    it('basic error hook', () => {
      service.hooks({
        error: {
          get (hook) {
            assert.equal(hook.type, 'error');
            assert.equal(hook.id, 'test');
            assert.equal(hook.method, 'get');
            assert.equal(hook.app, app);
            assert.equal(hook.error.message, 'Something went wrong');
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
        assert.equal(error.message, errorMessage);
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
        assert.equal(error.message, errorMessage);
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
        assert.equal(error.message, errorMessage);
      });
    });

    it('calling `next` with error', () => {
      service.hooks({
        error: {
          get (hook, next) {
            next(new Error(errorMessage));
          }
        }
      });

      return service.get('test').catch(error => {
        assert.equal(error.message, errorMessage);
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

            function (hook, next) {
              hook.error.third = true;

              next();
            }
          ]
        }
      });

      return service.get('test').catch(error => {
        assert.equal(error.message, errorMessage);
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
        .then(result => assert.deepEqual(result, data));
    });
  });

  describe('error in hooks', () => {
    const errorMessage = 'before hook broke';

    let app, service;

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
          assert.equal(hook.error.hook.type, 'before',
            'Original hook still set'
          );
          assert.equal(hook.id, 'dishes');
          assert.equal(hook.error.message, errorMessage);
        }
      });

      return service.get('dishes')
        .then(() => {
          throw new Error('Should never get here');
        })
        .catch(error => assert.equal(error.message, errorMessage));
    });

    it('in after hook', () => {
      service.hooks({
        after () {
          throw new Error(errorMessage);
        },

        error (hook) {
          assert.equal(hook.error.hook.type, 'after',
            'Original hook still set'
          );
          assert.equal(hook.id, 'dishes');
          assert.deepEqual(hook.original.result, {
            id: 'dishes',
            text: 'You have to do dishes'
          });
          assert.equal(hook.error.message, errorMessage);
        }
      });

      return service.get('dishes')
        .then(() => {
          throw new Error('Should never get here');
        })
        .catch(error => assert.equal(error.message, errorMessage));
    });

    it('uses the current hook object if thrown in a hook and sets hook.original', () => {
      service.hooks({
        after (hook) {
          hook.modified = true;

          throw new Error(errorMessage);
        },

        error (hook) {
          assert.ok(hook.modified);
          assert.equal(hook.original.type, 'after');
        }
      });

      return service.get('laundry')
        .then(() => {
          throw new Error('Should never get here');
        })
        .catch(error => assert.equal(error.message, errorMessage));
    });
  });
});
