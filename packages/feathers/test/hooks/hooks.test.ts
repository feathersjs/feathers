import assert from 'assert';
import { hooks } from '@feathersjs/hooks';
import feathers, { activateHooks, Id } from '../../src';

describe('hooks basics', () => {
  it('mix @feathersjs/hooks and .hooks', async () => {
    const svc = {
      async get (id: any, params: any) {
        return { id, user: params.user };
      }
    };

    hooks(svc, {
      get: [async (ctx: any, next: any) => {
        ctx.chain.push('@hooks 1 before');
        await next();
        ctx.chain.push('@hooks 1 after');
      }]
    });

    const app = feathers().use('/dummy', svc);
    const service = app.service('dummy');

    service.hooks({
      before: {
        get: (ctx: any) => {
          ctx.chain.push('.hooks 1 before');
        }
      },
      after: {
        get: (ctx: any) => {
          ctx.chain.push('.hooks 1 after');
        }
      }
    });

    hooks(service, {
      get: [async (ctx: any, next: any) => {
        ctx.chain.push('@hooks 2 before');
        await next();
        ctx.chain.push('@hooks 2 after');
      }]
    });

    service.hooks({
      before: {
        get: (ctx: any) => {
          ctx.chain.push('.hooks 2 before');
        }
      },
      after: {
        get: (ctx: any) => {
          ctx.chain.push('.hooks 2 after');
        }
      }
    });

    const hookContext = service.get.createContext({
      chain: []
    });
    const resultContext = await service.get(1, {}, hookContext);

    assert.strictEqual(hookContext, resultContext);
    assert.deepStrictEqual(resultContext.chain, [
      '@hooks 1 before',
      '.hooks 1 before',
      '.hooks 2 before',
      '@hooks 2 before',
      '@hooks 2 after',
      '.hooks 1 after',
      '.hooks 2 after',
      '@hooks 1 after'
    ]);
  });

  it('validates arguments', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return { id, user: params.user };
      },

      async create (data: any) {
        return data;
      }
    });

    await assert.rejects(() => app.service('dummy').get(), {
      message: 'An id must be provided to the \'dummy.get\' method'
    });
    await assert.rejects(() => app.service('dummy').create(), {
      message: 'A data object must be provided to the \'dummy.create\' method'
    });
  });

  it('works with services that return a promise (feathers-hooks#28)', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return { id, user: params.user };
      }
    });
    const service = app.service('dummy');

    service.hooks({
      before: {
        get (hook: any) {
          hook.params.user = 'David';
        }
      },
      after: {
        get (hook: any) {
          hook.result.after = true;
        }
      }
    });

    const data = await service.get(10);

    assert.deepStrictEqual(data, { id: 10, user: 'David', after: true });
  });

  it('has hook.app, hook.service and hook.path', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any) {
        return { id };
      }
    });
    const service = app.service('dummy');

    service.hooks({
      before (hook: any) {
        assert.strictEqual(this, service);
        assert.strictEqual(hook.service, service);
        assert.strictEqual(hook.app, app);
        assert.strictEqual(hook.path, 'dummy');
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
          function (hook: any) {
            hook.result = null;
            return hook;
          }
        ]
      }
    });

    const result = await service.get(1);

    assert.strictEqual(result, null);
  });

  it('invalid type in .hooks throws error', () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return{ id, params };
      }
    });

    assert.throws(() => app.service('dummy').hooks({
      invalid: {}
    }), {
      message: '\'invalid\' is not a valid hook type'
    });
  });

  it('invalid hook method throws error', () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return { id, params };
      }
    });

    assert.throws(() => app.service('dummy').hooks({
      before: {
        invalid () {}
      }
    }), {
      message: '\'invalid\' is not a valid hook method'
    });
  });

  it('registering an already hooked service works (#154)', () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
        return { id, params };
      }
    });

    app.use('/dummy2', app.service('dummy'));
  });

  describe('returns the hook object when passing true as last parameter', () => {
    it('on normal method call', async () => {
      const app = feathers().use('/dummy', {
        async get (id: any, params: any) {
          return { id, params };
        }
      });

      const context = await app.service('dummy').get(10, {}, true);

      assert.strictEqual(context.service, app.service('dummy'));
      assert.strictEqual(context.type, 'after');
      assert.strictEqual(context.path, 'dummy');
      assert.deepStrictEqual(context.result, {
        id: 10,
        params: {}
      });
    });

    it('on error', async () => {
      const app = feathers().use('/dummy', {
        get () {
          throw new Error('Something went wrong');
        }
      });

      await assert.rejects(() => app.service('dummy').get(10, {}, true), {
        service: app.service('dummy'),
        type: 'error',
        path: 'dummy'
      });
    });

    it('on argument validation error (https://github.com/feathersjs/express/issues/19)', async () => {
      const app = feathers().use('/dummy', {
        async get (id: string) {
          return { id };
        }
      });

      await assert.rejects(() => app.service('dummy').get(undefined, {}, true), context => {
        assert.strictEqual(context.service, app.service('dummy'));
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.path, 'dummy');
        assert.strictEqual(context.error.message, 'An id must be provided to the \'dummy.get\' method');

        return true;
      });
    });

    it('on error in error hook (https://github.com/feathersjs/express/issues/21)', async () => {
      const app = feathers().use('/dummy', {
        async get () {
          throw new Error('Nope');
        }
      });

      app.service('dummy').hooks({
        error: {
          get () {
            throw new Error('Error in error hook');
          }
        }
      });

      await assert.rejects(() => app.service('dummy').get(10, {}, true), context => {
        assert.strictEqual(context.service, app.service('dummy'));
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.path, 'dummy');
        assert.strictEqual(context.error.message, 'Error in error hook');

        return true;
      });
    });

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

      const hook = await app.service('dummy').get(10, {}, true);

      assert.ok(hook.error);
      assert.deepStrictEqual(hook.result, result);
    });
  });

  it('can register hooks on a custom method', async () => {
    const app = feathers().use('/dummy', {
      methods: {
        custom: ['id', 'data', 'params']
      },
      async get (id: Id) {
        return { id };
      },
      async custom (id: any, data: any, params: any) {
        return [id, data, params];
      },
      // activateHooks is usable as a decorator: @activateHooks(['id', 'data', 'params'])
      other: activateHooks(['id', 'data', 'params'])(
        (id: any, data: any, params: any) => {
          return Promise.resolve([id, data, params]);
        }
      )
    });

    app.service('dummy').hooks({
      before: {
        all (context: any) {
          context.test = ['all::before'];
        },
        custom (context: any) {
          context.test.push('custom::before');
        }
      },
      after: {
        all (context: any) {
          context.test.push('all::after');
        },
        custom (context: any) {
          context.test.push('custom::after');
        }
      }
    });

    const args = [1, { test: 'ok' }, { provider: 'rest' }];

    assert.deepStrictEqual(app.service('dummy').methods, {
      find: ['params'],
      get: ['id', 'params'],
      create: ['data', 'params'],
      update: ['id', 'data', 'params'],
      patch: ['id', 'data', 'params'],
      remove: ['id', 'params'],
      custom: ['id', 'data', 'params'],
      other: ['id', 'data', 'params']
    });

    let hook = await app.service('dummy').custom(...args, true);

    assert.deepStrictEqual(hook.result, args);
    assert.deepStrictEqual(hook.test, ['all::before', 'custom::before', 'all::after', 'custom::after']);

    hook = await app.service('dummy').other(...args, true);

    assert.deepStrictEqual(hook.result, args);
    assert.deepStrictEqual(hook.test, ['all::before', 'all::after']);
  });

  it('context.data should not change arguments', async () => {
    const app = feathers().use('/dummy', {
      methods: {
        custom: ['id', 'params']
      },
      async get (id: Id) {
        return { id };
      },
      async custom (id: any, params: any) {
        return [id, params];
      }
    });

    app.service('dummy').hooks({
      before: {
        all (context: any) {
          context.test = ['all::before'];
        },
        custom (context: any) {
          context.data = { post: 'title' };
        }
      }
    });

    const args = [1, { provider: 'rest' }];
    const result = await app.service('dummy').custom(...args)

    assert.deepStrictEqual(result, args);
  });

  it('normalizes params to object even when it is falsy (#1001)', async () => {
    const app = feathers().use('/dummy', {
      async get (id: any, params: any) {
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
