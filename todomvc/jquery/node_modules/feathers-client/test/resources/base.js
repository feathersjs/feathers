var assert = require('assert');

module.exports = function(service) {
  describe('Service base tests', function() {
    it('.find', function(done) {
      service.find(function(error, todos) {
        assert.deepEqual(todos, [ { text: 'some todo', complete: false, id: 0 } ]);
        done();
      });
    });

    it('.get and params passing', function(done) {
      var query = {
        some: 'thing',
        other: ['one', 'two']
      };

      service.get(0, query, function(error, todo) {
        assert.deepEqual(todo, {
          id: 0,
          text: 'some todo',
          complete: false,
          query: query
        });
        done();
      });
    });

    it('.create and created event', function(done) {
      service.once('created', function(data) {
        assert.equal(data.text, 'created todo');
        assert.ok(data.complete);
        done();
      });

      service.create({ text: 'created todo', complete: true });
    });

    it('.update and updated event', function(done) {
      service.once('updated', function(data) {
        assert.equal(data.text, 'updated todo');
        assert.ok(data.complete);
        done();
      });

      service.create({ text: 'todo to update', complete: false }, function(error, todo) {
        service.update(todo.id, { text: 'updated todo', complete: true });
      });
    });

    it('.patch and patched event', function(done) {
      service.once('patched', function(data) {
        assert.equal(data.text, 'todo to patch');
        assert.ok(data.complete);
        done();
      });

      service.create({ text: 'todo to patch', complete: false }, function(error, todo) {
          service.patch(todo.id, { complete: true }, {},
            function() {});
        });
    });

    it('.remove and removed event', function(done) {
      service.once('removed', function(data) {
        assert.equal(data.text, 'todo to remove');
        assert.equal(data.complete, false);
        done();
      });

      service.create({ text: 'todo to remove', complete: false }, function(error, todo) {
          service.remove(todo.id, {},
            function() {});
        });
    });

    it('.get with error', function(done) {
      service.get(0, { error: true }, function(error) {
        assert.ok(error && error.message);
        done();
      });
    });
  });
};
