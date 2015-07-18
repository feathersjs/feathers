/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#map/lazy/nested_reference*/
steal('can/util', function (can) {

	// iterates through `propPath`
	// and calls `callback` with current object and path part
	var pathIterator = function (root, propPath, callback) {
		var props = propPath.split("."),
			cur = root,
			part;
		while (part = props.shift()) {
			cur = cur[part];
			if (callback) {
				callback(cur, part);
			}
		}
		return cur;
	};

	// has `array` and `item` props, toString() returns item's index in `array`
	var ArrIndex = function (array) {
		this.array = array;
	};
	ArrIndex.prototype.toString = function () {
		return "" + can.inArray(this.item, this.array);
	};

	// `root` points to actual data
	// `references` keeps path functions to certain nodes within `root`
	var NestedReference = function (root) {
		this.root = root;
		this.references = [];
	};

	NestedReference.ArrIndex = ArrIndex;

	can.extend(NestedReference.prototype, {

		// pushes path func to `references`
		make: function (propPath) {
			var path = [], // holds path elements
				arrIndex;

			if (can.isArray(this.root) || this.root instanceof can.LazyList) {
				arrIndex = new ArrIndex(this.root);
			}

			// iter through `propPath` and keep path elements in `path`
			pathIterator(this.root, propPath, function (item, prop) {
				if (arrIndex) {
					arrIndex.item = item;
					path.push(arrIndex);
					arrIndex = undefined;
				} else {
					path.push(prop);
					if (can.isArray(item)) {
						arrIndex = new ArrIndex(item);
					}
				}
			});

			// finally push path func to references and return
			var pathFunc = function () {
				return path.join(".");
			};

			this.references.push(pathFunc);
			return pathFunc;
		},

		// removes all references that starts with `path`
		// calls `callback` with object on the current path and path itself
		removeChildren: function (path, callback) {
			var i = 0;
			while (i < this.references.length) {
				var reference = this.references[i]();
				if (reference.indexOf(path) === 0) {
					callback(this.get(reference), reference);
					this.references.splice(i, 1);
				} else {
					i++;
				}
			}
		},

		// returns node on the `path`
		get: function (path) {
			return pathIterator(this.root, path);
		},

		// iterates through references and calls `callback`
		// with actual object, path func and path
		each: function (callback) {
			var self = this;
			can.each(this.references, function (ref) {
				var path = ref();
				callback(self.get(path), ref, path);
			});
		}

	});

	// expose
	can.NestedReference = NestedReference;
});

