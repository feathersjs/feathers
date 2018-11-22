const assert = require('assert');
const { EventEmitter } = require('events');
const feathers = require('@feathersjs/feathers');
const errors = require('@feathersjs/errors');

const routing = require('../../lib/routing');
const {
  normalizeError,
  getDispatcher,
  runMethod
} = require('../../lib/socket/utils');

describe('socket commons utils', () => {
  describe('.normalizeError', () => {
    it('simple error normalization', () => {
      const message = 'Something went wrong';
      const e = new Error(message);

      assert.deepStrictEqual(normalizeError(e), {
        message,
        stack: e.stack.toString()
      });
    });

    it('calls .toJSON', () => {
      const json = { message: 'toJSON called' };

      assert.deepStrictEqual(normalizeError({
        toJSON () {
          return json;
        }
      }), json);
    });

    it('removes `hook` property', () => {
      const e = {
        hook: true
      };

      assert.deepStrictEqual(normalizeError(e), {});
      assert.ok(e.hook, 'Does not mutate the original object');
    });

    it('hides stack in production', () => {
      const oldEnv = process.env.NODE_ENV;

      process.env.NODE_ENV = 'production';

      const message = 'Something went wrong';
      const e = new Error(message);
      const normalized = normalizeError(e);

      assert.strictEqual(normalized.message, message);
      assert.ok(!normalized.stack);

      process.env.NODE_ENV = oldEnv;
    });
  });

  describe('.getDispatcher', () => {
    it('returns a dispatcher function', () =>
      assert.strictEqual(typeof getDispatcher(), 'function')
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
          assert.strictEqual(data, 'hi');
          done();
        });

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('dispatches event on a hooks path event', done => {
        dummyHook.path = 'myservice';

        dummySocket.once('myservice testing', data => {
          assert.strictEqual(data, 'hi');
          done();
        });

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('dispatches `hook.dispatch` instead', done => {
        const message = 'hi from dispatch';

        dummyHook.dispatch = message;

        dummySocket.once('testing', data => {
          assert.strictEqual(data, message);
          done();
        });

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('does nothing if there is no socket', () => {
        dummyChannel.connections[0].test = null;

        dispatcher('testing', dummyChannel, dummyHook);
      });

      it('dispatches arrays properly hook events', done => {
        const data1 = { message: 'First message' };
        const data2 = { message: 'Second message' };

        dummyHook.result = [ data1, data2 ];

        dummySocket.once('testing', data => {
          assert.deepStrictEqual(data, data1);
          dummySocket.once('testing', data => {
            assert.deepStrictEqual(data, data2);
            done();
          });
        });

        dispatcher('testing', dummyChannel, dummyHook, data1);
        dispatcher('testing', dummyChannel, dummyHook, data2);
      });

      it('dispatches arrays properly for custom events', done => {
        const result = [
          { message: 'First' },
          { message: 'Second' }
        ];

        dummyHook.result = result;

        dummySocket.once('otherEvent', data => {
          assert.deepStrictEqual(data, result);
          done();
        });

        dispatcher('otherEvent', dummyChannel, dummyHook, result);
      });
    });
  });

  describe('.runMethod', () => {
    let app;

    beforeEach(() => {
      app = feathers().configure(routing());
      app.use('/myservice', {
        get (id, params) {
          if (params.query.error) {
            return Promise.reject(new errors.NotAuthenticated('None shall pass'));
          }
          return Promise.resolve({ id });
        }
      });
    });

    describe('running methods', () => {
      it('basic', done => {
        const callback = (error, result) => {
          if (error) {
            return done(error);
          }

          assert.deepStrictEqual(result, { id: 10 });
          done();
        };

        runMethod(app, {}, 'myservice', 'get', [ 10, {}, callback ]);
      });

      it('merges params with connection and passes connection', done => {
        const connection = {
          testing: true
        };
        const callback = (error, result) => {
          if (error) {
            return done(error);
          }

          assert.deepStrictEqual(result, {
            id: 10,
            params: {
              connection,
              query: {},
              route: {},
              testing: true
            }
          });
          done();
        };

        app.use('/otherservice', {
          get (id, params) {
            return Promise.resolve({ id, params });
          }
        });

        runMethod(app, connection, 'otherservice', 'get', [ 10, {}, callback ]);
      });

      it('with params missing', done => {
        const callback = (error, result) => {
          if (error) {
            return done(error);
          }

          assert.deepStrictEqual(result, { id: 10 });
          done();
        };

        runMethod(app, {}, 'myservice', 'get', [ 10, callback ]);
      });

      it('with params but missing callback', done => {
        app.use('/otherservice', {
          get (id) {
            assert.strictEqual(id, 'dishes');

            return Promise.resolve({ id }).then(res => {
              done();
              return res;
            });
          }
        });

        runMethod(app, {}, 'otherservice', 'get', [ 'dishes', {} ]);
      });

      it('with params and callback missing', done => {
        app.use('/otherservice', {
          get (id) {
            assert.strictEqual(id, 'laundry');

            return Promise.resolve({ id }).then(res => {
              done();
              return res;
            });
          }
        });

        runMethod(app, {}, 'otherservice', 'get', [ 'laundry' ]);
      });
    });

    it('throws NotFound for invalid service', done => {
      const callback = error => {
        try {
          assert.deepStrictEqual(error, { name: 'NotFound',
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
          assert.deepStrictEqual(error, {
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
          assert.deepStrictEqual(error, {
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
          assert.deepStrictEqual(error, {
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
