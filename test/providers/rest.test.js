'use strict';

var request = require('request');
var assert = require('assert');
var feathers = require('../../lib/feathers');

var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.verify;

describe('REST provider', function () {
  describe('CRUD', function () {
    var server;

    before(function () {
      server = feathers()
        .use('todo', todoService)
        .listen(3000);
    });

    after(function (done) {
      server.close(done);
    });

    it('GET .find', function (done) {
      request('http://localhost:3000/todo', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.find(JSON.parse(body));
        done(error);
      });
    });

    it('GET .get', function (done) {
      request('http://localhost:3000/todo/dishes', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.get('dishes', JSON.parse(body));
        done(error);
      });
    });

    it('POST .create', function (done) {
      var original = {
        description: 'POST .create'
      };

      request({
        url: 'http://localhost:3000/todo',
        method: 'post',
        body: JSON.stringify(original),
        headers: {
          'Content-Type': 'application/json'
        }
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.create(original, JSON.parse(body));

        done(error);
      });
    });

    it('PUT .update', function (done) {
      var original = {
        description: 'PUT .update'
      };

      request({
        url: 'http://localhost:3000/todo/544',
        method: 'put',
        body: JSON.stringify(original),
        headers: {
          'Content-Type': 'application/json'
        }
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.update(544, original, JSON.parse(body));

        done(error);
      });
    });

    it('DELETE .remove', function (done) {
      request({
        url: 'http://localhost:3000/todo/233',
        method: 'delete'
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.remove(233, JSON.parse(body));

        done(error);
      });
    });
  });
});
