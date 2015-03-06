'use strict';

var assert = require('assert');
var Proto = require('uberproto');
var normalizer = require('../../lib/mixins/normalizer');

describe('Argument normalizer mixin', function () {
  it('normalizes findAll', function (done) {
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
});
