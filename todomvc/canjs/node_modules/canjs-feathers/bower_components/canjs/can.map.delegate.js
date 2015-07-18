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
/*can@2.2.6#map/delegate/delegate*/
define('can/map/delegate/delegate', [
    'can/util/util',
    'can/map/map'
], function (can) {
    var delegateMatches = function (parts, props) {
            var len = parts.length, i = 0, matchedProps = [], prop;
            for (i; i < len; i++) {
                prop = props[i];
                if (typeof prop !== 'string') {
                    return null;
                } else if (parts[i] === '**') {
                    return props.join('.');
                } else if (parts[i] === '*') {
                    matchedProps.push(prop);
                } else if (prop === parts[i]) {
                    matchedProps.push(prop);
                } else {
                    return null;
                }
            }
            return matchedProps.join('.');
        }, delegateHandler = function (event, prop, how, newVal, oldVal) {
            var props = prop.split('.'), delegates = (this._observe_delegates || []).slice(0), delegate, attr, matchedAttr, hasMatch, valuesEqual;
            event.attr = prop;
            event.lastAttr = props[props.length - 1];
            for (var i = 0; delegate = delegates[i++];) {
                if (event.batchNum && delegate.batchNum === event.batchNum || delegate.undelegated) {
                    continue;
                }
                hasMatch = undefined;
                valuesEqual = true;
                for (var a = 0; a < delegate.attrs.length; a++) {
                    attr = delegate.attrs[a];
                    matchedAttr = delegateMatches(attr.parts, props);
                    if (matchedAttr) {
                        hasMatch = matchedAttr;
                    }
                    if (attr.value && valuesEqual) {
                        valuesEqual = attr.value === '' + this.attr(attr.attr);
                    } else if (valuesEqual && delegate.attrs.length > 1) {
                        valuesEqual = this.attr(attr.attr) !== undefined;
                    }
                }
                if (hasMatch && valuesEqual) {
                    var from = prop.replace(hasMatch + '.', '');
                    if (event.batchNum) {
                        delegate.batchNum = event.batchNum;
                    }
                    if (delegate.event === 'change') {
                        prop = from;
                        event.curAttr = hasMatch;
                        delegate.callback.apply(this.attr(hasMatch), can.makeArray(arguments));
                    } else if (delegate.event === how) {
                        delegate.callback.apply(this.attr(hasMatch), [
                            event,
                            newVal,
                            oldVal,
                            from
                        ]);
                    } else if (delegate.event === 'set' && how === 'add') {
                        delegate.callback.apply(this.attr(hasMatch), [
                            event,
                            newVal,
                            oldVal,
                            from
                        ]);
                    }
                }
            }
        };
    can.extend(can.Map.prototype, {
        delegate: function (selector, event, handler) {
            selector = can.trim(selector);
            var delegates = this._observe_delegates || (this._observe_delegates = []), attrs = [], selectorRegex = /([^\s=,]+)(?:=("[^",]*"|'[^',]*'|[^\s"',]*))?(,?)\s*/g, matches;
            while ((matches = selectorRegex.exec(selector)) !== null) {
                if (matches[2] && can.inArray(matches[2].substr(0, 1), [
                        '"',
                        '\''
                    ]) >= 0) {
                    matches[2] = matches[2].substr(1, -1);
                }
                attrs.push({
                    attr: matches[1],
                    parts: matches[1].split('.'),
                    value: matches[2],
                    or: matches[3] === ','
                });
            }
            delegates.push({
                selector: selector,
                attrs: attrs,
                callback: handler,
                event: event
            });
            if (delegates.length === 1) {
                this.bind('change', delegateHandler);
            }
            return this;
        },
        undelegate: function (selector, event, handler) {
            selector = selector && can.trim(selector);
            var i = 0, delegates = this._observe_delegates || [], delegateOb;
            if (selector) {
                while (i < delegates.length) {
                    delegateOb = delegates[i];
                    if (delegateOb.callback === handler || !handler && delegateOb.selector === selector) {
                        delegateOb.undelegated = true;
                        delegates.splice(i, 1);
                    } else {
                        i++;
                    }
                }
            } else {
                delegates = [];
            }
            if (!delegates.length) {
                this.unbind('change', delegateHandler);
            }
            return this;
        }
    });
    can.Map.prototype.delegate.matches = delegateMatches;
    return can.Map;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
