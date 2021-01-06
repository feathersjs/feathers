import assert from 'assert';
import feathers from '../../src';

describe('`after` hooks', () => {
  describe('function(hook)', () => {
    it('.after hooks can return a promise', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any) {
          return {
            id, description: `You have to do ${id}`
          };
        },

        async find () {
          return [];
        }
      });
      const service = app.service('dummy');

      service.hooks({
        after: {
          async get (hook: any) {
            hook.result.ran = true;
            return hook;
          },

          async find () {
            throw new Error('You can not see this');
          }
        }
      });

      const data = await service.get('laundry', {});

      assert.deepStrictEqual(data, {
        id: 'laundry',
        description: 'You have to do laundry',
        ran: true
      });

      await assert.rejects(() => service.find({}), {
        message: 'You can not see this'
      });
    });

    it('.after hooks do not need to return anything', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any) {
          return {
            id, description: `You have to do ${id}`
          };
        },

        async find () {
          return [];
        }
      });
      const service = app.service('dummy');

      service.hooks({
        after: {
          get (hook: any) {
            hook.result.ran = true;
          },

          find () {
            throw new Error('You can not see this');
          }
        }
      });

      const data = await service.get('laundry');

      assert.deepStrictEqual(data, {
        id: 'laundry',
        description: 'You have to do laundry',
        ran: true
      });

      await assert.rejects(() => service.find(), {
        message: 'You can not see this'
      });
    });
  });

  describe('function(hook, next)', () => {
    it('gets mixed into a service and modifies data', async () => {
      const dummyService = {
        async create (data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create (hook: any) {
            assert.strictEqual(hook.type, 'after');

            hook.result.some = 'thing';

            return hook;
          }
        }
      });

      const data = await service.create({ my: 'data' });

      assert.deepStrictEqual({ my: 'data', some: 'thing' }, data, 'Got modified data');
    });

    it('also makes the app available at hook.app', async () => {
      const dummyService = {
        async create (data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create (hook: any) {
            hook.result.appPresent = typeof hook.app !== 'undefined';
            assert.strictEqual(hook.result.appPresent, true);

            return hook;
          }
        }
      });

      const data = await service.create({ my: 'data' });

      assert.deepStrictEqual({ my: 'data', appPresent: true }, data, 'The app was present in the hook.');
    });

    it('returns errors', async () => {
      const dummyService = {
        async update (_id: any, data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          update () {
            throw new Error('This did not work');
          }
        }
      });

      await assert.rejects(() => service.update(1, { my: 'data' }), {
        message: 'This did not work'
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
          remove () {
            assert.ok(false, 'This should never get called');
          }
        }
      });

      await assert.rejects(() => service.remove(1, {}), {
        message: 'Error removing item'
      });
    });

    it('adds .after() and chains multiple hooks for the same method', async () => {
      const dummyService = {
        async create (data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create (hook: any) {
            hook.result.some = 'thing';

            return hook;
          }
        }
      });

      service.hooks({
        after: {
          create (hook: any) {
            hook.result.other = 'stuff';
          }
        }
      });

      const data = await service.create({ my: 'data' });

      assert.deepStrictEqual({
        my: 'data',
        some: 'thing',
        other: 'stuff'
      }, data, 'Got modified data');
    });

    it('chains multiple after hooks using array syntax', async () => {
      const dummyService = {
        async create (data: any) {
          return data;
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const service = app.service('dummy');

      service.hooks({
        after: {
          create: [
            function (hook: any) {
              hook.result.some = 'thing';

              return hook;
            },
            function (hook: any) {
              hook.result.other = 'stuff';

              return hook;
            }
          ]
        }
      });

      const data = await service.create({ my: 'data' });

      assert.deepStrictEqual({
        my: 'data',
        some: 'thing',
        other: 'stuff'
      }, data, 'Got modified data');
    });

    it('.after hooks run in the correct order (#13)', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any) {
          return { id };
        }
      });
      const service = app.service('dummy');

      service.hooks({
        after: {
          get (hook: any) {
            hook.result.items = ['first'];

            return hook;
          }
        }
      });

      service.hooks({
        after: {
          get: [
            function (hook: any) {
              hook.result.items.push('second');

              return hook;
            },
            function (hook: any) {
              hook.result.items.push('third');

              return hook;
            }
          ]
        }
      });

      const data = await service.get(10);

      assert.deepStrictEqual(data.items, ['first', 'second', 'third']);
    });

    it('after all hooks (#11)', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any) {
          const items: any[] = [];

          return { id, items };
        },

        async find () {
          return [];
        }
      });

      const service = app.service('dummy');

      service.hooks({
        after: {
          all (hook: any) {
            hook.result.afterAllObject = true;

            return hook;
          }
        }
      });

      service.hooks({
        after: [
          function (hook: any) {
            hook.result.afterAllMethodArray = true;

            return hook;
          }
        ]
      });

      let data = await service.find({});

      assert.ok(data.afterAllObject);
      assert.ok(data.afterAllMethodArray);

      data = await service.get(1, {});

      assert.ok(data.afterAllObject);
      assert.ok(data.afterAllMethodArray);
    });

    it('after hooks have service as context and keep it in service method (#17)', async () => {
      const app = feathers().use('/dummy', {
        number: 42,
        async get (id: any) {
          return {
            id,
            number: this.number
          };
        }
      });

      const service = app.service('dummy');

      service.hooks({
        after: {
          get (this: any, hook: any) {
            hook.result.test = this.number + 1;

            return hook;
          }
        }
      });

      const data = await service.get(10);

      assert.deepStrictEqual(data, {
        id: 10,
        number: 42,
        test: 43
      });
    });
  });
});
