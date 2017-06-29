import assert from 'assert';
import Proto from 'uberproto';

import feathers from '../src';

describe('Feathers application', () => {
  it('initializes', () => {
    const app = feathers();

    assert.equal(typeof app.use, 'function');
    assert.equal(typeof app.service, 'function');
    assert.equal(typeof app.services, 'object');
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

  it('providers are getting called with a service', () => {
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

  describe('Services', () => {
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
});
