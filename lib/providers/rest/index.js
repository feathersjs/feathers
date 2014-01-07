'use strict';

var _ = require('underscore');
var wrappers = require('./wrappers');

module.exports = function (config) {
  config = config || {};

  var responder = config.responder || function (req, res) {
    res.format(_.extend({
      'application/json': function () {
        res.json(res.data);
      }
    }, config.formatters));
  };

  return function () {
    var app = this;

    app.enable('feathers rest');

    app.use(function (req, res, next) {
      req.feathers = {};
      next();
    });

    app.rest = wrappers;

    // Register the REST provider
    app.providers.push(function (path, service) {
      if (app.disabled('feathers rest')) {
        return;
      }

      var uri = path.indexOf('/') === 0 ? path : '/' + path;

      // GET / -> service.find(cb, params)
      app.get(uri, app.rest.find(service))
        // GET /:id -> service.get(cb, id, params)
        .get(uri + '/:id', app.rest.get(service))
        // POST -> service.create(cb, data, params)
        .post(uri, app.rest.create(service))
        // PUT /:id -> service.update(cb, id, data, params)
        .put(uri + '/:id', app.rest.update(service))
        // DELETE /:id -> service.remove(cb, id, params)
        .del(uri + '/:id', app.rest.remove(service));

      app.use(uri, responder);
    });
  };
};
