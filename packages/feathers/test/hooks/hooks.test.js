const assert = require('assert');
const { hooks, HookContext } = require('@feathersjs/hooks');
const feathers = require('../../lib');

describe('hooks basics', () => {
  it('mix @feathersjs/hooks and .hooks', async () => {
    const svc = {
      get(id, params) {
        return Promise.resolve({ id, user: params.user });
      }
    };

    hooks(svc, {
      get: [async (ctx, next) => {
        ctx.chain.push('@hooks 1 before');
        await next();
        ctx.chain.push('@hooks 1 after');
      }]
    });

    const app = feathers().use('/dummy', svc);
    const service = app.service('dummy');

    service.hooks({
      before: {
        get: ctx => {
          ctx.chain.push('.hooks 1 before');
        }
      },
      after: {
        get: ctx => {
          ctx.chain.push('.hooks 1 after');
        }
      }
    });

    hooks(service, {
      get: [async (ctx, next) => {
        ctx.chain.push('@hooks 2 before');
        await next();
        ctx.chain.push('@hooks 2 after');
      }]
    });

    service.hooks({
      before: {
        get: ctx => {
          ctx.chain.push('.hooks 2 before');
        }
      },
      after: {
        get: ctx => {
          ctx.chain.push('.hooks 2 after');
        }
      }
    });

    const hookContext = new HookContext({
      chain: []
    });
    const resultContext = await service.get(1, {}, hookContext);

    assert.strictEqual(hookContext, resultContext);
    assert.deepStrictEqual(resultContext.chain, [
      '@hooks 2 before',
      '@hooks 1 before',
      '.hooks 1 before',
      '.hooks 2 before',
      '.hooks 1 after',
      '.hooks 2 after',
      '@hooks 1 after',
      '@hooks 2 after'
    ])
  });

  it('validates arguments', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, user: params.user });
      },

      create (data) {
        return Promise.resolve(data);
      }
    });

    return app.service('dummy').get(1, {}, function () {}).catch(e => {
      assert.strictEqual(e.message, 'Callbacks are no longer supported. Use Promises or async/await instead.');

      return app.service('dummy').get();
    }).catch(e => {
      assert.strictEqual(e.message, `An id must be provided to the 'dummy.get' method`);
    }).then(() =>
      app.service('dummy').create()
    ).catch(e => {
      assert.strictEqual(e.message, `A data object must be provided to the 'dummy.create' method`);
    });
  });

  it('works with services that return a promise (feathers-hooks#28)', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, user: params.user });
      }
    });

    const service = app.service('dummy');

    service.hooks({
      before: {
        get (hook) {
          hook.params.user = 'David';
        }
      },
      after: {
        get (hook) {
          hook.result.after = true;
        }
      }
    });

    return service.get(10).then(data => {
      assert.deepStrictEqual(data, { id: 10, user: 'David', after: true });
    });
  });

  it('has hook.app, hook.service and hook.path', () => {
    const app = feathers().use('/dummy', {
      get (id) {
        return Promise.resolve({ id });
      }
    });

    const service = app.service('dummy');

    service.hooks({
      before (hook) {
        assert.strictEqual(this, service);
        assert.strictEqual(hook.service, service);
        assert.strictEqual(hook.app, app);
        assert.strictEqual(hook.path, 'dummy');
      }
    });

    return service.get('test');
  });

  it('does not error when result is null', () => {
    const app = feathers().use('/dummy', {
      get (id) {
        return Promise.resolve({ id });
      }
    });

    const service = app.service('dummy');

    service.hooks({
      after: {
        get: [
          function (hook) {
            hook.result = null;
            return hook;
          }
        ]
      }
    });

    return service.get(1)
      .then(result => assert.strictEqual(result, null));
  });

  it('invalid type in .hooks throws error', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, params });
      }
    });

    try {
      app.service('dummy').hooks({
        invalid: {}
      });
      assert.ok(false);
    } catch (e) {
      assert.strictEqual(e.message, `'invalid' is not a valid hook type`);
    }
  });

  it('invalid hook method throws error', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, params });
      }
    });

    try {
      app.service('dummy').hooks({
        before: {
          invalid () {}
        }
      });
      assert.ok(false);
    } catch (e) {
      assert.strictEqual(e.message, `'invalid' is not a valid hook method`);
    }
  });

  it('registering an already hooked service works (#154)', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, params });
      }
    });

    app.use('/dummy2', app.service('dummy'));
  });

  it('not returning a promise errors', () => {
    const app = feathers().use('/dummy', {
      get () {
        return {};
      }
    });

    return app.service('dummy').get(1).catch(e => {
      assert.strictEqual(e.message, `Service method 'get' for 'dummy' service must return a promise`);
    });
  });

  describe('returns the hook object when passing true as last parameter', () => {
    it('on normal method call', () => {
      const app = feathers().use('/dummy', {
        get (id, params) {
          return Promise.resolve({ id, params });
        }
      });

      return app.service('dummy').get(10, {}, true).then(context => {
        assert.strictEqual(context.service, app.service('dummy'));
        assert.strictEqual(context.type, 'after');
        assert.strictEqual(context.path, 'dummy');
        assert.deepStrictEqual(context.result, {
          id: 10,
          params: {}
        });
      });
    });

    it('on error', () => {
      const app = feathers().use('/dummy', {
        get () {
          return Promise.reject(new Error('Something went wrong'));
        }
      });

      return app.service('dummy').get(10, {}, true).catch(context => {
        assert.strictEqual(context.service, app.service('dummy'));
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.path, 'dummy');
        assert.strictEqual(context.error.message, 'Something went wrong');
      });
    });

    it('on argument validation error (https://github.com/feathersjs/express/issues/19)', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      return app.service('dummy').get(undefined, {}, true).catch(context => {
        assert.strictEqual(context.service, app.service('dummy'));
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.path, 'dummy');
        assert.strictEqual(context.error.message, 'An id must be provided to the \'dummy.get\' method');
      });
    });

    it('on error in error hook (https://github.com/feathersjs/express/issues/21)', () => {
      const app = feathers().use('/dummy', {
        get (id) {
          return Promise.reject(new Error('Nope'));
        }
      });

      app.service('dummy').hooks({
        error: {
          get (context) {
            throw new Error('Error in error hook');
          }
        }
      });

      return app.service('dummy').get(10, {}, true).catch(context => {
        assert.strictEqual(context.service, app.service('dummy'));
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.path, 'dummy');
        assert.strictEqual(context.error.message, 'Error in error hook');
      });
    });

    it('still swallows error if context.result is set', () => {
      const result = { message: 'this is a test' };
      const app = feathers().use('/dummy', {
        get () {
          return Promise.reject(new Error('Something went wrong'));
        }
      });

      app.service('dummy').hooks({
        error (context) {
          context.result = result;
        }
      });

      return app.service('dummy').get(10, {}, true).then(hook => {
        assert.ok(hook.error);
        assert.deepStrictEqual(hook.result, result);
      }).catch(() => {
        throw new Error('Should never get here');
      });
    });
  });

  it('can register hooks on a custom method', () => {
    const app = feathers().use('/dummy', {
      methods: {
        custom: ['id', 'data', 'params']
      },
      get () {},
      custom (id, data, params) {
        return Promise.resolve([id, data, params]);
      },
      // activateHooks is usable as a decorator: @activateHooks(['id', 'data', 'params'])
      other: feathers.activateHooks(['id', 'data', 'params'])(
        (id, data, params) => {
          return Promise.resolve([id, data, params]);
        }
      )
    });

    app.service('dummy').hooks({
      before: {
        all (context) {
          context.test = ['all::before'];
        },
        custom (context) {
          context.test.push('custom::before');
        }
      },
      after: {
        all (context) {
          context.test.push('all::after');
        },
        custom (context) {
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

    return app.service('dummy').custom(...args, true)
      .then(hook => {
        assert.deepStrictEqual(hook.result, args);
        assert.deepStrictEqual(hook.test, ['all::before', 'custom::before', 'all::after', 'custom::after']);

        app.service('dummy').other(...args, true)
          .then(hook => {
            assert.deepStrictEqual(hook.result, args);
            assert.deepStrictEqual(hook.test, ['all::before', 'all::after']);
          });
      });
  });

  it('context.data should not change arguments', () => {
    const app = feathers().use('/dummy', {
      methods: {
        custom: ['id', 'params']
      },
      get () {},
      custom (id, params) {
        return Promise.resolve([id, params]);
      }
    });

    app.service('dummy').hooks({
      before: {
        all (context) {
          context.test = ['all::before'];
        },
        custom (context) {
          context.data = { post: 'title' };
        }
      }
    });

    const args = [1, { provider: 'rest' }];

    return app.service('dummy').custom(...args)
      .then(result => {
        assert.deepStrictEqual(result, args);
      });
  });

  it('normalizes params to object even when it is falsy (#1001)', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, params });
      }
    });

    return app.service('dummy').get('test', null).then(result => {
      assert.deepStrictEqual(result, {
        id: 'test',
        params: {}
      });
    });
  });
});
