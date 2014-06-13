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

  it('exposes the api properly', function () {
    assert.equal(typeof errors.types, 'object', 'exposes error types');
    assert.equal(typeof errors.handler, 'function', 'exposes error handler');
    assert.equal(typeof errors.fourOhFour, 'function', 'exposes 404 handler');
  });

  it('initializes errors object', function () {
    assert.equal(typeof app.errors, 'object', 'errors got added to the app');
  });

  it('can create app errors', function () {
    var error = new app.errors.GeneralError('foo');

    assert.equal(error.code, 500 ,'a general error was created with the correct code');
    assert.equal(error.message, 'foo' ,'a general error was created with the correct message');
  });

  it('app has all the available errors', function () {
    assert.notEqual(typeof app.errors.BadRequest, 'undefined', 'has BadRequest');
    assert.notEqual(typeof app.errors.NotAuthenticated, 'undefined', 'has NotAuthenticated');
    assert.notEqual(typeof app.errors.PaymentError, 'undefined', 'has PaymentError');
    assert.notEqual(typeof app.errors.Forbidden, 'undefined', 'has Forbidden');
    assert.notEqual(typeof app.errors.NotFound, 'undefined', 'has NotFound');
    assert.notEqual(typeof app.errors.MethodNotAllowed, 'undefined', 'has MethodNotAllowed');
    assert.notEqual(typeof app.errors.NotAcceptable, 'undefined', 'has NotAcceptable');
    assert.notEqual(typeof app.errors.Timeout, 'undefined', 'has Timeout');
    assert.notEqual(typeof app.errors.Conflict, 'undefined', 'has Conflict');
    assert.notEqual(typeof app.errors.Unprocessable, 'undefined', 'has Unprocessable');
    assert.notEqual(typeof app.errors.GeneralError, 'undefined', 'has GeneralError');
    assert.notEqual(typeof app.errors.NotImplemented, 'undefined', 'has NotImplemented');
    assert.notEqual(typeof app.errors.Unavailable, 'undefined', 'has Unavailable');
  });

  it.skip('error handler catches errors', function () {
    // TODO (EK)
  });
});
