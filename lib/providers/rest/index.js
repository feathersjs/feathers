'use strict';

var wrappers = require('./wrappers');
var debug = require('debug')('feathers:rest');

module.exports = function (config) {
  config = config || {};

  var handler = config.handler || function (req, res) {
    res.format({
      'application/json': function () {
        res.json(res.data);
      }
    });
  };

  if (typeof config === 'function') {
    handler = config;
  }

  return function () {
    var app = this;

    app.enable('feathers rest');

    debug('Setting up default middleware for REST handler');

    app.use(function (req, res, next) {
      req.feathers = {};
      next();
    });

    app.rest = wrappers;

    // Register the REST provider
    app.providers.push(function (path, service, options) {
      if (app.disabled('feathers rest')) {
        return;
      }

      var middleware = (options || {}).middleware || {};
      var before = middleware.before || [];
      var after = middleware.after || [];

      var uri = path.indexOf('/') === 0 ? path : '/' + path;
      var baseRoute = app.route(uri);
      var idRoute = app.route(uri + '/:id');

      debug('Adding REST provider for service `' + path + '` at base route `' + uri + '`');

      // GET / -> service.find(cb, params)
      baseRoute.get.apply(baseRoute, before.concat(app.rest.find(service), after, handler));
      // POST / -> service.create(data, params, cb)
      baseRoute.post.apply(baseRoute, before.concat(app.rest.create(service), after, handler));
      // PATCH / -> service.patch(null, data, params)
      baseRoute.patch.apply(baseRoute, before.concat(app.rest.patch(service), after, handler));
      // PUT / -> service.update(null, data, params)
      baseRoute.put.apply(baseRoute, before.concat(app.rest.update(service), after, handler));
      // DELETE / -> service.remove(null, data, params)
      baseRoute.delete.apply(baseRoute, before.concat(app.rest.remove(service), after, handler));

      // GET /:id -> service.get(id, params, cb)
      idRoute.get.apply(idRoute, before.concat(app.rest.get(service), after, handler));
      // PUT /:id -> service.update(id, data, params, cb)
      idRoute.put.apply(idRoute, before.concat(app.rest.update(service), after, handler));
      // PATCH /:id -> service.patch(id, data, params, callback)
      idRoute.patch.apply(idRoute, before.concat(app.rest.patch(service), after, handler));
      // DELETE /:id -> service.remove(id, params, cb)
      idRoute.delete.apply(idRoute, before.concat(app.rest.remove(service), after, handler));
    });
  };
};
