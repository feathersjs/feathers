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
/*can@2.2.6#construct/proxy/proxy*/
define('can/construct/proxy/proxy', [
    'can/util/util',
    'can/construct/construct'
], function (can, Construct) {
    var isFunction = can.isFunction, isArray = can.isArray, makeArray = can.makeArray, proxy = function (funcs) {
            var args = makeArray(arguments), self;
            funcs = args.shift();
            if (!isArray(funcs)) {
                funcs = [funcs];
            }
            self = this;
            return function class_cb() {
                var cur = args.concat(makeArray(arguments)), isString, length = funcs.length, f = 0, func;
                for (; f < length; f++) {
                    func = funcs[f];
                    if (!func) {
                        continue;
                    }
                    isString = typeof func === 'string';
                    cur = (isString ? self[func] : func).apply(self, cur || []);
                    if (f < length - 1) {
                        cur = !isArray(cur) || cur._use_call ? [cur] : cur;
                    }
                }
                return cur;
            };
        };
    can.Construct.proxy = can.Construct.prototype.proxy = proxy;
    var correctedClasses = [
            can.Map,
            can.Control,
            can.Model
        ], i = 0;
    for (; i < correctedClasses.length; i++) {
        if (correctedClasses[i]) {
            correctedClasses[i].proxy = proxy;
        }
    }
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
