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
});
