/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#list/sort/sort*/
steal('can/util', 'can/list', function () {

	// BUBBLE RULE
	// 1. list.bind("change") -> bubbling
	//    list.unbind("change") -> no bubbling
	
	// 2. list.attr("comparator","id") -> nothing
	//    list.bind("length") -> bubbling
	//    list.removeAttr("comparator") -> nothing
	
	// 3. list.bind("change") -> bubbling
	//    list.attr("comparator","id") -> bubbling
	//    list.unbind("change") -> no bubbling
	


	// 4. list.bind("length") -> nothing 
	//    list.attr("comparator","id") -> bubbling
	//    list.removeAttr("comparator") -> nothing
	
	// 5. list.bind("length") -> nothing 
	//    list.attr("comparator","id") -> bubbling
	//    list.unbind("length") -> nothing

	// Change bubble rule to bubble on change if there is a comparator.
	var oldBubbleRule = can.List._bubbleRule;
	can.List._bubbleRule = function(eventName, list) {
		var oldBubble = oldBubbleRule.apply(this, arguments);

		if (list.comparator && can.inArray('change', oldBubble) === -1) {
			oldBubble.push('change');
		}

		return oldBubble;
	};

	var proto = can.List.prototype,
		_changes = proto._changes,
		setup = proto.setup,
		unbind = proto.unbind;

	//Add `move` as an event that lazy-bubbles

	// extend the list for sorting support

	can.extend(proto, {
		setup: function (instances, options) {
			setup.apply(this, arguments);
			this._comparatorBound = false;
			this._init = 1;
			this.bind('comparator', can.proxy(this._comparatorUpdated, this));
			delete this._init;
			
			if (this.comparator) {
				this.sort();
			}
		},
		_comparatorUpdated: function(ev, newValue){
			if( newValue || newValue === 0 ) {
				this.sort();
				
				if(this._bindings > 0 && ! this._comparatorBound) {
					this.bind("change", this._comparatorBound = function(){});
				}
			} else if(this._comparatorBound){
				unbind.call(this, "change", this._comparatorBound);
				this._comparatorBound = false;
				
			}
			
			// if anyone is listening to this object
		},
		unbind: function(ev, handler){
			var res = unbind.apply(this, arguments);
			
			if(this._comparatorBound && this._bindings === 1) {
				unbind.call(this,"change", this._comparatorBound);
				this._comparatorBound = false;
			}
			
			return res;
		},
		_comparator: function (a, b) {
			var comparator = this.comparator;

			// If the user has defined a comparator, use it
			if (comparator && typeof comparator === 'function') {
				return comparator(a, b);
			}

			return a === b ? 0 : a < b ? -1 : 1;
		},
		_changes: function (ev, attr, how, newVal, oldVal) {

			// If a comparator is defined and the change was to a
			// list item, consider moving the item.
			if (this.comparator && /^\d+/.test(attr)) {
	
				if (ev.batchNum && ev.batchNum !== this._lastBatchNum) {
					this.sort();
					this._lastBatchNum = ev.batchNum;
					return;
				}
	
				// get the index
				var currentIndex = +/^\d+/.exec(attr)[0],
					// and item
					item = this[currentIndex];
	
				if (typeof item !== 'undefined') {
	
					// Determine where this item should reside as a result
					// of the change
					var newIndex = this._getInsertIndex(item, currentIndex);
	
					if (newIndex !== currentIndex) {
						this._swapItems(currentIndex, newIndex);
	
						// Trigger length change so that {{#block}} helper can re-render
						can.trigger(this, 'length', [
							this.length
						]);
					}
	
				}
			}
			_changes.apply(this, arguments);
		},
		/**
		 * @hide
		 */
		_getInsertIndex: function (item, currentIndex) {
			var a = this._getComparatorValue(item),
				b,
				offset = 0;

			for (var i = 0; i < this.length; i++) {
				b = this._getComparatorValue(this[i]);

				// If we've reached the index that the item currently
				// resides in and still haven't found an ideal insert index,
				// offset the returned index by -1 to account for the fact
				// that this item would be moved if placed at the
				// suggested index.
				if (typeof currentIndex !== 'undefined' && i === currentIndex) {
					offset = -1;
					continue;
				}

				// If we've found an item ranked greater than or the same as this
				// item, consider this a good "insert" index.
				if (this._comparator(a, b) < 0) {
					return i + offset;
				}
			}

			// The index of the last item in the list
			return i + offset;
		},

		_getComparatorValue: function (item, overwrittenComparator) {

			// Use the value passed to .sort() as the comparator value
			// if it is a string
			var comparator = typeof overwrittenComparator === 'string' ?
				overwrittenComparator :
				this.comparator;

			// If the comparator is a string use that value to get
			// property on the item. If the comparator is a method,
			// it'll be used elsewhere.
			if (item && comparator && typeof comparator === 'string') {
				item = typeof item[comparator] === 'function' ?
					item[comparator]() :
					item.attr(comparator);
			}

			return item;
		},

		_getComparatorValues: function () {
			var self = this;
			var a = [];
			this.each(function (item, index) {
				a.push(self._getComparatorValue(item));
			});
			return a;
		},

		/**
		 * @hide
		 */
		sort: function (comparator, silent) {
			var a, b, c, isSorted;

			// Use the value passed to .sort() as the comparator function
			// if it is a function
			var comparatorFn = can.isFunction(comparator) ?
				comparator :
				this._comparator;

			for (var i, iMin, j = 0, n = this.length; j < n-1; j++) {
				iMin = j;

				isSorted = true;
				c = undefined;

				for (i = j+1; i < n; i++) {

					a = this._getComparatorValue(this.attr(i), comparator);
					b = this._getComparatorValue(this.attr(iMin), comparator);

					// [1, 2, 3, 4(b), 9, 6, 3(a)]
					if (comparatorFn.call(this, a, b) < 0) {
						isSorted = false;
						iMin = i;
					}

					// [1, 2, 3, 4, 8(b), 12, 49, 9(c), 6(a), 3]
					// While iterating over the unprocessed items in search
					// of a "min", attempt to find two neighboring values
					// that are improperly sorted.
					// Note: This is not part of the original selection
					// sort agortithm
					if (c && comparatorFn.call(this, a, c) < 0) {
						isSorted = false;
					}

					c = a;
				}

				if (isSorted) {
					break;
				}

				if (iMin !== j) {
					this._swapItems(iMin, j, silent);
				}
			}


			if (! silent) {
				// Trigger length change so that {{#block}} helper can re-render
				can.trigger(this, 'length', [this.length]);
			}

			return this;
		},

		/**
		 * @hide
		 */
		_swapItems: function (oldIndex, newIndex, silent) {

			var temporaryItemReference = this[oldIndex];

			// Remove the item from the list
			[].splice.call(this, oldIndex, 1);

			// Place the item at the correct index
			[].splice.call(this, newIndex, 0, temporaryItemReference);

			if (! silent) {
				// Update the DOM via can.view.live.list
				can.trigger(this, 'move', [
					temporaryItemReference,
					newIndex,
					oldIndex
				]);
			}
		}
		
	});
	// create push, unshift
	// converts to an array of arguments
	var getArgs = function (args) {
		return args[0] && can.isArray(args[0]) ? args[0] : can.makeArray(args);
	};
	can.each({
			/**
			 * @function push
			 * Add items to the end of the list.
			 *
			 *     var l = new can.List([]);
			 *
			 *     l.bind('change', function(
			 *         ev,        // the change event
			 *         attr,      // the attr that was changed, for multiple items, "*" is used
			 *         how,       // "add"
			 *         newVals,   // an array of new values pushed
			 *         oldVals,   // undefined
			 *         where      // the location where these items where added
			 *         ) {
			 *
			 *     })
			 *
			 *     l.push('0','1','2');
			 *
			 * @param {...*} [...items] items to add to the end of the list.
			 * @return {Number} the number of items in the array
			 */
			push: "length",
			/**
			 * @function unshift
			 * Add items to the start of the list.  This is very similar to
			 * [can.List::push].  Example:
			 *
			 *     var l = new can.List(["a","b"]);
			 *     l.unshift(1,2,3) //-> 5
			 *     l.attr() //-> [1,2,3,"a","b"]
			 *
			 * @param {...*} [...items] items to add to the start of the list.
			 * @return {Number} the length of the array.
			 */
			unshift: 0
		},
		// adds a method where
		// @param where items in the array should be added
		// @param name method name
		function (where, name) {
			var proto = can.List.prototype,
				old = proto[name];
			proto[name] = function () {

				if (this.comparator && arguments.length) {
					// get the items being added
					var args = getArgs(arguments);
					var i = args.length;

					while (i--) {
						// Go through and convert anything to an `map` that needs
						// to be converted.
						var val = can.bubble.set(this, i, this.__type(args[i], i) );

						// Insert this item at the correct index
						var newIndex = this._getInsertIndex(val);
						Array.prototype.splice.apply(this, [newIndex, 0, val]);

						this._triggerChange('' + newIndex, 'add', [val], undefined);
					}

					can.batch.trigger(this, 'reset', [args]);

					return this;
				} else {
					// call the original method
					return old.apply(this, arguments);
				}



			};
		});

	// Overwrite .splice so that items added to the list (no matter what the
	// defined index) are inserted at the correct index, while preserving the
	// ability to remove items from a list.
	(function () {
		var proto = can.List.prototype;
		var oldSplice = proto.splice;

		proto.splice = function (index, howMany) {

			var args = can.makeArray(arguments),
				newElements =[],
				i, len;

			// Don't use this "sort" oriented splice unless this list has a
			// comparator
			if (! this.comparator) {
				return oldSplice.apply(this, args);
			}

			// Get the list of new items intended to be added to the list
			for (i = 2, len = args.length; i < len; i++) {
				args[i] = this.__type(args[i], i);
				newElements.push(args[i]);
			}

			// Remove items using the original splice method
			oldSplice.call(this, index, howMany);

			// Add items by way of push so that they're sorted into
			// the correct position
			proto.push.apply(this, newElements);
		};
	})();


	return can.Map;
});

