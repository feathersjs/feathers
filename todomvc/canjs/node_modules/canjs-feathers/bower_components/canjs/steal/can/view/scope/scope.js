/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/scope/scope*/
// # can/view/scope/scope.js
//
// This allows you to define a lookup context and parent contexts that a key's value can be retrieved from.
// If no parent scope is provided, only the scope's context will be explored for values.

steal(
	'can/util',
	'can/view/scope/compute_data.js',
	'can/construct',
	'can/map',
	'can/list',
	'can/view',
	'can/compute', function (can, makeComputeData) {

		// ## Helpers

		// Regex for escaped periods
		var escapeReg = /(\\)?\./g,
		// Regex for double escaped periods
			escapeDotReg = /\\\./g,
		// **getNames**
		// Returns array of names by splitting provided string by periods and single escaped periods.
		// ```getNames("a.b\.c.d\\.e") //-> ['a', 'b', 'c', 'd.e']```
			getNames = function (attr) {
				var names = [],
					last = 0;
				// Goes through attr string and places the characters found between the periods and single escaped periods into the
				// `names` array.  Double escaped periods are ignored.
				attr.replace(escapeReg, function (first, second, index) {
					/* If period is double escaped then leave in place */
					if (!second) {
						names.push(
							attr
								.slice(last, index)
								/* replaces double-escaped period with period */
								.replace(escapeDotReg, '.')
						);
						last = index + first.length;
					}
				});
				/* Adds last portion of attr to names array */
				names.push(
					attr
						.slice(last)
						/* replaces double-escaped period with period */
						.replace(escapeDotReg, '.')
				);
				return names;
			};

		/**
		 * @add can.view.Scope
		 */
		var Scope = can.Construct.extend(

			/**
			 * @static
			 */
			{
				// ## Scope.read
				// Scope.read was moved to can.compute.read
				// can.compute.read reads properties from a parent.  A much more complex version of getObject.
				read: can.compute.read
			},
			/**
			 * @prototype
			 */
			{
				init: function (context, parent) {
					this._context = context;
					this._parent = parent;
					this.__cache = {};
				},

				// ## Scope.prototype.attr
				// Reads a value from the current context or parent contexts.
				attr: can.__notObserve(function (key, value) {
					// Reads for whatever called before attr.  It's possible
					// that this.read clears them.  We want to restore them.
					var options = {
							isArgument: true,
							returnObserveMethods: true,
							proxyMethods: false
						},
						res = this.read(key, options);

					// Allow setting a value on the context
					if(arguments.length === 2) {
						var lastIndex = key.lastIndexOf('.'),
							// Either get the paren of a key or the current context object with `.`
							readKey = lastIndex !== -1 ? key.substring(0, lastIndex) : '.',
							obj = this.read(readKey, options).value;

						if(lastIndex !== -1) {
							// Get the last part of the key which is what we want to set
							key = key.substring(lastIndex + 1, key.length);
						}

						can.compute.set(obj, key, value, options);
					}
					return res.value;
				}),

				// ## Scope.prototype.add
				// Creates a new scope and sets the current scope to be the parent.
				// ```
				// var scope = new can.view.Scope([{name:"Chris"}, {name: "Justin"}]).add({name: "Brian"});
				// scope.attr("name") //-> "Brian"
				// ```
				add: function (context) {
					if (context !== this._context) {
						return new this.constructor(context, this);
					} else {
						return this;
					}
				},

				// ## Scope.prototype.computeData
				// Finds the first location of the key in the scope and then provides a get-set compute that represents the key's value
				// and other information about where the value was found.
				computeData: function (key, options) {
					return makeComputeData(this, key, options);
				},

				// ## Scope.prototype.compute
				// Provides a get-set compute that represents a key's value.
				compute: function (key, options) {
					return this.computeData(key, options)
						.compute;
				},

				// ## Scope.prototype.read
				// Finds the first isntance of a key in the available scopes and returns the keys value along with the the observable the key
				// was found in, readsData and the current scope.
				/**
				 * @hide
				 * @param {can.mustache.key} attr A dot seperated path.  Use `"\."` if you have a property name that includes a dot.
				 * @param {can.view.Scope.readOptions} options that configure how this gets read.
				 * @return {{}}
				 * @option {Object} parent the value's immediate parent
				 * @option {can.Map|can.compute} rootObserve the first observable to read from.
				 * @option {Array<String>} reads An array of properties that can be used to read from the rootObserve to get the value.
				 * @option {*} value the found value
				 */
				read: function (attr, options) {
					// check if we should only look within current scope
					var stopLookup;
					if(attr.substr(0, 2) === './') {
						// set flag to halt lookup from walking up scope
						stopLookup = true;
						// stop lookup from checking parent scopes
						attr = attr.substr(2);
					}
					// check if we should be running this on a parent.
					else if (attr.substr(0, 3) === "../") {
						return this._parent.read(attr.substr(3), options);
					} else if (attr === "..") {
						return {
							value: this._parent._context
						};
					} else if (attr === "." || attr === "this") {
						return {
							value: this._context
						};
					}

					// Array of names from splitting attr string into names.  ```"a.b\.c.d\\.e" //-> ['a', 'b', 'c', 'd.e']```
					var names = attr.indexOf('\\.') === -1 ?
							// Reference doesn't contain escaped periods
							attr.split('.')
							// Reference contains escaped periods ```(`a.b\.c.foo` == `a["b.c"].foo)```
							: getNames(attr),
					// The current context (a scope is just data and a parent scope).
						context,
					// The current scope.
						scope = this,
					// While we are looking for a value, we track the most likely place this value will be found.
					// This is so if there is no me.name.first, we setup a listener on me.name.
					// The most likely candidate is the one with the most "read matches" "lowest" in the
					// context chain.
					// By "read matches", we mean the most number of values along the key.
					// By "lowest" in the context chain, we mean the closest to the current context.
					// We track the starting position of the likely place with `defaultObserve`.
						defaultObserve,
					// Tracks how to read from the defaultObserve.
						defaultReads = [],
					// Tracks the highest found number of "read matches".
						defaultPropertyDepth = -1,
					// `scope.read` is designed to be called within a compute, but
					// for performance reasons only listens to observables within one context.
					// This is to say, if you have me.name in the current context, but me.name.first and
					// we are looking for me.name.first, we don't setup bindings on me.name and me.name.first.
					// To make this happen, we clear readings if they do not find a value.  But,
					// if that path turns out to be the default read, we need to restore them.  This
					// variable remembers those reads so they can be restored.
						defaultComputeReadings,
					// Tracks the default's scope.
						defaultScope,
					// Tracks the first found observe.
						currentObserve,
					// Tracks the reads to get the value for a scope.
						currentReads;

					// Goes through each scope context provided until it finds the key (attr).  Once the key is found
					// then it's value is returned along with an observe, the current scope and reads.
					// While going through each scope context searching for the key, each observable found is returned and
					// saved so that either the observable the key is found in can be returned, or in the case the key is not
					// found in an observable the closest observable can be returned.

					while (scope) {
						context = scope._context;
						if (context !== null &&
							// if its a primitive type, keep looking up the scope, since there won't be any properties
							(typeof context === "object" || typeof context === "function") ) {
							var data = can.compute.read(context, names, can.simpleExtend({
								/* Store found observable, incase we want to set it as the rootObserve. */
								foundObservable: function (observe, nameIndex) {
									currentObserve = observe;
									currentReads = names.slice(nameIndex);
								},
								// Called when we were unable to find a value.
								earlyExit: function (parentValue, nameIndex) {
									/* If this has more matching values */
									if (nameIndex > defaultPropertyDepth) {
										defaultObserve = currentObserve;
										defaultReads = currentReads;
										defaultPropertyDepth = nameIndex;
										defaultScope = scope;
										/* Clear and save readings so next attempt does not use these readings */
										defaultComputeReadings = can.__clearReading();
									}
								},
								// Execute anonymous functions found along the way
								executeAnonymousFunctions: true
							}, options));
							// **Key was found**, return value and location data
							if (data.value !== undefined) {
								return {
									scope: scope,
									rootObserve: currentObserve,
									value: data.value,
									reads: currentReads
								};
							}
						}
						// Prevent prior readings and then move up to the next scope.
						can.__clearReading();
						if(!stopLookup) {
							// Move up to the next scope.
							scope = scope._parent;
						} else {
							scope = null;
						}
					}

					// **Key was not found**, return undefined for the value.  Unless an observable was
					// found in the process of searching for the key, then return the most likely observable along with it's
					// scope and reads.

					if (defaultObserve) {
						can.__setReading(defaultComputeReadings);
						return {
							scope: defaultScope,
							rootObserve: defaultObserve,
							reads: defaultReads,
							value: undefined
						};
					} else {
						return {
							names: names,
							value: undefined
						};
					}
				}
			});

		can.view.Scope = Scope;
		return Scope;
	});

