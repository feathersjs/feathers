'use strict';

var assert = require('assert');
var Proto = require('uberproto');
var q = require('q');
var _ = require('lodash');

var mixin = require('../../lib/mixins/promise');

describe('Promises/A+ mixin', function () {
  it('Calls a callback when a promise is returned from the original service', function (done) {
    // A dummy context (this will normally be the application)
    var context = {
      methods: ['get']
    };
    var FixtureService = Proto.extend({
      get: function (id) {
        return q({
          id: id,
          description: 'You have to do ' + id
        });
      }
    });

    mixin.call(context, FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.get('dishes', {}, function (error, data) {
      assert.deepEqual(data, {
        id: 'dishes',
        description: 'You have to do dishes'
      });
      done();
    });
  });

  it('calls back with an error for a failing deferred', function(done) {
    // A dummy context (this will normally be the application)
    var context = {
      methods: ['get']
    };
    var FixtureService = Proto.extend({
      get: function () {
        var dfd = q.defer();

        _.defer(function() {
          dfd.reject(new Error('Something went wrong'));
        });

        return dfd.promise;
      }
    });

    mixin.call(context, FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.get('dishes', {}, function (error) {
      assert.ok(error);
      assert.equal(error.message, 'Something went wrong');
      done();
    });
  });

  it('does not try to call the callback if it does not exist', function(done) {
    // A dummy context (this will normally be the application)
    var context = {
      methods: ['create']
    };
    var FixtureService = Proto.extend({
      create: function (data) {
        var dfd = q.defer();

        _.defer(function() {
          dfd.resolve(data);
        });

        return dfd.promise;
      }
    });
    var original = {
      id: 'laundry',
      description: 'You have to do laundry'
    };

    mixin.call(context, FixtureService);

    var instance = Proto.create.call(FixtureService);
    instance.create(original, {}).then(function(data) {
      assert.deepEqual(data, original);
      done();
    });
  });
});
