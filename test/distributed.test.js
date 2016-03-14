import assert from 'assert';
import io from 'socket.io-client';
import socketio from 'feathers-socketio';
import socketioClient from 'feathers-socketio/client';
import rest from 'feathers-rest';
import feathers from '../src/';
import client from '../src/client';

describe('Distributed Feathers applications test', () => {
  before(done => {
    const app = feathers()
      .configure(socketio())
      .use('todos', {
        create(data) {
          data.id = 42;
          return Promise.resolve(data);
        }
      });

    app.listen(8888, done);
  });

  it('passes created event between servers', done => {
    const socket = io('http://localhost:8888');
    const remoteApp = client().configure(socketioClient(socket));
    const todo = { text: 'Created on alpha server', complete: false };
    const beta = feathers()
      .configure(rest())
      .use('todos', remoteApp.service('todos'));

    beta.listen(9999, function() {
      beta.service('todos').on('created', function(newTodo) {
        assert.deepEqual(newTodo, {
          id: 42,
          text: 'Created on alpha server',
          complete: false
        });
        done();
      });

      socket.emit('todos::create', todo);
    });
  });
});
