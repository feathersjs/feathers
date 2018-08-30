const assert = require('assert');
const Proto = require('uberproto');
const { hooks } = require('@feathersjs/commons');
const feathers = require('../lib');

describe('Feathers application', () => {
  it('adds an ES module `default` export', () => {
    assert.equal(feathers, feathers.default);
  });

  it('initializes', () => {
    const app = feathers();

    assert.equal(typeof app.use, 'function');
    assert.equal(typeof app.service, 'function');
    assert.equal(typeof app.services, 'object');
  });

  it('sets the version on main and app instance', () => {
    const app = feathers();

    assert.equal(feathers.version, '3.0.0-development');
    assert.equal(app.version, '3.0.0-development');
  });

  it('sets SKIP on main', () => {
    assert.equal(feathers.SKIP, hooks.SKIP);
  });

  it('is an event emitter', done => {
    const app = feathers();
    const original = { hello: 'world' };

    app.on('test', data => {
      assert.deepEqual(original, data);
      done();
    });

    app.emit('test', original);
  });

  it('throws an error for old app.service(path, service)', () => {
    const app = feathers();

    try {
      app.service('/test', {});
    } catch (e) {
      assert.equal(e.message, 'Registering a new service with `app.service(path, service)` is no longer supported. Use `app.use(path, service)` instead.');
    }
  });

  it('uses .defaultService if available', () => {
    const app = feathers();

    assert.ok(!app.service('/todos/'));

    app.defaultService = function (path) {
      assert.equal(path, 'todos');
      return {
        get (id) {
          return Promise.resolve({
            id, description: `You have to do ${id}!`
          });
        }
      };
    };

    return app.service('/todos/').get('dishes').then(data => {
      assert.deepEqual(data, {
        id: 'dishes',
        description: 'You have to do dishes!'
      });
    });
  });

  it('additionally passes `app` as .configure parameter (#558)', done => {
    feathers().configure(function (app) {
      assert.equal(this, app);
      done();
    });
  });

  describe('Services', () => {
    it('calling .use with invalid path throws', () => {
      const app = feathers();

      try {
        app.use('/', {});
      } catch (e) {
        assert.equal(e.message, `'/' is not a valid service path.`);
      }

      try {
        app.use('', {});
      } catch (e) {
        assert.equal(e.message, `'' is not a valid service path.`);
      }

      try {
        app.use({}, {});
      } catch (e) {
        assert.equal(e.message, `'[object Object]' is not a valid service path.`);
      }
    });

    it('calling .use with a non service object throws', () => {
      const app = feathers();

      try {
        app.use('/bla', function () {});
        assert.ok(false, 'Should never get here');
      } catch (e) {
        assert.equal(e.message, 'Invalid service object passed for path `bla`');
      }
    });

    it('registers and wraps a new service', () => {
      const dummyService = {
        setup (app, path) {
          this.path = path;
        },

        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok(Proto.isPrototypeOf(wrappedService), 'Service got wrapped as Uberproto object');

      return wrappedService.create({
        message: 'Test message'
      }).then(data => assert.equal(data.message, 'Test message'));
    });

    it('services can be re-used (#566)', done => {
      const app1 = feathers();
      const app2 = feathers();

      app2.use('/dummy', {
        create (data) {
          return Promise.resolve(data);
        }
      });

      const dummy = app2.service('dummy');

      dummy.hooks({
        before: {
          create (hook) {
            hook.data.fromHook = true;
          }
        }
      });

      dummy.on('created', data => {
        assert.deepEqual(data, {
          message: 'Hi',
          fromHook: true
        });
        done();
      });

      app1.use('/testing', app2.service('dummy'));

      app1.service('testing').create({ message: 'Hi' });
    });

    it('services conserve Symbols', () => {
      const TEST = Symbol('test');
      const dummyService = {
        [TEST]: true,

        setup (app, path) {
          this.path = path;
        },

        create (data) {
          return Promise.resolve(data);
        }
      };

      const app = feathers().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok(wrappedService[TEST]);
    });

    it('methods conserve Symbols', () => {
      const TEST = Symbol('test');
      const dummyService = {
        setup (app, path) {
          this.path = path;
        },

        create (data) {
          return Promise.resolve(data);
        }
      };

      dummyService.create[TEST] = true;

      const app = feathers().use('/dummy', dummyService);
      const wrappedService = app.service('dummy');

      assert.ok(wrappedService.create[TEST]);
    });
  });

  // Copied from the Express tests (without special cases)
  describe('Express app options compatibility', function () {
    describe('.set()', () => {
      it('should set a value', () => {
        var app = feathers();
        app.set('foo', 'bar');
        assert.equal(app.get('foo'), 'bar');
      });

      it('should return the app', () => {
        var app = feathers();
        assert.equal(app.set('foo', 'bar'), app);
      });

      it('should return the app when undefined', () => {
        var app = feathers();
        assert.equal(app.set('foo', undefined), app);
      });
    });

    describe('.get()', () => {
      it('should return undefined when unset', () => {
        var app = feathers();
        assert.strictEqual(app.get('foo'), undefined);
      });

      it('should otherwise return the value', () => {
        var app = feathers();
        app.set('foo', 'bar');
        assert.equal(app.get('foo'), 'bar');
      });
    });

    describe('.enable()', () => {
      it('should set the value to true', () => {
        var app = feathers();
        assert.equal(app.enable('tobi'), app);
        assert.strictEqual(app.get('tobi'), true);
      });
    });

    describe('.disable()', () => {
      it('should set the value to false', () => {
        var app = feathers();
        assert.equal(app.disable('tobi'), app);
        assert.strictEqual(app.get('tobi'), false);
      });
    });

    describe('.enabled()', () => {
      it('should default to false', () => {
        var app = feathers();
        assert.strictEqual(app.enabled('foo'), false);
      });

      it('should return true when set', () => {
        var app = feathers();
        app.set('foo', 'bar');
        assert.strictEqual(app.enabled('foo'), true);
      });
    });

    describe('.disabled()', () => {
      it('should default to true', () => {
        var app = feathers();
        assert.strictEqual(app.disabled('foo'), true);
      });

      it('should return false when set', () => {
        var app = feathers();
        app.set('foo', 'bar');
        assert.strictEqual(app.disabled('foo'), false);
      });
    });
  });

  describe('.setup', () => {
    it('app.setup calls .setup on all services', () => {
      const app = feathers();
      let setupCount = 0;

      app.use('/dummy', {
        setup (appRef, path) {
          setupCount++;
          assert.equal(appRef, app);
          assert.equal(path, 'dummy');
        }
      });

      app.use('/simple', {
        get (id) {
          return Promise.resolve({ id });
        }
      });

      app.use('/dummy2', {
        setup (appRef, path) {
          setupCount++;
          assert.equal(appRef, app);
          assert.equal(path, 'dummy2');
        }
      });

      app.setup();

      assert.ok(app._isSetup);
      assert.equal(setupCount, 2);
    });

    it('registering a service after app.setup will be set up', () => {
      const app = feathers();

      app.setup();

      app.use('/dummy', {
        setup (appRef, path) {
          assert.ok(app._isSetup);
          assert.equal(appRef, app);
          assert.equal(path, 'dummy');
        }
      });
    });

    it('calls _setup on a service right away', () => {
      const app = feathers();
      let _setup = false;

      app.use('/dummy', {
        get () {},
        _setup (appRef, path) {
          _setup = true;
          assert.equal(appRef, app);
          assert.equal(path, 'dummy');
        }
      });

      assert.ok(_setup);
    });
  });

  describe('providers', () => {
    it('are getting called with a service', () => {
      const app = feathers();
      let providerRan = false;

      app.providers.push(function (service, location, options) {
        assert.ok(service.dummy);
        assert.equal(location, 'dummy');
        assert.deepEqual(options, {});
        providerRan = true;
      });

      app.use('/dummy', {
        dummy: true,
        get () {}
      });

      assert.ok(providerRan);

      app.setup();
    });

    it('are getting called with a service and options', () => {
      const app = feathers();
      const opts = { test: true };

      let providerRan = false;

      app.providers.push(function (service, location, options) {
        assert.ok(service.dummy);
        assert.equal(location, 'dummy');
        assert.deepEqual(options, opts);
        providerRan = true;
      });

      app.use('/dummy', {
        dummy: true,
        get () {}
      }, opts);

      assert.ok(providerRan);

      app.setup();
    });
  });

  describe('sub apps', () => {
    it('re-registers sub-app services with prefix', done => {
      const app = feathers();
      const subApp = feathers();

      subApp.use('/service1', {
        get (id) {
          return Promise.resolve({
            id, name: 'service1'
          });
        }
      }).use('/service2', {
        get (id) {
          return Promise.resolve({
            id, name: 'service2'
          });
        },

        create (data) {
          return Promise.resolve(data);
        }
      });

      app.use('/api/', subApp);

      app.service('/api/service2').once('created', data => {
        assert.deepEqual(data, {
          message: 'This is a test'
        });

        subApp.service('service2').once('created', data => {
          assert.deepEqual(data, {
            message: 'This is another test'
          });

          done();
        });

        app.service('api/service2').create({
          message: 'This is another test'
        });
      });

      app.service('/api/service1').get(10).then(data => {
        assert.equal(data.name, 'service1');

        return app.service('/api/service2').get(1);
      }).then(data => {
        assert.equal(data.name, 'service2');

        return subApp.service('service2').create({
          message: 'This is a test'
        });
      });
    });
  });
});
