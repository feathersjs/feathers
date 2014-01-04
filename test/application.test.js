'use strict';

var assert = require('assert');
var Proto = require('uberproto');
var io = require('socket.io-client');
var request = require('request');
var https = require('https');
var fs = require('fs');

var feathers = require('../lib/feathers');

describe('Feathers application', function () {
  it('registers service and looks it up with and without leading and trailing slashes', function () {
    var dummyService = {
      find: function () {
        // No need to implement this
      }
    };

    var app = feathers().use('/dummy/service/', dummyService);

    assert.ok(typeof app.lookup('dummy/service').find === 'function', 'Could look up without slashes');
    assert.ok(typeof app.lookup('/dummy/service').find === 'function', 'Could look up with leading slash');
    assert.ok(typeof app.lookup('dummy/service/').find === 'function', 'Could look up with trailing slash');
  });

  it('registers a service, wraps it and adds the event mixin', function (done) {
    var dummyService = {
      create: function (data, params, callback) {
        callback(null, data);
      }
    };

    var app = feathers().use('/dummy', dummyService);
    var server = app.listen(7887);
    var wrappedService = app.lookup('dummy');

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

  it('adds REST by default and registers SocketIO provider', function (done) {
    var todoService = {
      get: function (name, params, callback) {
        callback(null, {
          id: name,
          description: "You have to do " + name + "!"
        });
      }
    };

    var oldlog = console.log;
    console.log = function () {};

    var app = feathers().configure(feathers.socketio(function(io) {
      io.set('log level', 0);
    })).use('/todo', todoService);
    var server = app.listen(6999).on('listening', function () {
      console.log = oldlog;

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

  it('REST and SocketIO with SSL server (#25)', function(done) {
    // For more info on Reqest HTTPS settings see https://github.com/mikeal/request/issues/418
    // This needs to be set so that the SocektIO client can connect
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

    var todoService = {
      get: function (name, params, callback) {
        callback(null, {
          id: name,
          description: "You have to do " + name + "!"
        });
      }
    };

    var oldlog = console.log;
    console.log = function () {};
    var app = feathers().configure(feathers.socketio(function(io) {
      io.set('log level', 0);
    })).use('/secureTodos', todoService);

    var httpsServer = https.createServer({
      key: fs.readFileSync(__dirname + '/resources/privatekey.pem'),
      cert: fs.readFileSync(__dirname + '/resources/certificate.pem'),
      rejectUnauthorized: false,
      requestCert: false
    }, app).listen(7889);

    app.setup(httpsServer);

    httpsServer.on('listening', function() {
      var socket = io.connect('https://localhost:7889', { secure: true, port: 7889 });

      console.log = oldlog;

      request({
        url: 'https://localhost:7889/secureTodos/dishes',
        strictSSL: false,
        rejectUnhauthorized : false
      }, function (error, response, body) {
        assert.ok(response.statusCode === 200, 'Got OK status code');
        var data = JSON.parse(body);
        assert.equal(data.description, 'You have to do dishes!');

        socket.emit('secureTodos::get', 'laundry', {}, function (error, data) {
          assert.equal(data.description, 'You have to do laundry!');

          socket.disconnect();
          httpsServer.close(done);
        });
      });
    });
  });
});
