'use strict';

var request = require('request');
var assert = require('assert');
var feathers = require('../../lib/feathers');
var bodyParser = require('body-parser');

var fixture = require('./service-fixture');
var todoService = fixture.Service;
var verify = fixture.verify;

describe('REST provider', function () {
  describe('CRUD', function () {
    var server, app;

    before(function () {
      app = feathers().configure(feathers.rest())
        .use(bodyParser.json())
        .use('codes', {
          get: function(id, params, callback) {
            callback();
          },

          create: function(data, params, callback) {
            callback(null, data);
          }
        })
        .use('todo', todoService);
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
        assert.ok(response.statusCode === 201, 'Got CREATED status code');
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

    it('PATCH .patch', function (done) {
      var original = {
        description: 'PATCH .patch'
      };

      request({
        url: 'http://localhost:4777/todo/544',
        method: 'patch',
        body: JSON.stringify(original),
        headers: {
          'Content-Type': 'application/json'
        }
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        verify.patch(544, original, JSON.parse(body));

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

  describe('HTTP status codes', function() {
    var app;
    var server;

    before(function() {
      app = feathers().configure(feathers.rest()).use('todo', {
        get: function (id, params, callback) {
          callback(null, { description: 'You have to do ' + id });
        },

        find: function(params, callback) {
          callback();
        }
      });

      /* jshint ignore:start */
      // Error handler
      app.use(function (error, req, res, next) {
        assert.equal(error.message, 'Method `remove` is not supported by this endpoint.');
        res.json({ message: error.message });
      });
      /* jshint ignore:end */

      server = app.listen(4780);
    });

    after(function(done) {
      server.close(done);
    });

    it('throws a 405 for undefined service methods', function (done) {
      request('http://localhost:4780/todo/dishes', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code for .get');
        assert.deepEqual(JSON.parse(body), { description: 'You have to do dishes' }, 'Got expected object');
        request({
          method: 'delete',
          url: 'http://localhost:4780/todo/2'
        }, function (error, response, body) {
          assert.ok(response.statusCode === 405, 'Got 405 for .remove');
          assert.deepEqual(JSON.parse(body), { message: 'Method `remove` is not supported by this endpoint.' }, 'Error serialized as expected');
          done();
        });
      });
    });

    it('empty response sets 204 status codes', function(done) {
      request('http://localhost:4780/todo', function (error, response) {
        assert.ok(response.statusCode === 204, 'Got empty status code');

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

    var server = feathers().configure(feathers.rest())
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

  it('disables REST and lets you set the handler manually', function(done) {
    var app = feathers({ rest: false });

    app.configure(feathers.rest(function restFormatter(req, res) {
        res.format({
          'text/plain': function() {
            res.end('The todo is: ' + res.data.description);
          }
        });
      }))
      .use('/todo', {
        get: function (id, params, callback) {
          callback(null, { description: 'You have to do ' + id });
        }
      });

    var server = app.listen(4776);
    request('http://localhost:4776/todo/dishes', function (error, response, body) {
      assert.equal(body, 'The todo is: You have to do dishes');
      server.close(done);
    });
  });

  it('Lets you configure your own middleware before the handler (#40)', function(done) {
    var data = { description: 'Do dishes!', id: 'dishes' };
    var app = feathers();

    app.use(function defaultContentTypeMiddleware (req, res, next) {
      req.headers['content-type'] = req.headers['content-type'] || 'application/json';
      next();
    })
    .configure(feathers.rest())
    .use(bodyParser.json())
    .use('/todo', {
      create: function (data, params, callback) {
        callback(null, data);
      }
    });

    var server = app.listen(4775);
    request({
      method: 'POST',
      url: 'http://localhost:4775/todo',
      body: JSON.stringify(data)
    }, function (error, response, body) {
      assert.deepEqual(JSON.parse(body), data);
      server.close(done);
    });
  });
});
