const assert = require('assert');
const feathers = require('../../lib');

describe('`async` hooks', () => {
  describe('function([hook])', () => {
    it('returning a non-hook object throws error', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });
      const service = app.service('dummy');

      service.hooks({
        async: {
          get () {
            return {};
          }
        }
      });

      return service.get(10).catch(e => {
        assert.strictEqual(e.message, 'async hook for \'get\' method returned invalid hook object');
      });
    });

    it('hooks in chain can be replaced', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({
            id, description: `You have to do ${id}`
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get: [
            function (hook) {
              return Object.assign({}, hook, {
                modified: true
              });
            },
            function (hook) {
              assert.ok(hook.modified);
            }
          ]
        }
      });

      return service.get('laundry');
    });

    it('.async hooks can return a promise', () => {
      const app = feathers().use('/dummy', {
        get (id, params) {
          assert.ok(params.ran, 'Ran through promise hook');

          return Promise.resolve({
            id: id,
            description: `You have to do ${id}`
          });
        },

        remove () {
          assert.ok(false, 'Should never get here');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook) {
            return new Promise(resolve => {
              hook.params.ran = true;
              resolve();
            });
          },

          remove () {
            return new Promise((resolve, reject) => {
              reject(new Error('This did not work'));
            });
          }
        }
      });

      return service.get('dishes').then(() => service.remove(10))
        .catch(error => {
          assert.strictEqual(error.message, 'This did not work');
        });
    });

    it('.async hooks do not need to return anything', () => {
      const app = feathers().use('/dummy', {
        get (id, params) {
          assert.ok(params.ran, 'Ran through promise hook');

          return Promise.resolve({
            id: id,
            description: `You have to do ${id}`
          });
        },

        remove () {
          assert.ok(false, 'Should never get here');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook) {
            hook.params.ran = true;
          },

          remove () {
            throw new Error('This did not work');
          }
        }
      });

      return service.get('dishes').then(() => service.remove(10))
        .catch(error => {
          assert.strictEqual(error.message, 'This did not work');
        });
    });

    it('.async hooks can set hook.result which will skip service method', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          assert.ok(false, 'This should never run');
          return Promise.resolve({ id });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          async get (hook, next) {
            hook.result = {
              id: hook.id,
              message: 'Set from hook'
            };

            await next();
          }
        }
      });

      return service.get(10, {}).then(data => {
        assert.deepStrictEqual(data, {
          id: 10,
          message: 'Set from hook'
        });
      });
    });
  });

  describe('function(hook, next)', () => {
    it('gets mixed into a service and modifies data', () => {
      const dummyService = {
        create (data, params) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          create (hook, next) {
            assert.strictEqual(hook.type, 'before');

            hook.data.modified = 'data';

            Object.assign(hook.params, {
              modified: 'params'
            });

            return next();
          }
        }
      });

      return service.create({ some: 'thing' }).then(data => {
        assert.deepStrictEqual(data, {
          some: 'thing',
          modified: 'data'
        }, 'Data got modified');
      });
    });

    it('contains the app object at hook.app', () => {
      const someServiceConfig = {
        create (data, params, callback) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/some-service', someServiceConfig);
      const someService = app.service('some-service');

      someService.hooks({
        async: {
          create (hook, next) {
            hook.data.appPresent = typeof hook.app !== 'undefined';
            assert.strictEqual(hook.data.appPresent, true);
            return next();
          }
        }
      });

      return someService.create({ some: 'thing' }).then(data => {
        assert.deepStrictEqual(data, {
          some: 'thing',
          appPresent: true
        }, 'App object was present');
      });
    });

    it('passes errors', () => {
      const dummyService = {
        update () {
          assert.ok(false, 'Never should be called');
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          update () {
            throw new Error('You are not allowed to update');
          }
        }
      });

      return service.update(1, {}).catch(error => {
        assert.ok(error, 'Got an error');
        assert.strictEqual(error.message, 'You are not allowed to update', 'Got error message');
      });
    });

    it('does not run after hook when there is an error', () => {
      const dummyService = {
        remove () {
          return Promise.reject(new Error('Error removing item'));
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          async remove (context, next) {
            await next();

            assert.ok(false, 'This should never get called');
          }
        }
      });

      return service.remove(1, {}).catch(error => {
        assert.ok(error, 'Got error');
        assert.strictEqual(error.message, 'Error removing item', 'Got error message from service');
      });
    });

    it('calling back with no arguments uses the old ones', () => {
      const dummyService = {
        remove (id, params) {
          assert.strictEqual(id, 1, 'Got id');
          assert.deepStrictEqual(params, { my: 'param' });

          return Promise.resolve({ id });
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          remove (hook, next) {
            next();
          }
        }
      });

      return service.remove(1, { my: 'param' });
    });

    it('adds .hooks() and chains multiple hooks for the same method', () => {
      const dummyService = {
        create (data, params) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          create (hook, next) {
            hook.params.modified = 'params';

            next();
          }
        }
      });

      service.hooks({
        async: {
          create (hook, next) {
            hook.data.modified = 'second data';

            next();
          }
        }
      });

      return service.create({ some: 'thing' });
    });

    it('chains multiple async hooks using array syntax', () => {
      const dummyService = {
        create (data, params) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          create: [
            function (hook, next) {
              hook.params.modified = 'params';

              next();
            },
            function (hook, next) {
              hook.data.modified = 'second data';

              next();
            }
          ]
        }
      });

      return service.create({ some: 'thing' });
    });

    it('.async hooks run in the correct order (#13)', () => {
      const app = feathers().use('/dummy', {
        get (id, params, callback) {
          assert.deepStrictEqual(params.items, ['first', 'second', 'third']);

          return Promise.resolve({
            id: id,
            items: []
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook, next) {
            hook.params.items = ['first'];
            next();
          }
        }
      });

      service.hooks({
        async: {
          get: [
            function (hook, next) {
              hook.params.items.push('second');
              next();
            },
            function (hook, next) {
              hook.params.items.push('third');
              next();
            }
          ]
        }
      });

      return service.get(10);
    });

    it('async all hooks (#11)', () => {
      const app = feathers().use('/dummy', {
        get (id, params) {
          assert.ok(params.asyncAllObject);
          assert.ok(params.asyncAllMethodArray);

          return Promise.resolve({
            id: id,
            items: []
          });
        },

        find (params) {
          assert.ok(params.asyncAllObject);
          assert.ok(params.asyncAllMethodArray);

          return Promise.resolve([]);
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          all (hook, next) {
            hook.params.asyncAllObject = true;
            next();
          }
        }
      });

      service.hooks({
        async: [
          function (hook, next) {
            hook.params.asyncAllMethodArray = true;
            next();
          }
        ]
      });

      return service.find();
    });

    it('async hooks have service as context and keep it in service method (#17)', () => {
      const app = feathers().use('/dummy', {
        number: 42,
        get (id, params) {
          return Promise.resolve({
            id: id,
            number: this.number,
            test: params.test
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook, next) {
            hook.params.test = this.number + 2;
            return next();
          }
        }
      });

      return service.get(10).then(data => {
        assert.deepStrictEqual(data, {
          id: 10,
          number: 42,
          test: 44
        });
      });
    });

    it('calling next() multiple times does not do anything', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get: [
            function (hook, next) {
              return next();
            },

            function (hook, next) {
              next();
              return next();
            }
          ]
        }
      });

      return service.get(10).catch(e => {
        assert.strictEqual(e.message, 'next() called multiple times');
      });
    });
  });
});
