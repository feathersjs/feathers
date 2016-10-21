import assert from 'assert';

export default function (app, name) {
  const getService = () => (name && typeof app.service === 'function')
    ? app.service(name) : app;

  describe('Service base tests', function () {
    it('.find', function (done) {
      getService().find().then(todos => assert.deepEqual(todos, [
        {
          text: 'some todo',
          complete: false,
          id: 0
        }
      ])).then(() => done()).catch(done);
    });

    it('.get and params passing', function (done) {
      var query = {
        some: 'thing',
        other: ['one', 'two'],
        nested: {a: {b: 'object'}}
      };

      getService().get(0, {query}).then(todo => assert.deepEqual(todo, {
        id: 0,
        text: 'some todo',
        complete: false,
        query: query
      })).then(() => done()).catch(done);
    });

    it('.create and created event', function (done) {
      getService().once('created', function (data) {
        assert.equal(data.text, 'created todo');
        assert.ok(data.complete);
        done();
      });

      getService().create({text: 'created todo', complete: true});
    });

    it('.update and updated event', function (done) {
      getService().once('updated', function (data) {
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

    it('.patch and patched event', function (done) {
      getService().once('patched', function (data) {
        assert.equal(data.text, 'todo to patch');
        assert.ok(data.complete);
        done();
      });

      getService().create({text: 'todo to patch', complete: false})
        .then(todo => getService().patch(todo.id, {complete: true}));
    });

    it('.remove and removed event', function (done) {
      getService().once('removed', function (data) {
        assert.equal(data.text, 'todo to remove');
        assert.equal(data.complete, false);
        done();
      });

      getService().create({text: 'todo to remove', complete: false})
        .then(todo => getService().remove(todo.id)).catch(done);
    });

    it('.get with error', function (done) {
      let query = {error: true};
      getService().get(0, {query}).then(done, error => {
        assert.ok(error && error.message);
        done();
      });
    });
  });
}
