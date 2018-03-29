const errors = require('@feathersjs/errors');
const { omit } = require('@feathersjs/commons')._;

const debug = require('debug')('@feathersjs/express/rest');

const statusCodes = {
  created: 201,
  noContent: 204,
  methodNotAllowed: 405
};
const methodMap = {
  find: 'GET',
  get: 'GET',
  create: 'POST',
  update: 'PUT',
  patch: 'PATCH',
  remove: 'DELETE'
};
const allowedMethods = function (service) {
  return Object.keys(methodMap)
    .filter(method => typeof service[method] === 'function')
    .map(method => methodMap[method])
    // Filter out duplicates
    .filter((value, index, list) => list.indexOf(value) === index);
};

// A function that returns the middleware for a given method and service
// `getArgs` is a function that should return additional leading service arguments
function getHandler (method, getArgs) {
  return service => {
    return function (req, res, next) {
      const { query } = req;
      const route = omit(req.params, '__feathersId');

      res.setHeader('Allow', allowedMethods(service).join(','));

      // Check if the method exists on the service at all. Send 405 (Method not allowed) if not
      if (typeof service[method] !== 'function') {
        debug(`Method '${method}' not allowed on '${req.url}'`);
        res.status(statusCodes.methodNotAllowed);

        return next(new errors.MethodNotAllowed(`Method \`${method}\` is not supported by this endpoint.`));
      }

      // Grab the service parameters. Use req.feathers
      // and set the query to req.query merged with req.params
      const params = Object.assign({
        query, route
      }, req.feathers);

      Object.defineProperty(params, '__returnHook', {
        value: true
      });

      // Run the getArgs callback, if available, for additional parameters
      const args = getArgs(req, params);

      debug(`REST handler calling \`${method}\` from \`${req.url}\``);

      service[method](...args, true)
        .then(hook => {
          const data = hook.dispatch !== undefined ? hook.dispatch : hook.result;

          res.data = data;
          res.hook = hook;

          if (hook.statusCode) {
            res.status(hook.statusCode);
          } else if (!data) {
            debug(`No content returned for '${req.url}'`);
            res.status(statusCodes.noContent);
          } else if (method === 'create') {
            res.status(statusCodes.created);
          }

          return next();
        })
        .catch(hook => {
          const { error } = hook;

          debug(`Error in handler: \`${error.message}\``);
          res.hook = hook;

          return next(hook.error);
        });
    };
  };
}

// Returns no leading parameters
function reqNone (req, params) {
  return [ params ];
}

// Returns the leading parameters for a `get` or `remove` request (the id)
function reqId (req, params) {
  return [ req.params.__feathersId || null, params ];
}

// Returns the leading parameters for an `update` or `patch` request (id, data)
function reqUpdate (req, params) {
  return [ req.params.__feathersId || null, req.body, params ];
}

// Returns the leading parameters for a `create` request (data)
function reqCreate (req, params) {
  return [ req.body, params ];
}

module.exports = {
  find: getHandler('find', reqNone),
  get: getHandler('get', reqId),
  create: getHandler('create', reqCreate),
  update: getHandler('update', reqUpdate),
  patch: getHandler('patch', reqUpdate),
  remove: getHandler('remove', reqId)
};
