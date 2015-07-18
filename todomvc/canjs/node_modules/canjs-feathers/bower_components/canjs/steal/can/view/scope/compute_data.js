/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/scope/compute_data*/
steal("can/util","can/compute","can/compute/get_value_and_bind.js",function(can,compute, getValueAndBind){
	// The goal of this is to create a high-performance compute that represents a key value from can.view.Scope.
	// If the key value is something like {{name}} and the context is a can.Map, a faster
	// binding path will be used where new rebindings don't need to be looked for with every change of 
	// the observable property.
	// However, if the property changes to a compute, then the slower `can.compute.read` method of
	// observing values will be used.
	
	
	var isFastPath = function(computeData){
		return computeData.reads &&
					// a single property read
					computeData.reads.length === 1 &&
					// on a map
					computeData.root instanceof can.Map &&
					// that isn't calling a function
					!can.isFunction(computeData.root[computeData.reads[0]]);
	};
	
	var getValueAndBindScopeRead = function(scopeRead, scopeReadChanged){
		return getValueAndBind(scopeRead, null, {observed: {}}, scopeReadChanged);
	};
	var unbindScopeRead = function(readInfo, scopeReadChanged){
		for (var name in readInfo.observed) {
			var ob = readInfo.observed[name];
			ob.obj.unbind(ob.event, scopeReadChanged);
		}
	};
	var getValueAndBindSinglePropertyRead = function(computeData, singlePropertyReadChanged){
		var target = computeData.root,
			prop = computeData.reads[0];
		target.bind(prop, singlePropertyReadChanged);
		// something: true is just a dummy value so we know something is observed
		return {value: computeData.initialValue, observed: {something: true}};
	};
	var unbindSinglePropertyRead = function(computeData, singlePropertyReadChanged){
		computeData.root.unbind(computeData.reads[0], singlePropertyReadChanged);
	};
	var scopeReader = function(scope, key, options, computeData, newVal){
		if (arguments.length > 4) {
			if(computeData.root.isComputed) {
				computeData.root(newVal);
			} else if(computeData.reads.length) {
				var last = computeData.reads.length - 1;
				var obj = computeData.reads.length ? can.compute.read(computeData.root, computeData.reads.slice(0, last)).value
					: computeData.root;
				can.compute.set(obj, computeData.reads[last], newVal, options);
			}
			// **Compute getter**
		} else {
			// If computeData has found the value for the key in the past in an observable then go directly to
			// the observable (computeData.root) that the value was found in the last time and return the new value.  This
			// is a huge performance gain for the fact that we aren't having to check the entire scope each time.
			if (computeData.root) {
				return can.compute.read(computeData.root, computeData.reads, options)
					.value;
			}
			// If the key has not already been located in a observable then we need to search the scope for the
			// key.  Once we find the key then we need to return it's value and if it is found in an observable
			// then we need to store the observable so the next time this compute is called it can grab the value
			// directly from the observable.
			var data = scope.read(key, options);
			computeData.scope = data.scope;
			computeData.initialValue = data.value;
			computeData.reads = data.reads;
			computeData.root = data.rootObserve;
			return data.value;
		}
	};
	
	return function(scope, key, options){
		options = options || {
			args: []
		};
		// the object we are returning
		var computeData = {},
			// a function that can be passed to getValueAndBind, or used as a setter
			scopeRead = function (newVal) {
				if(arguments.length) {
					return scopeReader(scope, key, options, computeData, newVal);
				} else {
					return scopeReader(scope, key, options, computeData);
				}
			},
			// store the last batch number
			batchNum,
			// the observables read by the last calling of `scopeRead`
			readInfo,
			// What to do when a full scope read has changed
			scopeReadChanged = function(ev){
				// only run this if we have changed the batch and everything.
				if (readInfo.ready && compute.computeInstance.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum) ) {
					// Keep the old value
					var oldValue = readInfo.value,
						newValue;
						
					// Get the new value
					readInfo = getValueAndBind(scopeRead, null, readInfo, scopeReadChanged);
					newValue = readInfo.value;
					
					
					// Call the updater with old and new values
					compute.computeInstance.updater(newValue, oldValue, ev.batchNum);
					batchNum = batchNum = ev.batchNum;
				}
			},
			// What to do when a single property has changed
			singlePropertyReadChanged = function(ev, newVal, oldVal){
				if(typeof newVal !== "function") {
					compute.computeInstance.updater(newVal, oldVal, ev.batchNum);
				} else {
					// switch bindings
					unbindSinglePropertyRead(computeData,singlePropertyReadChanged );
					readInfo = getValueAndBindScopeRead(scopeRead, scopeReadChanged);
					isFastPathBound = false;
					compute.computeInstance.updater(readInfo.value, oldVal, ev.batchNum);
				}
			},
			// tracks if we are in the fast path or not
			isFastPathBound = false,
			
			compute = can.compute(undefined,{
				on: function() {
					readInfo = getValueAndBindScopeRead(scopeRead, scopeReadChanged);
					if( isFastPath(computeData) ) {
						var oldReadInfo = readInfo;
						// bind before unbind to keep bind count correct
						readInfo = getValueAndBindSinglePropertyRead(computeData, singlePropertyReadChanged);
						unbindScopeRead(oldReadInfo, scopeReadChanged);
						isFastPathBound = true;
					}
					// TODO deal with this right
					compute.computeInstance.value = readInfo.value;
					compute.computeInstance.hasDependencies = !can.isEmptyObject(readInfo.observed);
				},
				off: function(){
					if(isFastPathBound) {
						unbindSinglePropertyRead(computeData, singlePropertyReadChanged);
					} else {
						unbindScopeRead(readInfo, scopeReadChanged);
					}
				},
				set: scopeRead,
				get: scopeRead,
				// a hack until we clean up can.compute for 3.0
				__selfUpdater: true
			});
		
		computeData.compute = compute;
		return computeData;
		
	};
});

