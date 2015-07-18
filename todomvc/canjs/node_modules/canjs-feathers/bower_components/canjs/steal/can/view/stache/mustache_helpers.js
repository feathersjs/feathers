/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/stache/mustache_helpers*/
steal("can/util", "./utils.js","can/view/live",function(can, utils, live){
	live = live || can.view.live;
	
	var resolve = function (value) {
		if (utils.isObserveLike(value) && utils.isArrayLike(value) && value.attr('length')) {
			return value;
		} else if (can.isFunction(value)) {
			return value();
		} else {
			return value;
		}
	};
	
	var helpers = {
		"each": function(items, options){
			
			var resolved = resolve(items),
				result = [],
				keys,
				key,
				i;
			
			if( resolved instanceof can.List ) {
				return function(el){
					// make a child nodeList inside the can.view.live.html nodeList
					// so that if the html is re
					var nodeList = [el];
					nodeList.expression = "live.list";
					can.view.nodeLists.register(nodeList, null, options.nodeList);
					can.view.nodeLists.update(options.nodeList, [el]);
					
					var cb = function (item, index, parentNodeList) {
								
						return options.fn(options.scope.add({
								"@index": index
							}).add(item), options.options, parentNodeList);
							
					};
					live.list(el, items, cb, options.context, el.parentNode, nodeList);
				};
			}
			
			var expr = resolved;

			if ( !! expr && utils.isArrayLike(expr)) {
				for (i = 0; i < expr.length; i++) {
					result.push(options.fn(options.scope.add({
							"@index": i
						})
						.add(expr[i])));
				}
			} else if (utils.isObserveLike(expr)) {
				keys = can.Map.keys(expr);
				// listen to keys changing so we can livebind lists of attributes.

				for (i = 0; i < keys.length; i++) {
					key = keys[i];
					result.push(options.fn(options.scope.add({
							"@key": key
						})
						.add(expr[key])));
				}
			} else if (expr instanceof Object) {
				for (key in expr) {
					result.push(options.fn(options.scope.add({
							"@key": key
						})
						.add(expr[key])));
				}
				
			}
			return result;
			
		},
		"@index": function(offset, options) {
			if (!options) {
				options = offset;
				offset = 0;
			}
			var index = options.scope.attr("@index");
			return ""+((can.isFunction(index) ? index() : index) + offset);
		},
		'if': function (expr, options) {
			var value;
			// if it's a function, wrap its value in a compute
			// that will only change values from true to false
			if (can.isFunction(expr)) {
				value = can.compute.truthy(expr)();
			} else {
				value = !! resolve(expr);
			}

			if (value) {
				return options.fn(options.scope || this);
			} else {
				return options.inverse(options.scope || this);
			}
		},
		'is': function() {
			var lastValue, curValue,
				options = arguments[arguments.length - 1];

			if (arguments.length - 2 <= 0) {
				return options.inverse();
			}

			for (var i = 0; i < arguments.length - 1; i++) {
				curValue = resolve(arguments[i]);
				curValue = can.isFunction(curValue) ? curValue() : curValue;

				if (i > 0) {
					if (curValue !== lastValue) {
						return options.inverse();
					}
				}
				lastValue = curValue;
			}

			return options.fn();
		},
		'eq': function() {
			return helpers.is.apply(this, arguments);
		},
		'unless': function (expr, options) {
			return helpers['if'].apply(this, [can.isFunction(expr) ? can.compute(function() { return !expr(); }) : !expr, options]);
		},
		'with': function (expr, options) {
			var ctx = expr;
			expr = resolve(expr);
			if ( !! expr) {
				return options.fn(ctx);
			}
		},
		'log': function (expr, options) {
			if (typeof console !== "undefined" && console.log) {
				if (!options) {
					console.log(expr.context);
				} else {
					console.log(expr, options.context);
				}
			}
		},
		'data': function(attr){
			// options will either be the second or third argument.
			// Get the argument before that.
			var data = arguments.length === 2 ? this : arguments[1];
			return function(el){
				
				can.data( can.$(el), attr, data || this.context );
			};
		}
	};
	
	return {
		registerHelper: function(name, callback){
			helpers[name] = callback;
		},
		getHelper: function(name, options){
			var helper = options.attr("helpers." + name);
			if(!helper) {
				helper = helpers[name];
			}
			if(helper) {
				return {fn: helper};
			}
		}
	};
	
});

