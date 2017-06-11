/* eslint-disable handle-callback-err */
import assert from 'assert';

import feathers from '../../src';
import hooks from '../../src/hooks';

describe('.after hooks', () => {
  describe('function(hook)', () => {
    it('returning a non-hook object throws error', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        },

        after: {
          get () {
            return {};
          }
        }
      });
      const service = app.service('dummy');

      return service.get(10).catch(e => {
        assert.equal(e.message, 'after hook for \'get\' method returned invalid hook object');
      });
    });

    it('.after hooks can return a promise', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id) {
          return Promise.resolve({
            id: id,
            description: `You have to do ${id}`
          });
        },

        find () {
          return Promise.resolve([]);
        }
      });
      const service = app.service('dummy');

      service.after({
        get (hook) {
          hook.result.ran = true;
          return Promise.resolve(hook);
        },

        find () {
          return Promise.reject(new Error('You can not see this'));
        }
      });

      service.get('laundry', {}, (error, data) => {
        assert.deepEqual(data, {
          id: 'laundry',
          description: 'You have to do laundry',
          ran: true
        });
        service.find({}, error => {
          assert.equal(error.message, 'You can not see this');
          done();
        });
      });
    });

    it('.after hooks do not need to return anything', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id) {
          return Promise.resolve({
            id, description: `You have to do ${id}`
          });
        },

        find () {
          return Promise.resolve([]);
        }
      });
      const service = app.service('dummy');

      service.after({
        get (hook) {
          hook.result.ran = true;
        },

        find () {
          throw new Error('You can not see this');
        }
      });

      return service.get('laundry').then(data => {
        assert.deepEqual(data, {
          id: 'laundry',
          description: 'You have to do laundry',
          ran: true
        });

        return service.find().catch(error => {
          assert.equal(error.message, 'You can not see this');
        });
      });
    });
  });

  describe('function(hook, next)', () => {
    it('gets mixed into a service and modifies data', done => {
      const dummyService = {
        after: {
          create (hook, next) {
            assert.equal(hook.type, 'after');

            hook.result.some = 'thing';

            next(null, hook);
          }
        },

        create (data, params, callback) {
          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.create({ my: 'data' }, {}, (error, data) => {
        assert.deepEqual({ my: 'data', some: 'thing' }, data, 'Got modified data');
        done();
      });
    });

    it('also makes the app available at hook.app', done => {
      const dummyService = {
        after: {
          create (hook, next) {
            hook.result.appPresent = typeof hook.app === 'function';
            assert.equal(hook.result.appPresent, true);

            next(null, hook);
          }
        },

        create (data, params, callback) {
          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.create({ my: 'data' }, {}, (error, data) => {
        assert.deepEqual({ my: 'data', appPresent: true }, data, 'The app was present in the hook.');
        done();
      });
    });

    it('returns errors', done => {
      const dummyService = {
        after: {
          update (hook, next) {
            next(new Error('This did not work'));
          }
        },

        update (id, data, params, callback) {
          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.update(1, { my: 'data' }, {}, error => {
        assert.ok(error, 'Got an error');
        assert.equal(error.message, 'This did not work', 'Got expected error message from hook');
        done();
      });
    });

    it('does not run after hook when there is an error', done => {
      const dummyService = {
        after: {
          remove () {
            assert.ok(false, 'This should never get called');
          }
        },

        remove (id, params, callback) {
          callback(new Error('Error removing item'));
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.remove(1, {}, error => {
        assert.ok(error, 'Got error');
        assert.equal(error.message, 'Error removing item', 'Got error message from service');
        done();
      });
    });

    it('adds .after() and chains multiple hooks for the same method', done => {
      const dummyService = {
        create (data, params, callback) {
          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.after({
        create (hook, next) {
          hook.result.some = 'thing';
          next();
        }
      });

      service.after({
        create (hook, next) {
          hook.result.other = 'stuff';

          next();
        }
      });

      service.create({ my: 'data' }, {}, (error, data) => {
        assert.deepEqual({
          my: 'data',
          some: 'thing',
          other: 'stuff'
        }, data, 'Got modified data');
        done();
      });
    });

    it('chains multiple after hooks using array syntax', done => {
      const dummyService = {
        create (data, params, callback) {
          callback(null, data);
        }
      };

      const app = feathers().configure(hooks()).use('/dummy', dummyService);
      const service = app.service('dummy');

      service.after({
        create: [
          function (hook, next) {
            hook.result.some = 'thing';
            next();
          },
          function (hook, next) {
            hook.result.other = 'stuff';

            next();
          }
        ]
      });

      service.create({ my: 'data' }, {}, (error, data) => {
        assert.deepEqual({
          my: 'data',
          some: 'thing',
          other: 'stuff'
        }, data, 'Got modified data');
        done();
      });
    });

    it('.after hooks run in the correct order (#13)', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id, params, callback) {
          callback(null, { id });
        }
      });

      const service = app.service('dummy');

      service.after({
        get (hook, next) {
          hook.result.items = ['first'];
          next();
        }
      });

      service.after({
        get: [
          function (hook, next) {
            hook.result.items.push('second');
            next();
          },
          function (hook, next) {
            hook.result.items.push('third');
            next();
          }
        ]
      });

      service.get(10, {}, (error, data) => {
        assert.deepEqual(data.items, ['first', 'second', 'third']);
        done(error);
      });
    });

    it('after all hooks (#11)', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        after: {
          all (hook, next) {
            hook.result.afterAllObject = true;
            next();
          }
        },

        get (id, params, callback) {
          callback(null, {
            id: id,
            items: []
          });
        },

        find (params, callback) {
          callback(null, []);
        }
      });

      const service = app.service('dummy');

      service.after([
        function (hook, next) {
          hook.result.afterAllMethodArray = true;
          next();
        }
      ]);

      service.find({}, (error, data) => {
        assert.ok(data.afterAllObject);
        assert.ok(data.afterAllMethodArray);

        service.get(1, {}, (error, data) => {
          assert.ok(data.afterAllObject);
          assert.ok(data.afterAllMethodArray);
          done();
        });
      });
    });

    it('after hooks have service as context and keep it in service method (#17)', done => {
      const app = feathers().configure(hooks()).use('/dummy', {
        number: 42,
        get (id, params, callback) {
          callback(null, {
            id: id,
            number: this.number
          });
        }
      });

      const service = app.service('dummy');

      service.after({
        get (hook, next) {
          hook.result.test = this.number + 1;
          next();
        }
      });

      service.get(10, {}, (error, data) => {
        assert.deepEqual(data, {
          id: 10,
          number: 42,
          test: 43
        });
        done();
      });
    });

    it('can not call next() multiple times', () => {
      const app = feathers().configure(hooks()).use('/dummy', {
        get (id, params, callback) {
          callback(null, { id });
        }
      });

      const service = app.service('dummy');

      service.after({
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

      try {
        service.get(10);
      } catch (e) {
        assert.deepEqual(e.message, `next() called multiple times for hook on 'get' method`);
      }
    });
  });
});
