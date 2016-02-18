'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _feathersCommons = require('feathers-commons');

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

var _mixins = require('./mixins');

var _mixins2 = _interopRequireDefault(_mixins);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var debug = (0, _debug2.default)('feathers:application');
var methods = ['find', 'get', 'create', 'update', 'patch', 'remove'];
var Proto = _uberproto2.default.extend({
  create: null
});

exports.default = {
  init: function init() {
    Object.assign(this, {
      methods: methods,
      mixins: (0, _mixins2.default)(),
      services: {},
      providers: [],
      _setup: false
    });
  },
  service: function service(location, _service) {
    var _this = this;

    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    location = (0, _feathersCommons.stripSlashes)(location);

    if (!_service) {
      var current = this.services[location];

      if (typeof current === 'undefined' && typeof this.defaultService === 'function') {
        return this.service(location, this.defaultService(location), options);
      }

      return current;
    }

    var protoService = Proto.extend(_service);

    debug('Registering new service at `' + location + '`');

    // Add all the mixins
    this.mixins.forEach(function (fn) {
      return fn.call(_this, protoService);
    });

    if (typeof protoService._setup === 'function') {
      protoService._setup(this, location);
    }

    // Run the provider functions to register the service
    this.providers.forEach(function (provider) {
      return provider.call(_this, location, protoService, options);
    });

    // If we ran setup already, set this service up explicitly
    if (this._isSetup && typeof protoService.setup === 'function') {
      debug('Setting up service for `' + location + '`');
      protoService.setup(this, location);
    }

    return this.services[location] = protoService;
  },
  use: function use(location) {
    var service = undefined,
        middleware = Array.from(arguments).slice(1).reduce(function (middleware, arg) {
      if (typeof arg === 'function') {
        middleware[service ? 'after' : 'before'].push(arg);
      } else if (!service) {
        service = arg;
      } else {
        throw new Error('invalid arg passed to app.use');
      }
      return middleware;
    }, {
      before: [],
      after: []
    });

    var hasMethod = function hasMethod(methods) {
      return methods.some(function (name) {
        return service && typeof service[name] === 'function';
      });
    };

    // Check for service (any object with at least one service method)
    if (hasMethod(['handle', 'set']) || !hasMethod(this.methods)) {
      return this._super.apply(this, arguments);
    }

    // Any arguments left over are other middleware that we want to pass to the providers
    this.service(location, service, { middleware: middleware });

    return this;
  },
  setup: function setup() {
    var _this2 = this;

    // Setup each service (pass the app so that they can look up other services etc.)
    Object.keys(this.services).forEach(function (path) {
      var service = _this2.services[path];

      debug('Setting up service for `' + path + '`');
      if (typeof service.setup === 'function') {
        service.setup(_this2, path);
      }
    });

    this._isSetup = true;

    return this;
  },

  // Express 3.x configure is gone in 4.x but we'll keep a more basic version
  // That just takes a function in order to keep Feathers plugin configuration easier.
  // Environment specific configurations should be done as suggested in the 4.x migration guide:
  // https://github.com/visionmedia/express/wiki/Migrating-from-3.x-to-4.x
  configure: function configure(fn) {
    fn.call(this);

    return this;
  },
  listen: function listen() {
    var server = this._super.apply(this, arguments);

    this.setup(server);
    debug('Feathers application listening');

    return server;
  }
};
module.exports = exports['default'];