import { each } from './utils';

function getOrRemove(args) {
  return {
    id: args[0],
    params: args[1],
    callback: args[2]
  };
}

function updateOrPatch(args) {
  return {
    id: args[0],
    data: args[1],
    params: args[2],
    callback: args[3]
  };
}

const converters = {
  find: function(args) {
    return {
      params: args[0],
      callback: args[1]
    };
  },
  create: function(args) {
    return {
      data: args[0],
      params: args[1],
      callback: args[2]
    };
  },
  get: getOrRemove,
  remove: getOrRemove,
  update: updateOrPatch,
  patch: updateOrPatch
};

function hookObject(method, type, args, app) {
  var hook = converters[method](args);

  hook.method = method;
  hook.type = type;

  if(app) {
    hook.app = app;
  }

  return hook;
}

function defaultMakeArguments(hook) {
  var result = [];
  if(typeof hook.id !== 'undefined') {
    result.push(hook.id);
  }

  if(hook.data) {
    result.push(hook.data);
  }

  result.push(hook.params || {});
  result.push(hook.callback);

  return result;
}

function makeArguments(hook) {
  if(hook.method === 'find') {
    return [ hook.params, hook.callback ];
  }

  if(hook.method === 'get' || hook.method === 'remove') {
    return [ hook.id, hook.params, hook.callback ];
  }

  if(hook.method === 'update' || hook.method === 'patch') {
    return [ hook.id, hook.data, hook.params, hook.callback ];
  }

  if(hook.method === 'create') {
    return [ hook.data, hook.params, hook.callback ];
  }

  return defaultMakeArguments(hook);
}

function convertHookData(obj) {
  var hook = {};

  if(Array.isArray(obj)) {
    hook = { all: obj };
  } else if(typeof obj !== 'object') {
    hook = { all: [ obj ] };
  } else {
    each(obj, function(value, key) {
      hook[key] = !Array.isArray(value) ? [ value ] : value;
    });
  }

  return hook;
}

export default {
  hookObject,
  hook: hookObject,
  converters,
  defaultMakeArguments,
  makeArguments,
  convertHookData
};
