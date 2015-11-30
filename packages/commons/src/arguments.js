export const noop = () => {};
const getCallback = args => {
  var last = args[args.length - 1];
  return typeof last === 'function' ? last : noop;
};
const getParams = (args, position) => typeof args[position] === 'object' ? args[position] : {};

const updateOrPatch = name => {
  return function(args) {
    let id = args[0];
    let data = args[1];
    let callback = getCallback(args);
    let params = getParams(args, 2);

    if(typeof id === 'function') {
      throw new Error(`First parameter for '${name}' can not be a function`);
    }

    if(typeof data !== 'object') {
      throw new Error(`No data provided for '${name}'`);
    }

    if(args.length > 4) {
      throw new Error(`Too many arguments for '${name}' service method`);
    }

    return [ id, data, params, callback ];
  };
};

const getOrRemove = name => {
  return function(args) {
    let id = args[0];
    let params = getParams(args, 1);
    let callback = getCallback(args);

    if(args.length > 3) {
      throw new Error(`Too many arguments for '${name}' service method`);
    }

    if(typeof id === 'function') {
      throw new Error(`First parameter for '${name}' can not be a function`);
    }

    return [ id, params, callback ];
  };
};

export const converters = {
  find(args) {
    let callback = getCallback(args);
    let params = getParams(args, 0);

    if(args.length > 2) {
      throw new Error(`Too many arguments for 'find' service method`);
    }

    return [ params, callback ];
  },

  create(args) {
    let data = args[0];
    let params = getParams(args, 1);
    let callback = getCallback(args);

    if(typeof data !== 'object') {
      throw new Error(`First parameter for 'create' must be an object`);
    }

    if(args.length > 3) {
      throw new Error(`Too many arguments for 'create' service method`);
    }

    return [ data, params, callback ];
  },

  update: updateOrPatch('update'),

  patch: updateOrPatch('patch'),

  get: getOrRemove('get'),

  remove: getOrRemove('remove')
};

export default function getArguments(method, args) {
  return converters[method](args);
}
