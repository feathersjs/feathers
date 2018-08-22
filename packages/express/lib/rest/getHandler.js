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

function makeArgsGetter (argsOrder) {
  return (req, params) => argsOrder.reduce((result, argName) => {
    switch (argName) {
      case 'id':
        return [ ...result, req.params.__feathersId || null ];
      case 'data':
        return [ ...result, req.body ];
      case 'params':
        return [ ...result, params ];
    }
  }, []);
}

// A function that returns the middleware for a given method and service
// `getArgs` is a function that should return additional leading service arguments
module.exports = function getHandler (method) {
  return service => {
    const getArgs = makeArgsGetter(service.methods[method]);

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
};
