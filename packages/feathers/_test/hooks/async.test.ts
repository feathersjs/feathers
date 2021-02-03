import assert from 'assert';
import feathers from '../../src';

describe('`async` hooks', () => {
  describe('function([hook])', () => {
    it('hooks in chain can be replaced', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any) {
          return {
            id,
            description: `You have to do ${id}`
          };
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get: [
            function (hook: any) {
              return Object.assign({}, hook, {
                modified: true
              });
            },
            function (hook: any) {
              assert.ok(hook.modified);
            }
          ]
        }
      });

      await service.get('laundry');
    });

    it('.async hooks can return a promise', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any, params: any) {
          assert.ok(params.ran, 'Ran through promise hook');

          return {
            id,
            description: `You have to do ${id}`
          };
        },

        async remove () {
          assert.ok(false, 'Should never get here');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook: any) {
            return new Promise<void>(resolve => {
              hook.params.ran = true;
              resolve();
            });
          },

          async remove () {
            throw new Error('This did not work');
          }
        }
      });

      await service.get('dishes')

      assert.rejects(() => service.remove(10), {
        message: 'This did not work'
      });
    });

    it('.async hooks do not need to return anything', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any, params: any) {
          assert.ok(params.ran, 'Ran through promise hook');

          return {
            id,
            description: `You have to do ${id}`
          };
        },

        async remove () {
          assert.ok(false, 'Should never get here');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook: any) {
            hook.params.ran = true;
          },

          remove () {
            throw new Error('This did not work');
          }
        }
      });

      await service.get('dishes');
      await assert.rejects(() => service.remove(10), {
        message: 'This did not work'
      });
    });

    it('.async hooks can set hook.result which will skip service method', async () => {
      const app = feathers().use('/dummy', {
        async get () {
          assert.ok(false, 'This should never run');
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          async get (hook: any, next: any) {
            hook.result = {
              id: hook.id,
              message: 'Set from hook'
            };

            await next();
          }
        }
      });

      const data = await service.get(10, {});

      assert.deepStrictEqual(data, {
        id: 10,
        message: 'Set from hook'
      });
    });
  });

  describe('function(hook, next)', () => {
    it('gets mixed into a service and modifies data', async () => {
      const dummyService = {
        async create (data: any, params: any) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return data;
        }
      };
      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          create (hook: any, next: any) {
            assert.strictEqual(hook.type, 'before');

            hook.data.modified = 'data';

            Object.assign(hook.params, {
              modified: 'params'
            });

            return next();
          }
        }
      });

      const data = await service.create({ some: 'thing' });

      assert.deepStrictEqual(data, {
        some: 'thing',
        modified: 'data'
      }, 'Data got modified');
    });

    it('contains the app object at hook.app', async () => {
      const someServiceConfig = {
        async create (data: any) {
          return data;
        }
      };
      const app = feathers().use('/some-service', someServiceConfig);
      const someService = app.service('some-service');

      someService.hooks({
        async: {
          create (hook: any, next: any) {
            hook.data.appPresent = typeof hook.app !== 'undefined';
            assert.strictEqual(hook.data.appPresent, true);
            return next();
          }
        }
      });

      const data = await someService.create({ some: 'thing' });

      assert.deepStrictEqual(data, {
        some: 'thing',
        appPresent: true
      }, 'App object was present');
    });

    it('passes errors', async () => {
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

      await assert.rejects(() => service.update(1, {}), {
        message: 'You are not allowed to update'
      });
    });

    it('does not run after hook when there is an error', async () => {
      const dummyService = {
        async remove () {
          throw new Error('Error removing item');
        }
      };
      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          async remove (_context: any, next: any) {
            await next();

            assert.ok(false, 'This should never get called');
          }
        }
      });

      await assert.rejects(() => service.remove(1, {}), {
        message: 'Error removing item'
      });
    });

    it('calling back with no arguments uses the old ones', async () => {
      const dummyService = {
        remove (id: any, params: any) {
          assert.strictEqual(id, 1, 'Got id');
          assert.deepStrictEqual(params, { my: 'param' });

          return Promise.resolve({ id });
        }
      };
      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          remove (_hook: any, next: any) {
            next();
          }
        }
      });

      await service.remove(1, { my: 'param' });
    });

    it('adds .hooks() and chains multiple hooks for the same method', async () => {
      const dummyService = {
        create (data: any, params: any) {
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
          create (hook: any, next: any) {
            hook.params.modified = 'params';

            next();
          }
        }
      });

      service.hooks({
        async: {
          create (hook: any, next: any) {
            hook.data.modified = 'second data';

            next();
          }
        }
      });

      await service.create({ some: 'thing' });
    });

    it('chains multiple async hooks using array syntax', async () => {
      const dummyService = {
        async create (data: any, params: any) {
          assert.deepStrictEqual(data, {
            some: 'thing',
            modified: 'second data'
          }, 'Data modified');

          assert.deepStrictEqual(params, {
            modified: 'params'
          }, 'Params modified');

          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        async: {
          create: [
            function (hook: any, next: any) {
              hook.params.modified = 'params';

              next();
            },
            function (hook: any, next: any) {
              hook.data.modified = 'second data';

              next();
            }
          ]
        }
      });

      await service.create({ some: 'thing' });
    });

    it('.async hooks run in the correct order (#13)', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any, params: any) {
          assert.deepStrictEqual(params.items, ['first', 'second', 'third']);

          return {
            id,
            items: []
          };
        }
      });
      const service = app.service('dummy');

      service.hooks({
        async: {
          get (hook: any, next: any) {
            hook.params.items = ['first'];
            next();
          }
        }
      });

      service.hooks({
        async: {
          get: [
            function (hook: any, next: any) {
              hook.params.items.push('second');
              next();
            },
            function (hook: any, next: any) {
              hook.params.items.push('third');
              next();
            }
          ]
        }
      });

      await service.get(10);
    });

    it('async all hooks (#11)', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any, params: any) {
          assert.ok(params.asyncAllObject);
          assert.ok(params.asyncAllMethodArray);

          return {
            id,
            items: []
          };
        },

        async find (params: any) {
          assert.ok(params.asyncAllObject);
          assert.ok(params.asyncAllMethodArray);

          return [];
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          all (hook: any, next: any) {
            hook.params.asyncAllObject = true;
            next();
          }
        }
      });

      service.hooks({
        async: [
          function (hook: any, next: any) {
            hook.params.asyncAllMethodArray = true;
            next();
          }
        ]
      });

      await service.find();
    });

    it('async hooks have service as context and keep it in service method (#17)', async () => {
      const app = feathers().use('/dummy', {
        number: 42,
        async get (id: any, params: any) {
          return {
            id,
            number: (this as any).number,
            test: params.test
          };
        }
      });

      const service = app.service('dummy');

      service.hooks({
        async: {
          get (this: any, hook: any, next: any) {
            hook.params.test = this.number + 2;
            return next();
          }
        }
      });

      const data = await service.get(10);

      assert.deepStrictEqual(data, {
        id: 10,
        number: 42,
        test: 44
      });
    });

    it('calling next() multiple times does not do anything', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any) {
          return { id };
        }
      });
      const service = app.service('dummy');

      service.hooks({
        async: {
          get: [
            function (_hook: any, next: any) {
              return next();
            },

            function (_hook: any, next: any) {
              next();
              return next();
            }
          ]
        }
      });

      assert.rejects(() => service.get(10), {
        message: 'next() called multiple times'
      });
    });
  });
});
