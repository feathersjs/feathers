/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#control/control*/
// # can/control/control.js
//
// Create organized, memory-leak free, rapidly performing, stateful 
// controls with declarative eventing binding. Used when creating UI 
// controls with behaviors, bound to elements on the page.
// ## helpers

steal('can/util', 'can/construct', function (can) {
	// 
	// ### bind
	// this helper binds to one element and returns a function that unbinds from that element.
	var bind = function (el, ev, callback) {

		can.bind.call(el, ev, callback);

		return function () {
			can.unbind.call(el, ev, callback);
		};
	},
		isFunction = can.isFunction,
		extend = can.extend,
		each = can.each,
		slice = [].slice,
		paramReplacer = /\{([^\}]+)\}/g,
		special = can.getObject("$.event.special", [can]) || {},

		// ### delegate
		// 
		// this helper binds to elements based on a selector and returns a 
		// function that unbinds.
		delegate = function (el, selector, ev, callback) {
			can.delegate.call(el, selector, ev, callback);
			return function () {
				can.undelegate.call(el, selector, ev, callback);
			};
		},

		// ### binder
		// 
		// Calls bind or unbind depending if there is a selector.
		binder = function (el, ev, callback, selector) {
			return selector ?
				delegate(el, can.trim(selector), ev, callback) :
				bind(el, ev, callback);
		},

		basicProcessor;

	var Control = can.Control = can.Construct(
		/**
		 * @add can.Control
		 */
		// ## *static functions*
		/** 
		 * @static
		 */
		{
			// ## can.Control.setup
			// 
			// This function pre-processes which methods are event listeners and which are methods of
			// the control. It has a mechanism to allow controllers to inherit default values from super
			// classes, like `can.Construct`, and will cache functions that are action functions (see `_isAction`)
			// or functions with an underscored name.
			setup: function () {
				can.Construct.setup.apply(this, arguments);

				if (can.Control) {
					var control = this,
						funcName;

					control.actions = {};
					for (funcName in control.prototype) {
						if (control._isAction(funcName)) {
							control.actions[funcName] = control._action(funcName);
						}
					}
				}
			},
			// ## can.Control._shifter
			// 
			// Moves `this` to the first argument, wraps it with `jQuery` if it's 
			// an element.
			_shifter: function (context, name) {

				var method = typeof name === "string" ? context[name] : name;

				if (!isFunction(method)) {
					method = context[method];
				}

				return function () {
					context.called = name;
					return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
				};
			},

			// ## can.Control._isAction
			// 
			// Return `true` if `methodName` refers to an action. An action is a `methodName` value that
			// is not the constructor, and is either a function or string that refers to a function, or is
			// defined in `special`, `processors`. Detects whether `methodName` is also a valid method name.
			_isAction: function (methodName) {
				var val = this.prototype[methodName],
					type = typeof val;

				return (methodName !== 'constructor') &&
				(type === "function" || (type === "string" && isFunction(this.prototype[val]))) &&
				!! (special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
			},
			// ## can.Control._action
			// 
			// Takes a method name and the options passed to a control and tries to return the data 
			// necessary to pass to a processor (something that binds things).
			// 
			// For performance reasons, `_action` is called twice: 
			// * It's called when the Control class is created. for templated method names (e.g., `{window} foo`), it returns null. For non-templated method names it returns the event binding data. That data is added to `this.actions`.
			// * It is called wehn a control instance is created, but only for templated actions.
			_action: function (methodName, options) {

				// If we don't have options (a `control` instance), we'll run this later. If we have
				// options, run `can.sub` to replace the action template `{}` with values from the `options`
				// or `window`. If a `{}` template resolves to an object, `convertedName` will be an array.
				// In that case, the event name we want will be the last item in that array.
				paramReplacer.lastIndex = 0;
				if (options || !paramReplacer.test(methodName)) {
					var convertedName = options ? can.sub(methodName, this._lookup(options)) : methodName;
					if (!convertedName) {
						//!steal-remove-start
						can.dev.log('can/control/control.js: No property found for handling ' + methodName);
						//!steal-remove-end
						return null;
					}
					var arr = can.isArray(convertedName),
						name = arr ? convertedName[1] : convertedName,
						parts = name.split(/\s+/g),
						event = parts.pop();

					return {
						processor: processors[event] || basicProcessor,
						parts: [name, parts.join(" "), event],
						delegate: arr ? convertedName[0] : undefined
					};
				}
			},
			_lookup: function (options) {
				return [options, window];
			},
			// ## can.Control.processors
			// 
			// An object of `{eventName : function}` pairs that Control uses to 
			// hook up events automatically.
			processors: {},
			// ## can.Control.defaults
			// A object of name-value pairs that act as default values for a control instance
			defaults: {}
		}, {
			// ## *prototype functions*
			/**
			 * @prototype
			 */
			// ## setup
			// 
			// Setup is where most of the Control's magic happens. It performs several pre-initialization steps:
			// - Sets `this.element`
			// - Adds the Control's name to the element's className
			// - Saves the Control in `$.data`
			// - Merges Options
			// - Binds event handlers using `delegate`
			// The final step is to return pass the element and prepareed options, to be used in `init`.
			setup: function (element, options) {

				var cls = this.constructor,
					pluginname = cls.pluginName || cls._fullName,
					arr;

				// Retrieve the raw element, then set the plugin name as a class there.
				this.element = can.$(element);

				if (pluginname && pluginname !== 'can_control') {
					this.element.addClass(pluginname);
				}

				// Set up the 'controls' data on the element. If it does not exist, initialize
				// it to an empty array.
				arr = can.data(this.element, 'controls');
				if (!arr) {
					arr = [];
					can.data(this.element, 'controls', arr);
				}
				arr.push(this);

				// The `this.options` property is an Object that contains configuration data
				// passed to a control when it is created (`new can.Control(element, options)`)
				// 
				// The `options` argument passed when creating the control is merged with `can.Control.defaults` 
				// in [can.Control.prototype.setup setup].
				// 
				// If no `options` value is used during creation, the value in `defaults` is used instead
				this.options = extend({}, cls.defaults, options);

				this.on();

				return [this.element, this.options];
			},
			// ## on
			// 
			// This binds an event handler for an event to a selector under the scope of `this.element`
			// If no options are specified, all events are rebound to their respective elements. The actions,
			// which were cached in `setup`, are used and all elements are bound using `delegate` from `this.element`.
			on: function (el, selector, eventName, func) {
				if (!el) {
					this.off();

					var cls = this.constructor,
						bindings = this._bindings,
						actions = cls.actions,
						element = this.element,
						destroyCB = can.Control._shifter(this, "destroy"),
						funcName, ready;

					for (funcName in actions) {
						// Only push if we have the action and no option is `undefined`
						if ( actions.hasOwnProperty(funcName) ) {
							ready = actions[funcName] || cls._action(funcName, this.options, this);
							if( ready ) {
								bindings.control[funcName]  = ready.processor(ready.delegate || element,
									ready.parts[2], ready.parts[1], funcName, this);
							}
						}
					}

					// Set up the ability to `destroy` the control later.
					can.bind.call(element, "removed", destroyCB);
					bindings.user.push(function (el) {
						can.unbind.call(el, "removed", destroyCB);
					});
					return bindings.user.length;
				}

				// if `el` is a string, use that as `selector` and re-set it to this control's element...
				if (typeof el === 'string') {
					func = eventName;
					eventName = selector;
					selector = el;
					el = this.element;
				}

				// ...otherwise, set `selector` to null
				if (func === undefined) {
					func = eventName;
					eventName = selector;
					selector = null;
				}

				if (typeof func === 'string') {
					func = can.Control._shifter(this, func);
				}

				this._bindings.user.push(binder(el, eventName, func, selector));

				return this._bindings.user.length;
			},
			// ## off
			// 
			// Unbinds all event handlers on the controller.
			// This should _only_ be called in combination with .on()
			off: function () {
				var el = this.element[0],
					bindings = this._bindings;
				if( bindings ) {
					each(bindings.user || [], function (value) {
						value(el);
					});
					each(bindings.control || {}, function (value) {
						value(el);
					});
				}
				// Adds bindings.
				this._bindings = {user: [], control: {}};
			},
			// ## destroy
			// 
			// Prepares a `control` for garbage collection.
			// First checks if it has already been removed. Then, removes all the bindings, data, and 
			// the element from the Control instance.
			destroy: function () {
				if (this.element === null) {
					//!steal-remove-start
					can.dev.warn("can/control/control.js: Control already destroyed");
					//!steal-remove-end
					return;
				}
				var Class = this.constructor,
					pluginName = Class.pluginName || Class._fullName,
					controls;

				this.off();

				if (pluginName && pluginName !== 'can_control') {
					this.element.removeClass(pluginName);
				}

				controls = can.data(this.element, "controls");
				controls.splice(can.inArray(this, controls), 1);

				can.trigger(this, "destroyed");

				this.element = null;
			}
		});

	// ## Processors
	// 
	// Processors do the binding. This basic processor binds events. Each returns a function that unbinds 
	// when called.
	var processors = can.Control.processors;
	basicProcessor = function (el, event, selector, methodName, control) {
		return binder(el, event, can.Control._shifter(control, methodName), selector);
	};

	// Set common events to be processed as a `basicProcessor`
	each(["change", "click", "contextmenu", "dblclick", "keydown", "keyup",
		"keypress", "mousedown", "mousemove", "mouseout", "mouseover",
		"mouseup", "reset", "resize", "scroll", "select", "submit", "focusin",
		"focusout", "mouseenter", "mouseleave",
		"touchstart", "touchmove", "touchcancel", "touchend", "touchleave",
		"inserted","removed"
	], function (v) {
		processors[v] = basicProcessor;
	});

	return Control;
});

