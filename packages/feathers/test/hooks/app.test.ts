import assert from 'assert';

import feathers, { Application } from '../../src';

describe('app.hooks', () => {
  let app: Application;

  beforeEach(() => {
    app = feathers()
      .use('/todos', {
        get (id: any, params: any) {
          if (id === 'error') {
            return Promise.reject(new Error('Something went wrong'));
          }

          return Promise.resolve({ id, params });
        },

        create (data: any, params: any) {
          return Promise.resolve({ data, params });
        }
      });
  });

  it('app has the .hooks method', () => {
    assert.strictEqual(typeof app.hooks, 'function');
  });

  describe('app.hooks({ async })', () => {
    it('basic app async hook', () => {
      const service = app.service('todos');

      app.hooks({
        async async (hook: any, next: any) {
          assert.strictEqual(hook.app, app);
          await next();
          hook.params.ran = true;
        }
      });

      return service.get('test').then((result: any) => {
        assert.deepStrictEqual(result, {
          id: 'test',
          params: { ran: true }
        });

        const data = { test: 'hi' };

        return service.create(data).then((result: any) => {
          assert.deepStrictEqual(result, {
            data, params: { ran: true }
          });
        });
      });
    });
  });

  describe('app.hooks({ before })', () => {
    it('basic app before hook', () => {
      const service = app.service('todos');

      app.hooks({
        before (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.params.ran = true;
        }
      });

      return service.get('test').then((result: any) => {
        assert.deepStrictEqual(result, {
          id: 'test',
          params: { ran: true }
        });

        const data = { test: 'hi' };

        return service.create(data).then((result: any) => {
          assert.deepStrictEqual(result, {
            data, params: { ran: true }
          });
        });
      });
    });

    it('app before hooks always run first', () => {
      app.service('todos').hooks({
        before (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.params.order.push('service.before');
        }
      });

      app.service('todos').hooks({
        before (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.params.order.push('service.before 1');
        }
      });

      app.hooks({
        before (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.params.order = [];
          hook.params.order.push('app.before');
        }
      });

      return app.service('todos').get('test').then((result: any) => {
        assert.deepStrictEqual(result, {
          id: 'test',
          params: {
            order: [ 'app.before', 'service.before', 'service.before 1' ]
          }
        });
      });
    });
  });

  describe('app.hooks({ after })', () => {
    it('basic app after hook', () => {
      app.hooks({
        after (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.result.ran = true;
        }
      });

      return app.service('todos').get('test').then((result: any) => {
        assert.deepStrictEqual(result, {
          id: 'test',
          params: {},
          ran: true
        });
      });
    });

    it('app after hooks always run last', () => {
      app.hooks({
        after (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.result.order.push('app.after');
        }
      });

      app.service('todos').hooks({
        after (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.result.order = [];
          hook.result.order.push('service.after');
        }
      });

      app.service('todos').hooks({
        after (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.result.order.push('service.after 1');
        }
      });

      return app.service('todos').get('test').then((result: any) => {
        assert.deepStrictEqual(result, {
          id: 'test',
          params: {},
          order: [ 'service.after', 'service.after 1', 'app.after' ]
        });
      });
    });
  });

  describe('app.hooks({ error })', () => {
    it('basic app error hook', () => {
      app.hooks({
        error (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.error = new Error('App hook ran');
        }
      });

      return app.service('todos').get('error').catch((error: any) => {
        assert.strictEqual(error.message, 'App hook ran');
      });
    });

    it('app error hooks always run last', () => {
      app.hooks({
        error (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.error = new Error(`${hook.error.message} app.after`);
        }
      });

      app.service('todos').hooks({
        error (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.error = new Error(`${hook.error.message} service.after`);
        }
      });

      app.service('todos').hooks({
        error (hook: any) {
          assert.strictEqual(hook.app, app);
          hook.error = new Error(`${hook.error.message} service.after 1`);
        }
      });

      return app.service('todos').get('error').catch((error: any) => {
        assert.strictEqual(error.message, 'Something went wrong service.after service.after 1 app.after');
      });
    });
  });
});
