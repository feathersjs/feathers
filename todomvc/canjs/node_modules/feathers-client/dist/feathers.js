(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.feathers = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var utils = require('./utils');
function app(base) {
  if (typeof base !== 'string') {
    base = '/';
  }

  return {
    services: {},

    base: base,

    configure: function (cb) {
      cb.call(this);
      return this;
    },

    service: function (name) {
      name = utils.stripSlashes(name);
      if (!this.services[name]) {
        this.services[name] = this.Service._create(name, this);
      }
      return this.services[name];
    }
  };
}

utils.extend(app, require('./rest/index'));
utils.extend(app, require('./sockets/index'));

module.exports = app;
},{"./rest/index":6,"./sockets/index":11,"./utils":12}],3:[function(require,module,exports){
var utils = require('./utils');
var getArguments = require('./arguments');
var result = {};

utils.methods.forEach(function(method) {
  result[method] = function() {
    var args = getArguments(method, arguments);
    this._super.apply(this, args);
  };
});

module.exports = result;

},{"./arguments":1,"./utils":12}],4:[function(require,module,exports){
var query = require('querystring');
var Proto = require('uberproto');
var eventMixin = require('./events');
var utils = require('../utils');

module.exports = Proto.extend({
  events: utils.events,

  _create: Proto.create,

  init: function(name, options) {
    this.name = utils.stripSlashes(name);
    this.options = utils.extend({}, options);
    this.connection = options.connection;
    this.base = options.base + '/' + name;
    delete this.options.base;
  },

  makeUrl: function (params, id) {
    var url = this.base;

    if (typeof id !== 'undefined') {
      url += '/' + id;
    }

    if(Object.keys(params).length !== 0) {
      url += '?' + query.stringify(params);
    }

    return url;
  },

  find: function (params, callback) {
    this.request({
      url: this.makeUrl(params),
      method: 'GET'
    }, callback);
  },

  get: function(id, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      method: 'GET'
    }, callback);
  },

  create: function (data, params, callback) {
    this.request({
      url: this.makeUrl(params),
      body: data,
      method: 'POST'
    }, callback);
  },

  update: function (id, data, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      body: data,
      method: 'PUT'
    }, callback);
  },

  patch: function (id, data, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      body: data,
      method: 'PATCH'
    }, callback);
  },

  remove: function (id, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      method: 'DELETE'
    }, callback);
  }
}).mixin(eventMixin);

},{"../utils":12,"./events":5,"querystring":16,"uberproto":17}],5:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var utils = require('../utils');
var makeEmitting = function(name) {
  return function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var callback = args[args.length - 1];
    var _emit = this.emit.bind(this);
    if(typeof callback === 'function') {
      args[args.length - 1] = function(error, data) {
        if(!error) {
          _emit(name, data);
        }
        callback(error, data);
      };
    }
    return this._super.apply(this, args);
  };
};

module.exports = utils.extend({
  create: makeEmitting('created'),
  update: makeEmitting('updated'),
  patch: makeEmitting('patched'),
  remove: makeEmitting('removed')
}, EventEmitter.prototype);

},{"../utils":12,"events":13}],6:[function(require,module,exports){
module.exports = {
  jquery: require('./jquery'),
  request: require('./request'),
  superagent: require('./superagent')
};

},{"./jquery":7,"./request":8,"./superagent":9}],7:[function(require,module,exports){
var utils = require('../utils');
var Base = require('./base');
var normalizer = require('../normalizer');
var Service = Base.extend({
  request: function (options, callback) {
    var opts = utils.extend({
      dataType: options.type || 'json'
    }, options);

    if(options.body) {
      opts.data = JSON.stringify(options.body);
      opts.contentType = 'application/json';
    }

    delete opts.type;
    delete opts.body;

    this.connection.ajax(opts).then(function (data) {
      callback(null, data);
    }, function (xhr) {
      callback(new Error(xhr.responseText));
    });
  }
}).mixin(normalizer);

module.exports = function(jQuery) {
  if(!jQuery && typeof window !== 'undefined') {
    jQuery = window.jQuery;
  }

  if(typeof jQuery !== 'function') {
    throw new Error('jQuery instance needs to be provided');
  }

  return function() {
    this.Service = Service;
    this.connection = jQuery;
  };
};

module.exports.Service = Service;

},{"../normalizer":3,"../utils":12,"./base":4}],8:[function(require,module,exports){
var utils = require('../utils');
var Base = require('./base');
var normalizer = require('../normalizer');
var Service = Base.extend({
  request: function (options, callback) {
    this.connection(utils.extend({
      json: true
    }, options), function(error, res, data) {
      if(!error && res.statusCode >= 400) {
        return callback(new Error(data));
      }

      callback(error, data);
    });
  }
}).mixin(normalizer);

module.exports = function(request) {
  if(!request) {
    throw new Error('request instance needs to be provided');
  }

  return function() {
    this.Service = Service;
    this.connection = request;
  };
};

module.exports.Service = Service;
},{"../normalizer":3,"../utils":12,"./base":4}],9:[function(require,module,exports){
var Base = require('./base');
var normalizer = require('../normalizer');
var Service = Base.extend({
  request: function (options, callback) {
    var superagent = this.connection(options.method, options.url)
      .type(options.type || 'json');

    if(options.body) {
      superagent.send(options.body);
    }

    superagent.end(function(error, res) {
      callback(error, res && res.body);
    });
  }
}).mixin(normalizer);

module.exports = function(superagent) {
  if(!superagent) {
    throw new Error('Superagent needs to be provided');
  }

  return function() {
    this.Service = Service;
    this.connection = superagent;
  };
};

module.exports.Service = Service;

},{"../normalizer":3,"./base":4}],10:[function(require,module,exports){
var utils = require('../utils');
var Proto = require('uberproto');
var normalizer = require('../normalizer');
var toSocket = function(method) {
  return function(name, callback) {
    this.connection[method](this.path + ' ' + name, callback);
  };
};
var Service = Proto.extend({
  events: utils.events,

  _create: Proto.create,

  init: function(name, options) {
    this.path = utils.stripSlashes(name);
    this.connection = options.connection;
  },

  emit: function() {
    var method = this.connection.io ? 'emit' : 'send';

    this.connection[method].apply(this, arguments);
  }
});

['on', 'once', 'off'].forEach(function(name) {
  Service[name] = toSocket(name);
});

utils.methods.forEach(function(name) {
  Service[name] = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var method = this.connection.io ? 'emit' : 'send';

    args.unshift(this.path + '::' + name);
    this.connection[method].apply(this.connection, args);
  };
});

Service.mixin(normalizer);

module.exports = function(socket) {
  if(!socket) {
    throw new Error('No socket provided');
  }

  return function() {
    this.Service = Service;
    this.connection = socket;
  };
};

module.exports.Service = Service;

},{"../normalizer":3,"../utils":12,"uberproto":17}],11:[function(require,module,exports){
var init = require('./base');

function socketio(socket) {
  if(typeof window !== 'undefined' && window.io && typeof socket === 'string'){
    socket = window.io(socket);
  }

  return init(socket);
}

socketio.Service = init.Service;

module.exports = {
  socketio: socketio,
  primus: init
};

},{"./base":10}],12:[function(require,module,exports){
exports.stripSlashes = function (name) {
  return name.replace(/^\/|\/$/g, '');
};

exports.extend = function() {
  var first = arguments[0];
  var assign = function(current) {
    Object.keys(current).forEach(function(key) {
      first[key] = current[key];
    });
  };
  var current;

  for(var i = 1; i < arguments.length; i++) {
    current = arguments[i];
    assign(current);
  }
  return first;
};

exports.methods = [ 'find', 'get', 'create', 'update', 'patch', 'remove' ];

exports.events = [ 'created', 'updated', 'patched', 'removed' ];
},{}],13:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],14:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty(obj, k)) {
      obj[k] = v;
    } else if (isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

},{}],15:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

module.exports = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return map(objectKeys(obj), function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (isArray(obj[k])) {
        return map(obj[k], function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var isArray = Array.isArray || function (xs) {
  return Object.prototype.toString.call(xs) === '[object Array]';
};

function map (xs, f) {
  if (xs.map) return xs.map(f);
  var res = [];
  for (var i = 0; i < xs.length; i++) {
    res.push(f(xs[i], i));
  }
  return res;
}

var objectKeys = Object.keys || function (obj) {
  var res = [];
  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
  }
  return res;
};

},{}],16:[function(require,module,exports){
'use strict';

exports.decode = exports.parse = require('./decode');
exports.encode = exports.stringify = require('./encode');

},{"./decode":14,"./encode":15}],17:[function(require,module,exports){
/* global define, exports, module */
/**
 * A base object for ECMAScript 5 style prototypal inheritance.
 *
 * @see https://github.com/rauschma/proto-js/
 * @see http://ejohn.org/blog/simple-javascript-inheritance/
 * @see http://uxebu.com/blog/2011/02/23/object-based-inheritance-for-ecmascript-5/
 */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory();
	} else {
		root.Proto = factory();
	}
}(this, function () {
	return {
		/**
		 * Create a new object using Object.create. The arguments will be
		 * passed to the new instances init method or to a method name set in
		 * __init.
		 */
		create: function () {
			var instance = Object.create(this),
				init = typeof instance.__init === 'string' ? instance.__init : 'init';
			if (typeof instance[init] === "function") {
				instance[init].apply(instance, arguments);
			}
			return instance;
		},
		/**
		 * Mixin a given set of properties
		 * @param prop The properties to mix in
		 * @param obj [optional] The object to add the mixin
		 */
		mixin: function (prop, obj) {
			var self = obj || this,
				fnTest = /\b_super\b/,
				_super = Object.getPrototypeOf(self) || self.prototype,
				_old;

			// Copy the properties over
			for (var name in prop) {
				// store the old function which would be overwritten
				_old = self[name];
				// Check if we're overwriting an existing function
				self[name] = (typeof prop[name] === "function" && typeof _super[name] === "function" && fnTest.test(prop[name])) ||
					(typeof _old === "function" && typeof prop[name] === "function") ? //
					(function (old, name, fn) {
						return function () {
							var tmp = this._super;

							// Add a new ._super() method that is the same method
							// but either pointing to the prototype method
							// or to the overwritten method
							this._super = (typeof old === 'function') ? old : _super[name];

							// The method only need to be bound temporarily, so we
							// remove it when we're done executing
							var ret = fn.apply(this, arguments);
							this._super = tmp;

							return ret;
						};
					})(_old, name, prop[name]) : prop[name];
			}

			return self;
		},
		/**
		 * Extend the current or a given object with the given property
		 * and return the extended object.
		 * @param prop The properties to extend with
		 * @param obj [optional] The object to extend from
		 * @returns The extended object
		 */
		extend: function (prop, obj) {
			return this.mixin(prop, Object.create(obj || this));
		},
		/**
		 * Return a callback function with this set to the current or a given context object.
		 * @param name Name of the method to proxy
		 * @param args... [optional] Arguments to use for partial application
		 */
		proxy: function (name) {
			var fn = this[name],
				args = Array.prototype.slice.call(arguments, 1);

			args.unshift(this);
			return fn.bind.apply(fn, args);
		}
	};
}));

},{}]},{},[2])(2)
});