'use strict';

var _ = require('lodash');
var rubberduck = require('rubberduck');
var EventEmitter = require('events').EventEmitter;
var eventMappings = {
  create: 'created',
  update: 'updated',
  remove: 'removed',
  patch: 'patched',
  addToCollection: 'updated',
  removeFromCollection: 'updated'
};
var debug = require('debug')('feathers:event');

/**
 * An event mixin that emits events after a service method calls its callback.
 *
 * @type {{setup: Function}}
 */
var EventMixin = {
  setup: function () {
    var emitter = this._rubberDuck = rubberduck.emitter(this);
    var self = this;

    self._serviceEvents = _.isArray(self.events) ? self.events.slice() : [];

    // Pass the Rubberduck error event through
    // TODO deal with error events properly
    emitter.on('error', function (errors) {
      self.emit('serviceError', errors[0]);
    });

    _.each(eventMappings, function (event, method) {
      var alreadyEmits = self._serviceEvents.indexOf(event) !== -1;

      // dont'check already emits because new collection methods
      // (addToCollection and removeFromCollection) also emits an 'update' event
      if (typeof self[method] === 'function') {
        // The Rubberduck event name (e.g. afterCreate, afterUpdate or afterDestroy)
        var eventName = 'after' + method.charAt(0).toUpperCase() + method.substring(1);

        debug('event propagate:' + eventName);

        self._serviceEvents.push(event);
        // Punch the given method
        emitter.punch(method, -1);
        // Pass the event and error event through
        emitter.on(eventName, function (results) {
          if (!results[0]) { // callback without error

            debug('Emit:' + eventName);

            self.emit(event, results[1]);
          } else {
            self.emit('serviceError', results[0]);
          }
        });
      }
    });

    return this._super ? this._super.apply(this, arguments) : this;
  }
};

module.exports = function (service) {
  var isEmitter = typeof service.on === 'function' &&
    typeof service.emit === 'function';

  if (typeof service.mixin === 'function') {
    if(!isEmitter) {
      service.mixin(EventEmitter.prototype);
    }

    service.mixin(EventMixin);
  }
};

module.exports.Mixin = EventMixin;
