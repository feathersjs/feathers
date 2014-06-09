/*
 * feathers-errors
 * https://github.com/feathersjs/feathers-errors
 *
 * Copyright (c) 2014 Eric Kryski
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var errors = require('./error-types');
var html = fs.readFileSync(path.resolve(__dirname, '..', 'public/error.html')).toString();

/**
* Escape the given string of `html`.
*
* @param {String} html
* @return {String}
* @api private
*/
var escapeHTML = function(html){
  return String(html)
    .replace(/&(?!\w+;)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

exports = module.exports = function () {
  return function () {
    var app = this;

    // Enable the errors Plugin
    app.enable('feathers errors');

    // Set the available errors on the app for convenience
    app.errors = errors;
  };
};

exports.types = errors;

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
 *
 */

/* jshint unused:false */
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
      // If we have a rendering engine don't show the
      // default feathers error page.
      if (req.app.get('view engine') !== undefined) {
        if (err.code === 404) {
          return res.redirect('/404');
        }

        return res.redirect('/500');
      }

      var stack = (err.stack || '')
          .split('\n')
          .slice(1)
          .map(function(v) {
             return '<li>' + v + '</li>';
           })
          .join('');

      var errorPage = html
          .replace('{stack}', stack)
          .replace('{title}', err.message)
          .replace('{statusCode}', err.code)
          .replace(/\{error\}/g, escapeHTML(err.toString().replace(/\n/g, '<br/>')));
      res.send(errorPage);
    },

    'application/json': function(){
      res.json({
        'code': err.code,
        'name': err.name,
        'message': err.message
      });
    },

    'text/plain': function(){
      res.send(err.message);
    }
  });
};