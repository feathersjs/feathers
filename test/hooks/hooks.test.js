const assert = require('assert');
const feathers = require('../../lib');

describe('hooks basics', () => {
  it('validates arguments', () => {
    const app = feathers().use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, user: params.user });
      }
    });

    return app.service('dummy').get(1, {}, function () {}).catch(e => {
      assert.equal(e.message, 'Callbacks are no longer supported. Use Promises or async/await instead.');

      return app.service('dummy').get();
    }).catch(e => {
      assert.equal(e.message, `An id must be provided to the 'get' method`);
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
      assert.deepEqual(data, { id: 10, user: 'David', after: true });
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
        assert.equal(this, service);
        assert.equal(hook.service, service);
        assert.equal(hook.app, app);
        assert.equal(hook.path, 'dummy');
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
      .then(result => assert.equal(result, null));
  });

  it('invalid type in .hooks throws error', () => {
    const app = feathers().use('/dummy', {
      get (id, params, callback) {
        callback(null, { id, params });
      }
    });

    try {
      app.service('dummy').hooks({
        invalid: {}
      });
      assert.ok(false);
    } catch (e) {
      assert.equal(e.message, `'invalid' is not a valid hook type`);
    }
  });

  it('invalid hook method throws error', () => {
    const app = feathers().use('/dummy', {
      get (id, params, callback) {
        callback(null, { id, params });
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
      assert.equal(e.message, `'invalid' is not a valid hook method`);
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
      assert.equal(e.message, `Service method 'get' for 'dummy' service must return a promise`);
    });
  });

  describe('returns the hook object with __returnHook', () => {
    it('on normal method call', () => {
      const app = feathers().use('/dummy', {
        get (id, params) {
          return Promise.resolve({ id, params });
        }
      });
      const params = {
        __returnHook: true
      };

      return app.service('dummy').get(10, params).then(context => {
        assert.equal(context.service, app.service('dummy'));
        assert.equal(context.type, 'after');
        assert.equal(context.path, 'dummy');
        assert.deepEqual(context.result, {
          id: 10,
          params
        });
      });
    });

    it('on error', () => {
      const app = feathers().use('/dummy', {
        get () {
          return Promise.reject(new Error('Something went wrong'));
        }
      });
      const params = {
        __returnHook: true
      };

      return app.service('dummy').get(10, params).catch(context => {
        assert.equal(context.service, app.service('dummy'));
        assert.equal(context.type, 'error');
        assert.equal(context.path, 'dummy');
        assert.equal(context.error.message, 'Something went wrong');
      });
    });
  });
});
