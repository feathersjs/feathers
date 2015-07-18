function noop() {}

function getCallback(args) {
  var last = args[args.length - 1];
  return typeof last === 'function' ? last : noop;
}

function getParams(args, position) {
  var arg = args[position];
  return typeof arg === 'object' ? arg : {};
}

function updateOrPatch(name) {
  return function(args) {
    var id = args[0];
    var data = args[1];
    var callback = getCallback(args);
    var params = getParams(args, 2);

    if(typeof id === 'function') {
      throw new Error('First parameter for \'' + name + '\' can not be a function');
    }

    if(typeof data !== 'object') {
      throw new Error('No data provided for \'' + name + '\'');
    }

    if(args.length > 4) {
      throw new Error('Too many arguments for \'' + name + '\' service method');
    }

    return [ id, data, params, callback ];
  };
}

function getOrRemove(name) {
  return function(args) {
    var id = args[0];
    var params = getParams(args, 1);
    var callback = getCallback(args);

    if(args.length > 3) {
      throw new Error('Too many arguments for \'' + name + '\' service method');
    }

    if(id === 'function') {
      throw new Error('First parameter for \'' + name + '\' can not be a function');
    }

    return [ id, params, callback ];
  };
}

var converters = {
  find: function(args) {
    var callback = getCallback(args);
    var params = getParams(args, 0);

    if(args.length > 2) {
      throw new Error('Too many arguments for \'find\' service method');
    }

    return [ params, callback ];
  },

  create: function(args) {
    var data = args[0];
    var params = getParams(args, 1);
    var callback = getCallback(args);

    if(typeof data !== 'object') {
      throw new Error('First parameter for \'create\' must be an object');
    }

    if(args.length > 3) {
      throw new Error('Too many arguments for \'create\' service method');
    }

    return [ data, params, callback ];
  },

  update: updateOrPatch('update'),

  patch: updateOrPatch('patch'),

  get: getOrRemove('get'),

  remove: getOrRemove('remove')
};

module.exports = function getArguments(method, args) {
  return converters[method](args);
};

module.exports.noop = noop;
