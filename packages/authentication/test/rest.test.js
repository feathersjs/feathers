var assert = require('assert');
var request = require('request');
var createApplication = require('./server-fixtures');

describe('REST API authentication', function() {
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

  it('Requests with valid auth to protected services will return data', function(done) {
    request({
      url: 'http://localhost:8888/api/todos',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, function(err, res, body) {
      assert.equal(body.length, 3, 'Got data back');
      assert.equal(body[0].name, 'Do the dishes', 'Got todos back');
      done();
    });
  });

  it('Requests with valid auth to unprotected services will return data', function(done) {
    request({
      url: 'http://localhost:8888/api/tasks',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, function(err, res, body) {
      assert.equal(body.length, 3, 'Got data back');
      assert.equal(body[0].name, 'Feed the pigs', 'Got tasks back');
      done();
    });
  });

});
