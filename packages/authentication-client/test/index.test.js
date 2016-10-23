import { expect } from 'chai';
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

import authentication from '../src/index';
import createApplication from './test-server';

const email = 'test@feathersjs.com';
const password = 'test';
const settings = {
  user: {
    idField: 'id'
  },
  token: {
    secret: 'feathers-rocks'
  }
};
const setupTests = initApp => {
  let app;
  let options;

  beforeEach(() => {
    options = {
      type: 'local',
      email,
      password
    };
    app = initApp();
  });

  it('app.authentication object', () => {
    expect(typeof app.authentication.getJWT).to.equal('function');
    expect(app.authentication.options).to.deep.equal({
      cookie: 'feathers-jwt',
      tokenKey: 'feathers-jwt',
      localEndpoint: '/auth/local',
      tokenEndpoint: '/auth/token'
    });
  });

  it('can use app.authentication.getJWT() to get the token', () => {
    return app.authenticate(options).then(response => {
      app.authentication.getJWT().then(token => {
        expect(token).to.equal(response.token);
      });
    });
  });

  it('can decode a token with app.authentication.verifyToken()', () => {
    return app.authenticate(options).then(response => {
      return app.authentication.verifyJWT(response).then(payload => {
        expect(payload.id).to.equal(0);
        expect(payload.iss).to.equal('feathers');
        expect(payload.sub).to.equal('auth');
      });
    });
  });

  it('local username password authentication', () => {
    return app.authenticate(options).then(response => {
      expect(response.token).to.not.equal(undefined);
      expect(app.get('token')).to.deep.equal(response.token);
    });
  });

  it('local username password authentication and access to protected service', () => {
    return app.authenticate(options).then(response => {
      expect(response.token).to.not.equal(undefined);
      return app.service('messages').create({ text: 'auth test message' })
        .then(msg => {
          expect(typeof msg.id).to.not.equal(undefined);
        });
    });
  });

  it('local authentication with wrong credentials fails', () => {
    options.password = 'this is wrong';
    return app.authenticate(options).catch(error => {
      expect(error.name).to.equal('NotAuthenticated');
      expect(error.code).to.equal(401);
    });
  });

  it('authentication with no options and no stored token fails', () => {
    return app.authenticate().catch(error => {
      expect(error.message).to.equal('Could not find stored JWT and no authentication type was given');
      expect(error.code).to.equal(401);
    });
  });

  it('uses localStorage compatible stores', () => {
    const oldStorage = app.get('storage');
    app.set('storage', localstorage);

    return app.authenticate(options).then(response => {
      expect(response.token).to.equal(localstorage.getItem('feathers-jwt'));
      app.set('storage', oldStorage);
    });
  });

  it('token is stored and re-authentication with stored token works', () => {
    return app.authenticate(options).then(response => {
      expect(response.token).to.not.equal(undefined);

      return app.authenticate().then(response => {
        expect(app.get('token')).to.equal(response.token);
      });
    });
  });

  it('.logout works, does not grant access to protected service and token is removed from localstorage', () => {
    return app.authenticate(options).then(response => {
      expect(response.token).to.not.equal(undefined);
      return app.logout();
    })
    .then(() => {
      expect(app.get('token')).to.equal(null);
      return Promise.resolve(app.get('storage').getItem('feathers-jwt'));
    })
    .then(token => {
      expect(token).to.equal(undefined);

      return app.service('messages').create({ text: 'auth test message' }).catch(error => {
        expect(error.code).to.equal(401);
      });
    });
  });
};

describe('Client side authentication', () => {
  it('adds .authenticate, and .logout', () => {
    const app = feathers().configure(authentication());

    expect(typeof app.authenticate).to.equal('function');
    expect(typeof app.logout).to.equal('function');
  });

  describe('REST client authentication', () => {
    const connection = rest('http://localhost:8888').request(request);
    let server;

    before(done => {
      createApplication(settings, email, password, true, (err, obj) => {
        if (err) {
          done(err);
        }
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
        if (err) {
          done(err);
        }
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
        if (err) {
          done(err);
        }
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
