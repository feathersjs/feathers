'use strict';

var _ = require('underscore');

var _wrapper = function (req, res, next) {
  return function (error, data) {
    if (error) {
      return next(error);
    }
    res.data = data;
    return next();
  };
};
var _getParams = function (req) {
  var query = req.query || {};
  return _.extend({
    query: query
  }, req.feathers);
};
var toUri = function (name) {
  // TODO
  return '/' + name;
};

module.exports = function (config) {
  config = config || {};

  return function () {
    var app = this;
    var responder = config.responder || function (req, res) {
        res.format(_.extend({
          'application/json': function () {
            res.json(res.data);
          }
        }, config.formatters));
      };

    app.enable('feathers rest');

    app.use(function (req, res, next) {
      req.feathers = {};
      next();
    });

    // Register the REST provider
    app.providers.push(function (path, service) {
      if (app.disabled('feathers rest')) {
        return;
      }

      var uri = toUri(path);
      // TODO throw 405 Method Not Allowed with allowed methods

      // GET / -> resource.index(cb, params)
      app.get(uri, function (req, res, next) {
        service.find(_getParams(req), _wrapper(req, res, next));
      });

      // GET /:id -> resource.get(cb, id, params)
      app.get(uri + '/:id', function (req, res, next) {
        service.get(req.params.id, _getParams(req), _wrapper(req, res, next));
      });

      // POST -> resource.create(cb, data, params)
      app.post(uri, function (req, res, next) {
        service.create(req.body, _getParams(req), _wrapper(req, res, next));
      });

      // PUT /:id -> resource.update(cb, id, data, params)
      app.put(uri + '/:id', function (req, res, next) {
        service.update(req.params.id, req.body, _getParams(req), _wrapper(req, res, next));
      });

      // DELETE /:id -> resource.destroy(cb, id, params)
      app.del(uri + '/:id', function (req, res, next) {
        service.remove(req.params.id, _getParams(req), _wrapper(req, res, next));
      });

      app.use(uri, responder);
    });
  };
};
