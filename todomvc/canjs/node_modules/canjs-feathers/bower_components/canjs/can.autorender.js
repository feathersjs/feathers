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
/*can@2.2.6#view/autorender/autorender*/
'format steal';
define('can/view/autorender/autorender', ['can/util/util'], function (can) {
    var deferred = new can.Deferred(), ignoreAttributesRegExp = /^(dataViewId|class|id|type|src)$/i;
    var typeMatch = /\s*text\/(mustache|stache|ejs)\s*/;
    function isIn(element, type) {
        while (element.parentNode) {
            element = element.parentNode;
            if (element.nodeName.toLowerCase() === type.toLowerCase()) {
                return true;
            }
        }
    }
    function setAttr(el, attr, scope) {
        var camelized = can.camelize(attr);
        if (!ignoreAttributesRegExp.test(camelized)) {
            scope.attr(camelized, el.getAttribute(attr));
        }
    }
    function insertAfter(ref, element) {
        if (ref.nextSibling) {
            can.insertBefore(ref.parentNode, element, ref.nextSibling);
        } else {
            can.appendChild(ref.parentNode, element);
        }
    }
    function render(renderer, scope, el) {
        var frag = renderer(scope);
        if (isIn(el, 'head')) {
            can.appendChild(document.body, frag);
        } else if (el.nodeName.toLowerCase() === 'script') {
            insertAfter(el, frag);
        } else {
            insertAfter(el, frag);
            el.parentNode.removeChild(el);
        }
    }
    function setupScope(el) {
        var scope = can.viewModel(el);
        can.each(el.attributes || [], function (attr) {
            setAttr(el, attr.name, scope);
        });
        can.bind.call(el, 'attributes', function (ev) {
            setAttr(el, ev.attributeName, scope);
        });
        return scope;
    }
    function autoload() {
        var promises = [];
        can.each(can.$('[can-autorender]'), function (el, i) {
            el.style.display = 'none';
            var text = el.innerHTML || el.text, typeAttr = el.getAttribute('type'), typeInfo = typeAttr.match(typeMatch), type = typeInfo && typeInfo[1], typeModule = 'can/view/' + type;
            if (window.System || !(window.define && window.define.amd)) {
                typeModule += '/' + type;
            }
            promises.push(can['import'](typeModule).then(function (engine) {
                engine = can[type] || engine;
                if (engine.async) {
                    return engine.async(text).then(function (renderer) {
                        render(renderer, setupScope(el), el);
                    });
                } else {
                    var renderer = engine(text);
                    render(renderer, setupScope(el), el);
                }
            }));
        });
        can.when.apply(can, promises).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
    }
    if (document.readyState === 'complete') {
        autoload();
    } else {
        can.bind.call(window, 'load', autoload);
    }
    var promise = deferred.promise();
    can.autorender = function (success, error) {
        return promise.then(success, error);
    };
    return can.autorender;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
