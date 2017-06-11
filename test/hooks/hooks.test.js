import assert from 'assert';

import feathers from '../../src';
import hooks from '../../src/hooks';

describe('feathers-hooks', () => {
  it('always turns service call into a promise (#28)', () => {
    const app = feathers().configure(hooks()).use('/dummy', {
      get (id, params, callback) {
        callback(null, { id });
      }
    });

    const service = app.service('dummy');

    return service.get(10).then(data => {
      assert.deepEqual(data, { id: 10 });
    });
  });

  it('works with services that return a promise (#28)', () => {
    const app = feathers().configure(hooks()).use('/dummy', {
      get (id, params) {
        return Promise.resolve({ id, user: params.user });
      }
    });

    const service = app.service('dummy');

    service.before({
      get (hook) {
        hook.params.user = 'David';
      }
    }).after({
      get (hook) {
        hook.result.after = true;
      }
    });

    return service.get(10).then(data => {
      assert.deepEqual(data, { id: 10, user: 'David', after: true });
    });
  });

  it('dispatches events with data modified by hook', done => {
    const app = feathers().configure(hooks()).use('/dummy', {
      create (data) {
        return Promise.resolve(data);
      }
    });

    const service = app.service('dummy');

    service.before({
      create (hook) {
        hook.data.user = 'David';
      }
    }).after({
      create (hook) {
        hook.result.after = true;
      }
    });

    service.once('created', function (data) {
      try {
        assert.deepEqual(data, {
          test: true,
          user: 'David',
          after: true
        });
        done();
      } catch (e) {
        done(e);
      }
    });

    service.create({ test: true });
  });

  it('has hook.app, hook.service and hook.path', done => {
    const app = feathers().configure(hooks()).use('/dummy', {
      get (id) {
        return Promise.resolve({ id });
      }
    });

    const service = app.service('dummy');

    service.hooks({
      before (hook) {
        try {
          assert.equal(this, service);
          assert.equal(hook.service, service);
          assert.equal(hook.app, app);
          assert.equal(hook.path, 'dummy');
          done();
        } catch (e) {
          done(e);
        }
      }
    });

    service.get('test');
  });

  it('does not error when result is null', () => {
    const app = feathers().configure(hooks()).use('/dummy', {
      get (id, params, callback) {
        callback(null, { id });
      }
    });

    const service = app.service('dummy');

    service.after({
      get: [
        function (hook) {
          hook.result = null;
          return hook;
        }
      ]
    });

    return service.get(1)
      .then(result => assert.equal(result, null));
  });

  it('invalid type in .hooks throws error', () => {
    const app = feathers().configure(hooks()).use('/dummy', {
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
    const app = feathers().configure(hooks()).use('/dummy', {
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

  it('.hooks and backwards compatibility methods chain their hooks', () => {
    const app = feathers().configure(hooks()).use('/dummy', {
      get (id, params, callback) {
        callback(null, { id, params });
      }
    });
    const makeHooks = name => {
      return {
        all (hook) {
          hook.params.items.push(`${name}_all`);
        },

        get (hook) {
          hook.params.items.push(`${name}_get`);
        }
      };
    };

    const service = app.service('dummy');

    service.hooks({ before: makeHooks('hooks_before') });
    service.hooks({ before: makeHooks('hooks_before_1') });
    service.before(makeHooks('before'));
    service.before(makeHooks('before_1'));

    return service.get('testing', { items: [] })
      .then(data => assert.deepEqual(data.params.items, [
        'hooks_before_all',
        'hooks_before_get',
        'hooks_before_1_all',
        'hooks_before_1_get',
        'before_all',
        'before_get',
        'before_1_all',
        'before_1_get'
      ]));
  });

  it('registering an already hooked service works (#154)', () => {
    const app = feathers().configure(hooks()).use('/dummy', {
      get (id, params, callback) {
        callback(null, { id, params });
      }
    });

    app.use('/dummy2', app.service('dummy'));
  });
});
