var assert = require('assert');
var request = require('request');
var createApplication = require('./server-fixtures');

describe('REST API authentication', function() {
  this.timeout(10000);
  var server;
  var app;
  var username = 'feathers';
  var password = 'test';
  var settings = {
    secret: 'feathers-rocks'
  };
  var token;

  before(function(done) {
    createApplication(settings, username, password, function(err, obj){
      app = obj.app;
      server = obj.server;
      done();
    });
  });

  after(function(done) {
    server.close(done);
  });

  it('Posting no data to login returns a 401.', function(done) {
    request({
      url: 'http://localhost:8888/api/login',
      method: 'POST',
      form: {},
      json: true
    }, function(err, response, body) {
      assert.equal(body.code, 401, 'POST to /api/login with no params returns an error.');
      done();
    });

  });

  it('Login works.', function(done) {
    request({
      url: 'http://localhost:8888/api/login',
      method: 'POST',
      form: {
        username: username,
        password: password
      },
      json: true
    }, function(err, res, body) {
      token = body.token;
      assert.ok(body.token, 'POST to /api/login gave us back a token.');
      assert.equal(body.data.password, undefined, 'The returned token data did not include a password.');
      done();
    });
  });

  it('Requests without auth to an unprotected service will return data.', function(done) {
    request({
      url: 'http://localhost:8888/api/tasks',
      method: 'GET',
      json: true
    }, function(err, res, tasks) {
      assert.equal(tasks.length, 3, 'Got tasks');

      request({
        url: 'http://localhost:8888/api/tasks/1',
        json: true
      }, function(err, res, task) {
        assert.deepEqual(task, {
          id: '1',
          name: 'Make Pizza.'
        });
        done();
      });
    });
  });

  it('Requests without auth to a protected service will return an error.', function(done) {
    request({
      url: 'http://localhost:8888/api/todos',
      method: 'GET',
      json: true
    }, function(err, res, body) {
      assert.equal(typeof body, 'string', 'Got an error string back, not an object/array');

      request({
        url: 'http://localhost:8888/api/todos/1',
        json: true
      }, function(err, res, body) {
        assert.equal(typeof body, 'string', 'Got an error string back, not an object/array');
        done();
      });
    });
  });

  it('Requests with a broken token will return a JWT error', function(done) {
    request({
      url: 'http://localhost:8888/api/todos',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer abcd'
      }
    }, function(err, res, body) {
      assert.equal(typeof body, 'string', 'Got an error string back, not an object/array');
      assert.ok(body.indexOf('JsonWebTokenError' > -1), 'Got a JsonWebTokenError');
      done();
    });
  });
});
