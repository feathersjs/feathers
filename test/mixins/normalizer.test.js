'use strict';

var assert = require('assert');
var Proto = require('uberproto');
var normalizer = require('../../lib/mixins/normalizer');
var mixins = require('../../lib/mixins');

describe('Argument normalizer mixin', function () {
  it('normalizer mixin is always the last to run', function() {
    var arr = mixins();
    var dummy = function() { };

    assert.equal(arr.length, 3);

    arr.push(dummy);

    assert.equal(arr[arr.length - 1], normalizer, 'Last mixin is still the normalizer');
    assert.equal(arr[arr.length - 2], dummy, 'Dummy got added before last');
  });

  // The normalization is already tests in all variations in `getArguments`
  // so we just so we only test two random samples

  it('normalizes .find without a callback', function (done) {
    var context = {
      methods: ['find']
    };
    var FixtureService = Proto.extend({
      find: function(params, callback) {
        assert.ok(typeof callback === 'function');
        assert.equal(params.test, 'Here');
        done();
      }
    });

    normalizer.call(context, FixtureService);

    var instance = Proto.create.call(FixtureService);

    instance.find({ test: 'Here' });
  });

  it('normalizes .update without params and callback', function (done) {
    var context = {
      methods: ['update']
    };
    var FixtureService = Proto.extend({
      update: function(id, data, params, callback) {
        assert.equal(id, 1);
        assert.ok(typeof callback === 'function');
        assert.deepEqual(data, { test: 'Here' });
        assert.deepEqual(params, {});
        done();
      }
    });

    normalizer.call(context, FixtureService);

    var instance = Proto.create.call(FixtureService);

    instance.update(1, { test: 'Here' });
  });
});
