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
/*can@2.2.6#map/list/list*/
define('can/map/list/list', [
    'can/util/util',
    'can/map/map',
    'can/list/list',
    'can/compute/compute'
], function (can) {
    can.extend(can.List.prototype, {
        filter: function (callback) {
            var filtered = new this.constructor();
            var self = this;
            var generator = function (element, index) {
                var binder = function (ev, val) {
                    var index = filtered.indexOf(element);
                    if (!val && index !== -1) {
                        filtered.splice(index, 1);
                    }
                    if (val && index === -1) {
                        filtered.push(element);
                    }
                };
                var compute = can.compute(function () {
                        return callback(element, self.indexOf(element), self);
                    });
                compute.bind('change', binder);
                binder(null, compute());
            };
            this.bind('add', function (ev, data, index) {
                can.each(data, function (element, i) {
                    generator(element, index + i);
                });
            });
            this.bind('remove', function (ev, data, index) {
                can.each(data, function (element, i) {
                    var index = filtered.indexOf(element);
                    if (index !== -1) {
                        filtered.splice(index, 1);
                    }
                });
            });
            this.forEach(generator);
            return filtered;
        },
        map: function (callback) {
            var mapped = new can.List();
            var self = this;
            var generator = function (element, index) {
                var compute = can.compute(function () {
                        return callback(element, index, self);
                    });
                compute.bind('change', function (ev, val) {
                    mapped.splice(index, 1, val);
                });
                mapped.splice(index, 0, compute());
            };
            this.forEach(generator);
            this.bind('add', function (ev, data, index) {
                can.each(data, function (element, i) {
                    generator(element, index + i);
                });
            });
            this.bind('remove', function (ev, data, index) {
                mapped.splice(index, data.length);
            });
            return mapped;
        }
    });
    return can.List;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
