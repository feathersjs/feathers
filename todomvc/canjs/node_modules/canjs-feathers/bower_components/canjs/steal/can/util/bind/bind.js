/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/bind/bind*/
steal('can/util', function (can) {
	/**
	 * @typedef {{bind:function():*,unbind:function():*}} can.util.bind
	 *
	 * Provides mixin-able bind and unbind methods. `bind()` calls `this._bindsetup`
	 * when the first bind happens and.  `unbind()` calls `this._bindteardown` when there
	 * are no more event handlers.
	 *
	 */
	// ## Bind helpers
	can.bindAndSetup = function () {
		// Add the event to this object
		can.addEvent.apply(this, arguments);
		// If not initializing, and the first binding
		// call bindsetup if the function exists.
		if (!this._init) {
			if (!this._bindings) {
				this._bindings = 1;
				// setup live-binding
				if (this._bindsetup) {
					this._bindsetup();
				}
			} else {
				this._bindings++;
			}
		}
		return this;
	};
	can.unbindAndTeardown = function (event, handler) {

		var handlers = this.__bindEvents[event] || [];
		var handlerCount = handlers.length;

		// Remove the event handler
		can.removeEvent.apply(this, arguments);
		if (this._bindings === null) {
			this._bindings = 0;
		} else {
			// Subtract the difference in the number of handlers bound to this
			// event before/after removeEvent
			this._bindings = this._bindings - (handlerCount - handlers.length);
		}
		// If there are no longer any bindings and
		// there is a bindteardown method, call it.
		if (!this._bindings && this._bindteardown) {
			this._bindteardown();
		}
		return this;
	};
	return can;
});

