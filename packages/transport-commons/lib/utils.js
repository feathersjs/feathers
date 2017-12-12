const errors = require('@feathersjs/errors');
const UrlPattern = require('url-pattern');
const debug = require('debug')('@feathersjs/socket-commons');

const paramsPositions = exports.paramsPositions = {
  find: 0,
  get: 1,
  remove: 1,
  create: 1,
  update: 2,
  patch: 2
};

const normalizeError = exports.normalizeError = function (e) {
  const hasToJSON = typeof e.toJSON === 'function';
  const result = hasToJSON ? e.toJSON() : {};

  if (!hasToJSON) {
    Object.getOwnPropertyNames(e).forEach(key => {
      result[key] = e[key];
    });
  }

  if (process.env.NODE_ENV === 'production') {
    delete result.stack;
  }

  delete result.hook;

  return result;
};

exports.getDispatcher = function (emit, socketKey) {
  return function (event, channel, hook, data) {
    debug(`Dispatching '${event}' to ${channel.length} connections`);

    channel.connections.forEach(connection => {
      // The reference between connection and socket
      // is set in `app.setup`
      const socket = connection[socketKey];

      if (socket) {
        const eventName = `${hook.path || ''} ${event}`.trim();

        let result = channel.dataFor(connection) || hook.dispatch || hook.result;

        // If we are getting events from an array, try to get the individual
        // item to dispatch from the correct index.
        if (Array.isArray(hook.result) && Array.isArray(result)) {
          result = result[hook.result.indexOf(data)];
        }

        debug(`Dispatching '${eventName}' to Socket ${socket.id} with`, result);

        socket[emit](eventName, result);
      }
    });
  };
};

const getService = exports.getService = function (app, path) {
  let service = app.service(path);
  let route = {};

  if (!service) {
    // If the service was not found, find all registered service
    const paths = Object.keys(app.services);

    for (let current of paths) {
      // For each path, create a URL pattern to see if it matches
      // e.g. `/users/:userId/comments` for /users/10/comments
      // would return path `users/:userId/comments`
      // and a `{ userId: 10 }` route
      const match = new UrlPattern(current).match(path);

      if (match !== null) {
        return {
          service: app.service(current),
          route: match
        };
      }
    }
  }

  return { service, route };
};

exports.runMethod = function (app, connection, path, method, args) {
  const trace = `method '${method}' on service '${path}'`;
  const methodArgs = args.slice(0);
  const callback = typeof methodArgs[methodArgs.length - 1] === 'function'
    ? methodArgs.pop() : function () {};

  debug(`Running ${trace}`, connection, args);

  // A wrapper function that runs the method and returns a promise
  const _run = () => {
    const { service, route } = getService(app, path);

    // No valid service was found, return a 404
    // just like a REST route would
    if (!service) {
      return Promise.reject(new errors.NotFound(`Service '${path}' not found`));
    }

    // Only service methods are allowed
    if (paramsPositions[method] === undefined || typeof service[method] !== 'function') {
      return Promise.reject(new errors.MethodNotAllowed(`Method '${method}' not allowed on service '${path}'`));
    }

    const position = paramsPositions[method];
    const query = methodArgs[position] || {};
    // `params` have to be re-mapped to the query
    // and added with the route
    const params = Object.assign({ query, route }, connection);

    methodArgs[position] = params;

    return service[method](...methodArgs, true);
  };

  // Run and map to the callback that is being called for Socket calls
  _run().then(hook => {
    const result = hook.dispatch || hook.result;

    debug(`Returned successfully ${trace}`, result);
    callback(null, result);
  }).catch(hook => {
    const error = hook.type === 'error' ? hook.error : hook;

    debug(`Error in ${trace}`, error);
    callback(normalizeError(error));
  });
};
