import assert from 'assert';
import Proto from 'uberproto';
import feathers from '../src/client';

describe('Feathers universal client', () => {
  it('is not an Express application', () => {
    const app = feathers();
    // There may be some other better ways to verify this but it works for now
    assert.ok(typeof app.render !== 'function');
  });

  it('calling .use with a function throws', () => {
    const app = feathers();

    try {
      app.use(function() {});
      assert.ok(false, 'Should never get here');
    } catch(e) {
      assert.equal(e.message, 'Middleware functions can not be used in the Feathers client');
    }
  });

  it('.listen does nothing', () => {
    assert.deepEqual(feathers().listen(), {});
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

  it('Registers a service, wraps it, runs service.setup(), and adds the event and Promise mixin', done => {
    const dummyService = {
      setup(app, path){
        this.path = path;
      },

      create(data) {
        return Promise.resolve(data);
      }
    };

    const app = feathers().use('/dummy', dummyService);
    const wrappedService = app.service('dummy');

    assert.ok(Proto.isPrototypeOf(wrappedService), 'Service got wrapped as Uberproto object');
    assert.ok(typeof wrappedService.on === 'function', 'Wrapped service is an event emitter');

    wrappedService.on('created', function (data) {
      assert.equal(data.message, 'Test message', 'Got created event with test message');
      done();
    });

    wrappedService.create({
      message: 'Test message'
    }).then(data =>
      assert.equal(data.message, 'Test message', 'Got created event with test message'));
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
