/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#compute/read*/
steal("can/util", function(can){
	
	
	
	
	// there are things that you need to evaluate when you get them back as a property read
	// for example a compute or a function you might need to call to get the next value to 
	// actually check
	// - isArgument - should be renamed to something like "dontReadLastPropertyValue"
	var read = function (parent, reads, options) {
		options = options || {};
		var state = {
			foundObservable: false
		};
		
		// `cur` is the current value.
		var cur = readValue(parent, 0, reads, options, state),
			type,
			// `prev` is the object we are reading from.
			prev,
			// `foundObs` did we find an observable.
			readLength = reads.length,
			i = 0;


		while( i < readLength ) {
			prev = cur;
			// try to read the property
			for(var r=0, readersLength = read.propertyReaders.length; r < readersLength; r++) {
				var reader = read.propertyReaders[r];
				if(reader.test(cur)) {
					cur = reader.read(cur, reads[i], i, options, state);
					break; // there can be only one reading of a property
				}
			}
			i = i+1;
			// read the value if it is a compute or function
			cur = readValue(cur, i, reads, options, state, prev);
			type = typeof cur;
			// early exit if need be
			if (i < reads.length && (cur === null || type !== 'function' && type !== 'object')) {
				if (options.earlyExit) {
					options.earlyExit(prev, i - 1, cur);
				}
				// return undefined so we know this isn't the right value
				return {
					value: undefined,
					parent: prev
				};
			}
			
		}
		// if we don't have a value, exit early.
		if (cur === undefined) {
			if (options.earlyExit) {
				options.earlyExit(prev, i - 1);
			}
		}
		return {
			value: cur,
			parent: prev
		};
	};


	var readValue = function(value, index, reads, options, state, prev){
		var usedValueReader;
		do {
			
			usedValueReader = false;
			for(var i =0, len = read.valueReaders.length; i < len; i++){
				if( read.valueReaders[i].test(value, index, reads, options) ) {
					value = read.valueReaders[i].read(value, index, reads, options, state, prev);
					//usedValueReader = true;
				}
			}
		} while(usedValueReader);
		
		return value;
	};
	// value readers check the current value
	// and get a new value from it
	// ideally they would keep calling until 
	// none of these passed
	read.valueReaders = [{
		name: "compute",
		// compute value reader
		test: function(value, i, reads, options){
			return value && value.isComputed;
		},
		read: function(value, i, reads, options, state){
			if(options.isArgument && i === reads.length ) {
				return value;
			}
			
			if (!state.foundObservable && options.foundObservable) {
				options.foundObservable(value, i);
				state.foundObservable = true;
			}
			return value instanceof can.Compute ? value.get() : value();
		}
	},{
		name: "function",
		// if this is a function before the last read and its not a constructor function
		test: function(value, i, reads, options){
			var type = typeof value;
			// i = reads.length if this is the last iteration of the read for-loop.
			return type === 'function' && !value.isComputed &&
				(options.executeAnonymousFunctions || (options.isArgument && i === reads.length) ) &&
				!(can.Construct && value.prototype instanceof can.Construct) &&
				!(can.route && value === can.route);
		},
		read: function(value, i, reads, options, state, prev){
			if (options.isArgument && i === reads.length) {
				return options.proxyMethods !== false ? can.proxy(value, prev) : value;
			}
			return value.call(prev);
		}
	}];
	
	// propertyReaders actually read a property value 
	read.propertyReaders = [
		// read a can.Map or can.route
		{
			name: "map",
			test: can.isMapLike,
			read: function(value, prop, index, options, state){
				if (!state.foundObservable && options.foundObservable) {
					options.foundObservable(value, index);
					state.foundObservable = true;
				}
				if (typeof value[prop] === 'function' && value.constructor.prototype[prop] === value[prop]) {
					// call that method
					if (options.returnObserveMethods) {
						return value[prop];
					// if the property value is a can.Construct
					} else if ( (prop === 'constructor' && value instanceof can.Construct) ||
						(value[prop].prototype instanceof can.Construct)) {
						return value[prop];
					} else {
						return value[prop].apply(value, options.args || []);
					}
				} else {
					// use attr to get that value
					return value.attr(prop);
				}
			}
		},
		// read a promise
		{
			name: "promise",
			test: function(value){
				return can.isPromise(value);
			},
			read: function(value, prop, index, options, state){
				if (!state.foundObservable && options.foundObservable) {
					options.foundObservable(value, index);
					state.foundObservable = true;
				}
				var observeData = value.__observeData;
				if(!value.__observeData) {
					observeData = value.__observeData = {
						isPending: true,
						state: "pending",
						isResolved: false,
						isRejected: false,
						value: undefined,
						reason: undefined
					};
					can.cid(observeData);
					// proto based would be faster
					can.simpleExtend(observeData, can.event);
					value.then(function(value){
						observeData.isPending = false;
						observeData.isResolved = true;
						observeData.value = value;
						observeData.state = "resolved";
						observeData.dispatch("state",["resolved","pending"]);
					}, function(reason){
						observeData.isPending = false;
						observeData.isRejected = true;
						observeData.reason = reason;
						observeData.state = "rejected";
						observeData.dispatch("state",["rejected","pending"]);
					});
				}
				can.__observe(observeData,"state");
				return prop in observeData ? observeData[prop] : value[prop];
			}
		},
		
		// read a normal object
		{
			name: "object",
			// this is the default
			test: function(){return true;},
			read: function(value, prop){
				if(value == null) {
					return undefined;
				} else {
					return value[prop];
				}
			}
		}
	];
	
	// This should be able to set a property similar to how read works.
	read.write = function(parent, key, value, options) {
		options = options || {};
		if(can.isMapLike(parent)) {
			// HACK! ... check if the attr is a comptue, if it is, set it.
			if(!options.isArgument && parent._data && parent._data[key] && parent._data[key].isComputed) {
				return parent._data[key](value);
			} else {
				return parent.attr(key, value);
			}
		}

		if(parent[key] && parent[key].isComputed) {
			return parent[key](value);
		}

		if(typeof parent === 'object') {
			parent[key] = value;
		}
	};
	
	
	return read;
});
