/*
 * feathers-errors
 * https://github.com/feathersjs/feathers-errors
 *
 * Copyright (c) 2014 Eric Kryski
 * Licensed under the MIT license.
 */

'use strict';

var _ = require('lodash');
var errors = require('./error-types');

exports = module.exports = function () {
  return function () {
    var app = this;

    // Enable the errors Plugin
    app.enable('feathers errors');

    // Set the available errors on the app for convenience
    app.errors = errors;
  };
};

/**
 * Convenience method for a 404 middleware
 * See http://expressjs.com/guide.html#error-handling
 * @param  {Error} err - An error
 * @param  {Object} req - the request object
 * @param  {Object} res - the response object
 * @param  {Function} next - callback to call for next step in middleware chain
 */
exports.missing = function(req, res, next) {
  next(new errors.NotFound('Page not found.'));
};

/**
 * The error handler middleware.
 * See http://expressjs.com/guide.html#error-handling
 * @param  {Error} err - An error
 * @param  {Object} req - the request object
 * @param  {Object} res - the response object
 * @param  {Function} next - callback to call for next step in middleware chain
 */
exports.handler = function(err, req, res, next) {
  if (typeof err === 'string' || !(err instanceof errors.AbstractError)) {
    err = new errors.GeneralError(err);
  }

  var statusCode = typeof err.code === 'number' ? err.code : 500;

  res.status(statusCode);

  if (req.app.log === 'function') {
    req.app.log(req.url, err.stack || err);
  }

  res.format({
    'text/html': function(){
      if(req.app.settings.env === 'development') {
        return res.send(err);
      }

      var errorPath = req.app.get('redirect') + err.className;
      res.redirect(errorPath);
    },

    'application/json': function(){
      res.json(_.pick(err, 'message', 'name', 'code', 'className'));
    },

    'text/plain': function(){
      res.send(err.message);
    }
  });
};