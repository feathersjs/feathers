const assert = require('assert');

module.exports = function (app, name) {
  const getService = () => (name && typeof app.service === 'function')
    ? app.service(name) : app;

  describe('Service base tests', () => {
    it('.find', () => {
      return getService().find().then(todos =>
        assert.deepEqual(todos, [{
          text: 'some todo',
          complete: false,
          id: 0
        }])
      );
    });

    it('.get and params passing', () => {
      const query = {
        some: 'thing',
        other: ['one', 'two'],
        nested: {a: {b: 'object'}}
      };

      return getService().get(0, { query })
        .then(todo => assert.deepEqual(todo, {
          id: 0,
          text: 'some todo',
          complete: false,
          query: query
        }));
    });

    it('.create and created event', done => {
      getService().once('created', function (data) {
        assert.equal(data.text, 'created todo');
        assert.ok(data.complete);
        done();
      });

      getService().create({text: 'created todo', complete: true});
    });

    it('.update and updated event', done => {
      getService().once('updated', data => {
        assert.equal(data.text, 'updated todo');
        assert.ok(data.complete);
        done();
      });

      getService().create({text: 'todo to update', complete: false})
        .then(todo => getService().update(todo.id, {
          text: 'updated todo',
          complete: true
        }));
    });

    it('.patch and patched event', done => {
      getService().once('patched', data => {
        assert.equal(data.text, 'todo to patch');
        assert.ok(data.complete);
        done();
      });

      getService().create({text: 'todo to patch', complete: false})
        .then(todo => getService().patch(todo.id, {complete: true}));
    });

    it('.remove and removed event', done => {
      getService().once('removed', data => {
        assert.equal(data.text, 'todo to remove');
        assert.equal(data.complete, false);
        done();
      });

      getService().create({text: 'todo to remove', complete: false})
        .then(todo => getService().remove(todo.id)).catch(done);
    });

    it('.get with error', () => {
      let query = {error: true};

      return getService().get(0, {query}).catch(error =>
        assert.ok(error && error.message)
      );
    });
  });
};
