/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*[global-shim-start]*/
(function (exports, global){
	var origDefine = global.define;

	var get = function(name){
		var parts = name.split("."),
			cur = global,
			i;
		for(i = 0 ; i < parts.length; i++){
			if(!cur) {
				break;
			}
			cur = cur[parts[i]];
		}
		return cur;
	};
	var modules = (global.define && global.define.modules) ||
		(global._define && global._define.modules) || {};
	var ourDefine = global.define = function(moduleName, deps, callback){
		var module;
		if(typeof deps === "function") {
			callback = deps;
			deps = [];
		}
		var args = [],
			i;
		for(i =0; i < deps.length; i++) {
			args.push( exports[deps[i]] ? get(exports[deps[i]]) : ( modules[deps[i]] || get(deps[i]) )  );
		}
		// CJS has no dependencies but 3 callback arguments
		if(!deps.length && callback.length) {
			module = { exports: {} };
			var require = function(name) {
				return exports[name] ? get(exports[name]) : modules[name];
			};
			args.push(require, module.exports, module);
		}
		// Babel uses only the exports objet
		else if(!args[0] && deps[0] === "exports") {
			module = { exports: {} };
			args[0] = module.exports;
		}

		global.define = origDefine;
		var result = callback ? callback.apply(null, args) : undefined;
		global.define = ourDefine;

		// Favor CJS module.exports over the return value
		modules[moduleName] = module && module.exports ? module.exports : result;
	};
	global.define.orig = origDefine;
	global.define.modules = modules;
	global.define.amd = true;
	global.System = {
		define: function(__name, __code){
			global.define = origDefine;
			eval("(function() { " + __code + " \n }).call(global);");
			global.define = ourDefine;
		}
	};
})({},window)
/*can@2.2.6#util/array/makeArray*/
define('can/util/array/makeArray', ['can/util/array/each'], function (can) {
    can.makeArray = function (arr) {
        var ret = [];
        can.each(arr, function (a, i) {
            ret[i] = a;
        });
        return ret;
    };
    return can;
});
/*can@2.2.6#util/domless/domless*/
define('can/util/domless/domless', [
    'can/util/can',
    'can/util/attr/attr',
    'can/util/array/each',
    'can/util/array/makeArray'
], function (can, attr) {
    var core_trim = String.prototype.trim;
    var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
    function likeArray(obj) {
        return typeof obj.length === 'number';
    }
    function flatten(array) {
        return array.length > 0 ? Array.prototype.concat.apply([], array) : array;
    }
    can.isArray = function (arr) {
        return arr instanceof Array;
    };
    can.isFunction = function () {
        if (typeof document !== 'undefined' && typeof document.getElementsByTagName('body') === 'function') {
            return function (value) {
                return Object.prototype.toString.call(value) === '[object Function]';
            };
        } else {
            return function (value) {
                return typeof value === 'function';
            };
        }
    }();
    can.trim = core_trim && !core_trim.call('\uFEFF\xA0') ? function (text) {
        return text == null ? '' : core_trim.call(text);
    } : function (text) {
        return text == null ? '' : (text + '').replace(rtrim, '');
    };
    can.extend = function () {
        var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }
        if (typeof target !== 'object' && !can.isFunction(target)) {
            target = {};
        }
        if (length === i) {
            target = this;
            --i;
        }
        for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
                for (name in options) {
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (can.isPlainObject(copy) || (copyIsArray = can.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && can.isArray(src) ? src : [];
                        } else {
                            clone = src && can.isPlainObject(src) ? src : {};
                        }
                        target[name] = can.extend(deep, clone, copy);
                    } else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    can.map = function (elements, callback) {
        var values = [], putValue = function (val, index) {
                var value = callback(val, index);
                if (value != null) {
                    values.push(value);
                }
            };
        if (likeArray(elements)) {
            for (var i = 0, l = elements.length; i < l; i++) {
                putValue(elements[i], i);
            }
        } else {
            for (var key in elements) {
                putValue(elements[key], key);
            }
        }
        return flatten(values);
    };
    can.proxy = function (cb, that) {
        return function () {
            return cb.apply(that, arguments);
        };
    };
    can.attr = attr;
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
