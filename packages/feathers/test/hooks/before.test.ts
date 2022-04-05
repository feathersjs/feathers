import assert from 'assert';
import { feathers, Params, ServiceInterface } from '../../src';

describe('`before` hooks', () => {
  it('.before hooks can return a promise', async () => {
    interface DummyParams extends Params {
      ran: boolean;
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

    const app = feathers<{ dummy: DummyService }>().use('dummy', {
      async get (id: any, params: DummyParams) {
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
      before: {
        get (context) {
          return new Promise<void>(resolve => {
            context.params.ran = true;
            resolve();
          });
        },

        remove () {
          return new Promise((_resolve, reject) => {
            reject(new Error('This did not work'));
          });
        }
      }
    });

    await service.get('dishes')
    await assert.rejects(() => service.remove(10), {
      message: 'This did not work'
    });
  });

  it('.before hooks do not need to return anything', async () => {
    interface DummyParams extends Params {
      ran: boolean;
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

    const app = feathers<{ dummy: DummyService }>().use('dummy', {
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
      before: {
        get (context) {
          context.params.ran = true;
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

  it('.before hooks can set context.result which will skip service method', async () => {
    const app = feathers().use('/dummy', {
      async get () {
        assert.ok(false, 'This should never run');
      }
    });
    const service = app.service('dummy');

    service.hooks({
      before: {
        get (context) {
          context.result = {
            id: context.id,
            message: 'Set from hook'
          };
        }
      }
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
      before: {
        create (context) {
          assert.strictEqual(context.type, 'before');

          context.data.modified = 'data';

          Object.assign(context.params, {
            modified: 'params'
          });

          return context;
        }
      }
    });

    const data = await service.create({ some: 'thing' });

    assert.deepStrictEqual(data, {
      some: 'thing',
      modified: 'data'
    }, 'Data got modified');
  });

  it('contains the app object at context.app', async () => {
    const someServiceConfig = {
      async create (data: any) {
        return data;
      }
    };
    const app = feathers().use('/some-service', someServiceConfig);
    const someService = app.service('some-service');

    someService.hooks({
      before: {
        create (context) {
          context.data.appPresent = typeof context.app !== 'undefined';
          assert.strictEqual(context.data.appPresent, true);

          return context;
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
      before: {
        update () {
          throw new Error('You are not allowed to update');
        }
      }
    });

    await assert.rejects(() => service.update(1, {}), {
      message: 'You are not allowed to update'
    });
  });

  it('calling back with no arguments uses the old ones', async () => {
    interface DummyParams extends Params {
      my: string;
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

    const dummyService = {
      async remove (id: any, params: any) {
        assert.strictEqual(id, 1, 'Got id');
        assert.deepStrictEqual(params, { my: 'param' });

        return { id };
      }
    };
    const app = feathers<{ dummy: DummyService }>().use('dummy', dummyService);
    const service = app.service('dummy');

    service.hooks({
      before: {
        remove (context) {
          return context;
        }
      }
    });

    await service.remove(1, { my: 'param' });
  });

  it('adds .hooks() and chains multiple hooks for the same method', async () => {
    interface DummyParams extends Params {
      modified: string;
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

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
    const app = feathers<{ dummy: DummyService }>().use('dummy', dummyService);
    const service = app.service('dummy');

    service.hooks({
      before: {
        create (context) {
          context.params.modified = 'params';

          return context;
        }
      }
    });

    service.hooks({
      before: {
        create (context) {
          context.data.modified = 'second data';

          return context;
        }
      }
    });

    await service.create({ some: 'thing' });
  });

  it('chains multiple before hooks using array syntax', async () => {
    interface DummyParams extends Params {
      modified: string;
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

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

    const app = feathers<{ dummy: DummyService }>().use('dummy', dummyService);
    const service = app.service('dummy');

    service.hooks({
      before: {
        create: [
          function (context) {
            context.params.modified = 'params';

            return context;
          },
          function (context) {
            context.data.modified = 'second data';

            return context;
          }
        ]
      }
    });

    await service.create({ some: 'thing' });
  });

  it('.before hooks run in the correct order (#13)', async () => {
    interface DummyParams extends Params {
      items: string[];
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

    const app = feathers<{ dummy: DummyService }>().use('dummy', {
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
      before: {
        get (context) {
          context.params.items = ['first'];

          return context;
        }
      }
    });

    service.hooks({
      before: {
        get: [
          function (context) {
            context.params.items.push('second');

            return context;
          },
          function (context) {
            context.params.items.push('third');

            return context;
          }
        ]
      }
    });

    await service.get(10);
  });

  it('before all hooks (#11)', async () => {
    interface DummyParams extends Params {
      beforeAllObject: boolean;
      beforeAllMethodArray: boolean;
    }

    type DummyService = ServiceInterface<any, any, DummyParams>;

    const app = feathers<{ dummy: DummyService }>().use('dummy', {
      async get (id: any, params: any) {
        assert.ok(params.beforeAllObject);
        assert.ok(params.beforeAllMethodArray);

        return {
          id,
          items: []
        };
      },

      async find (params: any) {
        assert.ok(params.beforeAllObject);
        assert.ok(params.beforeAllMethodArray);

        return [];
      }
    });

    const service = app.service('dummy');

    service.hooks({
      before: {
        all (context) {
          context.params.beforeAllObject = true;

          return context;
        }
      }
    });

    service.hooks({
      before: [
        function (context) {
          context.params.beforeAllMethodArray = true;

          return context;
        }
      ]
    });

    await service.find();
  });

  it('before hooks have service as context and keep it in service method (#17)', async () => {
    interface DummyParams extends Params {
      test: number;
    }

    class Dummy implements ServiceInterface<any, any, DummyParams> {
      number = 42;

      async get (id: any, params?: DummyParams) {
        return {
          id,
          number: this.number,
          test: params.test
        };
      }
    }

    const app = feathers<{ dummy: Dummy }>().use('dummy', new Dummy());
    const service = app.service('dummy');

    service.hooks({
      before: {
        get (this: any, context) {
          context.params.test = this.number + 2;

          return context;
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
});
