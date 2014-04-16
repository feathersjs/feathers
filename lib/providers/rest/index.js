'use strict';

var bodyParser = require('body-parser');
var wrappers = require('./wrappers');

module.exports = function (config) {
  config = config || {};

  var handler = config.handler || function (req, res) {
    res.format({
      'application/json': function () {
        res.json(res.data);
      }
    });
  };

  if(typeof config === 'function') {
    handler = config;
  }

  return function () {
    var app = this;

    app.enable('feathers rest');

    app.use(bodyParser()).use(function (req, res, next) {
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

      app.route(uri)
        // GET / -> service.find(cb, params)
        .get(app.rest.find(service))
        // POST -> service.create(data, params, cb)
        .post(app.rest.create(service));

      app.route(uri + '/:id')
        // GET /:id -> service.get(id, params, cb)
        .get(app.rest.get(service))
        // PUT /:id -> service.update(id, data, params, cb)
        .put(app.rest.update(service))
        // PATCH /:id -> service.patch(id, data, params, callback)
        .patch(app.rest.patch(service))
        // DELETE /:id -> service.remove(id, params, cb)
        .delete(app.rest.remove(service));

      app.use(uri, handler);
    });
  };
};
