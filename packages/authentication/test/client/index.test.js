import assert from 'assert';
import io from 'socket.io-client';
import hooks from 'feathers-hooks';
import feathers from 'feathers/client';
import socketio from 'feathers-socketio/client';
import primus from 'feathers-primus/client';
import rest from 'feathers-rest/client';
import localstorage from 'localstorage-memory';
import request from 'request';
import Primus from 'primus';
import Emitter from 'primus-emitter';

import authentication from '../../src/client';
import createApplication from '../test-server';

const email = 'test@feathersjs.com';
const password = 'test';
const settings = {
  idField: 'id',
  token: {
    secret: 'feathers-rocks'
  }
};
const setupTests = initApp => {
  let app;

  beforeEach(() => app = initApp());

  it('local username password authentication', done => {
    app.authenticate({
        type: 'local',
        email, password
      }).then(response => {
        assert.ok(response.token);
        assert.ok(response.data);

        assert.deepEqual(app.get('token'), response.token);
        assert.deepEqual(app.get('user'), response.data);

        done();
      }).catch(done);
  });

  it('local username password authentication and access to protected service', done => {
    app.authenticate({
        type: 'local',
        email, password
      }).then(response => {
        assert.ok(response.token);
        assert.ok(response.data);

        return app.service('messages').create({ text: 'auth test message' })
          .then(msg => {
            assert.ok(typeof msg.id !== 'undefined');
            done();
          });
      }).catch(done);
  });

  it('local authentication with wrong credentials fails', done => {
    app.authenticate({
        type: 'local',
        email,
        password: 'this is wrong'
      })
      .then(() => done(new Error('Should never get here')))
      .catch(error => {
        assert.equal(error.name, 'NotAuthenticated');
        assert.equal(error.code, 401);
        done();
      });
  });

  it('authentication with no options and no stored token fails', done => {
    app.authenticate()
      .then(() => done(new Error('Should never get here')))
      .catch(error => {
        assert.equal(error.message, 'Could not find stored JWT and no authentication type was given');
        assert.equal(error.code, 401);
        done();
      });
  });

  it('uses localStorage compatible stores', done => {
    const oldStorage = app.get('storage');
    app.set('storage', localstorage);

    app.authenticate({
        type: 'local',
        email, password
      }).then(response => {
        assert.equal(response.token, localstorage.getItem('feathers-jwt'));
        app.set('storage', oldStorage);
        done();
      });
  });

  it('token is stored and re-authentication with stored token works', done => {
    app.authenticate({
        type: 'local',
        email, password
      }).then(response => {
        assert.ok(response.token);
        assert.ok(response.data);

        return app.authenticate().then(response => {
          assert.deepEqual(app.get('token'), response.token);
          assert.deepEqual(app.get('user'), response.data);
        }).then(done);
      }).catch(done);
  });

  it.skip('.logout works, does not grant access to protected service', done => {
    app.authenticate({
        type: 'local',
        email, password
      }).then(response => {
        assert.ok(response.token);
        assert.ok(response.data);

        app.logout().then(() => {
          app.service('messages').create({ text: 'auth test message' })
            .then(msg => console.log('!!!', msg))
            .catch(error => console.log(error));
        });
      }).catch(done);
  });
};

describe('Client side authentication', () => {
  it('adds .authenticate, and .logout', () => {
    const app = feathers().configure(authentication());

    assert.equal(typeof app.authenticate, 'function');
    assert.equal(typeof app.logout, 'function');
  });

  describe('REST client authentication', () => {
    const connection = rest('http://localhost:8888').request(request);
    let server;

    before(done => {
      createApplication(settings, email, password, true, (err, obj) => {
        server = obj.server;

        setTimeout(done, 10);
      });
    });

    after(done => server.close(done));

    setupTests(() => {
      return feathers()
        .configure(connection)
        .configure(hooks())
        .configure(authentication());
    });
  });

  describe('Socket.io client authentication', () => {
    let socket, server;

    before(done => {
      createApplication(settings, email, password, true, (err, obj) => {
        server = obj.server;
        socket = io('http://localhost:8888');

        setTimeout(done, 10);
      });
    });

    after(done => {
      socket.once('disconnect', () => server.close(done));
      socket.disconnect();
    });

    setupTests(() => {
      return feathers()
        .configure(socketio(socket))
        .configure(hooks())
        .configure(authentication());
    });
  });

  describe('Primus client authentication', () => {
    let socket, server;

    before(done => {
      createApplication(settings, email, password, false, (err, obj) => {
        const Socket = Primus.createSocket({
          transformer: 'websockets',
          plugin: {
            'emitter': Emitter
          }
        });

        server = obj.server;
        socket = new Socket('http://localhost:8888');

        setTimeout(done, 10);
      });
    });

    after(done => {
      socket.socket.close();
      server.close(done);
    });

    setupTests(() => {
      return feathers()
        .configure(primus(socket))
        .configure(hooks())
        .configure(authentication());
    });
  });
});
