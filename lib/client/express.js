'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function () {
  var app = {
    settings: {},

    get: function get(name) {
      return this.settings[name];
    },
    set: function set(name, value) {
      this.settings[name] = value;
      return this;
    },
    disable: function disable(name) {
      this.settings[name] = false;
      return this;
    },
    disabled: function disabled(name) {
      return !this.settings[name];
    },
    enable: function enable(name) {
      this.settings[name] = true;
      return this;
    },
    enabled: function enabled(name) {
      return !!this.settings[name];
    },
    use: function use() {
      throw new Error('Middleware functions can not be used in the Feathers client');
    },
    listen: function listen() {
      return {};
    }
  };

  _uberproto2.default.mixin(_events.EventEmitter.prototype, app);

  return app;
};

var _events = require('events');

var _uberproto = require('uberproto');

var _uberproto2 = _interopRequireDefault(_uberproto);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = exports['default'];