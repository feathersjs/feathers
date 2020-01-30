
const assert = require('assert');
const feathers = require('../../lib');
const { withHooks } = require('../../lib/hooks');

function createApp (findResult) {
  return feathers()
    .use('svc', {
      create (data) {
        return Promise.resolve(data);
      },
      find () {
        return Promise.resolve(findResult);
      }
    });
}

const testHook = hook => {
  hook._called = 'called';
  return hook;
};

describe('services withHooks', () => {
  it('get expected hook & object result', () => {
    const data = { name: 'john' };
    const params = {};

    const app = createApp();
    const svc = app.service('svc');

    return withHooks({
      app,
      service: svc,
      method: 'create'
    })({
      before: testHook
    })(data, params, true)
      .then(hook => {
        assert.deepStrictEqual(hook.result, data, 'test result');
        assert.deepStrictEqual({ ...hook }, {
          app,
          params,
          self: svc,
          service: svc,
          method: 'create',
          path: 'svc',
          data,
          _called: 'called',
          result: data,
          type: 'finally',
          arguments: [ data, params ]
        }, 'test hook');
      });
  });

  it('get expected array result', () => {
    const data = [{ name: 'john' }];

    const app = createApp();
    const svc = app.service('svc');

    return withHooks({
      app,
      service: svc,
      method: 'create'
    })({
      before: testHook
    })(data)
      .then(result => {
        assert.deepStrictEqual(result, data, 'test result');
      });
  });

  it('get expected find result', () => {
    const data = { total: 1, data: [{ name: 'john' }] };

    const app = createApp(data);
    const svc = app.service('svc');

    return withHooks({
      app,
      service: svc,
      method: 'find'
    })({
      before: testHook
    })()
      .then(result => {
        assert.deepStrictEqual(result, data, 'test result');
      });
  });

  it('get expected find result with no hooks at all', () => {
    const data = { total: 1, data: [{ name: 'john' }] };

    const app = createApp(data);
    const svc = app.service('svc');

    return withHooks({
      app,
      service: svc,
      method: 'find'
    })()().then(result => {
      assert.deepStrictEqual(result, data, 'test result');
    });
  });

  it('test using keep hook', () => {
    const data = [{ name: 'John', job: 'dev', address: { city: 'Montreal', postal: 'H4T 2A1' } }];

    const app = createApp();
    const svc = app.service('svc');

    return withHooks({
      app,
      service: svc,
      method: 'create'
    })({
      after: context => {
        (Array.isArray(context.result) ? context.result : [context.result])
          .forEach(value => {
            delete value.job;
            delete value.address.postal;
          });
      }
    })(data)
      .then(result => {
        assert.deepStrictEqual(result, [{ name: 'John', address: { city: 'Montreal' } }]);
      });
  });
});
