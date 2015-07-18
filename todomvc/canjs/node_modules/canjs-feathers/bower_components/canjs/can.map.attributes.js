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
/*can@2.2.6#map/attributes/attributes*/
define('can/map/attributes/attributes', [
    'can/util/util',
    'can/map/map',
    'can/list/list'
], function (can, Map) {
    can.each([
        can.Map,
        can.Model
    ], function (clss) {
        if (clss === undefined) {
            return;
        }
        var isObject = function (obj) {
            return typeof obj === 'object' && obj !== null && obj;
        };
        can.extend(clss, {
            attributes: {},
            convert: {
                'date': function (str) {
                    var type = typeof str;
                    if (type === 'string') {
                        str = Date.parse(str);
                        return isNaN(str) ? null : new Date(str);
                    } else if (type === 'number') {
                        return new Date(str);
                    } else {
                        return str;
                    }
                },
                'number': function (val) {
                    return parseFloat(val);
                },
                'boolean': function (val) {
                    if (val === 'false' || val === '0' || !val) {
                        return false;
                    }
                    return true;
                },
                'default': function (val, oldVal, error, type) {
                    if (can.Map.prototype.isPrototypeOf(type.prototype) && typeof type.model === 'function' && typeof type.models === 'function') {
                        return type[can.isArray(val) ? 'models' : 'model'](val);
                    }
                    if (can.Map.prototype.isPrototypeOf(type.prototype)) {
                        if (can.isArray(val) && typeof type.List === 'function') {
                            return new type.List(val);
                        }
                        return new type(val);
                    }
                    if (typeof type === 'function') {
                        return type(val, oldVal);
                    }
                    var construct = can.getObject(type), context = window, realType;
                    if (type.indexOf('.') >= 0) {
                        realType = type.substring(0, type.lastIndexOf('.'));
                        context = can.getObject(realType);
                    }
                    return typeof construct === 'function' ? construct.call(context, val, oldVal) : val;
                }
            },
            serialize: {
                'default': function (val, type) {
                    return isObject(val) && val.serialize ? val.serialize() : val;
                },
                'date': function (val) {
                    return val && val.getTime();
                }
            }
        });
        var oldSetup = clss.setup;
        clss.setup = function (superClass, stat, proto) {
            var self = this;
            oldSetup.call(self, superClass, stat, proto);
            can.each(['attributes'], function (name) {
                if (!self[name] || superClass[name] === self[name]) {
                    self[name] = {};
                }
            });
            can.each([
                'convert',
                'serialize'
            ], function (name) {
                if (superClass[name] !== self[name]) {
                    self[name] = can.extend({}, superClass[name], self[name]);
                }
            });
        };
    });
    can.Map.prototype.__convert = function (prop, value) {
        var Class = this.constructor, oldVal = this.__get(prop), type, converter;
        if (Class.attributes) {
            type = Class.attributes[prop];
            converter = Class.convert[type] || Class.convert['default'];
        }
        return value === null || !type ? value : converter.call(Class, value, oldVal, function () {
        }, type);
    };
    var oldSerialize = can.Map.helpers._serialize;
    can.Map.helpers._serialize = function (map, name, val) {
        var constructor = map.constructor, type = constructor.attributes ? constructor.attributes[name] : 0, converter = constructor.serialize ? constructor.serialize[type] : 0;
        return val && typeof val.serialize === 'function' ? oldSerialize.apply(this, arguments) : converter ? converter(val, type) : oldSerialize.apply(this, arguments);
    };
    var mapSerialize = can.Map.prototype.serialize;
    can.Map.prototype.serialize = function (attrName) {
        var baseResult = mapSerialize.apply(this, arguments);
        if (attrName) {
            return baseResult[attrName];
        } else {
            return baseResult;
        }
    };
    return can.Map;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
