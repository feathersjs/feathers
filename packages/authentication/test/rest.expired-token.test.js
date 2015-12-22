var assert = require('assert');
var request = require('request');
var createApplication = require('./server-fixtures');

describe('Test using an expired token', function() {
  this.timeout(10000);
  var server;
  var app;
  var username = 'feathers';
  var password = 'test';
  var settings = {
    secret: 'feathers-rocks',
    jwtOptions: {
      expiresIn: 1 // Testing token expiration after 1 second.
    }
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
      done();
    });
  });

  it('Requests with an expired token will return an error.', function(done) {
    setTimeout(function(){
      request({
        url: 'http://localhost:8888/api/todos',
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept' : 'application/json',
          'Content-Type': 'application/json'
        },
        json: true
      }, function(err, res, body) {
        assert.equal(body.name, 'TokenExpiredError', 'Got an error string back, not an object/array');
        done();
      });
    }, 2500);
  });

  it('Requests to refresh an expired token will fail', function (done) {
    setTimeout(function() {
      request({
        url: 'http://localhost:8888/api/login/refresh',
        method: 'POST',
        form: {
          token: token
        },
        json: true
      }, function (err, res, body) {
        assert.equal(body.name, 'TokenExpiredError', 'Got an error string back, not an object/array');
        done();
      });
    }, 2500);
  });

  it('Requests to refresh with no token will throw an error', function (done) {
    request({
      url: 'http://localhost:8888/api/login/refresh',
      method: 'POST',
      form: {

      },
      json: true
    }, function (err, res) {
      assert.equal(res.statusCode, 500, 'Throws error');
      done();
    });
  });
});
