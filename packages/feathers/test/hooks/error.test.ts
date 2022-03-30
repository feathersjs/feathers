import assert from 'assert';
import { feathers, Application, FeathersService } from '../../src';

describe('`error` hooks', () => {
  describe('on direct service method errors', () => {
    const errorMessage = 'Something else went wrong';
    const app = feathers().use('/dummy', {
      async get () {
        throw new Error('Something went wrong');
      }
    });
    const service = app.service('dummy');

    afterEach(() => {
      (service as any).__hooks.error.get = undefined;
      (service as any).__hooks.hooks.get = [];
    });

    it('basic error hook', async () => {
      service.hooks({
        error: {
          get (context) {
            assert.strictEqual(context.type, 'error');
            assert.strictEqual(context.id, 'test');
            assert.strictEqual(context.method, 'get');
            assert.strictEqual(context.app, app);
            assert.strictEqual(context.error.message, 'Something went wrong');
          }
        }
      });

      await assert.rejects(() => service.get('test'), {
        message: 'Something went wrong'
      });
    });

    it('can change the error', async () => {
      service.hooks({
        error: {
          get (context) {
            context.error = new Error(errorMessage);
          }
        }
      });

      await assert.rejects(() => service.get('test'), {
        message: errorMessage
      });
    });

    it('throwing an error', async () => {
      service.hooks({
        error: {
          get () {
            throw new Error(errorMessage);
          }
        }
      });

      await assert.rejects(() => service.get('test'), {
        message: errorMessage
      });
    });

    it('rejecting a promise', async () => {
      service.hooks({
        error: {
          async get () {
            throw new Error(errorMessage);
          }
        }
      });

      await assert.rejects(() => service.get('test'), {
        message: errorMessage
      });
    });

    it('can chain multiple hooks', async () => {
      service.hooks({
        error: {
          get: [
            function (context) {
              context.error = new Error(errorMessage);
              context.error.first = true;
            },

            function (context) {
              context.error.second = true;

              return Promise.resolve(context);
            },

            function (context) {
              context.error.third = true;

              return context;
            }
          ]
        }
      });

      await assert.rejects(() => service.get('test'), {
        message: errorMessage,
        first: true,
        second: true,
        third: true
      });
    });

    it('setting `context.result` will return result', async () => {
      const data = {
        message: 'It worked'
      };

      service.hooks({
        error: {
          get (context) {
            context.result = data;
          }
        }
      });

      const result = await service.get(10);

      assert.deepStrictEqual(result, data);
    });

    it('allows to set `context.result = null` in error hooks (#865)', async () => {
      const app = feathers().use('/dummy', {
        async get () {
          throw new Error('Damnit');
        }
      });

      app.service('dummy').hooks({
        error: {
          get (context: any) {
            context.result = null;
          }
        }
      });

      const result = await app.service('dummy').get(1);

      assert.strictEqual(result, null);
    });

    it('uses the current hook object if thrown in a service method', async () => {
      const app = feathers().use('/dummy', {
        async get () {
          throw new Error('Something went wrong');
        }
      });
      const service = app.service('dummy');

      service.hooks({
        before (context) {
          context.id = 42;
        },
        error (context) {
          assert.strictEqual(context.id, 42);
        }
      });

      await assert.rejects(() => service.get(1), {
        message: 'Something went wrong'
      });
    });
  });

  describe('error in hooks', () => {
    const errorMessage = 'before hook broke';

    let app: Application;
    let service: FeathersService;

    beforeEach(() => {
      app = feathers().use('/dummy', {
        async get (id: any) {
          return {
            id,
            text: `You have to do ${id}`
          };
        }
      });

      service = app.service('dummy');
    });

    it('in before hook', async () => {
      service.hooks({
        before () {
          throw new Error(errorMessage);
        }
      }).hooks({
        error (context) {
          assert.strictEqual(context.original.type, 'before',
            'Original hook still set'
          );
          assert.strictEqual(context.id, 'dishes');
          assert.strictEqual(context.error.message, errorMessage);
        }
      });

      await assert.rejects(() => service.get('dishes'), {
        message: errorMessage
      });
    });

    it('in after hook', async () => {
      service.hooks({
        after () {
          throw new Error(errorMessage);
        },

        error (context) {
          assert.strictEqual(context.original.type, 'after',
            'Original hook still set'
          );
          assert.strictEqual(context.id, 'dishes');
          assert.deepStrictEqual(context.original.result, {
            id: 'dishes',
            text: 'You have to do dishes'
          });
          assert.strictEqual(context.error.message, errorMessage);
        }
      });

      await assert.rejects(() => service.get('dishes'), {
        message: errorMessage
      });
    });

    it('uses the current hook object if thrown in a hook and sets context.original', async () => {
      service.hooks({
        after (context) {
          context.modified = true;

          throw new Error(errorMessage);
        },

        error (context) {
          assert.ok(context.modified);
          assert.strictEqual(context.original.type, 'after');
        }
      });

      await assert.rejects(() => service.get('laundry'), {
        message: errorMessage
      });
    });
  });

  it('Error in before hook causes inter-service calls to have wrong hook context (#841)', async () => {
    const app = feathers();

    let service1Params: any;
    let service2Params: any;

    app.use('/service1', {
      async find () {
        return { message: 'service1 success' };
      }
    });

    app.service('service1').hooks({
      before (context: any) {
        service1Params = context.params;
        throw new Error('Error in service1 before hook');
      }
    });

    app.use('/service2', {
      async find () {
        await app.service('/service1').find({});

        return { message: 'service2 success' };
      }
    });

    app.service('service2').hooks({
      before (context: any) {
        service2Params = context.params;
        context.params.foo = 'bar';
      },
      error (context: any) {
        assert.ok(service1Params !== context.params);
        assert.ok(service2Params === context.params);
        assert.strictEqual(context.path, 'service2');
        assert.strictEqual(context.params.foo, 'bar');
      }
    });

    await assert.rejects(() => app.service('/service2').find(), {
      message: 'Error in service1 before hook'
    });
  });
});
