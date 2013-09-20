'use strict';

var assert = require('assert');
var Proto = require('uberproto');
var io = require('socket.io-client');
var request = require('request');

var feathers = require('../lib/feathers');
var express = require('express');

describe('Feathers application', function () {
  it('registers service and looks it up with and without leading and trailing slashes', function () {
    var dummyService = {
      find: function (params, callback) {
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

    var app = feathers().configure(feathers.socketio()).use('/todo', todoService);
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
});
