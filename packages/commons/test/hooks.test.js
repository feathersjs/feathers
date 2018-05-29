const { expect } = require('chai');
const utils = require('../lib/hooks');

describe('hook utilities', () => {
  describe('.makeArguments', () => {
    it('basic functionality', () => {
      let args = utils.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      expect(args).to.deep.equal([2, { my: 'data' }, { some: 'thing' }]);

      args = utils.makeArguments({
        id: 0,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      expect(args).to.deep.equal([0, { my: 'data' }, { some: 'thing' }]);

      args = utils.makeArguments({
        params: { some: 'thing' },
        method: 'find'
      });

      expect(args).to.deep.equal([
        { some: 'thing' }
      ]);
    });

    it('uses .defaultMakeArguments', () => {
      let args = utils.makeArguments({
        params: { some: 'thing' },
        method: 'something',
        data: { test: 'me' }
      });

      expect(args).to.deep.equal([
        { test: 'me' },
        { some: 'thing' }
      ]);

      args = utils.makeArguments({
        id: 'testing',
        method: 'something'
      });

      expect(args).to.deep.equal([
        'testing', {}
      ]);
    });

    it('.makeArguments makes correct argument list for known methods', () => {
      let args = utils.makeArguments({
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'update'
      });

      expect(args).to.deep.equal([undefined, { my: 'data' }, { some: 'thing' }]);

      args = utils.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'remove'
      });

      expect(args).to.deep.equal([2, { some: 'thing' }]);

      args = utils.makeArguments({
        id: 2,
        data: { my: 'data' },
        params: { some: 'thing' },
        method: 'create'
      });

      expect(args).to.deep.equal([{ my: 'data' }, { some: 'thing' }]);
    });
  });

  describe('.convertHookData', () => {
    it('converts existing', () => {
      expect(utils.convertHookData('test')).to.deep.equal({
        all: [ 'test' ]
      });
    });

    it('converts to `all`', () => {
      expect(utils.convertHookData([ 'test', 'me' ])).to.deep.equal({
        all: [ 'test', 'me' ]
      });
    });

    it('converts all properties into arrays', () => {
      expect(utils.convertHookData({
        all: 'thing',
        other: 'value',
        hi: [ 'foo', 'bar' ]
      }))
        .to.deep.equal({
          all: [ 'thing' ],
          other: [ 'value' ],
          hi: [ 'foo', 'bar' ]
        });
    });
  });

  describe('.isHookObject', () => {
    it('with a valid hook object', () => {
      expect(utils.isHookObject({
        type: 'before',
        method: 'here'
      })).to.equal(true);
    });

    it('with an invalid hook object', () => {
      expect(utils.isHookObject({
        type: 'before'
      })).to.equal(false);
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
      let hookObject = utils.createHookObject('find', hookData);

      expect(hookObject.toJSON()).to.deep.equal({
        method: 'find',
        path: 'testing'
      });

      expect(JSON.stringify(hookObject)).to.equal(JSON.stringify({
        method: 'find',
        path: 'testing'
      }));
    });

    it('for find', () => {
      let hookObject = utils.createHookObject('find', hookData);

      expect(hookObject).to.deep.equal({
        method: 'find',
        app,
        service,
        path: 'testing'
      });

      hookObject = utils.createHookObject('find');

      expect(hookObject).to.deep.equal({
        method: 'find',
        path: null
      });

      hookObject = utils.createHookObject('find', hookData);

      expect(hookObject).to.deep.equal({
        method: 'find',
        app,
        service,
        path: 'testing'
      });
    });

    it('for get', () => {
      let hookObject = utils.createHookObject('get', hookData);

      expect(hookObject).to.deep.equal({
        method: 'get',
        app,
        service,
        path: 'testing'
      });

      hookObject = utils.createHookObject('get', hookData);

      expect(hookObject).to.deep.equal({
        method: 'get',
        app,
        service,
        path: 'testing'
      });
    });

    it('for remove', () => {
      let hookObject = utils.createHookObject('remove', hookData);

      expect(hookObject).to.deep.equal({
        method: 'remove',
        app,
        service,
        path: 'testing'
      });

      hookObject = utils.createHookObject('remove', hookData);

      expect(hookObject).to.deep.equal({
        method: 'remove',
        app,
        service,
        path: 'testing'
      });
    });

    it('for create', () => {
      const hookObject = utils.createHookObject('create', hookData);

      expect(hookObject).to.deep.equal({
        method: 'create',
        app,
        service,
        path: 'testing'
      });
    });

    it('for update', () => {
      const hookObject = utils.createHookObject('update', hookData);

      expect(hookObject).to.deep.equal({
        method: 'update',
        app,
        service,
        path: 'testing'
      });
    });

    it('for patch', () => {
      const hookObject = utils.createHookObject('patch', hookData);

      expect(hookObject).to.deep.equal({
        method: 'patch',
        app,
        service,
        path: 'testing'
      });
    });

    it('for custom method', () => {
      const hookObject = utils.createHookObject('custom', hookData);

      expect(hookObject).to.deep.equal({
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

      const promise = utils.processHooks([
        function (hook) {
          hook.chain = [ 'first' ];

          return Promise.resolve(hook);
        },

        function (hook, next) {
          hook.chain.push('second');

          next();
        },

        hook => {
          hook.chain.push('third');
        },

        function (hook) {
          hook.chain.push('fourth');

          return hook;
        }
      ], dummyHook);

      return promise.then(result => {
        expect(result).to.deep.equal({
          type: 'dummy',
          method: 'something',
          chain: [ 'first', 'second', 'third', 'fourth' ]
        });
      });
    });

    it('skip further hooks', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = utils.processHooks([
        function (hook) {
          hook.chain = [ 'first' ];

          return Promise.resolve(hook);
        },

        function (hook, next) {
          hook.chain.push('second');

          next();
        },

        hook => {
          hook.chain.push('third');

          return utils.SKIP;
        },

        function (hook) {
          hook.chain.push('fourth');

          return hook;
        },

        function (hook, next) {
          hook.chain.push('fourth');

          next();
        }
      ], dummyHook);

      return promise.then(result => {
        expect(result).to.deep.equal({
          type: 'dummy',
          method: 'something',
          chain: [ 'first', 'second', 'third' ]
        });
      });
    });

    it('next and next with error', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = utils.processHooks([
        function (hook, next) {
          hook.test = 'first ran';

          next();
        },

        function (hook, next) {
          next(new Error('This did not work'));
        }
      ], dummyHook);

      return promise.catch(error => {
        expect(error.message).to.equal('This did not work');
        expect(error.hook.test).to.equal('first ran');
      });
    });

    it('errors when invalid hook object is returned', () => {
      const dummyHook = {
        type: 'dummy',
        method: 'something'
      };

      const promise = utils.processHooks([
        function () {
          return {};
        }
      ], dummyHook);

      return promise.catch(e => {
        expect(e.message).to.equal(`dummy hook for 'something' method returned invalid hook object`);
        expect(typeof e.hook).to.equal('object');
      });
    });
  });

  describe('.enableHooks', () => {
    it('with custom types', () => {
      const base = {};

      utils.enableHooks(base, [], ['test']);

      expect(typeof base.__hooks).to.equal('object');
      expect(typeof base.__hooks.test).to.equal('object');
      expect(typeof base.__hooks.before).to.equal('undefined');
    });

    it('does nothing when .hooks method exists', () => {
      const base = {
        hooks () {}
      };

      utils.enableHooks(base, [], ['test']);
      expect(typeof base.__hooks).to.equal('undefined');
    });

    describe('.hooks method', () => {
      let base = {};

      beforeEach(() => {
        base = utils.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
      });

      it('registers hook with custom type and `all` method', () => {
        expect(typeof base.hooks).to.equal('function');

        const fn = function () {};

        base.hooks({ dummy: fn });

        expect(base.__hooks.dummy.testMethod).to.deep.equal([ fn ]);
      });

      it('registers hook with custom type and specific method', () => {
        base.hooks({
          dummy: {
            testMethod () {}
          }
        });

        expect(base.__hooks.dummy.testMethod.length).to.equal(1);
      });

      it('throws an error when registering invalid hook type', () => {
        try {
          base.hooks({ wrong: function () {} });
          throw new Error('Should never get here');
        } catch (e) {
          expect(e.message).to.equal(`'wrong' is not a valid hook type`);
        }
      });

      it('throws an error when registering invalid method', () => {
        try {
          base.hooks({ dummy: {
            wrongMethod: function () {}
          } });
          throw new Error('Should never get here');
        } catch (e) {
          expect(e.message).to.equal(`'wrongMethod' is not a valid hook method`);
        }
      });
    });
  });

  describe('.getHooks', () => {
    const app = utils.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
    const service = utils.enableHooks({}, [ 'testMethod' ], [ 'dummy' ]);
    const appHook = function () {};
    const serviceHook = function () {};

    app.hooks({
      dummy: appHook
    });

    service.hooks({
      dummy: serviceHook
    });

    it('combines app and service hooks', () => {
      expect(utils.getHooks(app, service, 'dummy', 'testMethod'))
        .to.deep.equal([ appHook, serviceHook ]);
    });

    it('combines app and service hooks with appLast', () => {
      expect(utils.getHooks(app, service, 'dummy', 'testMethod', true))
        .to.deep.equal([ serviceHook, appHook ]);
    });
  });
});
