'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (service) {
  var isEmitter = typeof service.on === 'function' && typeof service.emit === 'function';
  var emitter = service._rubberDuck = _rubberduck2.default.emitter(service);

  if (typeof service.mixin === 'function' && !isEmitter) {
    service.mixin(_events.EventEmitter.prototype);
  }

  service._serviceEvents = Array.isArray(service.events) ? service.events.slice() : [];

  // Pass the Rubberduck error event through
  // TODO deal with error events properly
  emitter.on('error', function (errors) {
    service.emit('serviceError', errors[0]);
  });

  Object.keys(eventMappings).forEach(function (method) {
    var event = eventMappings[method];
    var alreadyEmits = service._serviceEvents.indexOf(event) !== -1;

    if (typeof service[method] === 'function' && !alreadyEmits) {
      // The Rubberduck event name (e.g. afterCreate, afterUpdate or afterDestroy)
      var eventName = 'after' + upperCase(method);
      service._serviceEvents.push(event);
      // Punch the given method
      emitter.punch(method, -1);
      // Pass the event and error event through
      emitter.on(eventName, function (results, args) {
        if (!results[0]) {
          (function () {
            // callback without error
            var hook = hookObject(method, 'after', args);
            var data = Array.isArray(results[1]) ? results[1] : [results[1]];

            data.forEach(function (current) {
              return service.emit(event, current, hook);
            });
          })();
        } else {
          service.emit('serviceError', results[0]);
        }
      });
    }
  });
};

var _rubberduck = require('rubberduck');

var _rubberduck2 = _interopRequireDefault(_rubberduck);

var _events = require('events');

var _feathersCommons = require('feathers-commons');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hookObject = _feathersCommons.hooks.hookObject;
var eventMappings = {
  create: 'created',
  update: 'updated',
  remove: 'removed',
  patch: 'patched'
};

function upperCase(name) {
  return name.charAt(0).toUpperCase() + name.substring(1);
}

module.exports = exports['default'];