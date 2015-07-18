/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#compute/get_value_and_bind*/
steal("can/util", function(){
	
	// # can/compute/observe
	// Exports a function that calls a function and binds to any observables it reads.
	// When any of those observables change, a callback function is called.
	//
	// And ...
	//
	// Adds two main methods to can:
	//
	// - can.__observe - All other observes call this method to be visible to computed functions.
	// - can.__notObserve - Returns a function that can not be observed.
	//
	// ## observe
	// This module's export:
	// - `func` - A function to read and and bind to all observables it might read.
	// - `context` - What `func` should be called with.
	// - `oldObserved` - A map of observable / event pairs this function used to be listening to.
	// - `onchanged` - What to callback whenever any of the observables changed.
	function observe(func, context, oldInfo, onchanged) {
		// Call the function, get the value as well as the observed objects and events
		var info = getValueAndObserved(func, context),
			// The objects-event pairs that must be bound to
			newObserveSet = info.observed,
			oldObserved = oldInfo.observed;
		// Go through what needs to be observed.
		if(info.names !== oldInfo.names) {
			bindNewSet(oldObserved, newObserveSet, onchanged);
			unbindOldSet(oldObserved, onchanged);
		}
		// set ready after all previous events have fired
		can.batch.afterPreviousEvents(function(){
			info.ready = true;
		});
		
		return info;
	}
	
	// The top of this is what observables and events the current observer
	// should listen to.
	
	// ## Observe Helpers
	//
	// The following methods are used to call a function that relies on
	// observable data and to track the observable events which should 
	// be listened to when changes occur.
	// To do this, `can.__observe(observable, event)` is called to
	// "broadcast" the corresponding event on each read.
	// 
	// ### Observed
	//
	// An "Observed" is an object of observable objects and events that
	// a function relies on. These objects and events must be listened to
	// in order to determine when to check a function for updates.
	// This looks like the following:
	//
	//     { 
	//       "map1|first": {obj: map, event: "first"},
	//       "map1|last" : {obj: map, event: "last"}
	//     }
	// 
	// Each object-event pair is mapped so no duplicates will be listed.
	var observedStack = [];
	
	// returns if some function is in the process of recording observes.
	can.__isRecordingObserves = function(){
		return observedStack.length;
	};
	
	can.__observe = can.__reading = function (obj, event) {
		if (observedStack.length) {
			var name = obj._cid + '|' + event,
				top = observedStack[observedStack.length-1];
			
			top.names += name;
			top.observed[name] = {
				obj: obj,
				event: event + ""
			};
		}
	};
	
	
	// protects a function from being observed.
	can.__notObserve = function(fn){
		return function(){
			var previousReads = can.__clearObserved();
			var res = fn.apply(this, arguments);
			can.__setObserved(previousReads);
			return res;
		};
	};
	
	// The following methods 
	can.__clearObserved = can.__clearReading = function () {
		if (observedStack.length) {
			var ret = observedStack[observedStack.length-1];
			observedStack[observedStack.length-1] = {observed: {}};
			return ret;
		}
	};

	can.__setObserved = can.__setReading = function (o) {
		if (observedStack.length) {
			observedStack[observedStack.length-1] = o;
		}
	};

	can.__addObserved = can.__addReading = function(o){
		if (observedStack.length) {
			can.simpleExtend(observedStack[observedStack.length-1], o);
		}
	};
	
	var getValueAndObserved = function (func, self) {
		
		observedStack.push({names: "", observed: {}});

		var value = func.call(self);
		var stackItem = observedStack.pop();
		stackItem.value = value;
		return stackItem;
	};

	// This will not be optimized.
	var bindNewSet = function(oldObserved, newObserveSet, onchanged){
		for(var name in newObserveSet ) {
			bindOrPreventUnbinding(oldObserved, newObserveSet, name, onchanged);
		}
	};

	// This will be optimized.
	var bindOrPreventUnbinding = function(oldObserved, newObserveSet, name, onchanged){
		if( oldObserved[name] ) {
			delete oldObserved[name];
		} else {
			var obEv = newObserveSet[name];
			obEv.obj.bind(obEv.event, onchanged);
		}
	};

	var unbindOldSet = function(oldObserved, onchanged){
		for (var name in oldObserved) {
			var obEv = oldObserved[name];
			obEv.obj.unbind(obEv.event, onchanged);
		}
	};


	return observe;

});

