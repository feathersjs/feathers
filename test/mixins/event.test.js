'use strict';

var assert = require('assert');
var _ = require('lodash');
var Proto = require('uberproto');
var mixinEvent = require('../../lib/mixins/event');
var EventMixin = mixinEvent.Mixin;

describe('Event mixin', function () {
  it('initializes', function () {
    var FixtureService = Proto.extend({
      setup: function (arg) {
        return 'Original setup: ' + arg;
      }
    });

    mixinEvent(FixtureService);

    assert.equal(typeof FixtureService.setup, 'function');
    assert.equal(typeof FixtureService.on, 'function');
    assert.equal(typeof FixtureService.emit, 'function');

    var instance = FixtureService.create();
    assert.equal('Original setup: Test', instance.setup('Test'));
    assert.ok(instance._rubberDuck instanceof require('events').EventEmitter);

    var existingMethodsService = {
      setup: function (arg) {
        return 'Original setup from object: ' + arg;
      }
    };

    Proto.mixin(EventMixin, existingMethodsService);

    assert.equal('Original setup from object: Test', existingMethodsService.setup('Test'));
    assert.equal(typeof existingMethodsService.on, 'function');
  });

  it('serviceError', function (done) {
    var FixtureService = Proto.extend({
      create: function (data, params, cb) {
        _.defer(function () {
          cb(new Error('Something went wrong'));
        });
      }
    });

    mixinEvent(FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.setup();

    instance.on('serviceError', function (error) {
      assert.ok(error instanceof Error);
      assert.equal(error.message, 'Something went wrong');
      done();
    });

    instance.create({
      name: 'Tester'
    }, {}, function (error) {
      assert.ok(error instanceof Error);
    });
  });

  it('created', function (done) {
    var FixtureService = Proto.extend({
      create: function (data, params, cb) {
        _.defer(function () {
          cb(null, {
            id: 10,
            name: data.name
          });
        });
      }
    });

    mixinEvent(FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.setup();

    instance.on('created', function (data) {
      assert.equal(data.id, 10);
      assert.equal(data.name, 'Tester');
      done();
    });

    instance.create({
      name: 'Tester'
    }, {}, function (error, data) {
      assert.equal(data.id, 10);
    });
  });

  it('updated', function (done) {
    var FixtureService = Proto.extend({
      update: function (id, data, params, cb) {
        _.defer(function () {
          cb(null, {
            id: id,
            name: data.name
          });
        }, 20);
      }
    });

    mixinEvent(FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.setup();

    instance.on('updated', function (data) {
      assert.equal(data.id, 12);
      assert.equal(data.name, 'Updated tester');
      done();
    });

    instance.update(12, {
      name: 'Updated tester'
    }, {}, function (error, data) {
      assert.equal(data.id, 12);
    });
  });

  it('removed', function (done) {
    var FixtureService = Proto.extend({
      remove: function (id, params, cb) {
        _.defer(function () {
          cb(null, {
            id: id
          });
        }, 20);
      }
    });

    mixinEvent(FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.setup();

    instance.on('removed', function (data) {
      assert.equal(data.id, 27);
      done();
    });

    instance.remove(27, {}, function (error, data) {
      assert.equal(data.id, 27);
    });
  });
});
