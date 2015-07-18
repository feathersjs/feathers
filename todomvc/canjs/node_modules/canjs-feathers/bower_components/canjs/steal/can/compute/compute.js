/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#compute/compute*/
/* jshint maxdepth:7*/

// # can.compute
// 
// `can.compute` allows creation of observable values
// from the result of a funciton. Any time an observable
// value that the function depends on changes, the
// function automatically updates. This enables creating
// observable data that relies on other sources, potentially
// multiple different ones. For instance, a `can.compute` is
// able to:
// - Combine a first and last name into a full name and update when either changes
// - Calculate the absolute value of an observable number, updating any time the observable number does
// - Specify complicated behavior for getting and setting a value, as well as how to handle changes

steal('can/util', 'can/util/bind', 'can/util/batch', 'can/compute/proto_compute.js', function (can, bind) {



	can.compute = function (getterSetter, context, eventName, bindOnce) {

		var internalCompute = new can.Compute(getterSetter, context, eventName, bindOnce);

		var compute = function(val) {
			if(arguments.length) {
				return internalCompute.set(val);
			}

			return internalCompute.get();
		};

		compute.bind = can.proxy(internalCompute.bind, internalCompute);
		compute.unbind = can.proxy(internalCompute.unbind, internalCompute);
		compute.isComputed = internalCompute.isComputed;
		compute.clone = function(ctx) {
			if(typeof getterSetter === 'function') {
				context = ctx;
			}

			return can.compute(getterSetter, context, ctx, bindOnce);
		};

		compute.computeInstance = internalCompute;

		return compute;
	};
	// Instead of calculating whether anything is listening every time,
	// use a function to do nothing (which may be overwritten)
	var k = function () {};
	// A list of temporarily bound computes
	var computes, unbindComputes = function () {
			for (var i = 0, len = computes.length; i < len; i++) {
				computes[i].unbind('change', k);
			}
			computes = null;
		};
	// Binds computes for a moment to retain their value and prevent caching
	can.compute.temporarilyBind = function (compute) {
		compute.bind('change', k);
		if (!computes) {
			computes = [];
			setTimeout(unbindComputes, 10);
		}
		computes.push(compute);
	};
	
	// Whether a compute is truthy
	can.compute.truthy = function (compute) {
		return can.compute(function () {
			var res = compute();
			if (typeof res === 'function') {
				res = res();
			}
			return !!res;
		});
	};
	can.compute.async = function(initialValue, asyncComputer, context){
		return can.compute(initialValue, {
			fn: asyncComputer,
			context: context
		});
	};


	can.compute.read = can.Compute.read;


	can.compute.set = can.Compute.set;

	return can.compute;
});

