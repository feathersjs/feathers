/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#construct/proxy/proxy*/
steal('can/util', 'can/construct', function (can, Construct) {
	var isFunction = can.isFunction,
		isArray = can.isArray,
		makeArray = can.makeArray,
		proxy = function (funcs) {
			//args that should be curried
			var args = makeArray(arguments),
				self;
			// get the functions to callback
			funcs = args.shift();
			// if there is only one function, make funcs into an array
			if (!isArray(funcs)) {
				funcs = [funcs];
			}
			// keep a reference to us in self
			self = this;

			//!steal-remove-start
			for (var i = 0; i < funcs.length; i++) {
				if (typeof funcs[i] === "string" && !isFunction(this[funcs[i]])) {
					throw ("class.js " + (this.fullName || this.Class.fullName) + " does not have a " + funcs[i] + "method!");
				}
			}
			//!steal-remove-end

			return function class_cb() {
				// add the arguments after the curried args
				var cur = args.concat(makeArray(arguments)),
					isString, length = funcs.length,
					f = 0,
					func;
				// go through each function to call back
				for (; f < length; f++) {
					func = funcs[f];
					if (!func) {
						continue;
					}
					// set called with the name of the function on self (this is how this.view works)
					isString = typeof func === 'string';
					// call the function
					cur = (isString ? self[func] : func)
						.apply(self, cur || []);
					// pass the result to the next function (if there is a next function)
					if (f < length - 1) {
						cur = !isArray(cur) || cur._use_call ? [cur] : cur;
					}
				}
				return cur;
			};
		};
	can.Construct.proxy = can.Construct.prototype.proxy = proxy;
	// this corrects the case where can/control loads after can/construct/proxy, so static props don't have proxy
	var correctedClasses = [
		can.Map,
		can.Control,
		can.Model
	],
		i = 0;
	for (; i < correctedClasses.length; i++) {
		if (correctedClasses[i]) {
			correctedClasses[i].proxy = proxy;
		}
	}
	return can;
});

