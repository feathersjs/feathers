import assert from 'assert';
import createApplication from '../test-server';
import jwt from 'jsonwebtoken';

describe('Primus authentication', function() {
  this.timeout(15000);
  const host = 'http://localhost:8888';

  let server, app, primus, Socket;
  let email = 'test@feathersjs.com';
  let password = 'test';
  let settings = {
    token: {
      secret: 'feathers-rocks'
    }
  };
  let jwtOptions = {
    issuer: 'feathers',
    algorithms: ['HS256'],
    expiresIn: '1h' // 1 hour
  };

  // create a valid JWT
  let validToken = jwt.sign({ id: 0 }, settings.token.secret, jwtOptions);

  // create an expired JWT
  jwtOptions.expiresIn = 1; // 1 ms
  let expiredToken = jwt.sign({ id: 0 }, settings.token.secret, jwtOptions);

  before((done) => {
    createApplication(settings, email, password, false, (err, obj) =>{
      app = obj.app;
      server = obj.server;
      Socket = app.primus.Socket;

      // Add a quick timeout to make sure that our token is expired
      setTimeout(done, 1000);
    });
  });

  after(function(done) {
    server.close(done);
  });

  beforeEach(done => {
    primus = new Socket(host);
    primus.on('open', function() {
      done();
    });
  });

  afterEach(() => {
    primus.end();
  });

  describe('Local authentication', () => {
    describe('when login unsuccessful', () => {
      it('returns a 401 when user not found', function(done) {
        const data = {
          email: 'not-found@feathersjs.com',
          password
        };
        
        primus.on('unauthorized', function(error) {
          assert.equal(error.code, 401);
          done();
        });

        primus.send('authenticate', data);
      });

      it('returns a 401 when password is invalid', function(done) {
        const data = {
          email: 'testd@feathersjs.com',
          password: 'invalid'
        };

        primus.on('unauthorized', function(error) {
          assert.equal(error.code, 401);
          done();
        });

        primus.send('authenticate', data);
      });

      it.skip('disconnects the socket', function(done) {
        const data = {
          token: expiredToken
        };

        primus.on('close', function() {
          done();
        });

        primus.send('authenticate', data);
      });
    });

    describe('when login succeeds', () => {
      it('returns a JWT', function(done) {
        const data = {
          email,
          password
        };
        
        primus.on('authenticated', function(response) {
          assert.ok(response.token);
          done();
        });

        primus.send('authenticate', data);
      });

      it('returns the logged in user', function(done) {
        const data = {
          email,
          password
        };
        
        primus.on('authenticated', function(response) {
          assert.equal(response.data.email, 'test@feathersjs.com');
          done();
        });

        primus.send('authenticate', data);
      });
    });
  });

  describe('Token authentication', () => {
    describe('when login unsuccessful', () => {

      it('returns a 401 when token is invalid', function(done) {
        const data = {
          token: 'invalid'
        };

        primus.on('unauthorized', function(error) {
          assert.equal(error.code, 401);
          done();
        });

        primus.send('authenticate', data);
      });

      it('returns a 401 when token is expired', function(done) {
        const data = {
          token: expiredToken
        };

        primus.on('unauthorized', function(error) {
          assert.equal(error.code, 401);
          done();
        });

        primus.send('authenticate', data);
      });

      it.skip('disconnects the socket', function(done) {
        const data = {
          token: expiredToken
        };

        primus.on('close', function() {
          done();
        });

        primus.send('authenticate', data);
      });
    });

    describe('when login succeeds', () => {
      const data = { token: validToken };

      it('returns a JWT', function(done) {        
        primus.on('authenticated', function(response) {
          assert.ok(response.token);
          done();
        });

        primus.send('authenticate', data);
      });

      it('returns the logged in user', function(done) {
        primus.on('authenticated', function(response) {
          assert.equal(response.data.email, 'test@feathersjs.com');
          done();
        });

        primus.send('authenticate', data);
      });
    });
  });

  describe('OAuth1 authentication', () => {
    // TODO (EK): This isn't really possible with primus unless
    // you are sending auth_tokens from your OAuth1 provider
  });

  describe('OAuth2 authentication', () => {
    // TODO (EK): This isn't really possible with primus unless
    // you are sending auth_tokens from your OAuth2 provider
  });
});
