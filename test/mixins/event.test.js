'use strict';

var assert = require('assert');
var _ = require('lodash');
var Proto = require('uberproto');
var EventEmitter = require('events').EventEmitter;

var mixinEvent = require('../../lib/mixins/event');
var create = Proto.create;

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

    var instance = create.call(FixtureService);
    assert.equal('Original setup: Test', instance.setup('Test'));
    assert.ok(instance._rubberDuck instanceof EventEmitter);

    var existingMethodsService = {
      setup: function (arg) {
        return 'Original setup from object: ' + arg;
      }
    };

    Proto.mixin(EventEmitter.prototype, existingMethodsService);

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

    var instance = create.call(FixtureService);

    mixinEvent(instance);

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

    var instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('created', function (data, args) {
      assert.equal(data.id, 10);
      assert.equal(data.name, 'Tester');
      assert.equal(args.data.name, 'Tester');
      assert.equal(args.params.custom, 'value');
      done();
    });

    instance.create({
      name: 'Tester'
    }, {
      custom: 'value'
    }, function (error, data) {
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

    var instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('updated', function (data, args) {
      assert.equal(data.id, 12);
      assert.equal(data.name, 'Updated tester');
      assert.equal(args.id, 12);
      assert.equal(args.data.name, 'Updated tester');
      assert.equal(args.params.custom, 'value');
      done();
    });

    instance.update(12, {
      name: 'Updated tester'
    }, {
      custom: 'value'
    }, function (error, data) {
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

    var instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('removed', function (data, args) {
      assert.equal(data.id, 27);
      assert.equal(args.id, 27);
      assert.equal(args.params.custom, 'value');
      done();
    });

    instance.remove(27, {
      custom: 'value'
    }, function (error, data) {
      assert.equal(data.id, 27);
    });
  });

  it('array event data emits multiple event', function (done) {
    var fixture = [
      { id: 0 },
      { id: 1 },
      { id: 2 },
    ];
    var FixtureService = Proto.extend({
      create: function (data, params, cb) {
        _.defer(function () {
          cb(null, fixture);
        });
      }
    });

    var instance = create.call(FixtureService);
    var counter = 0;

    mixinEvent(instance);

    instance.on('created', function (data) {
      assert.equal(data.id, counter);
      counter++;
      if(counter === fixture.length) {
        done();
      }
    });

    instance.create({}, {}, function () {});
  });

  it('does not punch when service has an events list (#118)', function(done) {
    var FixtureService = Proto.extend({
      events: [ 'created' ],
      create: function (data, params, cb) {
        _.defer(function () {
          cb(null, {
            id: 10,
            name: data.name
          });
        });
      }
    });

    FixtureService.mixin(EventEmitter.prototype);

    var instance = create.call(FixtureService);

    mixinEvent(instance);

    instance.on('created', function (data) {
      assert.deepEqual(data, { custom: 'event' });
      done();
    });

    instance.create({
      name: 'Tester'
    }, {}, function (error, data) {
      assert.equal(data.id, 10);
      instance.emit('created', { custom: 'event' });
    });
  });
});
