var assert = require('assert');
var request = require('request');
var createApplication = require('./server-fixtures');

describe('REST API authentication with valid auth token', function () {
  this.timeout(5000);
  var server;
  var app;
  var username = 'feathers';
  var password = 'test';
  var settings = {
    secret: 'feathers-rocks'
  };
  var token;

  before(function (done) {

    createApplication(settings, username, password, function (err, obj) {
      app = obj.app;
      server = obj.server;

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
        done();
      });
    });
  });

  after(function (done) {
    server.close(done);
  });


  it('Requests with valid auth to protected services will return data', function (done) {
    request({
      url: 'http://localhost:8888/api/todos',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, function (err, res, body) {
      assert.equal(body.length, 3, 'Got data back');
      assert.equal(body[0].name, 'Do the dishes', 'Got todos back');
      done();
    });
  });

  it('Requests with valid auth to unprotected services will return data', function (done) {
    request({
      url: 'http://localhost:8888/api/tasks',
      method: 'GET',
      json: true,
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }, function (err, res, body) {
      assert.equal(body.length, 3, 'Got data back');
      assert.equal(body[0].name, 'Feed the pigs', 'Got tasks back');
      done();
    });
  });
});
