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
/*can@2.2.6#map/validations/validations*/
define('can/map/validations/validations', [
    'can/util/util',
    'can/map/map'
], function (can) {
    var validate = function (attrNames, options, proc) {
        if (!proc) {
            proc = options;
            options = {};
        }
        options = options || {};
        attrNames = typeof attrNames === 'string' ? [attrNames] : can.makeArray(attrNames);
        if (options.testIf && !options.testIf.call(this)) {
            return;
        }
        var self = this;
        can.each(attrNames, function (attrName) {
            if (!self.validations[attrName]) {
                self.validations[attrName] = [];
            }
            self.validations[attrName].push(function (newVal) {
                var res = proc.call(this, newVal, attrName);
                return res === undefined ? undefined : options.message || res;
            });
        });
    };
    var old = can.Map.prototype.__set;
    can.Map.prototype.__set = function (prop, value, current, success, error) {
        var self = this, validations = self.constructor.validations, errorCallback = function (errors) {
                var stub = error && error.call(self, errors);
                if (stub !== false) {
                    can.trigger(self, 'error', [
                        prop,
                        errors
                    ], true);
                }
                return false;
            };
        old.call(self, prop, value, current, success, errorCallback);
        if (validations && validations[prop]) {
            var errors = self.errors(prop);
            if (errors) {
                errorCallback(errors);
            }
        }
        return this;
    };
    can.each([
        can.Map,
        can.Model
    ], function (clss) {
        if (clss === undefined) {
            return;
        }
        var oldSetup = clss.setup;
        can.extend(clss, {
            setup: function (superClass) {
                oldSetup.apply(this, arguments);
                if (!this.validations || superClass.validations === this.validations) {
                    this.validations = {};
                }
            },
            validate: validate,
            validationMessages: {
                format: 'is invalid',
                inclusion: 'is not a valid option (perhaps out of range)',
                lengthShort: 'is too short',
                lengthLong: 'is too long',
                presence: 'can\'t be empty',
                range: 'is out of range',
                numericality: 'must be a number'
            },
            validateFormatOf: function (attrNames, regexp, options) {
                validate.call(this, attrNames, options, function (value) {
                    if (typeof value !== 'undefined' && value !== null && value !== '' && String(value).match(regexp) === null) {
                        return this.constructor.validationMessages.format;
                    }
                });
            },
            validateInclusionOf: function (attrNames, inArray, options) {
                validate.call(this, attrNames, options, function (value) {
                    if (typeof value === 'undefined') {
                        return;
                    }
                    for (var i = 0; i < inArray.length; i++) {
                        if (inArray[i] === value) {
                            return;
                        }
                    }
                    return this.constructor.validationMessages.inclusion;
                });
            },
            validateLengthOf: function (attrNames, min, max, options) {
                validate.call(this, attrNames, options, function (value) {
                    if ((typeof value === 'undefined' || value === null) && min > 0 || typeof value !== 'undefined' && value !== null && value.length < min) {
                        return this.constructor.validationMessages.lengthShort + ' (min=' + min + ')';
                    } else if (typeof value !== 'undefined' && value !== null && value.length > max) {
                        return this.constructor.validationMessages.lengthLong + ' (max=' + max + ')';
                    }
                });
            },
            validatePresenceOf: function (attrNames, options) {
                validate.call(this, attrNames, options, function (value) {
                    if (typeof value === 'undefined' || value === '' || value === null) {
                        return this.constructor.validationMessages.presence;
                    }
                });
            },
            validateRangeOf: function (attrNames, low, hi, options) {
                validate.call(this, attrNames, options, function (value) {
                    if ((typeof value === 'undefined' || value === null) && low > 0 || typeof value !== 'undefined' && value !== null && (value < low || value > hi)) {
                        return this.constructor.validationMessages.range + ' [' + low + ',' + hi + ']';
                    }
                });
            },
            validatesNumericalityOf: function (attrNames) {
                validate.call(this, attrNames, function (value) {
                    var res = !isNaN(parseFloat(value)) && isFinite(value);
                    if (!res) {
                        return this.constructor.validationMessages.numericality;
                    }
                });
            }
        });
    });
    can.extend(can.Map.prototype, {
        errors: function (attrs, newVal) {
            if (attrs) {
                attrs = can.isArray(attrs) ? attrs : [attrs];
            }
            var errors = {}, self = this, addErrors = function (attr, funcs) {
                    can.each(funcs, function (func) {
                        var res = func.call(self, isTest ? self.__convert ? self.__convert(attr, newVal) : newVal : self.attr(attr));
                        if (res) {
                            if (!errors[attr]) {
                                errors[attr] = [];
                            }
                            errors[attr].push(res);
                        }
                    });
                }, validations = this.constructor.validations || {}, isTest = attrs && attrs.length === 1 && arguments.length === 2;
            can.each(attrs || validations, function (funcs, attr) {
                if (typeof attr === 'number') {
                    attr = funcs;
                    funcs = validations[attr];
                }
                addErrors(attr, funcs || []);
            });
            return can.isEmptyObject(errors) ? null : isTest ? errors[attrs[0]] : errors;
        }
    });
    return can.Map;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
