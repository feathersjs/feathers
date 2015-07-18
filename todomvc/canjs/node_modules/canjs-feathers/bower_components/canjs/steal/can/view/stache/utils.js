/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/stache/utils*/
steal("can/util", function(){
	return {
		// Returns if something looks like an array.  This works for can.List
		isArrayLike: function (obj) {
			return obj && obj.splice && typeof obj.length === 'number';
		},
		// Returns if something is an observe.  This works for can.route
		isObserveLike: function (obj) {
			return obj instanceof can.Map || (obj && !! obj._get);
		},
		// A generic empty function
		emptyHandler: function(){},
		// Converts a string like "1" into 1. "null" into null, etc.
		// This doesn't have to do full JSON, so removing eval would be good.
		jsonParse: function(str){
			// if it starts with a quote, assume a string.
			if(str[0] === "'") {
				return str.substr(1, str.length -2);
			} else if(str === "undefined") {
				return undefined;
			} else if(can.global.JSON) {
				return JSON.parse(str);
			} else {
				return eval("("+str+")");
			}
		},
		mixins: {
			last: function(){
				return this.stack[this.stack.length - 1];
			},
			add: function(chars){
				this.last().add(chars);
			},
			subSectionDepth: function(){
				return this.stack.length - 1;
			}
		}
	};
});

