import { expect } from 'chai';
import request from 'request';
import createApplication from '../test-server';
import jwt from 'jsonwebtoken';

describe('REST authentication', function() {
  this.timeout(10000);
  const host = 'http://localhost:8888';

  let server, app;
  let email = 'test@feathersjs.com';
  let password = 'test';
  let settings = {
    idField: 'id',
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
    createApplication(settings, email, password, true, (err, obj) =>{
      app = obj.app;
      server = obj.server;
      
      setTimeout(done, 10);
    });
  });

  after(function(done) {
    server.close(done);
  });

  describe('Local authentication', () => {
    describe('Using Form Data', () => {
      describe('when login unsuccessful', () => {
        const options = {
          url: `${host}/auth/local`,
          method: 'POST',
          followAllRedirects: true,
          form: {}
        };

        it('redirects to failure page', function(done) {
          options.form = {
            email: 'not-found@feathersjs.com',
            password
          };

          request(options, function(err, response) {
            expect(response.statusCode).to.equal(200);
            expect(response.request.uri.path).to.equal('/auth/failure');
            done();
          });
        });
      });

      describe('when login succeeds', () => {
        const options = {
          url: `${host}/auth/local`,
          method: 'POST',
          followAllRedirects: true,
          form: {
            email,
            password
          }
        };

        it('redirects to success page', function(done) {
          request(options, function(err, response) {
            expect(response.statusCode).to.equal(200);
            expect(response.request.uri.path).to.equal('/auth/success');
            done();
          });
        });

        it('sets the JWT in a cookie', function(done) {
          var jar = request.jar();
          options.jar = jar;

          request(options, function() {
            var cookies = jar.getCookies(`${host}/auth/success`);

            expect(cookies.length).to.equal(1);
            expect(cookies[0].toString().indexOf('feathers-jwt')).to.not.equal(-1);
            done();
          });
        });
      });
    });

    describe('Using Ajax', () => {
      describe('when login unsuccessful', () => {
        const options = {
          url: `${host}/auth/local`,
          method: 'POST',
          form: {},
          json: true
        };

        it('returns a 401 when user not found', function(done) {
          options.form = {
            email: 'not-found@feathersjs.com',
            password
          };

          request(options, function(err, response) {
            expect(response.statusCode).to.equal(401);
            done();
          });
        });

        it('returns a 401 when password is invalid', function(done) {
          options.form = {
            email: 'testd@feathersjs.com',
            password: 'invalid'
          };

          request(options, function(err, response) {
            expect(response.statusCode).to.equal(401);
            done();
          });
        });
      });

      describe('when login succeeds', () => {
        const options = {
          url: `${host}/auth/local`,
          method: 'POST',
          form: {
            email,
            password
          },
          json: true
        };

        it('returns a 201', function(done) {
          request(options, function(err, response) {
            expect(response.statusCode).to.equal(201);
            done();
          });
        });

        it('returns a JWT', function(done) {
          request(options, function(err, response, body) {
            expect(body.token).to.not.equal(undefined);
            done();
          });
        });

        it('returns the logged in user', function(done) {
          request(options, function(err, response, body) {
            expect(body.data.email).to.equal('test@feathersjs.com');
            done();
          });
        });
      });
    });
  });

  describe('Token authentication', () => {
    describe('when login unsuccessful', () => {
      const options = {
        url: `${host}/auth/token`,
        method: 'POST',
        form: {},
        json: true
      };

      it('returns a 401 when token is invalid', function(done) {
        options.form = {
          token: 'invalid'
        };

        request(options, function(err, response) {
          expect(response.statusCode).to.equal(401);
          done();
        });
      });

      it('returns a 401 when token is expired', function(done) {
        options.form = {
          token: expiredToken
        };

        request(options, function(err, response) {
          expect(response.statusCode).to.equal(401);
          done();
        });
      });
    });

    describe('when login succeeds', () => {
      const options = {
        url: `${host}/auth/token`,
        method: 'POST',
        form: {
          token: validToken
        },
        json: true
      };

      it('returns a 201', function(done) {
        request(options, function(err, response) {
          expect(response.statusCode).to.equal(201);
          done();
        });
      });

      it('returns a JWT', function(done) {
        request(options, function(err, response, body) {
          expect(body.token).to.not.equal(undefined);
          done();
        });
      });

      it('returns the logged in user', function(done) {
        request(options, function(err, response, body) {
          expect(body.data.email).to.equal('test@feathersjs.com');
          done();
        });
      });
    });
  });

  describe('OAuth1 authentication', () => {
    // TODO (EK): This is hard to test
  });

  describe('OAuth2 authentication', () => {
    // TODO (EK): This is hard to test
  });

  describe('Authorization', () => {
    describe('when authenticated', () => {
      describe('when token passed via header', () => {
        let options;

        before(() => {
          options = {
            method: 'GET',
            json: true,
            headers: {
              Authorization: validToken
            }
          };
        });

        it('returns data from protected route', (done) => {
          options.url = `${host}/messages/1`;

          request(options, function(err, response, body) {
            expect(body.id).to.equal(1);
            done();
          });
        });
      });

      describe('when token passed via body', () => {
        let options;

        before(() => {
          options = {
            method: 'PATCH',
            json: true,
            body: {
              token: validToken,
              text: 'new text'
            }
          };
        });

        it('returns updates data behind protected route', (done) => {
          options.url = `${host}/messages/2`;

          request(options, function(err, response, body) {
            expect(body.id).to.equal(2);
            expect(body.text).to.equal('new text');
            done();
          });
        });
      });

      describe('when token passed via query string', () => {
        let options;

        before(() => {
          options = {
            method: 'GET',
            json: true
          };
        });

        it('returns data from protected route', (done) => {
          options.url = `${host}/messages/1?token=${validToken}`;

          request(options, function(err, response, body) {
            expect(body.id).to.equal(1);
            done();
          });
        });
      });
    });

    describe('when not authenticated', () => {
      let options;

      before(() => {
        options = {
          method: 'GET',
          json: true
        };
      });

      describe('when route is protected', () => {
        before(() => {
          options.url = `${host}/messages/1`;
        });

        it('returns 401', (done) => {
          request(options, function(err, response) {
            expect(response.statusCode).to.equal(401);
            done();
          });
        });

        it('returns error instead of data', (done) => {
          request(options, function(err, response, body) {
            expect(body.code).to.equal(401);
            done();
          });
        });
      });

      describe('when route is not protected', () => {
        before(() => {
          options.url = `${host}/users`;
        });

        it('returns 200', (done) => {
          request(options, function(err, response) {
            expect(response.statusCode).to.equal(200);
            done();
          });
        });

        it('returns data', (done) => {
          request(options, function(err, response, body) {
            expect(body).to.not.equal(undefined);
            done();
          });
        });
      });
    });
  });
});
