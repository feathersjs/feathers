const assert = require('assert');
const feathers = require('../../lib');

describe('`after` hooks', () => {
  describe('function(hook)', () => {
    it('returning a non-hook object throws error', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });
      const service = app.service('dummy');

      service.hooks({
        after: {
          get () {
            return {};
          }
        }
      });

      return service.get(10).catch(e => {
        assert.equal(e.message, 'after hook for \'get\' method returned invalid hook object');
      });
    });

    it('.after hooks can return a promise', () => {
      const app = feathers().use('/dummy', {
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

      service.hooks({
        after: {
          get (hook) {
            hook.result.ran = true;
            return Promise.resolve(hook);
          },

          find () {
            return Promise.reject(new Error('You can not see this'));
          }
        }
      });

      return service.get('laundry', {}).then(data => {
        assert.deepEqual(data, {
          id: 'laundry',
          description: 'You have to do laundry',
          ran: true
        });

        return service.find({}).then(() => {
          throw new Error('Should never get here');
        }).catch(error => {
          assert.equal(error.message, 'You can not see this');
        });
      });
    });

    it('.after hooks do not need to return anything', () => {
      const app = feathers().use('/dummy', {
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

      service.hooks({
        after: {
          get (hook) {
            hook.result.ran = true;
          },

          find () {
            throw new Error('You can not see this');
          }
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
    it('gets mixed into a service and modifies data', () => {
      const dummyService = {
        create (data, params) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create (hook, next) {
            assert.equal(hook.type, 'after');

            hook.result.some = 'thing';

            next(null, hook);
          }
        }
      });

      return service.create({ my: 'data' }).then(data => {
        assert.deepEqual({ my: 'data', some: 'thing' }, data, 'Got modified data');
      });
    });

    it('also makes the app available at hook.app', () => {
      const dummyService = {
        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create (hook, next) {
            hook.result.appPresent = typeof hook.app !== 'undefined';
            assert.equal(hook.result.appPresent, true);

            next(null, hook);
          }
        }
      });

      return service.create({ my: 'data' }).then(data => {
        assert.deepEqual({ my: 'data', appPresent: true }, data, 'The app was present in the hook.');
      });
    });

    it('returns errors', () => {
      const dummyService = {
        update (id, data) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          update (hook, next) {
            next(new Error('This did not work'));
          }
        }
      });

      return service.update(1, { my: 'data' }).catch(error => {
        assert.ok(error, 'Got an error');
        assert.equal(error.message, 'This did not work', 'Got expected error message from hook');
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
          remove () {
            assert.ok(false, 'This should never get called');
          }
        }
      });

      return service.remove(1, {}).catch(error => {
        assert.ok(error, 'Got error');
        assert.equal(error.message, 'Error removing item', 'Got error message from service');
      });
    });

    it('adds .after() and chains multiple hooks for the same method', () => {
      const dummyService = {
        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create (hook, next) {
            hook.result.some = 'thing';
            next();
          }
        }
      });

      service.hooks({
        after: {
          create (hook, next) {
            hook.result.other = 'stuff';

            next();
          }
        }
      });

      service.create({ my: 'data' }).then(data => {
        assert.deepEqual({
          my: 'data',
          some: 'thing',
          other: 'stuff'
        }, data, 'Got modified data');
      });
    });

    it('chains multiple after hooks using array syntax', () => {
      const dummyService = {
        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
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
        }
      });

      return service.create({ my: 'data' }).then(data => {
        assert.deepEqual({
          my: 'data',
          some: 'thing',
          other: 'stuff'
        }, data, 'Got modified data');
      });
    });

    it('.after hooks run in the correct order (#13)', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        after: {
          get (hook, next) {
            hook.result.items = ['first'];
            next();
          }
        }
      });

      service.hooks({
        after: {
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
        }
      });

      service.get(10).then(data => {
        assert.deepEqual(data.items, ['first', 'second', 'third']);
      });
    });

    it('after all hooks (#11)', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({
            id: id,
            items: []
          });
        },

        find () {
          return Promise.resolve([]);
        }
      });

      const service = app.service('dummy');

      service.hooks({
        after: {
          all (hook, next) {
            hook.result.afterAllObject = true;
            next();
          }
        }
      });

      service.hooks({
        after: [
          function (hook, next) {
            hook.result.afterAllMethodArray = true;
            next();
          }
        ]
      });

      return service.find({}).then(data => {
        assert.ok(data.afterAllObject);
        assert.ok(data.afterAllMethodArray);

        return service.get(1, {}).then(data => {
          assert.ok(data.afterAllObject);
          assert.ok(data.afterAllMethodArray);
        });
      });
    });

    it('after hooks have service as context and keep it in service method (#17)', () => {
      const app = feathers().use('/dummy', {
        number: 42,
        get (id) {
          return Promise.resolve({
            id: id,
            number: this.number
          });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        after: {
          get (hook, next) {
            hook.result.test = this.number + 1;
            next();
          }
        }
      });

      service.get(10).then(data => {
        assert.deepEqual(data, {
          id: 10,
          number: 42,
          test: 43
        });
      });
    });

    it('can not call next() multiple times', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      const service = app.service('dummy');

      service.hooks({
        after: {
          get: [
            function (hook, next) {
              next();
            },

            function (hook, next) {
              next();
              next();
            }
          ]
        }
      });

      return service.get(10);
    });
  });
});
