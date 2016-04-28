import assert from 'assert';
import { verify } from 'feathers-commons/lib/test-fixture';

export default function(name, options) {
  it(`invalid arguments cause an error`, function (done) {
    options.socket.send(`${name}::find`, 1, {}, function(error) {
      assert.equal(error.message, `Too many arguments for 'find' service method`);
      done();
    });
  });

  describe(`CRUD`, function () {

    it(`::find`, function (done) {
      options.socket.send(`${name}::find`, {}, function (error, data) {
        verify.find(data);

        done(error);
      });
    });

    it(`::get`, function (done) {
      options.socket.send(`${name}::get`, `laundry`, {}, function (error, data) {
        verify.get(`laundry`, data);

        done(error);
      });
    });

    it(`::get with error`, done => {
      options.socket.send(`${name}::get`, `laundry`, { error: true }, function (error) {
        assert.equal(error.message, 'Something for laundry went wrong');
        done();
      });
    });

    it(`::get with runtime error`, done => {
      options.socket.send(`${name}::get`, `laundry`, { runtimeError: true }, function (error) {
        assert.equal(error.message, 'thingThatDoesNotExist is not defined');
        done();
      });
    });

    it(`::get with error in hook`, done => {
      options.socket.send(`${name}::get`, `laundry`, { hookError: true }, function (error) {
        assert.equal(error.message, 'Error from get, before hook');
        done();
      });
    });

    it(`::create`, function (done) {
      var original = {
        name: `creating`
      };

      options.socket.send(`${name}::create`, original, {}, function (error, data) {
        verify.create(original, data);

        done(error);
      });
    });

    it(`::create without parameters and callback`, function (done) {
      var original = {
        name: `creating`
      };

      options.socket.send(`${name}::create`, original);

      options.socket.once(`${name} created`, function(data) {
        verify.create(original, data);

        done();
      });
    });

    it(`::update`, function (done) {
      var original = {
        name: `updating`
      };

      options.socket.send(`${name}::update`, 23, original, {}, function (error, data) {
        verify.update(23, original, data);

        done(error);
      });
    });

    it(`::update many`, function (done) {
      var original = {
        name: `updating`,
        many: true
      };

      options.socket.send(`${name}::update`, null, original, {}, function (error, data) {
        verify.update(null, original, data);

        done(error);
      });
    });

    it(`::patch`, function (done) {
      var original = {
        name: `patching`
      };

      options.socket.send(`${name}::patch`, 25, original, {}, function (error, data) {
        verify.patch(25, original, data);

        done(error);
      });
    });

    it(`::patch many`, function (done) {
      var original = {
        name: `patching`,
        many: true
      };

      options.socket.send(`${name}::patch`, null, original, {}, function (error, data) {
        verify.patch(null, original, data);

        done(error);
      });
    });

    it(`::remove`, function (done) {
      options.socket.send(`${name}::remove`, 11, {}, function (error, data) {
        verify.remove(11, data);

        done(error);
      });
    });

    it(`::remove many`, function (done) {
      options.socket.send(`${name}::remove`, null, {}, function (error, data) {
        verify.remove(null, data);

        done(error);
      });
    });
  });

  describe(`Events`, function () {
    it(`created`, function (done) {
      var original = {
        name: `created event`
      };

      options.socket.once(`${name} created`, function (data) {
        verify.create(original, data);
        done();
      });

      options.socket.send(`${name}::create`, original, {}, function () {});
    });

    it(`updated`, function (done) {
      var original = {
        name: `updated event`
      };

      options.socket.once(`${name} updated`, function (data) {
        verify.update(10, original, data);
        done();
      });

      options.socket.send(`${name}::update`, 10, original, {}, function () {});
    });

    it(`patched`, function(done) {
      var original = {
        name: `patched event`
      };

      options.socket.once(`${name} patched`, function (data) {
        verify.patch(12, original, data);
        done();
      });

      options.socket.send(`${name}::patch`, 12, original, {}, function () {});
    });

    it(`removed`, function (done) {
      options.socket.once(`${name} removed`, function (data) {
        verify.remove(333, data);
        done();
      });

      options.socket.send(`${name}::remove`, 333, {}, function () {});
    });
  });

  describe(`Event filtering`, function() {
    it(`.created`, function (done) {
      var service = options.app.service(name);
      var original = { description: `created event test` };
      var oldCreated = service.created;

      service.created = function(data, params, callback) {
        assert.ok(service === this);
        assert.deepEqual(params, options.socketParams);
        verify.create(original, data);

        callback(null, Object.assign({ processed: true }, data));
      };

      options.socket.send(`${name}::create`, original, {}, function() {});

      options.socket.once(`${name} created`, function (data) {
        service.created = oldCreated;
        // Make sure ${name} got processed
        verify.create(Object.assign({ processed: true }, original), data);
        done();
      });
    });

    it(`.updated`, function (done) {
      // ${name} this is not testing the right thing
      // but we will get better event filtering in v2 anyway
      var original = {
        name: `updated event`
      };

      options.socket.once(`${name} updated`, function (data) {
        verify.update(10, original, data);
        done();
      });

      options.socket.send(`${name}::update`, 10, original, {}, function () {});
    });

    it(`.removed`, function (done) {
      var service = options.app.service(name);
      var oldRemoved = service.removed;

      service.removed = function(data, params, callback) {
        assert.ok(service === this);
        assert.deepEqual(params, options.socketParams);

        if(data.id === 23) {
          // Only dispatch with given id
          return callback(null, data);
        }

        callback(null, false);
      };

      options.socket.send(`${name}::remove`, 1, {}, function() {});
      options.socket.send(`${name}::remove`, 23, {}, function() {});

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
          provider: `primus`,
          user: { name: `David` }
        });

        verify.create(original, data);

        return Object.assign({ processed: true }, data);
      });

      options.socket.send(`${name}::create`, original, { test: true });

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

      options.socket.send(`${name}::create`, original, { test: true });

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

      options.socket.send(`${name}::create`, original, { test: true });
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


      options.socket.send(`${name}::remove`, 1, {}, function() {});
      options.socket.send(`${name}::remove`, 23, {}, function() {});

      options.socket.once(`${name} removed`, function (data) {
        assert.equal(data.id, 23);
        service._eventFilters = {};
        done();
      });
    });
  });
}
