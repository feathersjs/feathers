import { strict as assert } from 'assert';
import * as hooks from '../../src/hooks/commons';

describe('hook utilities', () => {
  describe('.makeArguments', () => {
    it('basic functionality', () => {
      let args = hooks.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      assert.deepEqual(args, [2, { my: 'data' }, { some: 'thing' }]);

      args = hooks.makeArguments({
        id: 0,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      assert.deepEqual(args, [0, { my: 'data' }, { some: 'thing' }]);

      args = hooks.makeArguments({
        params: { some: 'thing' },
        method: 'find'
      });

      assert.deepEqual(args, [
        { some: 'thing' }
      ]);
    });

    it('uses .defaultMakeArguments', () => {
      let args = hooks.makeArguments({
        params: { some: 'thing' },
        method: 'something',
        data: { test: 'me' }
      });

      assert.deepEqual(args, [
        { test: 'me' },
        { some: 'thing' }
      ]);

      args = hooks.makeArguments({
        id: 'testing',
        method: 'something'
      });

      assert.deepEqual(args, [
        'testing', {}
      ]);
    });

    it('.makeArguments makes correct argument list for known methods', () => {
      let args = hooks.makeArguments({
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      assert.deepEqual(args, [undefined, { my: 'data' }, { some: 'thing' }]);

      args = hooks.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'remove'
      });

      assert.deepEqual(args, [2, { some: 'thing' }]);

      args = hooks.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'create'
      });

      assert.deepEqual(args, [{ my: 'data' }, { some: 'thing' }]);
    });
  });

  describe('.convertHookData', () => {
    it('converts existing', () => {
      assert.deepEqual(hooks.convertHookData('test'), {
        all: [ 'test' ]
      });
    });

    it('converts to `all`', () => {
      assert.deepEqual(hooks.convertHookData([ 'test', 'me' ]), {
        all: [ 'test', 'me' ]
      });
    });

    it('converts all properties into arrays', () => {
      assert.deepEqual(hooks.convertHookData({
        all: 'thing',
        other: 'value',
        hi: [ 'foo', 'bar' ]
      }), {
        all: [ 'thing' ],
        other: [ 'value' ],
        hi: [ 'foo', 'bar' ]
      });
    });
  });

  describe('.isHookObject', () => {
    it('with a valid hook object', () => {
      assert.ok(hooks.isHookObject({
        type: 'before',
        method: 'here'
      }));
    });

    it('with an invalid hook object', () => {
      assert.ok(!hooks.isHookObject({
        type: 'before'
      }));
    });
  });

  describe('.createHookObject', () => {
    const service = {};
    const app = {
      services: {
        testing: service
      }
    };
    const hookData = { app, service };

    it('.toJSON', () => {
      const hookObject = hooks.createHookObject('find', hookData);

      assert.deepEqual(hookObject.toJSON(), {
        method: 'find',
        path: 'testing'
      });

      assert.equal(JSON.stringify(hookObject), JSON.stringify({
        method: 'find',
        path: 'testing'
      }));
    });

    it('for find', () => {
      let hookObject = hooks.createHookObject('find', hookData);

      assert.deepEqual(hookObject, {
        method: 'find',
        app,
        service,
        path: 'testing'
      });

      hookObject = hooks.createHookObject('find');

      assert.deepEqual(hookObject, {
        method: 'find',
        path: null
      });

      hookObject = hooks.createHookObject('find', hookData);

      assert.deepEqual(hookObject, {
        method: 'find',
        app,
        service,
        path: 'testing'
      });
    });

    it('for get', () => {
      let hookObject = hooks.createHookObject('get', hookData);

      assert.deepEqual(hookObject, {
        method: 'get',
        app,
        service,
        path: 'testing'
      });

      hookObject = hooks.createHookObject('get', hookData);

      assert.deepEqual(hookObject, {
        method: 'get',
        app,
        service,
        path: 'testing'
      });
    });

    it('for remove', () => {
      let hookObject = hooks.createHookObject('remove', hookData);

      assert.deepEqual(hookObject, {
        method: 'remove',
        app,
        service,
        path: 'testing'
      });

      hookObject = hooks.createHookObject('remove', hookData);

      assert.deepEqual(hookObject, {
        method: 'remove',
        app,
        service,
        path: 'testing'
      });
    });

    it('for create', () => {
      const hookObject = hooks.createHookObject('create', hookData);

      assert.deepEqual(hookObject, {
        method: 'create',
        app,
        service,
        path: 'testing'
      });
    });

    it('for update', () => {
      const hookObject = hooks.createHookObject('update', hookData);

      assert.deepEqual(hookObject, {
        method: 'update',
        app,
        service,
        path: 'testing'
      });
    });

    it('for patch', () => {
      const hookObject = hooks.createHookObject('patch', hookData);

      assert.deepEqual(hookObject, {
        method: 'patch',
        app,
        service,
        path: 'testing'
      });
    });

    it('for custom method', () => {
      const hookObject = hooks.createHookObject('custom', hookData);

      assert.deepEqual(hookObject, {
        method: 'custom',
        app,
        service,
        path: 'testing'
      });
    });
  });

  describe('.processHooks', () => {
    it('runs through a hook chain with various formats', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = hooks.processHooks([
        function (hook: any) {
          hook.chain = [ 'first' ];

          return Promise.resolve(hook);
        },

        (hook: any) => {
          hook.chain.push('second');
        },

        function (hook: any) {
          hook.chain.push('third');

          return hook;
        }
      ], dummyHook);

      return promise.then((result: any) => {
        assert.deepEqual(result, {
          type: 'dummy',
          method: 'something',
          chain: [ 'first', 'second', 'third' ]
        });
      });
    });

    it('errors when invalid hook object is returned', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = hooks.processHooks([
        function () {
          return {};
        }
      ], dummyHook);

      return promise.catch((e: any) => {
        assert.equal(e.message, 'dummy hook for \'something\' method returned invalid hook object');
        assert.equal(typeof e.hook, 'object');
      });
    });
  });

  describe('.enableHooks', () => {
    it('with custom types', () => {
      const base: any = {};

      hooks.enableHooks(base, [], ['test']);

      assert.equal(typeof base.__hooks, 'object');
      assert.equal(typeof base.__hooks.test, 'object');
      assert.equal(typeof base.__hooks.before, 'undefined');
    });

    it('does nothing when .hooks method exists', () => {
      const base: any = {
        hooks () {}
      };

      hooks.enableHooks(base, [], ['test']);
      assert.equal(typeof base.__hooks, 'undefined');
    });

    describe('.hooks method', () => {
      let base: any = {};

      beforeEach(() => {
        base = hooks.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
      });

      it('registers hook with custom type and `all` method', () => {
        assert.equal(typeof base.hooks, 'function');

        const fn = function () {};

        base.hooks({ dummy: fn });

        assert.deepEqual(base.__hooks.dummy.testMethod, [ fn ]);
      });

      it('registers hook with custom type and specific method', () => {
        base.hooks({
          dummy: {
            testMethod () {}
          }
        });

        assert.equal(base.__hooks.dummy.testMethod.length, 1);
      });

      it('throws an error when registering invalid hook type', () => {
        try {
          base.hooks({ wrong () {} });
          throw new Error('Should never get here');
        } catch (e) {
          assert.equal(e.message, '\'wrong\' is not a valid hook type');
        }
      });

      it('throws an error when registering invalid method', () => {
        try {
          base.hooks({ dummy: {
            wrongMethod () {}
          } });
          throw new Error('Should never get here');
        } catch (e) {
          assert.equal(e.message, '\'wrongMethod\' is not a valid hook method');
        }
      });
    });
  });

  describe('.getHooks', () => {
    const app = hooks.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
    const service = hooks.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
    const appHook = function () {};
    const serviceHook = function () {};

    app.hooks({
      dummy: appHook
    });

    service.hooks({
      dummy: serviceHook
    });

    it('combines app and service hooks', () => {
      assert.deepEqual(hooks.getHooks(app, service, 'dummy', 'testMethod'), [
        appHook, serviceHook
      ]);
    });

    it('combines app and service hooks with appLast', () => {
      assert.deepEqual(hooks.getHooks(app, service, 'dummy', 'testMethod', true), [
        serviceHook, appHook
      ]);
    });
  });
});
