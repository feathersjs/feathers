/* eslint-disable handle-callback-err */
import assert from 'assert';

import feathers from '../../src';
import hooks from '../../src/hooks';

describe('.before hooks', () => {
  describe('function([hook])', () => {
    it('returning a non-hook object throws error', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        },

        before: {
          get () {
            return {};
          }
        }
      });
      const service = app.service('dummy');

      return service.get(10).catch(e => {
        assert.equal(e.message, 'before hook for \'get\' method returned invalid hook object');
      });
    });

    it('hooks in chain can be replaced', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id) {
          return Promise.resolve({
            id, description: `You have to do ${id}`
          });
        }
      });

      const service = app.service('dummy').before({
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
      });

      return service.get('laundry');
    });

    it('.before hooks can return a promise', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
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

      const service = app.service('dummy').before({
        get: function (hook) {
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
      });

      return service.get('dishes').then(() => service.remove(10))
        .catch(error => {
          assert.equal(error.message, 'This did not work');
        });
    });

    it('.before hooks do not need to return anything', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
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

      const service = app.service('dummy').before({
        get: function (hook) {
          hook.params.ran = true;
        },

        remove () {
          throw new Error('This did not work');
        }
      });

      return service.get('dishes').then(() => service.remove(10))
        .catch(error => {
          assert.equal(error.message, 'This did not work');
        });
    });

    it('.before hooks can set hook.result which will skip service method', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id) {
          assert.ok(false, 'This should never run');
          return Promise.resolve({ id });
        }
      });

      const service = app.service('dummy');

      service.before({
        get (hook) {
          hook.result = {
            id: hook.id,
            message: 'Set from hook'
          };
        }
      });

      return service.get(10, {}).then(data => {
        assert.deepEqual(data, {
          id: 10,
          message: 'Set from hook'
        });
      });
    });
  });

  describe('function(hook, next)', () => {
    it('gets mixed into a service and modifies data', done => {
      const dummyService = {
        before: {
          create (hook, next) {
            assert.equal(hook.type, 'before');

            hook.data.modified = 'data';

            Object.assign(hook.params, {
              modified: 'params'
            });

            next(null, hook);
          }
        },

        create (data, params, callback) {
          assert.deepEqual(data, {
            some: 'thing',
            modified: 'data'
          }, 'Data modified');

          assert.deepEqual(params, {
            modified: 'params'
          }, 'Params modified');

          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.create({ some: 'thing' }, {}, (error, data) => {
        assert.ok(!error, 'No error');

        assert.deepEqual(data, {
          some: 'thing',
          modified: 'data'
        }, 'Data got modified');

        done();
      });
    });

    it('contains the app object at hook.app', done => {
      const someServiceConfig = {
        before: {
          create (hook, next) {
            hook.data.appPresent = typeof hook.app === 'function';
            assert.equal(hook.data.appPresent, true);
            next(null, hook);
          }
        },

        create (data, params, callback) {
          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/some-service', someServiceConfig);
      const someService = app.service('some-service');

      someService.create({ some: 'thing' }, {}, (error, data) => {
        assert.deepEqual(data, {
          some: 'thing',
          appPresent: true
        }, 'App object was present');

        done();
      });
    });

    it('passes errors', done => {
      const dummyService = {
        before: {
          update (hook, next) {
            next(new Error('You are not allowed to update'));
          }
        },

        update () {
          assert.ok(false, 'Never should be called');
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.update(1, {}, {}, error => {
        assert.ok(error, 'Got an error');
        assert.equal(error.message, 'You are not allowed to update', 'Got error message');
        done();
      });
    });

    it('calling back with no arguments uses the old ones', done => {
      const dummyService = {
        before: {
          remove (hook, next) {
            next();
          }
        },

        remove (id, params, callback) {
          assert.equal(id, 1, 'Got id');
          assert.deepEqual(params, { my: 'param' });
          callback();
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.remove(1, { my: 'param' }, done);
    });

    it('adds .before() and chains multiple hooks for the same method', done => {
      const dummyService = {
        create (data, params, callback) {
          assert.deepEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepEqual(params, {
            modified: 'params'
          }, 'Params modified');

          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.before({
        create (hook, next) {
          hook.params.modified = 'params';

          next();
        }
      });

      service.before({
        create (hook, next) {
          hook.data.modified = 'second data';

          next();
        }
      });

      service.create({ some: 'thing' }, {}, error => {
        assert.ok(!error, 'No error');
        done();
      });
    });

    it('chains multiple before hooks using array syntax', done => {
      const dummyService = {
        create (data, params, callback) {
          assert.deepEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepEqual(params, {
            modified: 'params'
          }, 'Params modified');

          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.before({
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
      });

      service.create({ some: 'thing' }, {}, error => {
        assert.ok(!error, 'No error');
        done();
      });
    });

    it('.before hooks run in the correct order (#13)', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id, params, callback) {
          assert.deepEqual(params.items, ['first', 'second', 'third']);
          callback(null, {
            id: id,
            items: []
          });
        }
      });

      const service = app.service('dummy');

      service.before({
        get (hook, next) {
          hook.params.items = ['first'];
          next();
        }
      });

      service.before({
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
      });

      service.get(10, {}, done);
    });

    it('before all hooks (#11)', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        before: {
          all (hook, next) {
            hook.params.beforeAllObject = true;
            next();
          }
        },

        get (id, params, callback) {
          assert.ok(params.beforeAllObject);
          assert.ok(params.beforeAllMethodArray);
          callback(null, {
            id: id,
            items: []
          });
        },

        find (params, callback) {
          assert.ok(params.beforeAllObject);
          assert.ok(params.beforeAllMethodArray);
          callback(null, []);
        }
      });

      const service = app.service('dummy');

      service.before([
        function (hook, next) {
          hook.params.beforeAllMethodArray = true;
          next();
        }
      ]);

      service.find({}, () => {
        service.get(1, {}, done);
      });
    });

    it('before hooks have service as context and keep it in service method (#17)', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        number: 42,
        get (id, params, callback) {
          callback(null, {
            id: id,
            number: this.number,
            test: params.test
          });
        }
      });

      const service = app.service('dummy');

      service.before({
        get (hook, next) {
          hook.params.test = this.number + 2;
          next();
        }
      });

      service.get(10, {}, (error, data) => {
        assert.deepEqual(data, {
          id: 10,
          number: 42,
          test: 44
        });
        done();
      });
    });

    it('calling next() multiple times does not do anything', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id, params, callback) {
          callback(null, { id });
        }
      });

      const service = app.service('dummy');

      service.before({
        get: [
          function (hook, next) {
            next();
          },

          function (hook, next) {
            next();
            next();
          }
        ]
      });

      return service.get(10).then(data => {
        assert.deepEqual(data, { id: 10 });
      });
    });
  });
});
