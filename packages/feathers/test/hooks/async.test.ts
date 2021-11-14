import assert from 'assert';
import { feathers } from '../../src';

describe('`async` hooks', () => {
  it('async hooks can set hook.result which will skip service method', async () => {
    const app = feathers().use('/dummy', {
      async get () {
        assert.ok(false, 'This should never run');
      }
    });
    const service = app.service('dummy');

    service.hooks({
      get: [async (hook, next) => {
        hook.result = {
          id: hook.id,
          message: 'Set from hook'
        };

        await next();
      }]
    });

    const data = await service.get(10, {});

    assert.deepStrictEqual(data, {
      id: 10,
      message: 'Set from hook'
    });
  });

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
      create: [async (hook, next) => {
        assert.strictEqual(hook.type, null);

        hook.data.modified = 'data';

        Object.assign(hook.params, {
          modified: 'params'
        });

        await next();
      }]
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
      create: [async (hook, next) => {
        hook.data.appPresent = typeof hook.app !== 'undefined';
        assert.strictEqual(hook.data.appPresent, true);
        return next();
      }]
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
      update: [async () => {
        throw new Error('You are not allowed to update');
      }]
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
      remove: [async (_context, next) => {
        await next();

        assert.ok(false, 'This should never get called');
      }]
    });

    await assert.rejects(() => service.remove(1, {}), {
      message: 'Error removing item'
    });
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
      create: [async (hook, next) => {
        hook.params.modified = 'params';

        await next();
      }, async (hook, next) => {
        hook.data.modified = 'second data';

        next();
      }]
    });

    await service.create({ some: 'thing' });
  });

  it('async hooks run in the correct order', async () => {
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
      get: [async (hook, next) => {
        hook.params.items = ['first'];
        await next();
      }]
    });

    service.hooks({
      get: [
        async function (hook, next) {
          hook.params.items.push('second');
          next();
        },
        async function (hook, next) {
          hook.params.items.push('third');
          next();
        }
      ]
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

    service.hooks([
      async (hook, next) => {
        hook.params.asyncAllObject = true;
        next();
      }
    ]);

    service.hooks([
      async function (hook, next) {
        hook.params.asyncAllMethodArray = true;
        next();
      }
    ]);

    await service.find();
  });

  it('async hooks have service as context and keep it in service method (#17)', async () => {
    class Dummy {
      number= 42;

      async get (id: any, params: any) {
        return {
          id,
          number: (this as any).number,
          test: params.test
        };
      }
    }

    const app = feathers().use('/dummy', new Dummy());

    const service = app.service('dummy');

    service.hooks({
      get: [async function (this: any, hook, next) {
        hook.params.test = this.number + 2;

        await next();
      }]
    });

    const data = await service.get(10);

    assert.deepStrictEqual(data, {
      id: 10,
      number: 42,
      test: 44
    });
  });
});
