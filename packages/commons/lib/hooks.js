const { _: { each, pick }, createSymbol } = require('./utils');

// To skip further hooks
const SKIP = createSymbol('__feathersSkipHooks');

exports.SKIP = SKIP;
exports.ACTIVATE_HOOKS = createSymbol('__feathersActivateHooks');

exports.createHookObject = function createHookObject (method, data = {}) {
  const hook = {};

  Object.defineProperty(hook, 'toJSON', {
    value () {
      return pick(this, 'type', 'method', 'path',
        'params', 'id', 'data', 'result', 'error');
    }
  });

  return Object.assign(hook, data, {
    method,
    // A dynamic getter that returns the path of the service
    get path () {
      const { app, service } = data;

      if (!service || !app || !app.services) {
        return null;
      }

      return Object.keys(app.services)
        .find(path => app.services[path] === service);
    }
  });
};

// Fallback used by `makeArguments` which usually won't be used
exports.defaultMakeArguments = function defaultMakeArguments (hook) {
  const result = [];

  if (typeof hook.id !== 'undefined') {
    result.push(hook.id);
  }

  if (hook.data) {
    result.push(hook.data);
  }

  result.push(hook.params || {});

  return result;
};

// Turns a hook object back into a list of arguments
// to call a service method with
exports.makeArguments = function makeArguments (hook) {
  switch (hook.method) {
    case 'find':
      return [ hook.params ];
    case 'get':
    case 'remove':
      return [ hook.id, hook.params ];
    case 'update':
    case 'patch':
      return [ hook.id, hook.data, hook.params ];
    case 'create':
      return [ hook.data, hook.params ];
  }

  return exports.defaultMakeArguments(hook);
};

// Converts different hook registration formats into the
// same internal format
exports.convertHookData = function convertHookData (obj) {
  let hook = {};

  if (Array.isArray(obj)) {
    hook = { all: obj };
  } else if (typeof obj !== 'object') {
    hook = { all: [ obj ] };
  } else {
    each(obj, function (value, key) {
      hook[key] = !Array.isArray(value) ? [ value ] : value;
    });
  }

  return hook;
};

// Duck-checks a given object to be a hook object
// A valid hook object has `type` and `method`
exports.isHookObject = function isHookObject (hookObject) {
  return typeof hookObject === 'object' &&
    typeof hookObject.method === 'string' &&
    typeof hookObject.type === 'string';
};

// Returns all service and application hooks combined
// for a given method and type `appLast` sets if the hooks
// from `app` should be added last (or first by default)
exports.getHooks = function getHooks (app, service, type, method, appLast = false) {
  const appHooks = app.__hooks[type][method] || [];
  const serviceHooks = service.__hooks[type][method] || [];

  if (appLast) {
    // Run hooks in the order of service -> app -> finally
    return serviceHooks.concat(appHooks);
  }

  return appHooks.concat(serviceHooks);
};

exports.processHooks = function processHooks (hooks, initialHookObject) {
  let hookObject = initialHookObject;
  let updateCurrentHook = current => {
    // Either use the returned hook object or the current
    // hook object from the chain if the hook returned undefined
    if (current) {
      if (current === SKIP) {
        return SKIP;
      }

      if (!exports.isHookObject(current)) {
        throw new Error(`${hookObject.type} hook for '${hookObject.method}' method returned invalid hook object`);
      }

      hookObject = current;
    }

    return hookObject;
  };
  // Go through all hooks and chain them into our promise
  const promise = hooks.reduce((promise, fn) => {
    const hook = fn.bind(this);

    if (hook.length === 2) { // function(hook, next)
      promise = promise.then(hookObject => hookObject === SKIP ? SKIP : new Promise((resolve, reject) => {
        hook(hookObject, (error, result) =>
          error ? reject(error) : resolve(result)
        );
      }));
    } else { // function(hook)
      promise = promise.then(hookObject => hookObject === SKIP ? SKIP : hook(hookObject));
    }

    // Use the returned hook object or the old one
    return promise.then(updateCurrentHook);
  }, Promise.resolve(hookObject));

  return promise.then(() => hookObject).catch(error => {
    // Add the hook information to any errors
    error.hook = hookObject;
    throw error;
  });
};

// Add `.hooks` functionality to an object
exports.enableHooks = function enableHooks (obj, methods, types) {
  if (typeof obj.hooks === 'function') {
    return obj;
  }

  const __hooks = {};

  types.forEach(type => {
    // Initialize properties where hook functions are stored
    __hooks[type] = {};
  });

  // Add non-enumerable `__hooks` property to the object
  Object.defineProperty(obj, '__hooks', {
    value: __hooks
  });

  return Object.assign(obj, {
    hooks (allHooks) {
      each(allHooks, (obj, type) => {
        if (!this.__hooks[type]) {
          throw new Error(`'${type}' is not a valid hook type`);
        }

        const hooks = exports.convertHookData(obj);

        each(hooks, (value, method) => {
          if (method !== 'all' && methods.indexOf(method) === -1) {
            throw new Error(`'${method}' is not a valid hook method`);
          }
        });

        methods.forEach(method => {
          const myHooks = this.__hooks[type][method] ||
            (this.__hooks[type][method] = []);

          if (hooks.all) {
            myHooks.push.apply(myHooks, hooks.all);
          }

          if (hooks[method]) {
            myHooks.push.apply(myHooks, hooks[method]);
          }
        });
      });

      return this;
    }
  });
};
