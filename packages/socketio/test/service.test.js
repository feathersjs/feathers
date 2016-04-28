import assert from 'assert';
import { verify } from 'feathers-commons/lib/test-fixture';

export default function(name, options) {
  it(`invalid arguments cause an error`, done => {
    options.socket.emit(`${name}::find`, 1, {}, function(error) {
      assert.equal(error.message, `Too many arguments for 'find' service method`);
      done();
    });
  });

  describe(`CRUD`, () => {
    it(`::find`, function (done) {
      options.socket.emit(`${name}::find`, {}, function (error, data) {
        verify.find(data);

        done(error);
      });
    });

    it(`::get`, done => {
      options.socket.emit(`${name}::get`, `laundry`, {}, function (error, data) {
        verify.get(`laundry`, data);

        done(error);
      });
    });

    it(`::get with error`, done => {
      options.socket.emit(`${name}::get`, `laundry`, { error: true }, function (error) {
        assert.equal(error.message, 'Something for laundry went wrong');
        done();
      });
    });

    it(`::get with runtime error`, done => {
      options.socket.emit(`${name}::get`, `laundry`, { runtimeError: true }, function (error) {
        assert.equal(error.message, 'thingThatDoesNotExist is not defined');
        done();
      });
    });

    it(`::get with error in hook`, done => {
      options.socket.emit(`${name}::get`, `laundry`, { hookError: true }, function (error) {
        assert.equal(error.message, 'Error from get, before hook');
        done();
      });
    });

    it(`::create`, done => {
      let original = {
        name: `creating`
      };

      options.socket.emit(`${name}::create`, original, {}, function (error, data) {
        verify.create(original, data);

        done(error);
      });
    });

    it(`::create without parameters and callback`, done => {
      let original = {
        name: `creating`
      };

      options.socket.emit(`${name}::create`, original);

      options.socket.once(`${name} created`, function(data) {
        verify.create(original, data);

        done();
      });
    });

    it(`::update`, done => {
      let original = {
        name: `updating`
      };

      options.socket.emit(`${name}::update`, 23, original, {}, function (error, data) {
        verify.update(23, original, data);

        done(error);
      });
    });

    it(`::update many`, done => {
      let original = {
        name: `updating`,
        many: true
      };

      options.socket.emit(`${name}::update`, null, original, {}, function (error, data) {
        verify.update(null, original, data);

        done(error);
      });
    });

    it(`::patch`, done => {
      let original = {
        name: `patching`
      };

      options.socket.emit(`${name}::patch`, 25, original, {}, function (error, data) {
        verify.patch(25, original, data);

        done(error);
      });
    });

    it(`::patch many`, done => {
      let original = {
        name: `patching`,
        many: true
      };

      options.socket.emit(`${name}::patch`, null, original, {}, function (error, data) {
        verify.patch(null, original, data);

        done(error);
      });
    });

    it(`::remove`, done => {
      options.socket.emit(`${name}::remove`, 11, {}, function (error, data) {
        verify.remove(11, data);

        done(error);
      });
    });

    it(`::remove many`, done => {
      options.socket.emit(`${name}::remove`, null, {}, function (error, data) {
        verify.remove(null, data);

        done(error);
      });
    });
  });

  describe(`Events`, () => {
    it(`created`, done => {
      let original = {
        name: `created event`
      };

      options.socket.once(`${name} created`, function (data) {
        verify.create(original, data);
        done();
      });

      options.socket.emit(`${name}::create`, original, {}, function () {});
    });

    it(`updated`, done => {
      let original = {
        name: `updated event`
      };

      options.socket.once(`${name} updated`, function (data) {
        verify.update(10, original, data);
        done();
      });

      options.socket.emit(`${name}::update`, 10, original, {}, function () {});
    });

    it(`patched`, done => {
      let original = {
        name: `patched event`
      };

      options.socket.once(`${name} patched`, function (data) {
        verify.patch(12, original, data);
        done();
      });

      options.socket.emit(`${name}::patch`, 12, original, {}, function () {});
    });

    it(`removed`, done => {
      options.socket.once(`${name} removed`, function (data) {
        verify.remove(333, data);
        done();
      });

      options.socket.emit(`${name}::remove`, 333, {}, function () {});
    });

    it(`custom events`, done => {
      let service = options.app.service(name);
      let original = {
        name: `created event`
      };
      let old = service.create;

      service.create = function(data) {
        this.emit(`log`, { message: `Custom log event`, data: data });
        service.create = old;
        return old.apply(this, arguments);
      };

      options.socket.once(`${name} log`, function(data) {
        assert.deepEqual(data, { message: `Custom log event`, data: original });
        done();
      });

      options.socket.emit(`${name}::create`, original, {}, function () {});
    });
  });

  describe(`Event filtering`, () => {
    before(done => setTimeout(done, 20));

    it(`.created`, done => {
      let service = options.app.service(name);
      let original = { description: `created event test` };
      let oldCreated = service.created;

      service.created = function(data, params, callback) {
        assert.deepEqual(params, options.socketParams);
        verify.create(original, data);

        callback(null, Object.assign({ processed: true }, data));
      };

      options.socket.emit(`${name}::create`, original, {}, function() {});

      options.socket.once(`${name} created`, function (data) {
        service.created = oldCreated;
        // Make sure ${name} got processed
        verify.create(Object.assign({ processed: true }, original), data);
        done();
      });
    });

    it(`.removed`, done => {
      let service = options.app.service(name);
      let oldRemoved = service.removed;

      service.removed = function(data, params, callback) {
        assert.deepEqual(params, options.socketParams);

        if(data.id === 23) {
          // Only dispatch with given id
          return callback(null, data);
        }

        callback(null, false);
      };

      options.socket.emit(`${name}::remove`, 1, {}, function() {});
      options.socket.emit(`${name}::remove`, 23, {}, function() {});

      options.socket.once(`${name} removed`, function (data) {
        service.removed = oldRemoved;
        assert.equal(data.id, 23);
        done();
      });
    });

    it(`adds service.filter and registers event callback`, () => {
      let service = options.app.service(name);

      assert.equal(typeof service.filter, `function`);
      assert.equal(typeof service._eventFilters, `object`);

      service.filter(`created`, function() {});
      assert.equal(service._eventFilters.created.length, 1);

      service._eventFilters = {};
    });

    it(`filters an event and passes the right parameters`, done => {
      let service = options.app.service(name);
      let original = { description: `created event test` };

      service.filter(`created`, function(data, connection, hook) {
        assert.deepEqual(connection, options.socketParams);
        assert.deepEqual(hook.params, {
          query: { test: true },
          provider: `socketio`,
          user: { name: `David` }
        });

        verify.create(original, data);

        return Object.assign({ processed: true }, data);
      });

      options.socket.emit(`${name}::create`, original, { test: true });

      options.socket.once(`${name} created`, function (data) {
        service._eventFilters = {};
        // Make sure ${name} got processed
        verify.create(Object.assign({ processed: true }, original), data);
        done();
      });
    });

    it(`chains filters of different types and lets you modify data`, done => {
      let service = options.app.service(name);
      let original = { description: `created event test` };

      service.filter(`created`, [
        function(data) {
          return Object.assign({ processed: true }, data);
        },

        function(data, connection, hook, callback) {
          data = Object.assign({ next: true }, data);
          callback(null, data);
        }
      ]);

      options.socket.emit(`${name}::create`, original, { test: true });

      options.socket.once(`${name} created`, function (data) {
        service._eventFilters = {};
        // Make sure ${name} got processed
        verify.create(Object.assign({
          processed: true,
          next: true
        }, original), data);
        done();
      });
    });

    it(`filter errors stop execution and send pathed error`, done => {
      let service = options.app.service(name);
      let original = { description: `created event test` };

      service.filter(`created`, [
        function() {
          throw new Error(`Nooo!`);
        },

        function() {
          assert.ok(false, `Should never get here`);
        }
      ]);

      options.socket.once(`${name} error`, error => {
        assert.equal(error.message, `Nooo!`);
        service._eventFilters = {};
        done();
      });

      options.socket.emit(`${name}::create`, original, { test: true });
    });

    it(`stops execution when a filter returns falsy`, done => {
      let service = options.app.service(name);

      service.filter(`removed`, [
        function(data, connection) {
          assert.deepEqual(connection, options.socketParams);

          if(data.id === 23) {
            // Only dispatch with given id
            return data;
          }

          return false;
        },

        function(data) {
          if(data.id !== 23) {
            assert.ok(false, `Should never get here`);
          }
          return data;
        }
      ]);


      options.socket.emit(`${name}::remove`, 1, {}, function() {});
      options.socket.emit(`${name}::remove`, 23, {}, function() {});

      options.socket.once(`${name} removed`, function (data) {
        assert.equal(data.id, 23);
        service._eventFilters = {};
        done();
      });
    });
  });
}
