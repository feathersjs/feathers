'use strict';

var request = require('request');
var assert = require('assert');
var feathers = require('../../lib/feathers');

var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.verify;

describe('REST provider', function () {
  describe('CRUD', function () {
    var server, app;

    before(function () {
      app = feathers().use('todo', todoService);
      server = app.listen(4777);
    });

    after(function (done) {
      server.close(done);
    });

    it('GET .find', function (done) {
      request('http://localhost:4777/todo', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.find(JSON.parse(body));
        done(error);
      });
    });

    it('GET .get', function (done) {
      request('http://localhost:4777/todo/dishes', function (error, response, body) {
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
        url: 'http://localhost:4777/todo',
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
        url: 'http://localhost:4777/todo/544',
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
        url: 'http://localhost:4777/todo/233',
        method: 'delete'
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.remove(233, JSON.parse(body));

        done(error);
      });
    });
  });

  it('sets service parameters', function (done) {
    var service = {
      get: function (id, params, callback) {
        callback(null, params);
      }
    };

    var server = feathers()
      .use(function (req, res, next) {
        assert.ok(req.feathers, 'Feathers object initialized');
        req.feathers.test = 'Happy';
        next();
      })
      .use('service', service)
      .listen(4778);

    request('http://localhost:4778/service/bla?some=param&another=thing', function (error, response, body) {
      var expected = {
        test: 'Happy',
        query: {
          some: 'param',
          another: 'thing'
        }
      };

      assert.ok(response.statusCode === 200, 'Got OK status code');
      assert.deepEqual(JSON.parse(body), expected, 'Got params object back');
      server.close(done);
    });
  });

  it('throws a 405 for undefined service methods', function(done) {
    var app = feathers().use('todo', {
        get: function(id, params, callback) {
          callback(null, { description: 'You have to do ' + id });
        }
      });

    /* jshint ignore:start */
    // Error handler
    app.use(function(error, req, res, next) {
      assert.equal(error.message, 'Can not call service method .find');
      res.json({ message: error.message });
    });
    /* jshint ignore:end */

    var server = app.listen(4777);

    request('http://localhost:4777/todo/dishes', function (error, response, body) {
      assert.ok(response.statusCode === 200, 'Got OK status code for .get');
      assert.deepEqual(JSON.parse(body), { description: 'You have to do dishes' }, 'Got expected object');
      request('http://localhost:4777/todo', function (error, response, body) {
        assert.ok(response.statusCode === 405, 'Got 405 for .find');
        assert.deepEqual(JSON.parse(body), { message: 'Can not call service method .find' }, 'Error serialized as expected');
        server.close(done);
      });
    });
  });
});
