const assert = require('assert');
const feathers = require('../lib');
const Service = require('../lib/Service');

describe('Service', () => {
  it('initializes', () => {
    const service = new Service();

    assert.strictEqual(typeof service.enableHooks, 'function');
    assert.strictEqual(typeof service._setup, 'function');
    assert.strictEqual(typeof service.setup, 'function');
    assert.strictEqual(typeof service.hooks, 'undefined');
  });

  it('enables hooks works in contructor', () => {
    class Person extends Service {
      constructor () {
        super({
          methods: {
            sayHello: ['data', 'params']
          }
        });
      }

      sayHello (data, params = {}) {
        return { message: `Hello ${data.name ? data.name : 'you'} !` };
      }
    }
    const person = new Person();

    assert.deepStrictEqual(person.sayHello({ name: 'Bertho' }), { message: 'Hello Bertho !' });
    assert.strictEqual(typeof person.hooks, 'function');
  });

  it('.enableHooks works in contructor', () => {
    class Person extends Service {
      constructor () {
        super();

        this.enableHooks({
          methods: {
            sayHello: ['data', 'params']
          }
        });
      }

      sayHello (data, params = {}) {
        return { message: `Hello ${data.name ? data.name : 'you'} !` };
      }
    }
    const person = new Person();

    assert.deepStrictEqual(person.sayHello({ name: 'Bertho' }), { message: 'Hello Bertho !' });
    assert.strictEqual(typeof person.hooks, 'function');
  });

  it('.enableHooks after .setup', () => {
    class Person extends Service {
      async sayHello (data, params = {}) {
        return { message: `Hello ${data.name ? data.name : 'you'} !` };
      }
    }
    const person = new Person();

    assert.strictEqual(typeof person.hooks, 'undefined');

    person.setup();

    person.enableHooks({
      sayHello: ['data', 'params']
    });

    assert.strictEqual(typeof person.hooks, 'function');

    return person.sayHello({ name: 'Bertho' })
      .then(result => {
        assert.deepStrictEqual(result, { message: 'Hello Bertho !' });
      });
  });

  it('can add hooks', () => {
    class Person extends Service {
      constructor () {
        super({
          methods: {
            sayHello: ['data', 'params']
          }
        });
      }

      sayHello (data, params = {}) {
        return { message: `Hello ${data.name ? data.name : 'you'} !` };
      }
    }
    const person = new Person().setup();

    const hook = ctx => ctx;

    person.hooks({
      before: hook
    });

    assert.deepStrictEqual(person.__hooks, {
      async: {},
      before: {
        sayHello: [hook]
      },
      after: {},
      error: {},
      finally: {}
    });
  });

  it('run hooks on method call', () => {
    class Person extends Service {
      constructor () {
        super({
          methods: {
            sayHello: ['data', 'params'],
            unknown: ['data', 'params']
          }
        });
      }

      async sayHello (data, params = {}) {
        return { message: `Hello ${data.name ? data.name : 'you'} !` };
      }
    }

    const person = new Person();

    const hook = ctx => {
      return ctx;
    };

    person.setup();

    person.hooks({
      before: hook
    });

    return person.sayHello({
      name: 'Bertho'
    })
      .then(result => assert.deepStrictEqual(result.message, 'Hello Bertho !'));
  });

  describe('hooks basics', () => {
    class Dummy extends Service {
      constructor () {
        super({
          methods: {
            get: ['id', 'params'],
            create: ['data', 'params']
          }
        });
      }

      get (id, params) {
        return Promise.resolve({ id, user: params.user });
      }

      create (data) {
        return Promise.resolve(data);
      }
    }

    it('validates arguments', () => {
      const service = new Dummy();

      service.setup();

      return service.get(1, {}, function () {}).catch(e => {
        assert.strictEqual(e.message, 'Callbacks are no longer supported. Use Promises or async/await instead.');

        return service.get();
      }).catch(e => {
        assert.strictEqual(e.message, `An id must be provided to the 'get' method`);
      }).then(() =>
        service.create()
      ).catch(e => {
        assert.strictEqual(e.message, `A data object must be provided to the 'create' method`);
      });
    });

    it('works with services that return a promise (feathers-hooks#28)', () => {
      const service = new Dummy();

      service.setup();

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
        assert.deepStrictEqual(data, { id: 10, user: 'David', after: true });
      });
    });

    it('has hook.app, hook.service and hook.path', () => {
      const svc = new Dummy();

      const app = feathers().use('/dummy', svc);

      const service = app.service('dummy');

      service.hooks({
        before (hook) {
          assert.strictEqual(this, service);
          assert.strictEqual(hook.service, service);
          assert.strictEqual(hook.app, app);
          assert.strictEqual(hook.path, 'dummy');
        }
      });

      return service.get('test');
    });

    it('does not error when result is null', () => {
      const service = new Dummy().setup();

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
        .then(result => assert.strictEqual(result, null));
    });

    it('invalid type in .hooks throws error', () => {
      const service = new Dummy().setup();

      try {
        service.hooks({
          invalid: {}
        });
        assert.ok(false);
      } catch (e) {
        assert.strictEqual(e.message, `'invalid' is not a valid hook type`);
      }
    });

    it('invalid hook method throws error', () => {
      const service = new Dummy().setup();

      try {
        service.hooks({
          before: {
            invalid () {}
          }
        });
        assert.ok(false);
      } catch (e) {
        assert.strictEqual(e.message, `'invalid' is not a valid hook method`);
      }
    });

    it('registering an already hooked service works (#154)', () => {
      const service = new Dummy().setup();

      feathers().use('/dummy2', service);
    });

    it('not returning a promise errors', () => {
      class Dummy2 extends Service {
        constructor () {
          super({
            methods: {
              get: ['id', 'params']
            }
          });
        }
        get () {
          return {};
        }
      }

      const app = feathers().use('/dummy', new Dummy2());

      return app.service('dummy').get(1).catch(e => {
        assert.strictEqual(e.message, `Service method 'get' for 'dummy' service must return a promise`);
      });
    });
  });

  describe('returns the hook object when passing true as last parameter', () => {
    it('on normal method call', () => {
      class Dummy extends Service {
        constructor () {
          super({
            methods: {
              get: ['id', 'params']
            }
          });
        }

        get (id, params) {
          return Promise.resolve({ id, params });
        }
      }

      const service = new Dummy().setup();

      return service.get(10, {}, true).then(context => {
        assert.strictEqual(context.type, 'after');
        assert.strictEqual(context.path, null);
        assert.deepStrictEqual(context.result, {
          id: 10,
          params: {}
        });
      });
    });

    it('on error', () => {
      class Dummy extends Service {
        constructor () {
          super({
            methods: {
              get: ['id', 'params']
            }
          });
        }

        get (id, params) {
          return Promise.reject(new Error('Something went wrong'));
        }
      }

      const service = new Dummy().setup();

      return service.get(10, {}, true).catch(context => {
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.error.message, 'Something went wrong');
      });
    });

    it('on argument validation error (https://github.com/feathersjs/express/issues/19)', () => {
      class Dummy extends Service {
        constructor () {
          super({
            methods: {
              get: ['id', 'params']
            }
          });
        }

        get (id) {
          return Promise.resolve({ id });
        }
      }

      const service = new Dummy().setup();

      return service.get(undefined, {}, true).catch(context => {
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.error.message, 'An id must be provided to the \'get\' method');
      });
    });

    it('on error in error hook (https://github.com/feathersjs/express/issues/21)', () => {
      class Dummy extends Service {
        constructor () {
          super({
            methods: {
              get: ['id', 'params']
            }
          });
        }

        get (id) {
          return Promise.reject(new Error('Nope'));
        }
      }

      const service = new Dummy().setup();

      service.hooks({
        error: {
          get (context) {
            throw new Error('Error in error hook');
          }
        }
      });

      return service.get(10, {}, true).catch(context => {
        assert.strictEqual(context.type, 'error');
        assert.strictEqual(context.error.message, 'Error in error hook');
      });
    });

    it('still swallows error if context.result is set', () => {
      const result = { message: 'this is a test' };

      class Dummy extends Service {
        constructor () {
          super({
            methods: {
              get: ['id', 'params']
            }
          });
        }

        get (id) {
          return Promise.reject(new Error('Something went wrong'));
        }
      }

      const service = new Dummy().setup();

      service.hooks({
        error (context) {
          context.result = result;
        }
      });

      return service.get(10, {}, true).then(hook => {
        assert.ok(hook.error);
        assert.deepStrictEqual(hook.result, result);
      }).catch(() => {
        throw new Error('Should never get here');
      });
    });
  });

  it('can register hooks on a custom method', () => {
    class Dummy extends Service {
      constructor () {
        super({
          methods: {
            custom: ['id', 'data', 'params']
          }
        });
      }

      custom (id, data, params) {
        return Promise.resolve([id, data, params]);
      }

      other (id, data, params) {
        return Promise.resolve([id, data, params]);
      }
    }

    const service = new Dummy();

    service.enableHooks({
      other: ['id', 'data', 'params']
    });

    service.hooks({
      before: {
        all (context) {
          context.test = ['all::before'];
        },
        custom (context) {
          context.test.push('custom::before');
        }
      },
      after: {
        all (context) {
          context.test.push('all::after');
        },
        custom (context) {
          context.test.push('custom::after');
        }
      }
    });

    service.setup();

    const args = [1, { test: 'ok' }, { provider: 'rest' }];

    assert.deepStrictEqual(service.methods, {
      // find: ['params'],
      // get: ['id', 'params'],
      // create: ['data', 'params'],
      // update: ['id', 'data', 'params'],
      // patch: ['id', 'data', 'params'],
      // remove: ['id', 'params'],
      custom: ['id', 'data', 'params'],
      other: ['id', 'data', 'params']
    });

    return service.custom(...args, true)
      .then(hook => {
        assert.deepStrictEqual(hook.result, args);
        assert.deepStrictEqual(hook.test, ['all::before', 'custom::before', 'all::after', 'custom::after']);

        service.other(...args, true)
          .then(hook => {
            assert.deepStrictEqual(hook.result, args);
            assert.deepStrictEqual(hook.test, ['all::before', 'all::after']);
          });
      });
  });

  it('context.data should not change arguments', () => {
    class Dummy extends Service {
      constructor () {
        super({
          methods: {
            custom: ['id', 'params']
          }
        });
      }

      custom (id, params) {
        return Promise.resolve([id, params]);
      }
    }

    const service = new Dummy().setup();

    service.hooks({
      before: {
        all (context) {
          context.test = ['all::before'];
        },
        custom (context) {
          context.data = { post: 'title' };
        }
      }
    });

    const args = [1, { provider: 'rest' }];

    return service.custom(...args)
      .then(result => {
        assert.deepStrictEqual(result, args);
      });
  });

  it('normalizes params to object even when it is falsy (#1001)', () => {
    class Dummy extends Service {
      constructor () {
        super({
          methods: {
            get: ['id', 'params']
          }
        });
      }

      get (id, params) {
        return Promise.resolve({ id, params });
      }
    }

    const service = new Dummy().setup();

    return service.get('test', null).then(result => {
      assert.deepStrictEqual(result, {
        id: 'test',
        params: {}
      });
    });
  });
});
