const assert = require('assert');
const { EventEmitter } = require('events');
const feathers = require('feathers');
const errors = require('feathers-errors');

const {
  normalizeError,
  getDispatcher,
  runMethod,
  getService
} = require('../lib/utils');

describe('socket commons utils', () => {
  describe('.normalizeError', () => {
    it('simple error normalization', () => {
      const message = 'Something went wrong';
      const e = new Error(message);

      assert.deepEqual(normalizeError(e), {
        message,
        stack: e.stack.toString()
      });
    });

    it('calls .toJSON', () => {
      const json = { message: 'toJSON called' };

      assert.deepEqual(normalizeError({
        toJSON () {
          return json;
        }
      }), json);
    });

    it('removes `hook` property', () => {
      const e = {
        hook: true
      };

      assert.deepEqual(normalizeError(e), {});
      assert.ok(e.hook, 'Does not mutate the original object');
    });
  });

  describe('.getDispatcher', () => {
    it('returns a dispatcher function', () =>
      assert.equal(typeof getDispatcher(), 'function')
    );

    describe('dispatcher logic', () => {
      let dispatcher, dummySocket, dummyHook, dummyChannel;

      beforeEach(() => {
        dispatcher = getDispatcher('emit', 'test');
        dummySocket = new EventEmitter();
        dummyHook = { result: 'hi' };
        dummyChannel = {
          connections: [{
            test: dummySocket
          }],
          dataFor () {
            return null;
          }
        };
      });

      it('dispatches a basic event', done => {
        dummySocket.once('testing', data => {
          assert.equal(data, 'hi');
          done();
        });

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('dispatches event on a hooks path event', done => {
        dummyHook.path = 'myservice';

        dummySocket.once('myservice testing', data => {
          assert.equal(data, 'hi');
          done();
        });

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('dispatches `hook.dispatch` instead', done => {
        const message = 'hi from dispatch';

        dummyHook.dispatch = message;

        dummySocket.once('testing', data => {
          assert.equal(data, message);
          done();
        });

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('does nothing if there is no socket', () => {
        dummyChannel.connections[0].test = null;

        dispatcher('testing', dummyChannel, dummyHook);
      });
    });
  });

  describe('.getService', () => {
    it('simple service', () => {
      const app = feathers().use('/myservice', {
        get (id) {
          return Promise.resolve({ id });
        }
      });
      const { service, route } = getService(app, 'myservice/');

      assert.deepEqual(route, {}, 'There is always a route');

      return service.get(10).then(data =>
        assert.deepEqual(data, { id: 10 }, 'Got data from service')
      );
    });

    it('route with parameter', () => {
      const app = feathers().use('/users/:userId/comments', {
        get (id) {
          return Promise.resolve({ id });
        }
      });
      const { service, route } = getService(app, 'users/10/comments');

      assert.deepEqual(route, {
        userId: 10
      }, 'got expected route parameters');

      return service.get(1).then(data =>
        assert.deepEqual(data, { id: 1 }, 'Got data from service')
      );
    });

    it('no service found', () => {
      const app = feathers().use('/users/:userId/comment', {
        get (id) {
          return Promise.resolve({ id });
        }
      });
      const { service, route } = getService(app, 'users/10/comments');

      assert.deepEqual(route, {}, 'route is empty');
      assert.ok(!service);
    });
  });

  describe('.runMethod', () => {
    let app;

    beforeEach(() => {
      app = feathers().use('/myservice', {
        get (id, params) {
          if (params.query.error) {
            return Promise.reject(new errors.NotAuthenticated('None shall pass'));
          }
          return Promise.resolve({ id });
        }
      });
    });

    it('simple method running', done => {
      const callback = (error, result) => {
        if (error) {
          return done(error);
        }

        assert.deepEqual(result, { id: 10 });
        done();
      };

      runMethod(app, {}, 'myservice', 'get', [ 10, callback ]);
    });

    it('throws NotFound for invalid service', done => {
      const callback = error => {
        try {
          assert.deepEqual(error, { name: 'NotFound',
            message: 'Service \'ohmyservice\' not found',
            code: 404,
            className: 'not-found',
            data: undefined,
            errors: {}
          });
          done();
        } catch (e) {
          done(e);
        }
      };

      runMethod(app, {}, 'ohmyservice', 'get', [ 10, callback ]);
    });

    it('throws MethodNotAllowed undefined method', done => {
      const callback = error => {
        try {
          assert.deepEqual(error, {
            name: 'MethodNotAllowed',
            message: 'Method \'create\' not allowed on service \'myservice\'',
            code: 405,
            className: 'method-not-allowed',
            data: undefined,
            errors: {}
          });
          done();
        } catch (e) {
          done(e);
        }
      };

      runMethod(app, {}, 'myservice', 'create', [ {}, callback ]);
    });

    it('throws MethodNotAllowed for invalid service method', done => {
      const callback = error => {
        try {
          assert.deepEqual(error, {
            name: 'MethodNotAllowed',
            message: 'Method \'blabla\' not allowed on service \'myservice\'',
            code: 405,
            className: 'method-not-allowed',
            data: undefined,
            errors: {}
          });
          done();
        } catch (e) {
          done(e);
        }
      };

      runMethod(app, {}, 'myservice', 'blabla', [ {}, callback ]);
    });

    it('method error calls back with normalized error', done => {
      const callback = (error, result) => {
        try {
          assert.deepEqual(error, {
            name: 'NotAuthenticated',
            message: 'None shall pass',
            data: undefined,
            code: 401,
            className: 'not-authenticated',
            errors: {}
          });
          done();
        } catch (e) {
          done(e);
        }
      };

      runMethod(app, {}, 'myservice', 'get', [
        42, { error: true }, callback
      ]);
    });
  });
});
