import assert from 'assert';
import { hooks, NextFunction } from '@feathersjs/hooks';
import { HookContext, createContext, feathers, Id, Params } from '../../src';
import { groupBasicHooksByType } from '../../src/hooks/basic'

describe('hooks basics', () => {
  it('mix @feathersjs/hooks and .hooks', async () => {
    class SimpleService {
      async get (id: Id, params: Params) {
        return { id, chain: params.chain };
      }
    }

    hooks(SimpleService.prototype, [async (ctx: HookContext, next: NextFunction) => {
      ctx.params.chain.push('@hooks all before');
      await next();
      ctx.params.chain.push('@hooks all after');
    }]);

    hooks(SimpleService, {
      get: [async (ctx: HookContext, next: NextFunction) => {
        assert.ok(ctx.app);
        assert.ok(ctx.service);
        ctx.params.chain.push('@hooks get before');
        await next();
        ctx.params.chain.push('@hooks get after');
      }]
    });

    const app = feathers().use('/dummy', new SimpleService());
    const service = app.service('dummy');

    app.hooks([async function appHook (ctx: HookContext, next: NextFunction) {
      assert.ok(ctx.app);
      assert.ok(ctx.service);

      ctx.params.chain = [ 'app.hooks before'];
      await next();
      ctx.params.chain.push('app.hooks after');
    }]);

    app.hooks({
      before: [(ctx: HookContext) => {
        ctx.params.chain.push('app.hooks basic before');
      }],
      after: [(ctx: HookContext) => {
        ctx.params.chain.push('app.hooks basic after');
      }]
    });

    service.hooks({
      before: {
        get: (ctx: HookContext) => {
          ctx.params.chain.push('service.hooks basic before');
        }
      },
      after: {
        get: (ctx: HookContext) => {
          ctx.params.chain.push('service.hooks basic after');
        }
      }
    });

    service.hooks({
      get: [async (ctx: HookContext, next: NextFunction) => {
        ctx.params.chain.push('service.hooks get before');
        await next();
        ctx.params.chain.push('service.hooks get after');
      }]
    });

    service.hooks({
      before: {
        get: (ctx: HookContext) => {
          ctx.params.chain.push('service.hooks 2 basic before');
        }
      },
      after: {
        get: (ctx: HookContext) => {
          ctx.params.chain.push('service.hooks 2 basic after');
        }
      }
    });

    const { chain } = await service.get(1, {});

    assert.deepStrictEqual(chain, [
      'app.hooks before',
      'app.hooks basic before',
      '@hooks all before',
      '@hooks get before',
      'service.hooks get before',
      'service.hooks basic before',
      'service.hooks 2 basic before',
      'service.hooks basic after',
      'service.hooks 2 basic after',
      'service.hooks get after',
      '@hooks get after',
      '@hooks all after',
      'app.hooks basic after',
      'app.hooks after'
    ])
  });

  it('converts basic hooks grouped by method into grouped by type', async () => {
    const hooksByMethod = {
      find: { before: [1], after: [2], error: [3] },
      get: { before: [4], after: [5], error: [6] },
      create: { before: [7], after: [8], error: [9] },
      update: { before: [10], after: [11], error: [12] },
      patch: { before: [13], after: [14], error: [15] },
      remove: { before: [16], after: [17], error: [18] }
    }
    const hooksByType = groupBasicHooksByType(hooksByMethod)
    const expectedHooksByType = {
      before: {
        find: [1],
        get: [4],
        create: [7],
        update: [10],
        patch: [13],
        remove: [16]
      },
      after: {
        find: [2],
        get: [5],
        create: [8],
        update: [11],
        patch: [14],
        remove: [17]
      },
      error: {
        find: [3],
        get: [6],
        create: [9],
        update: [12],
        patch: [15],
        remove: [18]
      }
    }
    assert.deepStrictEqual(hooksByType, expectedHooksByType, 'should convert complete object')

    const hooksByMethod2 = {
      find: { before: [1], after: [2] },
      get: { after: [5], error: [6] },
      customMethod: { before: [7], error: [9] }
    }
    const hooksByType2 = groupBasicHooksByType(hooksByMethod2)
    const expectedHooksByType2 = {
      before: {
        find: [1],
        customMethod: [7]
      },
      after: {
        find: [2],
        get: [5]
      },
      error: {
        get: [6],
        customMethod: [9]
      }
    }
    assert.deepStrictEqual(hooksByType2, expectedHooksByType2, 'should handle missing values and custom methods')
  })

  it('supports basic hooks grouped by method', async () => {
    class SimpleService {
      async get (id: Id, params: Params) {
        return { id, chain: params.chain };
      }
    }

    const app = feathers().use('/dummy', new SimpleService());
    const service = app.service('dummy');

    service.hooks({
      get: {
        // @ts-ignore
        before: [
          (ctx: HookContext) => {
            ctx.params.chain = []
            ctx.params.chain.push('basic hook 1 before');
          }
        ],
        after: [
          (ctx: HookContext) => {
            ctx.params.chain.push('basic hook 1 after');
          }
        ]
      }
    });

    const { chain } = await service.get(1, {});

    assert.deepStrictEqual(chain, [
      'basic hook 1 before',
      'basic hook 1 after'
    ])
  })

  // it('validates arguments', async () => {
  //   const app = feathers().use('/dummy', {
  //     async get (id: any, params: any) {
  //       return { id, user: params.user };
  //     },

  //     async create (data: any) {
  //       return data;
  //     }
  //   });

  //   await assert.rejects(() => app.service('dummy').get(), {
  //     message: 'An id must be provided to the \'dummy.get\' method'
  //   });
  //   await assert.rejects(() => app.service('dummy').create(), {
  //     message: 'A data object must be provided to the \'dummy.create\' method'
  //   });
  // });

  it('works with services that return a promise (feathers-hooks#28)', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return { id, user: params.user };
      }
    });
    const service = app.service('dummy');

    service.hooks({
      before: {
        get (context) {
          context.params.user = 'David';
        }
      },
      after: {
        get (context) {
          context.result.after = true;
        }
      }
    });

    const data = await service.get(10);

    assert.deepStrictEqual(data, { id: 10, user: 'David', after: true });
  });

  it('has context.app, context.service and context.path', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any) {
        return { id };
      }
    });
    const service = app.service('dummy');

    service.hooks({
      before (context) {
        assert.strictEqual(this, service);
        assert.strictEqual(context.service, service);
        assert.strictEqual(context.app, app);
        assert.strictEqual(context.path, 'dummy');
      }
    });

    await service.get('test');
  });

  it('does not error when result is null', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any) {
        return { id };
      }
    });
    const service = app.service('dummy');

    service.hooks({
      after: {
        get: [
          function (context) {
            context.result = null;
            return context;
          }
        ]
      }
    });

    const result = await service.get(1);

    assert.strictEqual(result, null);
  });


  it('registering an already hooked service works (#154)', () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return { id, params };
      }
    });

    app.use('/dummy2', app.service('dummy'));
  });

  describe('returns the context when passing it as last parameter', () => {
    it('on normal method call', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any, params: any) {
          return { id, params };
        }
      });
      const service = app.service('dummy');
      const context = createContext(service, 'get');
      const returnedContext = await app.service('dummy').get(10, {}, context);

      assert.strictEqual(returnedContext.service, app.service('dummy'));
      assert.strictEqual(returnedContext.type, null);
      assert.strictEqual(returnedContext.path, 'dummy');
      assert.deepStrictEqual(returnedContext.result, {
        id: 10,
        params: {}
      });
    });

    it.skip('on error', async () => {
      const app = feathers().use('/dummy', {
        get () {
          throw new Error('Something went wrong');
        }
      });

      const service = app.service('dummy');
      const context = createContext(service, 'get');

      await assert.rejects(() => service.get(10, {}, context), {
        service: app.service('dummy'),
        type: null,
        path: 'dummy'
      });
    });

    // it('on argument validation error (https://github.com/feathersjs/express/issues/19)', async () => {
    //   const app = feathers().use('/dummy', {
    //     async get (id: string) {
    //       return { id };
    //     }
    //   });

    //   await assert.rejects(() => app.service('dummy').get(undefined, {}, true), context => {
    //     assert.strictEqual(context.service, app.service('dummy'));
    //     assert.strictEqual(context.type, 'error');
    //     assert.strictEqual(context.path, 'dummy');
    //     assert.strictEqual(context.error.message, 'An id must be provided to the \'dummy.get\' method');

    //     return true;
    //   });
    // });

    // it('on error in error hook (https://github.com/feathersjs/express/issues/21)', async () => {
    //   const app = feathers().use('/dummy', {
    //     async get () {
    //       throw new Error('Nope');
    //     }
    //   });

    //   app.service('dummy').hooks({
    //     error: {
    //       get () {
    //         throw new Error('Error in error hook');
    //       }
    //     }
    //   });

    //   await assert.rejects(() => app.service('dummy').get(10, {}, true), context => {
    //     assert.strictEqual(context.service, app.service('dummy'));
    //     assert.strictEqual(context.type, 'error');
    //     assert.strictEqual(context.path, 'dummy');
    //     assert.strictEqual(context.error.message, 'Error in error hook');

    //     return true;
    //   });
    // });

    it('still swallows error if context.result is set', async () => {
      const result = { message: 'this is a test' };
      const app = feathers().use('/dummy', {
        async get () {
          throw new Error('Something went wrong');
        }
      });

      app.service('dummy').hooks({
        error (context: any) {
          context.result = result;
        }
      });

      const service = app.service('dummy');
      const context = createContext(service, 'get');
      const returnedContext = await service.get(10, {}, context);

      assert.ok(returnedContext.error);
      assert.deepStrictEqual(returnedContext.result, result);
    });
  });

  it('can register hooks on a custom method, still adds hooks to default methods', async () => {
    class Dummy {
      async get (id: Id) {
        return { id };
      }

      async create (data: any) {
        return data;
      }

      async custom (data: any) {
        return data;
      }
    }

    const app = feathers<{
      dummy: Dummy
    }>().use('dummy', new Dummy(), {
      methods: [ 'get', 'custom' ]
    });

    app.service('dummy').hooks({
      custom: [async (context, next) => {
        context.data.fromHook = true;
        await next();
      }],
      create: [async (_context, next) => next()]
    });

    assert.deepStrictEqual(await app.service('dummy').custom({
      message: 'testing'
    }), {
      message: 'testing',
      fromHook: true
    });
  });

  it('normalizes params to object even when it is falsy (#1001)', async () => {
    const app = feathers().use('/dummy', {
      async get (id: Id, params: Params) {
        return { id, params };
      }
    });

    const result = await app.service('dummy').get('test', null);

    assert.deepStrictEqual(result, {
      id: 'test',
      params: {}
    });
  });
});
