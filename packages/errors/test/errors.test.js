'use strict';

/* jshint undef:false */

var assert = require('assert');
var feathers = require('feathers');
var errors = require('../lib/errors');
var app;

describe('Feathers errors', function () {

  beforeEach(function() {
    app = feathers().configure(errors());
  });

  it('initializes errors object', function () {
    assert.equal(typeof app.errors, 'object', 'errors got added to the app');
  });

  it('can create app errors', function () {
    var error = new app.errors.GeneralError('foo');

    assert.equal(error.code, 500 ,'a general error was created with the correct code');
    assert.equal(error.message, 'foo' ,'a general error was created with the correct message');
  });

  it('has all the available errors', function () {
    assert.notEqual(typeof app.errors.GeneralError, 'undefined', 'has GeneralError');
    assert.notEqual(typeof app.errors.BadRequest, 'undefined', 'has BadRequest');
    assert.notEqual(typeof app.errors.NotAuthenticated, 'undefined', 'has NotAuthenticated');
    assert.notEqual(typeof app.errors.Forbidden, 'undefined', 'has Forbidden');
    assert.notEqual(typeof app.errors.NotFound, 'undefined', 'has NotFound');
    assert.notEqual(typeof app.errors.Timeout, 'undefined', 'has Timeout');
    assert.notEqual(typeof app.errors.Conflict, 'undefined', 'has Conflict');
    assert.notEqual(typeof app.errors.PaymentError, 'undefined', 'has PaymentError');
    assert.notEqual(typeof app.errors.Unprocessable, 'undefined', 'has Unprocessable');
  });

  it.skip('error handler catches errors', function () {
    // TODO (EK)
  });
});
