import hooks from 'feathers-hooks';
import feathers from 'feathers/client';
import primus from 'feathers-primus/client';
import localstorage from 'localstorage-memory';
import Primus from 'primus';
import Emitter from 'primus-emitter';
import { expect } from 'chai';

import authentication from '../../src/index';
import createApplication from '../fixtures/server';

const port = 8998;
const baseURL = `http://localhost:${port}`;
const Socket = Primus.createSocket({
  transformer: 'websockets',
  plugin: {
    'emitter': Emitter
  }
});

const app = createApplication({ secret: 'supersecret' }, 'primus');
let options;

describe('Primus client authentication', function () {
  this.timeout(20000);
  let socket;
  let server;
  let client;

  before(done => {
    server = app.listen(port);
    server.once('listening', () => {
      socket = new Socket(baseURL);
      client = feathers()
        .configure(hooks())
        .configure(primus(socket, { timeout: 1000 }))
        .configure(authentication());

      done();
    });
  });

  beforeEach(() => {
    options = {
      strategy: 'local',
      email: 'admin@feathersjs.com',
      password: 'admin'
    };
  });

  after(done => {
    socket.socket.close();
    server.close(done);
  });

  it('can use client.passport.getJWT() to get the accessToken', () => {
    return client.authenticate(options).then(response => {
      client.passport.getJWT().then(accessToken => {
        expect(accessToken).to.equal(response.accessToken);
      });
    });
  });

  it('can decode an accessToken with client.passport.verifyToken()', () => {
    return client.authenticate(options).then(response => {
      return client.passport.verifyJWT(response.accessToken).then(payload => {
        expect(payload.userId).to.equal(0);
        expect(payload.iss).to.equal('feathers');
        expect(payload.sub).to.equal('anonymous');
      });
    });
  });

  it('local username password authentication', () => {
    return client.authenticate(options).then(response => {
      expect(response.accessToken).to.not.equal(undefined);
      expect(client.get('accessToken')).to.deep.equal(response.accessToken);
    });
  });

  it('supports socket timeouts', () => {
    return client.passport.connected().then(() => {
      client.passport.options.timeout = 0;

      return client.authenticate(options).catch(error => {
        client.passport.options.timeout = 5000;
        expect(error.message).to.equal('Authentication timed out');
      });
    });
  });

  it('`authenticated` event', done => {
    client.once('authenticated', response => {
      try {
        expect(response.accessToken).to.not.equal(undefined);
        expect(client.get('accessToken')).to.deep.equal(response.accessToken);
        done();
      } catch (e) {
        done(e);
      }
    });

    client.authenticate(options);
  });

  it('local username password authentication and access to protected service', () => {
    return client.authenticate(options).then(response => {
      expect(response.accessToken).to.not.equal(undefined);
      return client.service('users').get(0).then(user => {
        expect(user.id).to.equal(0);
      });
    });
  });

  it('local authentication with wrong credentials fails', () => {
    options.password = 'this is wrong';
    return client.authenticate(options).catch(error => {
      expect(error.name).to.equal('NotAuthenticated');
      expect(error.code).to.equal(401);
    });
  });

  it('authentication with no options and no stored accessToken fails', () => {
    return client.authenticate().catch(error => {
      expect(error.message).to.equal('Could not find stored JWT and no authentication type was given');
      expect(error.code).to.equal(401);
    });
  });

  it('uses localStorage compatible stores', () => {
    const oldStorage = client.get('storage');
    client.set('storage', localstorage);

    return client.authenticate(options).then(response => {
      expect(response.accessToken).to.equal(localstorage.getItem('feathers-jwt'));
      client.set('storage', oldStorage);
    });
  });

  it('accessToken is stored and re-authentication with stored accessToken works', () => {
    return client.authenticate(options).then(response => {
      expect(response.accessToken).to.not.equal(undefined);

      return client.authenticate().then(response => {
        expect(client.get('accessToken')).to.equal(response.accessToken);
      });
    });
  });

  it('.logout works, does not grant access to protected service and accessToken is removed from localstorage', () => {
    return client.authenticate(options).then(response => {
      expect(response.accessToken).to.not.equal(undefined);
      return client.logout();
    })
    .then(() => {
      expect(client.get('accessToken')).to.equal(null);
      return Promise.resolve(client.get('storage').getItem('feathers-jwt'));
    })
    .then(accessToken => {
      expect(accessToken).to.equal(undefined);

      return client.service('users').get(0).catch(error => {
        expect(error.code).to.equal(401);
      });
    });
  });

  it('`logout` event', done => {
    client.once('logout', () => done());

    client.authenticate(options).then(response => {
      expect(response.accessToken).to.not.equal(undefined);
      return client.logout();
    });
  });

  it('authenticates automatically after reconnection', done => {
    client.authenticate(options).then(response => {
      app.primus.end({ reconnect: true });
      server.close(() => {
        setTimeout(() => {
          const newApp = createApplication({ secret: 'supersecret' }, 'primus');

          server = newApp.listen(port);
          server.once('listening', () => {
            newApp.primus.on('connection', s => {
              s.once('authenticate', data => {
                expect(data.accessToken).to.equal(response.accessToken);
                done();
              });
            });
          });
        }, 1000);
      });
    });
  });

  it.skip('authenticates automatically after upgrade', done => {
    // TODO (EK): This is working but I have no idea how to manually
    // trigger socket upgrade events.
    app.primus.on('connection', serverSocket => {
      serverSocket.on('upgrade', () => {
        console.log('upgraded');

        serverSocket.on('authenticate', data => {
          expect(data.accessToken).to.be.ok;
          done();
        });
      });
    });

    client.authenticate(options).then(response => {
      setTimeout(() => {
        app.primus.send('upgrade');
      }, 500);
    });
  });
});
