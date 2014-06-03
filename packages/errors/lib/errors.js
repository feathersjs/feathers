/*
 * feathers-associations
 * https://github.com/feathersjs/associations
 *
 * Copyright (c) 2014 David Luecke
 * Licensed under the MIT license.
 */

'use strict';

var Proto = require('uberproto');
var _ = require('lodash');
var errors = require('./error-types');

module.exports = function () {
  return function () {
    var app = this;

    Proto.mixin({
      _errors: {},

      handler: function(err, req, res) {
        if (typeof err === 'string' || !(err instanceof errors.AbstractError)) {
          err = new errors.GeneralError(err);
        }

        var statusCode = typeof err.code === 'number' ? err.code : 500;

        res.status(statusCode);
        req.app.log(req.url, err.stack || err);    

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
      },

      setup: function () {
        var self = this;

        return this._super.apply(this, arguments);
      }
    }, app);
  };
};
