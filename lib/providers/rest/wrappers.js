var _ = require('underscore');

/**
 * Return a service callback that sets the data in the given
 * response and calls next on errors.
 *
 * @param req
 * @param res
 * @param next
 * @returns {Function}
 */
function wrap(req, res, next) {
  return function(error, data) {
    if (error) {
      return next(error);
    }
    res.data = data;
    return next();
  };
}

/**
 * Returns the service params, setting params.query
 * to an empty object (if not set) and grabbing anything set
 * in req.feathers.
 *
 * @param req The request
 * @returns {Object} The service parameters
 */
function getParams(req) {
  var query = req.query || {};
  return _.extend({
    query: query
  }, req.feathers);
}

/**
 * Checks if the service method is available. If not, sets the response HTTP status to
 * 405 (Method not allowed) and returns an error.
 *
 * @param res The HTTP response
 * @param service The wrapped service object
 * @param name The method name to check for
 * @returns {Error|false} `false` or an error object with the description
 */
function checkMethod(res, service, name) {
  if (typeof service[name] !== 'function') {
    res.status(405);
    return new Error('Can not call service method .' + name);
  }

  return false;
}

/**
 * Returns wrapped middleware for a service method.
 *
 * @type {{find: find, get: get, create: create, update: update, remove: remove}}
 */
module.exports = {
  find: function(service) {
    return function(req, res, next) {
      var error = checkMethod(res, service, 'find');
      if (error) {
        return next(error);
      }

      service.find(getParams(req), wrap(req, res, next));
    };
  },

  get: function(service) {
    return function(req, res, next) {
      var error = checkMethod(res, service, 'get');
      if (error) {
        return next(error);
      }

      service.get(req.params.id, getParams(req), wrap(req, res, next));
    };
  },

  create: function(service) {
    return function(req, res, next) {
      var error = checkMethod(res, service, 'create');
      if (error) {
        return next(error);
      }

      service.create(req.body, getParams(req), wrap(req, res, next));
    };
  },

  update: function(service) {
    return function(req, res, next) {
      var error = checkMethod(res, service, 'update');
      if (error) {
        return next(error);
      }

      service.update(req.params.id, req.body, getParams(req), wrap(req, res, next));
    };
  },

  remove: function(service) {
    return function(req, res, next) {
      var error = checkMethod(res, service, 'remove');
      if (error) {
        return next(error);
      }

      service.remove(req.params.id, getParams(req), wrap(req, res, next));
    };
  }
};
