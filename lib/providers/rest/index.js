'use strict';

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
        // GET /:id -> service.get(id, params, cb)
        .get(uri + '/:id', app.rest.get(service))
        // POST -> service.create(data, params, cb)
        .post(uri, app.rest.create(service))
        // PUT /:id -> service.update(id, data, params, cb)
        .put(uri + '/:id', app.rest.update(service))
        // DELETE /:id -> service.remove(id, params, cb)
        .del(uri + '/:id', app.rest.remove(service))
        // PATCH /:id -> service.patch(id, data, params, callback)
        .patch(uri + '/:id', app.rest.patch(service));

      app.use(uri, handler);
    });
  };
};
