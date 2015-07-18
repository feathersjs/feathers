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
/*can@2.2.6#view/modifiers/modifiers*/
define('can/view/modifiers/modifiers', [
    'dist/jquery',
    'can/util/util',
    'can/view/view'
], function ($, can) {
    $ = $ || window.$;
    var convert, modify, isTemplate, isHTML, isDOM, getCallback, noHookup = {
            'val': true,
            'text': true
        };
    convert = function (func_name) {
        var old = $.fn[func_name];
        $.fn[func_name] = function () {
            var args = can.makeArray(arguments), callbackNum, callback, self = this, result;
            if (can.isDeferred(args[0])) {
                args[0].done(function (res) {
                    modify.call(self, [res], old);
                });
                return this;
            } else if (isTemplate(args)) {
                if (callbackNum = getCallback(args)) {
                    callback = args[callbackNum];
                    args[callbackNum] = function (result) {
                        modify.call(self, [result], old);
                        callback.call(self, result);
                    };
                    can.view.apply(can.view, args);
                    return this;
                }
                result = can.view.apply(can.view, args);
                if (!can.isDeferred(result)) {
                    args = [result];
                } else {
                    result.done(function (res) {
                        modify.call(self, [res], old);
                    });
                    return this;
                }
            }
            return noHookup[func_name] ? old.apply(this, args) : modify.call(this, args, old);
        };
    };
    modify = function (args, old) {
        var res;
        for (var hasHookups in can.view.hookups) {
            break;
        }
        if (hasHookups && args[0] && isHTML(args[0])) {
            args[0] = can.view.frag(args[0]).childNodes;
        }
        res = old.apply(this, args);
        return res;
    };
    isTemplate = function (args) {
        var secArgType = typeof args[1];
        return typeof args[0] === 'string' && (secArgType === 'object' || secArgType === 'function') && !isDOM(args[1]);
    };
    isDOM = function (arg) {
        return arg.nodeType || arg[0] && arg[0].nodeType;
    };
    isHTML = function (arg) {
        if (isDOM(arg)) {
            return true;
        } else if (typeof arg === 'string') {
            arg = can.trim(arg);
            return arg.substr(0, 1) === '<' && arg.substr(arg.length - 1, 1) === '>' && arg.length >= 3;
        } else {
            return false;
        }
    };
    getCallback = function (args) {
        return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
    };
    $.fn.hookup = function () {
        can.view.frag(this);
        return this;
    };
    can.each([
        'prepend',
        'append',
        'after',
        'before',
        'text',
        'html',
        'replaceWith',
        'val'
    ], function (func) {
        convert(func);
    });
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
