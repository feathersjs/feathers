import assert from 'assert';

import { feathers, Application } from '../../src';

describe('app.hooks', () => {
  let app: Application;

  beforeEach(() => {
    app = feathers().use('/todos', {
      async get (id: any, params: any) {
        if (id === 'error') {
          throw new Error('Something went wrong');
        }

        return { id, params };
      },

      async create (data: any, params: any) {
        return { data, params };
      }
    });
  });

  it('app has the .hooks method', () => {
    assert.strictEqual(typeof app.hooks, 'function');
  });

  describe('app.hooks([ async ])', () => {
    it('basic app advanced hook', async () => {
      const service = app.service('todos');

      app.hooks([
        async (context, next) => {
          assert.strictEqual(context.app, app);
          await next();
          context.params.ran = true;
        }
      ]);

      let result = await service.get('test');

      assert.deepStrictEqual(result, {
        id: 'test',
        params: { ran: true }
      });

      const data = { test: 'hi' };

      result = await service.create(data);

      assert.deepStrictEqual(result, {
        data, params: { ran: true }
      });
    });
  });

  describe('app.hooks({ method: [ async ] })', () => {
    it('basic app async method hook', async () => {
      const service = app.service('todos');

      app.hooks({
        get: [async (context, next) => {
          assert.strictEqual(context.app, app);
          await next();
          context.params.ran = true;
        }]
      });

      const result = await service.get('test');

      assert.deepStrictEqual(result, {
        id: 'test',
        params: { ran: true }
      });
    });
  });

  describe('app.hooks({ before })', () => {
    it('basic app before hook', async () => {
      const service = app.service('todos');

      app.hooks({
        before (context) {
          assert.strictEqual(context.app, app);
          context.params.ran = true;
        }
      });

      let result = await service.get('test');

      assert.deepStrictEqual(result, {
        id: 'test',
        params: { ran: true }
      });

      const data = { test: 'hi' };

      result = await service.create(data);

      assert.deepStrictEqual(result, {
        data, params: { ran: true }
      });
    });

    it('app before hooks always run first', async () => {
      app.service('todos').hooks({
        before (context) {
          assert.strictEqual(context.app, app);
          context.params.order.push('service.before');
        }
      });

      app.service('todos').hooks({
        before (context) {
          assert.strictEqual(context.app, app);
          context.params.order.push('service.before 1');
        }
      });

      app.hooks({
        before (context) {
          assert.strictEqual(context.app, app);
          context.params.order = [];
          context.params.order.push('app.before');
        }
      });

      const result = await app.service('todos').get('test');

      assert.deepStrictEqual(result, {
        id: 'test',
        params: {
          order: [ 'app.before', 'service.before', 'service.before 1' ]
        }
      });
    });
  });

  describe('app.hooks({ after })', () => {
    it('basic app after hook', async () => {
      app.hooks({
        after (context) {
          assert.strictEqual(context.app, app);
          context.result.ran = true;
        }
      });

      const result = await app.service('todos').get('test');

      assert.deepStrictEqual(result, {
        id: 'test',
        params: {},
        ran: true
      });
    });

    it('app after hooks always run last', async () => {
      app.hooks({
        after (context) {
          assert.strictEqual(context.app, app);
          context.result.order.push('app.after');
        }
      });

      app.service('todos').hooks({
        after (context) {
          assert.strictEqual(context.app, app);
          context.result.order = [];
          context.result.order.push('service.after');
        }
      });

      app.service('todos').hooks({
        after (context) {
          assert.strictEqual(context.app, app);
          context.result.order.push('service.after 1');
        }
      });

      const result = await app.service('todos').get('test');

      assert.deepStrictEqual(result, {
        id: 'test',
        params: {},
        order: [ 'service.after', 'service.after 1', 'app.after' ]
      });
    });
  });

  describe('app.hooks({ error })', () => {
    it('basic app error hook', async () => {
      app.hooks({
        error (context) {
          assert.strictEqual(context.app, app);
          context.error = new Error('App hook ran');
        }
      });

      await assert.rejects(() => app.service('todos').get('error'), {
        message: 'App hook ran'
      });
    });

    it('app error hooks always run last', async () => {
      app.hooks({
        error (context) {
          assert.strictEqual(context.app, app);
          context.error = new Error(`${context.error.message} app.after`);
        }
      });

      app.service('todos').hooks({
        error (context) {
          assert.strictEqual(context.app, app);
          context.error = new Error(`${context.error.message} service.after`);
        }
      });

      app.service('todos').hooks({
        error (context) {
          assert.strictEqual(context.app, app);
          context.error = new Error(`${context.error.message} service.after 1`);
        }
      });

      await assert.rejects(() => app.service('todos').get('error'), {
        message: 'Something went wrong service.after service.after 1 app.after'
      });
    });
  });
});
