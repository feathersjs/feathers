import assert from 'assert';
import io from 'socket.io-client';
import memory from 'feathers-memory';
import hooks from 'feathers-hooks';
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';

import authentication from '../../src/client';
import createApplication from '../test-server';

describe('Client side authentication', () => {
  const socket = io('http://localhost:8888');
  const email = 'test@feathersjs.com';
  const password = 'test';
  const settings = {
    idField: 'id',
    token: {
      secret: 'feathers-rocks'
    }
  };
  
  let app, server;
  
  before(done => {
    createApplication(settings, email, password, true, (err, obj) => {
      app = obj.app;
      server = obj.server;
      
      setTimeout(done, 10);
    });
  });
  
  after(done => {
    socket.once('disconnect', () => server.close(done));
    socket.disconnect();
  });
  
  it('adds .authenticate, .user, .token and .logout', () => {
    const app = feathers().configure(authentication());
    
    assert.equal(typeof app.authenticate, 'function');
    assert.equal(typeof app.user, 'function');
    assert.equal(typeof app.token, 'function');
    assert.equal(typeof app.logout, 'function');
  });
  
  it('authenticates via Socket.io', done => {
    const app = feathers()
      .configure(socketio(socket))
      .configure(hooks())
      .configure(authentication())
      .use('/storage', memory());
    
    socket.on('connect', () => {
      app.authenticate({
        type: 'local',
        email, password
      }).then(response => {
        assert.ok(response.token);
        assert.ok(response.data);
        
        app.user()
          .then(user => {
            assert.deepEqual(user, response.data);
            
            return app.token();
          })
          .then(token => assert.deepEqual(token, response.token))
          .then(done);
      }).catch(done);
    });
  });
});
