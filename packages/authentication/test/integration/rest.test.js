import assert from 'assert';
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
          assert.equal(response.statusCode, 401);
          done();
        });
      });

      it('returns a 401 when password is invalid', function(done) {
        options.form = {
          email: 'testd@feathersjs.com',
          password: 'invalid'
        };

        request(options, function(err, response) {
          assert.equal(response.statusCode, 401);
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
          assert.equal(response.statusCode, 201);
          done();
        });
      });

      it('returns a JWT', function(done) {
        request(options, function(err, response, body) {
          assert.ok(body.token, 'POST to /auth/local gave us back a token.');
          done();
        });
      });

      it('returns the logged in user', function(done) {
        request(options, function(err, response, body) {
          assert.equal(body.data.email, 'test@feathersjs.com');
          done();
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
          assert.equal(response.statusCode, 401);
          done();
        });
      });

      it('returns a 401 when token is expired', function(done) {
        options.form = {
          token: expiredToken
        };

        request(options, function(err, response) {
          assert.equal(response.statusCode, 401);
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
          assert.equal(response.statusCode, 201);
          done();
        });
      });

      it('returns a JWT', function(done) {
        request(options, function(err, response, body) {
          assert.ok(body.token, 'POST to /auth/token gave us back a token.');
          done();
        });
      });

      it('returns the logged in user', function(done) {
        request(options, function(err, response, body) {
          assert.equal(body.data.email, 'test@feathersjs.com');
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

  // it('Requests without auth to an unprotected service will return data.', function(done) {
  //   request({
  //     url: 'http://localhost:8888/api/tasks',
  //     method: 'GET',
  //     json: true
  //   }, function(err, res, tasks) {
  //     assert.equal(tasks.length, 3, 'Got tasks');

  //     request({
  //       url: 'http://localhost:8888/api/tasks/1',
  //       json: true
  //     }, function(err, res, task) {
  //       assert.deepEqual(task, {
  //         id: '1',
  //         name: 'Make Pizza.'
  //       });
  //       done();
  //     });
  //   });
  // });

  // it('Requests without auth to a protected service will return an error.', function(done) {
  //   request({
  //     url: 'http://localhost:8888/api/todos',
  //     method: 'GET',
  //     json: true
  //   }, function(err, res, body) {
  //     assert.equal(typeof body, 'string', 'Got an error string back, not an object/array');

  //     request({
  //       url: 'http://localhost:8888/api/todos/1',
  //       json: true
  //     }, function(err, res, body) {
  //       assert.equal(typeof body, 'string', 'Got an error string back, not an object/array');
  //       done();
  //     });
  //   });
  // });

  // it('Requests with a broken token will return a JWT error', function(done) {
  //   request({
  //     url: 'http://localhost:8888/api/todos',
  //     method: 'GET',
  //     json: true,
  //     headers: {
  //       'Authorization': 'Bearer abcd'
  //     }
  //   }, function(err, res, body) {
  //     assert.equal(typeof body, 'string', 'Got an error string back, not an object/array');
  //     assert.ok(body.indexOf('JsonWebTokenError' > -1), 'Got a JsonWebTokenError');
  //     done();
  //   });
  // });
});
