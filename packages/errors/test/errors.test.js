'use strict';

var assert = require('assert');

var feathers = require('feathers');
var error = require('../lib/errors');

describe('Feathers errors', function () {
  it('initializes .associate', function () {
    var app = feathers().configure(errors());

    assert.equal(typeof app.error, 'function', 'error method got added');
  });
});
