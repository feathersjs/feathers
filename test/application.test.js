'use strict';

var assert = require('assert');
var Proto = require('uberproto');
var io = require('socket.io-client');
var request = require('request');
var https = require('https');
var fs = require('fs');
var q = require('q');

var feathers = require('../lib/feathers');

describe('Feathers application', function () {
  it('Express application should use express apps.', function () {
    var app = feathers();
    var child = feathers();

    app.use('/path', child);
    assert.equal(child.parent, app);
  });

  it('Register services and look them up with and without leading and trailing slashes.', function () {
    var dummyService = {
      find: function () {
        // No need to implement this
      }
    };

    var app = feathers().use('/dummy/service/', dummyService);

    app.listen(8012, function(){
      app.use('/another/dummy/service/', dummyService);
    });

    assert.ok(typeof app.service('dummy/service').find === 'function', 'Could look up without slashes');
    assert.ok(typeof app.service('/dummy/service').find === 'function', 'Could look up with leading slash');
    assert.ok(typeof app.service('dummy/service/').find === 'function', 'Could look up with trailing slash');

    app.on('listening', function () {
      assert.ok(typeof app.service('another/dummy/service').find === 'function', 'Could look up without slashes');
      assert.ok(typeof app.service('/another/dummy/service').find === 'function', 'Could look up with leading slash');
      assert.ok(typeof app.service('another/dummy/service/').find === 'function', 'Could look up with trailing slash');
    });
  });

  it('Registers a service, wraps it, runs service.setup(), and adds the event mixin.', function (done) {
    var dummyService = {
      setup: function(app, path){
        this.path = path;
      },

      create: function (data, params, callback) {
        callback(null, data);
      }
    };

    var dynamicService;

    var app = feathers().use('/dummy', dummyService);
    var server = app.listen(7887, function(){
      app.use('/dumdum', dummyService);
      dynamicService = app.service('dumdum');

      assert.ok(wrappedService.path === 'dummy', 'Wrapped service setup method ran.');
      assert.ok(dynamicService.path === 'dumdum', 'Dynamic service setup method ran.');
    });
    var wrappedService = app.service('dummy');

    assert.ok(Proto.isPrototypeOf(wrappedService), 'Service got wrapped as Uberproto object');
    assert.ok(typeof wrappedService.on === 'function', 'Wrapped service is an event emitter');

    wrappedService.on('created', function (data) {
      assert.equal(data.message, 'Test message', 'Got created event with test message');
      server.close(done);
    });

    wrappedService.create({
      message: 'Test message'
    }, {}, function (error, data) {
      assert.ok(!error, 'No error');
      assert.equal(data.message, 'Test message', 'Got created event with test message');
    });
  });

  it('Adds REST and SocketIO providers.', function (done) {
    var todoService = {
      get: function (name, params, callback) {
        callback(null, {
          id: name,
          description: 'You have to do ' + name + '!'
        });
      }
    };

    var app = feathers()
      .configure(feathers.rest())
      .configure(feathers.socketio())
      .use('/todo', todoService);
    var server = app.listen(6999).on('listening', function () {
      var socket = io.connect('http://localhost:6999');

      request('http://localhost:6999/todo/dishes', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        var data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        socket.emit('todo::get', 'laundry', {}, function (error, data) {
          assert.equal(data.description, 'You have to do laundry!');

          socket.disconnect();
          server.close(done);
        });
      });
    });
  });

  it('Uses custom middleware. (#21)', function (done) {
    var todoService = {
      get: function (name, params, callback) {
        callback(null, {
          id: name,
          description: 'You have to do ' + name + '!',
          stuff: params.stuff
        });
      }
    };

    var app = feathers()
      .configure(feathers.rest())
      .use('/todo', function (req, res, next) {
        req.feathers.stuff = 'custom middleware';
        next();
      }, todoService)
      .use('/otherTodo', todoService);

    var server = app.listen(6995).on('listening', function () {
      request('http://localhost:6995/todo/dishes', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        var data = JSON.parse(body);
        assert.equal(data.stuff, 'custom middleware', 'Custom middleware updated params');

        request('http://localhost:6995/otherTodo/dishes', function (error, response, body) {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          var data = JSON.parse(body);
          assert.ok(!data.stuff, 'Custom middleware not run for different service.');
          server.close(done);
        });
      });
    });
  });

  it('REST and SocketIO with SSL server (#25)', function (done) {
    // For more info on Reqest HTTPS settings see https://github.com/mikeal/request/issues/418
    // This needs to be set so that the SocektIO client can connect
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    var todoService = {
      get: function (name, params, callback) {
        callback(null, {
          id: name,
          description: 'You have to do ' + name + '!'
        });
      }
    };

    var app = feathers()
      .configure(feathers.rest())
      .configure(feathers.socketio()).use('/secureTodos', todoService);

    var httpsServer = https.createServer({
      key: fs.readFileSync(__dirname + '/resources/privatekey.pem'),
      cert: fs.readFileSync(__dirname + '/resources/certificate.pem'),
      rejectUnauthorized: false,
      requestCert: false
    }, app).listen(7889);

    app.setup(httpsServer);

    httpsServer.on('listening', function () {
      var socket = io.connect('https://localhost:7889', { secure: true, port: 7889 });

      request({
        url: 'https://localhost:7889/secureTodos/dishes',
        strictSSL: false,
        rejectUnhauthorized: false
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        var data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        socket.emit('secureTodos::get', 'laundry', {}, function (error, data) {
          assert.equal(data.description, 'You have to do laundry!');

          socket.disconnect();
          httpsServer.close();
          done();
        });
      });
    });
  });

  it('Returns the value of a promise. (#41)', function (done) {
    var original = {};
    var todoService = {
      get: function (name) {
        original = {
          id: name,
          q: true,
          description: 'You have to do ' + name + '!'
        };
        return q(original);
      }
    };

    var app = feathers()
      .configure(feathers.rest())
      .use('/todo', todoService);

    var server = app.listen(6880).on('listening', function () {
      request('http://localhost:6880/todo/dishes', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        assert.deepEqual(original, JSON.parse(body));
        server.close(done);
      });
    });
  });

  it('Extend params with route params. (#76)', function (done) {
    var todoService = {
      get: function (id, params, callback) {
        var result = {
          id: id,
          appId: params.appId
        };
        callback(null, result);
      }
    };

    var app = feathers()
      .configure(feathers.rest())
      .use('/:appId/todo', todoService);

    var expected = {
      id: 'dishes',
      appId: 'theApp'
    };

    var server = app.listen(6880).on('listening', function () {
      request('http://localhost:6880/theApp/todo/' + expected.id, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        assert.deepEqual(expected, JSON.parse(body));
        server.close(done);
      });
    });
  });

  it('Calls _setup in order to set up custom routes with higher priority. (#86)', function (done) {
    var todoService = {
      get: function (name, params, callback) {
        callback(null, {
          id: name,
          q: true,
          description: 'You have to do ' + name + '!'
        });
      },

      _setup: function (app, path) {
        app.get('/' + path + '/count', function(req, res) {
          res.json({
            counter: 10
          });
        });
      }
    };

    var app = feathers()
      .configure(feathers.rest())
      .use('/todo', todoService);

    var server = app.listen(8999).on('listening', function () {
      request('http://localhost:8999/todo/dishes', function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        var data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        request('http://localhost:8999/todo/count', function (error, response, body) {
          assert.ok(response.statusCode === 200, 'Got OK status code');
          var data = JSON.parse(body);
          assert.equal(data.counter, 10);
          server.close(done);
        });
      });
    });
  });

  it('mixins are unique to one application', function() {
    var app = feathers();
    app.mixins.push(function() {});
    assert.equal(app.mixins.length, 4);

    var otherApp = feathers();
    otherApp.mixins.push(function() {});
    assert.equal(otherApp.mixins.length, 4);
  });
});
