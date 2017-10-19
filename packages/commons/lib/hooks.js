const { each } = require('./utils')._;

function getParams (value) {
  return value || {};
}

function convertGetOrRemove (args) {
  return {
    id: args[0],
    params: getParams(args[1])
  };
}

function convertUpdateOrPatch (args) {
  return {
    id: args[0],
    data: args[1],
    params: getParams(args[2])
  };
}

exports.converters = {
  find (args) {
    return {
      params: getParams(args[0])
    };
  },
  create (args) {
    return {
      data: args[0],
      params: getParams(args[1])
    };
  },
  get: convertGetOrRemove,
  remove: convertGetOrRemove,
  update: convertUpdateOrPatch,
  patch: convertUpdateOrPatch
};

exports.createHookObject = function createHookObject (method, args, data = {}) {
  const hook = exports.converters[method](args);

  return Object.assign(hook, data, {
    method,
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

exports.makeArguments = function makeArguments (hook) {
  if (hook.method === 'find') {
    return [ hook.params ];
  }

  if (hook.method === 'get' || hook.method === 'remove') {
    return [ hook.id, hook.params ];
  }

  if (hook.method === 'update' || hook.method === 'patch') {
    return [ hook.id, hook.data, hook.params ];
  }

  if (hook.method === 'create') {
    return [ hook.data, hook.params ];
  }

  return exports.defaultMakeArguments(hook);
};

exports.convertHookData = function convertHookData (obj) {
  var hook = {};

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

exports.isHookObject = function isHookObject (hookObject) {
  return typeof hookObject === 'object' &&
    typeof hookObject.method === 'string' &&
    typeof hookObject.type === 'string';
};

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
    if (current) {
      if (!exports.isHookObject(current)) {
        throw new Error(`${hookObject.type} hook for '${hookObject.method}' method returned invalid hook object`);
      }

      hookObject = current;
    }

    return hookObject;
  };
  let promise = Promise.resolve(hookObject);

  // Go through all hooks and chain them into our promise
  hooks.forEach(fn => {
    const hook = fn.bind(this);

    if (hook.length === 2) { // function(hook, next)
      promise = promise.then(hookObject => {
        return new Promise((resolve, reject) => {
          hook(hookObject, (error, result) =>
            error ? reject(error) : resolve(result));
        });
      });
    } else { // function(hook)
      promise = promise.then(hook);
    }

    // Use the returned hook object or the old one
    promise = promise.then(updateCurrentHook);
  });

  return promise.catch(error => {
    // Add the hook information to any errors
    error.hook = hookObject;
    throw error;
  });
};

exports.enableHooks = function enableHooks (obj, methods, types) {
  if (typeof obj.hooks === 'function') {
    return obj;
  }

  let __hooks = {};

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
