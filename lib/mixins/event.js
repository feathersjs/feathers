'use strict';

var _ = require('lodash');
var rubberduck = require('rubberduck');
var EventEmitter = require('events').EventEmitter;
var hookObject = require('feathers-commons').hooks.hookObject;
var eventMappings = {
  create: 'created',
  update: 'updated',
  remove: 'removed',
  patch: 'patched'
};

module.exports = function (service) {
  var isEmitter = typeof service.on === 'function' &&
    typeof service.emit === 'function';
  var emitter = service._rubberDuck = rubberduck.emitter(service);

  if (typeof service.mixin === 'function') {
    if(!isEmitter) {
      service.mixin(EventEmitter.prototype);
    }
  }

  service._serviceEvents = _.isArray(service.events) ? service.events.slice() : [];

  // Pass the Rubberduck error event through
  // TODO deal with error events properly
  emitter.on('error', function (errors) {
    service.emit('serviceError', errors[0]);
  });

  _.each(eventMappings, function (event, method) {
    var alreadyEmits = service._serviceEvents.indexOf(event) !== -1;

    if (typeof service[method] === 'function' && !alreadyEmits) {
      // The Rubberduck event name (e.g. afterCreate, afterUpdate or afterDestroy)
      var eventName = 'after' + method.charAt(0).toUpperCase() + method.substring(1);
      service._serviceEvents.push(event);
      // Punch the given method
      emitter.punch(method, -1);
      // Pass the event and error event through
      emitter.on(eventName, function (results, args) {
        if (!results[0]) { // callback without error
          var hook = hookObject(method, 'after', args);
          var data = Array.isArray(results[1]) ? results[1] : [ results[1] ];

          data.forEach(function(current) {
            service.emit(event, current, hook);
          });
        } else {
          service.emit('serviceError', results[0]);
        }
      });
    }
  });
};
