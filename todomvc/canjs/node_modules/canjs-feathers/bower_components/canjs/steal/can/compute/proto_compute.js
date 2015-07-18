/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#compute/proto_compute*/
steal('can/util', 'can/util/bind', 'can/compute/read.js','can/compute/get_value_and_bind.js','can/util/batch', function (can, bind, read, getValueAndBind) {
	
	// # can/compute/proto_compute (aka can.Compute)
	// 
	// A prototype based version of can.compute.  `can.compute` uses this internally.
	// 
	// can.Computes have public `.get`, `.set`, `.on`, and `.off` methods that call 
	// internally configured methods:
	//
	// - `_on(updater)` - Called the first time the compute is bound. This should bind to 
	//    any source observables.  When any of the source observables have changed, it should call
	//    `updater(newVal, oldVal, batchNum)`.
	//
	// - `_off(updater)` - Called when the compute has no more event handlers.  This should unbind to any source observables.
	// - `_get` - Called to get the current value of the compute.
	// - `_set` - Called to set the value of the compute.
	//
	// Other internal flags and values:
	// - `value` - the cached value
	// - `_setUpdates` - if calling `_set` will have updated the cached value itself so `_get` does not need to be called.
	// - `_canObserve` - if this compute can be observed.
	// - `hasDependencies` - if this compute has source observable values.
	
	// A helper to trigger an event when a value changes
	var updateOnChange = function(compute, newValue, oldValue, batchNum){
		// Only trigger event when value has changed
		if (newValue !== oldValue) {
			can.batch.trigger(compute, batchNum ? {type: "change", batchNum: batchNum} : 'change', [
				newValue,
				oldValue
			]);
		}
	};

	// A helper that creates an ._on and ._off function that
	// will bind on source observables and update the value of the compute.
	var setupComputeHandlers = function(compute, func, context, singleBind) {
		var readInfo,
			onchanged,
			batchNum;
		singleBind = false;
		return {
			// Set up handler for when the compute changes
			on: function(updater){
				var self = this;
				if(!onchanged) {
					onchanged = function(ev){
						// only run this 
						if (readInfo.ready && compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
							// Keep the old value
							var oldValue = readInfo.value,
								newValue;
							// Get the new value
							if(singleBind) {
								newValue = func.call(context);
								readInfo.value = newValue;
							} else {
								readInfo = getValueAndBind(func, context, readInfo, onchanged);
								newValue = readInfo.value;
							}
							
							// Call the updater with old and new values
							self.updater(newValue, oldValue, ev.batchNum);
							batchNum = batchNum = ev.batchNum;
						}
					};
				}

				readInfo = getValueAndBind(func, context, {observed: {}}, onchanged);
				
				if(singleBind) {
					// prevent other calls from being observed;
					func = can.__notObserve(func);
				}
				
				compute.value = readInfo.value;
				compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
			},
			// Remove handler for the compute
			off: function(updater){
				for (var name in readInfo.observed) {
					var ob = readInfo.observed[name];
					ob.obj.unbind(ob.event, onchanged);
				}
			}
		};
	};

	// Instead of calculating whether anything is listening every time,
	// use a function to do nothing (which may be overwritten)
	var k = function () {};

	var updater = function(newVal, oldVal, batchNum) {
		this.value = newVal;
		updateOnChange(this, newVal, oldVal, batchNum);
	},

	asyncGet = function(fn, context, lastSetValue) {
		return function() {
			return fn.call(context, lastSetValue.get());
		};
	},

	asyncUpdater = function(context, oldUpdater) {
		return function(newVal) {
			if(newVal !== undefined) {
				oldUpdater(newVal, context.value);
			}
		};
	};

	// ## can.Compute
	// Checks the arguments and calls different setup methods
	can.Compute = function(getterSetter, context, eventName, bindOnce) {
		var args = [];

		for(var i = 0, arglen = arguments.length; i < arglen; i++) {
			args[i] = arguments[i];
		}

		var contextType = typeof args[1];

		if (typeof args[0] === 'function') {
			this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
		} else if (args[1]) {
			if (contextType === 'string') {
				// `can.compute(object, propertyName[, eventName])`
				this._setupContextString(args[0], args[1], args[2]);
			} else if(contextType === 'function') {
				// `can.compute(initialValue, setter)`
				this._setupContextFunction(args[0], args[1], args[2]);
			} else {
				//`new can.Compute(initialValue, {})`
				if(args[1] && args[1].fn) {
					this._setupAsyncCompute(args[0], args[1]);
				} else {
					this._setupContextSettings(args[0], args[1]);
				}

			}
		} else {
			// `can.compute(initialValue)`
			this._setupInitialValue(args[0]);
		}

		this._args = args;

		this.isComputed = true;
		can.cid(this, 'compute');
	};

	can.simpleExtend(can.Compute.prototype, {
		//TODO: verify "this" is the instance of a compute
		_bindsetup: can.__notObserve(function () {
			this.bound = true;
			this._on(this.updater);
		}),

		_bindteardown: function () {
			this._off(this.updater);
			this.bound = false;
		},

		bind: can.bindAndSetup,
		unbind: can.unbindAndTeardown,

		clone: function(context) {
			if(context && typeof this._args[0] === 'function') {
				this._args[1] = context;
			} else if(context) {
				this._args[2] = context;
			}

			return new can.Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
		},

		_on: k,
		_off: k,
		// Returns the cached value if `bound`, otherwise, returns
		// the _get value.
		get: function() {
			// Another compute may bind to this `computed`
			if(can.__isRecordingObserves() && this._canObserve !== false) {

				// Tell the compute to listen to change on this computed
				// Use `can.__observe` to allow other compute to listen
				// for a change on this `computed`
				can.__observe(this, 'change');
				// We are going to bind on this compute.
				// If we are not bound, we should bind so that
				// we don't have to re-read to get the value of this compute.
				if (!this.bound) {
					can.Compute.temporarilyBind(this);
				}
			}
			// If computed is bound, use the cached value
			if (this.bound) {
				return this.value;
			} else {
				return this._get();
			}
		},
		_get: function() {
			return this.value;
		},
		// 
		set: function(newVal) {
			// Save a reference to the old value
			var old = this.value;
			// Setter may return the value if setter
			// is for a value maintained exclusively by this compute.
			var setVal = this._set(newVal, old);
			

			
			// If the computed function has dependencies,
			// return the current value
			if (this.hasDependencies) {
				// If set can update the value,
				// just return the updated value.
				if(this._setUpdates) {
					return this.value;
				}
				
				return this._get();
			}
			// Setting may not fire a change event, in which case
			// the value must be read
			if (setVal === undefined) {
				this.value = this._get();
			} else {
				this.value = setVal;
			}
			// Fire the change
			updateOnChange(this, this.value, old);
			return this.value;
		},

		_set: function(newVal) {
			return this.value = newVal;
		},

		updater: updater,

		_computeFn: function(newVal) {
			if(arguments.length) {
				return this.set(newVal);
			}

			return this.get();
		},

		toFunction: function() {
			return can.proxy(this._computeFn, this);
		},

		_setupGetterSetterFn: function(getterSetter, context, eventName, bindOnce) {
			this._set = can.proxy(getterSetter, context);
			this._get = can.proxy(getterSetter, context);
			this._canObserve = eventName === false ? false : true;

			var handlers = setupComputeHandlers(this, getterSetter, context || this, bindOnce);
			this._on = handlers.on;
			this._off = handlers.off;
			
		},
		// can.compute(input, value, "change");
		_setupContextString: function(target, propertyName, eventName) {
			var isObserve = can.isMapLike( target ),
				self = this,
				handler = function(ev, newVal,oldVal) {
					self.updater(newVal, oldVal, ev.batchNum);
				};

			if(isObserve) {
				this.hasDependencies = true;
				this._get = function() {
					return target.attr(propertyName);
				};
				this._set = function(val) {
					target.attr(propertyName, val);
				};
				this._on = function(update) {
					target.bind(eventName || propertyName, handler);
					// Set the cached value
					this.value = this._get();
				};
				this._off = function() {
					return target.unbind(eventName || propertyName, handler);
				};
			} else {
				this._get = can.proxy(this._get, target);
				this._set = can.proxy(this._set, target);
			}
		},

		_setupContextFunction: function(initialValue, setter, eventName) {
			this.value = initialValue;
			this._set = setter;
			can.simpleExtend(this, eventName);
		},
		// new can.Compute(5,{get, set, on, off})
		_setupContextSettings: function(initialValue, settings) {
			
			this.value = initialValue;
			
			this._set = settings.set ? can.proxy(settings.set, settings) : this._set;
			this._get = settings.get ? can.proxy(settings.get, settings) : this._get;

			// This allows updater to be called without any arguments.
			// selfUpdater flag can be set by things that want to call updater themselves.
			if(!settings.__selfUpdater) {
				var self = this,
					oldUpdater = this.updater;
				this.updater = function() {
					oldUpdater.call(self, self._get(), self.value);
				};
			}
			
			
			this._on = settings.on ? settings.on : this._on;
			this._off = settings.off ? settings.off : this._off;
		},
		_setupAsyncCompute: function(initialValue, settings){
			
			this.value = initialValue;
			
			var oldUpdater = can.proxy(this.updater, this),
				self = this,
				fn = settings.fn,
				data;
			
			this.updater = oldUpdater;
			
			var lastSetValue = new can.Compute(initialValue);
			// expose this compute so it can be read
			this.lastSetValue = lastSetValue;
			this._setUpdates = true;
			this._set = function(newVal){
				if(newVal === lastSetValue.get()) {
					return this.value;
				}

				// this is the value passed to the fn
				return lastSetValue.set(newVal);
			};

			// make sure get is called with the newVal, but not setter
			this._get = asyncGet(fn, settings.context, lastSetValue);
			// Check the number of arguments the 
			// async function takes.
			if(fn.length === 0) {
				// if it takes no arguments, it is calculated from other things.
				data = setupComputeHandlers(this, fn, settings.context);
			} else if(fn.length === 1) {
				// If it has a single argument, pass it the current value
				// or the value from define.set.
				data = setupComputeHandlers(this, function() {
					return fn.call(settings.context, lastSetValue.get() );
				}, settings);
			} else {
				// The updater function passed to on so that if called with
				// a single, non undefined value, works.
				this.updater = asyncUpdater(this, oldUpdater);
				
				// Finally, pass the function so it can decide the final value.
				data = setupComputeHandlers(this, function() {
					// Call fn, and get new value
					var res = fn.call(settings.context, lastSetValue.get(), function(newVal) {
						oldUpdater(newVal, self.value);
					});
					// If undefined is returned, don't update the value.
					return res !== undefined ? res : this.value;
				}, settings);
			}

			this._on = data.on;
			this._off = data.off;
		},
		_setupInitialValue: function(initialValue) {
			this.value = initialValue;
		}
	});

	// A list of temporarily bound computes
	var computes, unbindComputes = function () {
		for (var i = 0, len = computes.length; i < len; i++) {
			computes[i].unbind('change', k);
		}
		computes = null;
	};

	// Binds computes for a moment to retain their value and prevent caching
	can.Compute.temporarilyBind = function (compute) {
		compute.bind('change', k);
		if (!computes) {
			computes = [];
			setTimeout(unbindComputes, 10);
		}
		computes.push(compute);
	};

	can.Compute.async = function(initialValue, asyncComputer, context){
		return new can.Compute(initialValue, {
			fn: asyncComputer,
			context: context
		});
	};

	can.Compute.read = read;
	can.Compute.set = read.write;
	
	can.Compute.truthy = function(compute) {
		return new can.Compute(function() {
			var res = compute.get();
			if(typeof res === 'function') {
				res = res.get();
			}
			return !!res;
		});
	};

	return can.Compute;
});

