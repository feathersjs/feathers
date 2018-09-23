const assert = require('assert');
const feathers = require('@feathersjs/feathers');

const hook = require('../../lib/hooks/events');

describe('authentication/hooks/events', () => {
  let app, service;

  beforeEach(() => {
    app = feathers().use('/authentication', {
      create (data) {
        return Promise.resolve(data);
      },

      remove (id) {
        return Promise.resolve({ id });
      }
    });

    service = app.service('authentication');
    service.hooks({
      after: hook()
    });
  });

  it('login', done => {
    const data = {
      message: 'test'
    };

    app.once('login', (result, params, context) => {
      try {
        assert.deepEqual(result, data);
        assert.ok(params.testParam);
        assert.ok(context.method, 'create');
        done();
      } catch (error) {
        done(error);
      }
    });

    service.create(data, {
      testParam: true,
      provider: 'test'
    });
  });

  it('logout', done => {
    app.once('logout', (result, params, context) => {
      try {
        assert.deepEqual(result, {
          id: 'test'
        });
        assert.ok(params.testParam);
        assert.ok(context.method, 'remove');
        done();
      } catch (error) {
        done(error);
      }
    });

    service.remove('test', {
      testParam: true,
      provider: 'test'
    });
  });

  it('does nothing when provider is not set', done => {
    const handler = () => {
      done(new Error('Should never get here'));
    };

    app.on('logout', handler);
    service.once('removed', result => {
      app.removeListener('logout', handler);
      assert.deepEqual(result, {
        id: 'test'
      });
      done();
    });

    service.remove('test');
  });
});
