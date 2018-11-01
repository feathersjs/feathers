var assert = require('assert');
var baseTests = require('feathers-commons/lib/test/client');

var feathers = window.feathers;
var socket = window.io();

describe('Universal Feathers client browser tests', function () {
  var app = feathers()
    .configure(feathers.socketio(socket))
    .use('/myservice', {
      get (id) {
        return Promise.resolve({
          id, description: `You have to do ${id}!`
        });
      },

      create (data) {
        return Promise.resolve(data);
      }
    });

  app.service('myservice').hooks({
    before: {
      create (hook) {
        hook.data.hook = true;
      }
    },
    after: {
      get (hook) {
        hook.result.ran = true;
      }
    }
  });

  after(() => app.service('todos').remove(null));

  baseTests(app, 'todos');

  describe('Client side hooks and services', () => {
    it('initialized myservice and works with hooks', done => {
      app.service('myservice').get('dishes').then(todo => {
        assert.deepEqual(todo, {
          id: 'dishes',
          description: 'You have to do dishes!',
          ran: true
        });
        done();
      }).catch(done);
    });

    it('create and event with hook', done => {
      var myservice = app.service('myservice');

      myservice.once('created', data => {
        assert.deepEqual(data, {
          description: 'Test todo',
          hook: true
        });
        done();
      });

      myservice.create({ description: 'Test todo' });
    });

    describe('Feathers Errors', () => {
      describe('successful error creation', () => {
        describe('without custom message', () => {
          it('default error', () => {
            var error = new feathers.errors.GeneralError();
            assert.equal(error.code, 500);
            assert.equal(error.message, 'Error');
            assert.equal(error.className, 'general-error');
            assert.equal(error instanceof feathers.errors.GeneralError, true);
            assert.equal(error instanceof feathers.errors.FeathersError, true);
          });
        });
      });
    });
  });
});
