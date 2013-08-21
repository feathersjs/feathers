var Proto = require('uberproto');
var _ = require('underscore');
var rubberduck = require('rubberduck');
var EventEmitter = require('events').EventEmitter;
var eventMappings = {
	create: 'created',
	update: 'updated',
	destroy: 'removed'
};

/**
 * An event mixin that emits events after a service method calls its callback.
 *
 * @type {{setup: Function}}
 */
var EventMixin = {
	setup: function() {
		var emitter = this._rubberDuck = rubberduck.emitter(this);
		var self = this;

		self._serviceEvents = [];
		// Pass the Rubberduck error event through
		emitter.on('error', function(errors) {
			self.emit('error', errors[0]);
		});

		_.each(eventMappings, function(event, method) {
			if(self[method]) {
				// The Rubberduck event name (e.g. afterCreate, afterUpdate or afterDestroy)
				var eventName = 'after' + method.charAt(0).toUpperCase() + method.substring(1);
				self._serviceEvents.push(event);
				// Punch the given method
				emitter.punch(method, -1);
				// Pass the event and error event through
				emitter.on(eventName, function(results) {
					if(!results[0]) { // callback without error
						self.emit(event, results[1]);
					} else {
						self.emit('error', results[0]);
					}
				});
			}
		});
		return this._super ? this._super.apply(this, arguments) : this;
	}
};

// Add EventEmitter prototype methods (if they don't already exist)
_.each(EventEmitter.prototype, function(fn, name) {
	EventMixin[name] = function() {
		if(this._super) {
			return this._super.apply(this, arguments);
		}
		return EventEmitter.prototype[name].apply(this, arguments);
	}
});

module.exports = function(service) {
	service.mixin && service.mixin(EventMixin);
};

module.exports.Mixin = EventMixin;
