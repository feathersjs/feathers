/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#event/event*/
// # can/event
//
// Implements a basic event system that can be used with any type of object.
// In addition to adding basic event functionality, it also provides the `can.event` object 
// that can be mixed into objects and prototypes.
//
// Most of the time when this is used, it will be used with the mixin:
//
// ```
// var SomeClass = can.Construct("SomeClass");
// can.extend(SomeClass.prototype, can.event);
// ```

steal('can/util/can.js', function (can) {
	// ## can.event.addEvent
	//
	// Adds a basic event listener to an object.
	// This consists of storing a cache of event listeners on each object,
	// that are iterated through later when events are dispatched.
	/**
	 * @function can.event.addEvent
	 * @parent can.event.static
	 * @signature `obj.addEvent( event, handler )`
	 *
	 * Add a basic event listener to an object.
	 *
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 *
	 * @signature `can.event.addEvent.call( obj, event, handler )`
	 *
	 * This syntax can be used for objects that don't include the `can.event` mixin.
	 */
	can.addEvent = function (event, handler) {
		// Initialize event cache.
		var allEvents = this.__bindEvents || (this.__bindEvents = {}),
			eventList = allEvents[event] || (allEvents[event] = []);

		// Add the event
		eventList.push({
			handler: handler,
			name: event
		});
		return this;
	};

	// ## can.event.listenTo
	//
	// Listens to an event without know how bind is implemented.
	// The primary use for this is to listen to another's objects event while 
	// tracking events on the local object (similar to namespacing).
	//
	// The API was heavily influenced by BackboneJS: http://backbonejs.org/
	/**
	 * @function can.event.listenTo
	 * @parent can.event.static
	 * @signature `obj.listenTo( other, event, handler )`
	 *
	 * Listens for an event on another object.
	 * This is similar to concepts like event namespacing, except that the namespace 
	 * is the scope of the calling object.
	 *
	 * @param {Object} other The object to listen for events on.
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 *
	 * @signature `can.event.listenTo.call( obj, other, event, handler )`
	 *
	 * This syntax can be used for objects that don't include the `can.event` mixin.
	 */
	can.listenTo = function (other, event, handler) {
		// Initialize event cache
		var idedEvents = this.__listenToEvents;
		if (!idedEvents) {
			idedEvents = this.__listenToEvents = {};
		}

		// Identify the other object
		var otherId = can.cid(other);
		var othersEvents = idedEvents[otherId];
		
		// Create a local event cache
		if (!othersEvents) {
			othersEvents = idedEvents[otherId] = {
				obj: other,
				events: {}
			};
		}
		var eventsEvents = othersEvents.events[event];
		if (!eventsEvents) {
			eventsEvents = othersEvents.events[event] = [];
		}

		// Add the event, both locally and to the other object
		eventsEvents.push(handler);
		can.bind.call(other, event, handler);
	};

	// ## can.event.stopListening
	// 
	// Stops listening for events on other objects
	/**
	 * @function can.event.stopListening
	 * @parent can.event.static
	 * @signature `obj.stopListening( other, event, handler )`
	 *
	 * Stops listening for an event on another object.
	 *
	 * @param {Object} other The object to listen for events on.
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 *
	 * @signature `can.event.stopListening.call( obj, other, event, handler )`
	 *
	 * This syntax can be used for objects that don't include the `can.event` mixin.
	 */
	can.stopListening = function (other, event, handler) {
		var idedEvents = this.__listenToEvents,
			iterIdedEvents = idedEvents,
			i = 0;
		if (!idedEvents) {
			return this;
		}
		if (other) {
			var othercid = can.cid(other);
			(iterIdedEvents = {})[othercid] = idedEvents[othercid];
			// you might be trying to listen to something that is not there
			if (!idedEvents[othercid]) {
				return this;
			}
		}

		// Clean up events on the other object
		for (var cid in iterIdedEvents) {
			var othersEvents = iterIdedEvents[cid],
				eventsEvents;
			other = idedEvents[cid].obj;

			// Find the cache of events
			if (!event) {
				eventsEvents = othersEvents.events;
			} else {
				(eventsEvents = {})[event] = othersEvents.events[event];
			}

			// Unbind event handlers, both locally and on the other object
			for (var eventName in eventsEvents) {
				var handlers = eventsEvents[eventName] || [];
				i = 0;
				while (i < handlers.length) {
					if (handler && handler === handlers[i] || !handler) {
						can.unbind.call(other, eventName, handlers[i]);
						handlers.splice(i, 1);
					} else {
						i++;
					}
				}
				// no more handlers?
				if (!handlers.length) {
					delete othersEvents.events[eventName];
				}
			}
			if (can.isEmptyObject(othersEvents.events)) {
				delete idedEvents[cid];
			}
		}
		return this;
	};

	// ## can.event.removeEvent
	//
	// Removes a basic event listener from an object.
	// This removes event handlers from the cache of listened events.
	/**
	 * @function can.event.removeEvent
	 * @parent can.event.static
	 * @signature `obj.removeEvent( event, handler )`
	 *
	 * Removes a basic event listener from an object.
	 *
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @param {Function} [__validate] An extra function that can validate an event handler 
	 *                                as a match. This is an internal parameter and only used 
	 *                                for `can/event` plugins.
	 * @return {Object} this
	 *
	 * @signature `can.event.removeEvent.call( obj, event, handler )`
	 *
	 * This syntax can be used for objects that don't include the `can.event` mixin.
	 */
	can.removeEvent = function (event, fn, __validate) {
		if (!this.__bindEvents) {
			return this;
		}
		var events = this.__bindEvents[event] || [],
			i = 0,
			ev, isFunction = typeof fn === 'function';
		while (i < events.length) {
			ev = events[i];
			// Determine whether this event handler is "equivalent" to the one requested
			// Generally this requires the same event/function, but a validation function 
			// can be included for extra conditions. This is used in some plugins like `can/event/namespace`.
			if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
				events.splice(i, 1);
			} else {
				i++;
			}
		}
		return this;
	};

	// ## can.event.dispatch
	//
	// Dispatches/triggers a basic event on an object.
	/**
	 * @function can.event.dispatch
	 * @parent can.event.static
	 * @signature `obj.dispatch( event, args )`
	 *
	 * Dispatches/triggers a basic event on an object.
	 *
	 * @param {String|Object} event The event to dispatch
	 * @param {Array} [args] Additional arguments to pass to event handlers
	 * @return {Object} event The resulting event object
	 *
	 * @signature `can.event.dispatch.call( obj, event, args )`
	 *
	 * This syntax can be used for objects that don't include the `can.event` mixin.
	 */
	can.dispatch = function (event, args) {
		var events = this.__bindEvents;
		if (!events) {
			return;
		}

		// Initialize the event object
		if (typeof event === 'string') {
			event = {
				type: event
			};
		}

		// Grab event listeners
		var eventName = event.type,
			handlers = (events[eventName] || []).slice(0),
			passed = [event];
		
		// Execute handlers listening for this event.
		if(args) {
			passed.push.apply(passed, args);
		}

		for (var i = 0, len = handlers.length; i < len; i++) {
			handlers[i].handler.apply(this, passed);
		}

		return event;
	};
	
	// ## can.event.one
	//
	// Adds a basic event listener that listens to an event once and only once.
	/**
	 * @function can.event.one
	 * @parent can.event.static
	 * @signature `obj.one( event, handler )`
	 *
	 * Adds a basic event listener that listens to an event once and only once.
	 *
	 * @param {String} event The name of the event to listen for.
	 * @param {Function} handler The handler that will be executed to handle the event.
	 * @return {Object} this
	 */
	can.one = function(event, handler) {
		// Unbind the listener after it has been executed
		var one = function() {
			can.unbind.call(this, event, one);
			return handler.apply(this, arguments);
		};

		// Bind the altered listener
		can.bind.call(this, event, one);
		return this;
	};

	// ## can.event
	// Create and export the `can.event` mixin
	can.event = {
		// Event method aliases
		/**
		 * @function can.event.on
		 * @parent can.event.static
		 * @signature `obj.on( event, handler )`
		 *
		 * Add a basic event listener to an object.
		 *
		 * This is an alias of [can.event.addEvent addEvent].
		 *
		 * @signature `can.event.on.call( obj, event, handler )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		on: function() {
			if (arguments.length === 0 && can.Control && this instanceof can.Control) {
				return can.Control.prototype.on.call(this);
			}
			else {
				return can.addEvent.apply(this, arguments);
			}
		},

		/**
		 * @function can.event.off
		 * @parent can.event.static
		 * @signature `obj.off( event, handler )`
		 *
		 * Removes a basic event listener from an object.
		 *
		 * This is an alias of [can.event.removeEvent removeEvent].
		 *
		 * @signature `can.event.off.call( obj, event, handler )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		off: function() {
			if (arguments.length === 0 && can.Control && this instanceof can.Control) {
				return can.Control.prototype.off.call(this);
			}
			else {
				return can.removeEvent.apply(this, arguments);
			}
		},

		/**
		 * @function can.event.bind
		 * @parent can.event.static
		 * @signature `obj.bind( event, handler )`
		 *
		 * Add a basic event listener to an object.
		 *
		 * This is an alias of [can.event.addEvent addEvent].
		 *
		 * @signature `can.event.bind.call( obj, event, handler )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		bind: can.addEvent,
		/**
		 * @function can.event.unbind
		 * @parent can.event.static
		 * @signature `obj.unbind( event, handler )`
		 *
		 * Removes a basic event listener from an object.
		 *
		 * This is an alias of [can.event.removeEvent removeEvent].
		 *
		 * @signature `can.event.unbind.call( obj, event, handler )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		unbind: can.removeEvent,
		/**
		 * @function can.event.delegate
		 * @parent can.event.static
		 * @signature `obj.delegate( selector, event, handler )`
		 *
		 * Provides a compatibility layer for adding delegate event listeners.
		 * This doesn't actually implement delegates, but rather allows 
		 * logic that assumes a delegate to still function.
		 *
		 * Therefore, this is essentially an alias of [can.event.addEvent addEvent] with the selector ignored.
		 *
		 * @param {String} selector The **ignored** selector to use for the delegate.
		 * @param {String} event The name of the event to listen for.
		 * @param {Function} handler The handler that will be executed to handle the event.
		 * @return {Object} this
		 *
		 * @signature `can.event.delegate.call( obj, selector, event, handler )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		delegate: function(selector, event, handler) {
			return can.addEvent.call(this, event, handler);
		},
		/**
		 * @function can.event.undelegate
		 * @parent can.event.static
		 * @signature `obj.undelegate( selector, event, handler )`
		 *
		 * Provides a compatibility layer for removing delegate event listeners.
		 * This doesn't actually implement delegates, but rather allows 
		 * logic that assumes a delegate to still function.
		 *
		 * Therefore, this is essentially an alias of [can.event.removeEvent removeEvent] with the selector ignored.
		 *
		 * @param {String} selector The **ignored** selector to use for the delegate.
		 * @param {String} event The name of the event to listen for.
		 * @param {Function} handler The handler that will be executed to handle the event.
		 * @return {Object} this
		 *
		 * @signature `can.event.undelegate.call( obj, selector, event, handler )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		undelegate: function(selector, event, handler) {
			return can.removeEvent.call(this, event, handler);
		},
		/**
		 * @function can.event.trigger
		 * @parent can.event.static
		 * @signature `obj.trigger( event, args )`
		 *
		 * Dispatches/triggers a basic event on an object.
		 * This is an alias of [can.event.dispatch dispatch].
		 *
		 * @signature `can.event.trigger.call( obj, event, args )`
		 *
		 * This syntax can be used for objects that don't include the `can.event` mixin.
		 */
		trigger: can.dispatch,

		// Normal can/event methods
		one: can.one,
		addEvent: can.addEvent,
		removeEvent: can.removeEvent,
		listenTo: can.listenTo,
		stopListening: can.stopListening,
		dispatch: can.dispatch
	};

	return can.event;
});

