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

      var middleware = (options && options.middleware) || [];
      var uri = path.indexOf('/') === 0 ? path : '/' + path;
      var baseRoute = app.route(uri);
      var idRoute = app.route(uri + '/:id');
      var collectionRoute = app.route(uri + '/:id/:collection');
      var collectionItemRoute = app.route(uri + '/:id/:collection/:documentId');

      debug('Adding REST provider for service `' + path + '` at base route `' + uri + '`');

      // GET / -> service.find(params, cb)
      baseRoute.get.apply(baseRoute, middleware.concat(app.rest.find(service)));
      // POST / -> service.create(data, params, cb)
      baseRoute.post.apply(baseRoute, middleware.concat(app.rest.create(service)));

      // GET /:id -> service.get(id, params, cb)
      idRoute.get.apply(idRoute, middleware.concat(app.rest.get(service)));
      // PUT /:id -> service.update(id, data, params, cb)
      idRoute.put.apply(idRoute, middleware.concat(app.rest.update(service)));
      // PATCH /:id -> service.patch(id, data, params, cb)
      idRoute.patch.apply(idRoute, middleware.concat(app.rest.patch(service)));
      // DELETE /:id -> service.remove(id, params, cb)
      idRoute.delete.apply(idRoute, middleware.concat(app.rest.remove(service)));

      // GET /:id/:collection -> service.findInCollection(id, collection, params, cb)
      collectionRoute.get.apply(collectionRoute,
        middleware.concat(app.rest.findInCollection(service)));
      // POST /:id/:collection -> service.addToCollection(id, collection, data, params, cb)
      collectionRoute.post.apply(collectionRoute,
        middleware.concat(app.rest.addToCollection(service)));

      // GET /:id/:collection/:documentId -> service.getInCollection(id, collection, documentId, params, cb)
      collectionItemRoute.get.apply(collectionItemRoute,
        middleware.concat(app.rest.getInCollection(service)));
      // DELETE /:id/:collection/:documentId -> service.removeFromCollection(id, collection, documentId, params, cb)
      collectionItemRoute.delete.apply(collectionItemRoute,
        middleware.concat(app.rest.removeFromCollection(service)));

      app.use(uri, handler);
    });
  };
};
