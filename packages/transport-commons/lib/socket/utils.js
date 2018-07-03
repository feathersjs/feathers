const errors = require('@feathersjs/errors');
const debug = require('debug')('@feathersjs/transport-commons');

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
  return function (event, channel, context, data) {
    debug(`Dispatching '${event}' to ${channel.length} connections`);

    channel.connections.forEach(connection => {
      // The reference between connection and socket
      // is set in `app.setup`
      const socket = connection[socketKey];

      if (socket) {
        const eventName = `${context.path || ''} ${event}`.trim();

        let result = channel.dataFor(connection) || context.dispatch || context.result;

        // If we are getting events from an array but try to dispatch individual data
        // try to get the individual item to dispatch from the correct index.
        if (!Array.isArray(data) && Array.isArray(context.result) && Array.isArray(result)) {
          result = result[context.result.indexOf(data)];
        }

        debug(`Dispatching '${eventName}' to Socket ${socket.id} with`, result);

        socket[emit](eventName, result);
      }
    });
  };
};

exports.runMethod = function (app, connection, path, method, args) {
  const trace = `method '${method}' on service '${path}'`;
  const methodArgs = args.slice(0);
  const callback = typeof methodArgs[methodArgs.length - 1] === 'function'
    ? methodArgs.pop() : function () {};

  debug(`Running ${trace}`, connection, args);

  const handleError = error => {
    debug(`Error in ${trace}`, error);
    callback(normalizeError(error));
  };
  // A wrapper function that runs the method and returns a promise
  const _run = () => {
    const lookup = app.lookup(path);

    // No valid service was found, return a 404
    // just like a REST route would
    if (lookup === null) {
      return Promise.reject(new errors.NotFound(`Service '${path}' not found`));
    }

    const { service, params: route = {} } = lookup;

    // Only service methods are allowed
    if (paramsPositions[method] === undefined || typeof service[method] !== 'function') {
      return Promise.reject(new errors.MethodNotAllowed(`Method '${method}' not allowed on service '${path}'`));
    }

    const position = paramsPositions[method];
    const query = methodArgs[position] || {};
    // `params` have to be re-mapped to the query
    // and added with the route
    const params = Object.assign({ query, route, connection }, connection);

    methodArgs[position] = params;

    return service[method](...methodArgs, true);
  };

  try {
    // Run and map to the callback that is being called for Socket calls
    _run().then(hook => {
      const result = hook.dispatch || hook.result;

      debug(`Returned successfully ${trace}`, result);
      callback(null, result);
    }).catch(hook => handleError(hook.type === 'error' ? hook.error : hook));
  } catch (error) {
    handleError(error);
  }
};
