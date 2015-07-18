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
/*can@2.2.6#view/ejs/ejs*/
define('can/view/ejs/ejs', [
    'can/util/util',
    'can/view/view',
    'can/util/string/string',
    'can/compute/compute',
    'can/view/scanner',
    'can/view/render'
], function (can) {
    var extend = can.extend, EJS = function (options) {
            if (this.constructor !== EJS) {
                var ejs = new EJS(options);
                return function (data, helpers) {
                    return ejs.render(data, helpers);
                };
            }
            if (typeof options === 'function') {
                this.template = { fn: options };
                return;
            }
            extend(this, options);
            this.template = this.scanner.scan(this.text, this.name);
        };
    can.EJS = EJS;
    EJS.prototype.render = function (object, extraHelpers) {
        object = object || {};
        return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
    };
    extend(EJS.prototype, {
        scanner: new can.view.Scanner({
            text: {
                outStart: 'with(_VIEW) { with (_CONTEXT) {',
                outEnd: '}}',
                argNames: '_CONTEXT,_VIEW',
                context: 'this'
            },
            tokens: [
                [
                    'templateLeft',
                    '<%%'
                ],
                [
                    'templateRight',
                    '%>'
                ],
                [
                    'returnLeft',
                    '<%=='
                ],
                [
                    'escapeLeft',
                    '<%='
                ],
                [
                    'commentLeft',
                    '<%#'
                ],
                [
                    'left',
                    '<%'
                ],
                [
                    'right',
                    '%>'
                ],
                [
                    'returnRight',
                    '%>'
                ]
            ],
            helpers: [{
                    name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                    fn: function (content) {
                        var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/, parts = content.match(quickFunc);
                        return 'can.proxy(function(__){var ' + parts[1] + '=can.$(__);' + parts[2] + '}, this);';
                    }
                }],
            transform: function (source) {
                return source.replace(/<%([\s\S]+?)%>/gm, function (whole, part) {
                    var brackets = [], foundBracketPair, i;
                    part.replace(/[{}]/gm, function (bracket, offset) {
                        brackets.push([
                            bracket,
                            offset
                        ]);
                    });
                    do {
                        foundBracketPair = false;
                        for (i = brackets.length - 2; i >= 0; i--) {
                            if (brackets[i][0] === '{' && brackets[i + 1][0] === '}') {
                                brackets.splice(i, 2);
                                foundBracketPair = true;
                                break;
                            }
                        }
                    } while (foundBracketPair);
                    if (brackets.length >= 2) {
                        var result = ['<%'], bracket, last = 0;
                        for (i = 0; bracket = brackets[i]; i++) {
                            result.push(part.substring(last, last = bracket[1]));
                            if (bracket[0] === '{' && i < brackets.length - 1 || bracket[0] === '}' && i > 0) {
                                result.push(bracket[0] === '{' ? '{ %><% ' : ' %><% }');
                            } else {
                                result.push(bracket[0]);
                            }
                            ++last;
                        }
                        result.push(part.substring(last), '%>');
                        return result.join('');
                    } else {
                        return '<%' + part + '%>';
                    }
                });
            }
        })
    });
    EJS.Helpers = function (data, extras) {
        this._data = data;
        this._extras = extras;
        extend(this, extras);
    };
    EJS.Helpers.prototype = {
        list: function (list, cb) {
            can.each(list, function (item, i) {
                cb(item, i, list);
            });
        },
        each: function (list, cb) {
            if (can.isArray(list)) {
                this.list(list, cb);
            } else {
                can.view.lists(list, cb);
            }
        }
    };
    can.view.register({
        suffix: 'ejs',
        script: function (id, src) {
            return 'can.EJS(function(_CONTEXT,_VIEW) { ' + new EJS({
                text: src,
                name: id
            }).template.out + ' })';
        },
        renderer: function (id, text) {
            return EJS({
                text: text,
                name: id
            });
        }
    });
    can.ejs.Helpers = EJS.Helpers;
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
