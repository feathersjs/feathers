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
/*can@2.2.6#util/can*/
define('can/util/can', [], function () {
    var glbl = typeof window !== 'undefined' ? window : global;
    var can = {};
    if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
        glbl.can = can;
    }
    can.global = glbl;
    can.k = function () {
    };
    can.isDeferred = can.isPromise = function (obj) {
        return obj && typeof obj.then === 'function' && typeof obj.pipe === 'function';
    };
    can.isMapLike = function (obj) {
        return can.Map && (obj instanceof can.Map || obj && obj.__get);
    };
    var cid = 0;
    can.cid = function (object, name) {
        if (!object._cid) {
            cid++;
            object._cid = (name || '') + cid;
        }
        return object._cid;
    };
    can.VERSION = '2.2.6';
    can.simpleExtend = function (d, s) {
        for (var prop in s) {
            d[prop] = s[prop];
        }
        return d;
    };
    can.last = function (arr) {
        return arr && arr[arr.length - 1];
    };
    var protoBind = Function.prototype.bind;
    if (protoBind) {
        can.proxy = function (fn, context) {
            return protoBind.call(fn, context);
        };
    } else {
        can.proxy = function (fn, context) {
            return function () {
                return fn.apply(context, arguments);
            };
        };
    }
    can.frag = function (item) {
        var frag;
        if (!item || typeof item === 'string') {
            frag = can.buildFragment(item == null ? '' : '' + item, document.body);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        } else if (item.nodeType === 11) {
            return item;
        } else if (typeof item.nodeType === 'number') {
            frag = document.createDocumentFragment();
            frag.appendChild(item);
            return frag;
        } else if (typeof item.length === 'number') {
            frag = document.createDocumentFragment();
            can.each(item, function (item) {
                frag.appendChild(can.frag(item));
            });
            return frag;
        } else {
            frag = can.buildFragment('' + item, document.body);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        }
    };
    can.scope = can.viewModel = function (el, attr, val) {
        el = can.$(el);
        var scope = can.data(el, 'scope') || can.data(el, 'viewModel');
        if (!scope) {
            scope = new can.Map();
            can.data(el, 'scope', scope);
            can.data(el, 'viewModel', scope);
        }
        switch (arguments.length) {
        case 0:
        case 1:
            return scope;
        case 2:
            return scope.attr(attr);
        default:
            scope.attr(attr, val);
            return el;
        }
    };
    can['import'] = function (moduleName) {
        var deferred = new can.Deferred();
        if (typeof window.System === 'object' && can.isFunction(window.System['import'])) {
            window.System['import'](moduleName).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
        } else if (window.define && window.define.amd) {
            window.require([moduleName], function (value) {
                deferred.resolve(value);
            });
        } else if (window.steal) {
            steal.steal(moduleName, function (value) {
                deferred.resolve(value);
            });
        } else if (window.require) {
            deferred.resolve(window.require(moduleName));
        } else {
            deferred.resolve();
        }
        return deferred.promise();
    };
    can.__observe = function () {
    };
    return can;
});
/*can@2.2.6#util/attr/attr*/
define('can/util/attr/attr', ['can/util/can'], function (can) {
    var setImmediate = can.global.setImmediate || function (cb) {
            return setTimeout(cb, 0);
        }, attr = {
            MutationObserver: can.global.MutationObserver || can.global.WebKitMutationObserver || can.global.MozMutationObserver,
            map: {
                'class': 'className',
                'value': 'value',
                'innertext': 'innerText',
                'textcontent': 'textContent',
                'checked': true,
                'disabled': true,
                'readonly': true,
                'required': true,
                src: function (el, val) {
                    if (val == null || val === '') {
                        el.removeAttribute('src');
                        return null;
                    } else {
                        el.setAttribute('src', val);
                        return val;
                    }
                },
                style: function (el, val) {
                    return el.style.cssText = val || '';
                }
            },
            defaultValue: [
                'input',
                'textarea'
            ],
            set: function (el, attrName, val) {
                attrName = attrName.toLowerCase();
                var oldValue;
                if (!attr.MutationObserver) {
                    oldValue = attr.get(el, attrName);
                }
                var tagName = el.nodeName.toString().toLowerCase(), prop = attr.map[attrName], newValue;
                if (typeof prop === 'function') {
                    newValue = prop(el, val);
                } else if (prop === true) {
                    newValue = el[attrName] = true;
                    if (attrName === 'checked' && el.type === 'radio') {
                        if (can.inArray(tagName, attr.defaultValue) >= 0) {
                            el.defaultChecked = true;
                        }
                    }
                } else if (prop) {
                    newValue = val;
                    if (el[prop] !== val) {
                        el[prop] = val;
                    }
                    if (prop === 'value' && can.inArray(tagName, attr.defaultValue) >= 0) {
                        el.defaultValue = val;
                    }
                } else {
                    el.setAttribute(attrName, val);
                    newValue = val;
                }
                if (!attr.MutationObserver && newValue !== oldValue) {
                    attr.trigger(el, attrName, oldValue);
                }
            },
            trigger: function (el, attrName, oldValue) {
                if (can.data(can.$(el), 'canHasAttributesBindings')) {
                    attrName = attrName.toLowerCase();
                    return setImmediate(function () {
                        can.trigger(el, {
                            type: 'attributes',
                            attributeName: attrName,
                            target: el,
                            oldValue: oldValue,
                            bubbles: false
                        }, []);
                    });
                }
            },
            get: function (el, attrName) {
                attrName = attrName.toLowerCase();
                var prop = attr.map[attrName];
                if (typeof prop === 'string' && el[prop]) {
                    return el[prop];
                }
                return el.getAttribute(attrName);
            },
            remove: function (el, attrName) {
                attrName = attrName.toLowerCase();
                var oldValue;
                if (!attr.MutationObserver) {
                    oldValue = attr.get(el, attrName);
                }
                var setter = attr.map[attrName];
                if (typeof setter === 'function') {
                    setter(el, undefined);
                }
                if (setter === true) {
                    el[attrName] = false;
                } else if (typeof setter === 'string') {
                    el[setter] = '';
                } else {
                    el.removeAttribute(attrName);
                }
                if (!attr.MutationObserver && oldValue != null) {
                    attr.trigger(el, attrName, oldValue);
                }
            },
            has: function () {
                var el = can.global.document && document.createElement('div');
                if (el && el.hasAttribute) {
                    return function (el, name) {
                        return el.hasAttribute(name);
                    };
                } else {
                    return function (el, name) {
                        return el.getAttribute(name) !== null;
                    };
                }
            }()
        };
    return attr;
});
/*can@2.2.6#event/event*/
define('can/event/event', ['can/util/can'], function (can) {
    can.addEvent = function (event, handler) {
        var allEvents = this.__bindEvents || (this.__bindEvents = {}), eventList = allEvents[event] || (allEvents[event] = []);
        eventList.push({
            handler: handler,
            name: event
        });
        return this;
    };
    can.listenTo = function (other, event, handler) {
        var idedEvents = this.__listenToEvents;
        if (!idedEvents) {
            idedEvents = this.__listenToEvents = {};
        }
        var otherId = can.cid(other);
        var othersEvents = idedEvents[otherId];
        if (!othersEvents) {
            othersEvents = idedEvents[otherId] = {
                obj: other,
                events: {}
            };
        }
        var eventsEvents = othersEvents.events[event];
        if (!eventsEvents) {
            eventsEvents = othersEvents.events[event] = [];
        }
        eventsEvents.push(handler);
        can.bind.call(other, event, handler);
    };
    can.stopListening = function (other, event, handler) {
        var idedEvents = this.__listenToEvents, iterIdedEvents = idedEvents, i = 0;
        if (!idedEvents) {
            return this;
        }
        if (other) {
            var othercid = can.cid(other);
            (iterIdedEvents = {})[othercid] = idedEvents[othercid];
            if (!idedEvents[othercid]) {
                return this;
            }
        }
        for (var cid in iterIdedEvents) {
            var othersEvents = iterIdedEvents[cid], eventsEvents;
            other = idedEvents[cid].obj;
            if (!event) {
                eventsEvents = othersEvents.events;
            } else {
                (eventsEvents = {})[event] = othersEvents.events[event];
            }
            for (var eventName in eventsEvents) {
                var handlers = eventsEvents[eventName] || [];
                i = 0;
                while (i < handlers.length) {
                    if (handler && handler === handlers[i] || !handler) {
                        can.unbind.call(other, eventName, handlers[i]);
                        handlers.splice(i, 1);
                    } else {
                        i++;
                    }
                }
                if (!handlers.length) {
                    delete othersEvents.events[eventName];
                }
            }
            if (can.isEmptyObject(othersEvents.events)) {
                delete idedEvents[cid];
            }
        }
        return this;
    };
    can.removeEvent = function (event, fn, __validate) {
        if (!this.__bindEvents) {
            return this;
        }
        var events = this.__bindEvents[event] || [], i = 0, ev, isFunction = typeof fn === 'function';
        while (i < events.length) {
            ev = events[i];
            if (__validate ? __validate(ev, event, fn) : isFunction && ev.handler === fn || !isFunction && (ev.cid === fn || !fn)) {
                events.splice(i, 1);
            } else {
                i++;
            }
        }
        return this;
    };
    can.dispatch = function (event, args) {
        var events = this.__bindEvents;
        if (!events) {
            return;
        }
        if (typeof event === 'string') {
            event = { type: event };
        }
        var eventName = event.type, handlers = (events[eventName] || []).slice(0), passed = [event];
        if (args) {
            passed.push.apply(passed, args);
        }
        for (var i = 0, len = handlers.length; i < len; i++) {
            handlers[i].handler.apply(this, passed);
        }
        return event;
    };
    can.one = function (event, handler) {
        var one = function () {
            can.unbind.call(this, event, one);
            return handler.apply(this, arguments);
        };
        can.bind.call(this, event, one);
        return this;
    };
    can.event = {
        on: function () {
            if (arguments.length === 0 && can.Control && this instanceof can.Control) {
                return can.Control.prototype.on.call(this);
            } else {
                return can.addEvent.apply(this, arguments);
            }
        },
        off: function () {
            if (arguments.length === 0 && can.Control && this instanceof can.Control) {
                return can.Control.prototype.off.call(this);
            } else {
                return can.removeEvent.apply(this, arguments);
            }
        },
        bind: can.addEvent,
        unbind: can.removeEvent,
        delegate: function (selector, event, handler) {
            return can.addEvent.call(this, event, handler);
        },
        undelegate: function (selector, event, handler) {
            return can.removeEvent.call(this, event, handler);
        },
        trigger: can.dispatch,
        one: can.one,
        addEvent: can.addEvent,
        removeEvent: can.removeEvent,
        listenTo: can.listenTo,
        stopListening: can.stopListening,
        dispatch: can.dispatch
    };
    return can.event;
});
/*can@2.2.6#util/fragment*/
define('can/util/fragment', ['can/util/can'], function (can) {
    var fragmentRE = /^\s*<(\w+)[^>]*>/, toString = {}.toString, fragment = function (html, name) {
            if (name === undefined) {
                name = fragmentRE.test(html) && RegExp.$1;
            }
            if (html && toString.call(html.replace) === '[object Function]') {
                html = html.replace(/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, '<$1></$2>');
            }
            var container = document.createElement('div'), temp = document.createElement('div');
            if (name === 'tbody' || name === 'tfoot' || name === 'thead') {
                temp.innerHTML = '<table>' + html + '</table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
            } else if (name === 'tr') {
                temp.innerHTML = '<table><tbody>' + html + '</tbody></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild;
            } else if (name === 'td' || name === 'th') {
                temp.innerHTML = '<table><tbody><tr>' + html + '</tr></tbody></table>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild.firstChild.firstChild;
            } else if (name === 'option') {
                temp.innerHTML = '<select>' + html + '</select>';
                container = temp.firstChild.nodeType === 3 ? temp.lastChild : temp.firstChild;
            } else {
                container.innerHTML = '' + html;
            }
            var tmp = {}, children = container.childNodes;
            tmp.length = children.length;
            for (var i = 0; i < children.length; i++) {
                tmp[i] = children[i];
            }
            return [].slice.call(tmp);
        };
    can.buildFragment = function (html, nodes) {
        if (html && html.nodeType === 11) {
            return html;
        }
        var parts = fragment(html), frag = document.createDocumentFragment();
        for (var i = 0, length = parts.length; i < length; i++) {
            frag.appendChild(parts[i]);
        }
        return frag;
    };
    (function () {
        var text = '<-\n>', frag = can.buildFragment(text, document);
        if (text !== frag.childNodes[0].nodeValue) {
            var oldBuildFragment = can.buildFragment;
            can.buildFragment = function (html, nodes) {
                var res = oldBuildFragment(html, nodes);
                if (res.childNodes.length === 1 && res.childNodes[0].nodeType === 3) {
                    res.childNodes[0].nodeValue = html;
                }
                return res;
            };
        }
    }());
    return can;
});
/*can@2.2.6#util/array/each*/
define('can/util/array/each', ['can/util/can'], function (can) {
    var isArrayLike = function (obj) {
        var length = 'length' in obj && obj.length;
        return typeof arr !== 'function' && (length === 0 || typeof length === 'number' && length > 0 && length - 1 in obj);
    };
    can.each = function (elements, callback, context) {
        var i = 0, key, len, item;
        if (elements) {
            if (isArrayLike(elements)) {
                if (can.List && elements instanceof can.List) {
                    for (len = elements.attr('length'); i < len; i++) {
                        item = elements.attr(i);
                        if (callback.call(context || item, item, i, elements) === false) {
                            break;
                        }
                    }
                } else {
                    for (len = elements.length; i < len; i++) {
                        item = elements[i];
                        if (callback.call(context || item, item, i, elements) === false) {
                            break;
                        }
                    }
                }
            } else if (typeof elements === 'object') {
                if (can.Map && elements instanceof can.Map || elements === can.route) {
                    var keys = can.Map.keys(elements);
                    for (i = 0, len = keys.length; i < len; i++) {
                        key = keys[i];
                        item = elements.attr(key);
                        if (callback.call(context || item, item, key, elements) === false) {
                            break;
                        }
                    }
                } else {
                    for (key in elements) {
                        if (elements.hasOwnProperty(key) && callback.call(context || elements[key], elements[key], key, elements) === false) {
                            break;
                        }
                    }
                }
            }
        }
        return elements;
    };
    return can;
});
/*can@2.2.6#util/object/isplain/isplain*/
define('can/util/object/isplain/isplain', ['can/util/can'], function () {
    var core_hasOwn = Object.prototype.hasOwnProperty, isWindow = function (obj) {
            return obj !== null && obj == obj.window;
        }, isPlainObject = function (obj) {
            if (!obj || typeof obj !== 'object' || obj.nodeType || isWindow(obj)) {
                return false;
            }
            try {
                if (obj.constructor && !core_hasOwn.call(obj, 'constructor') && !core_hasOwn.call(obj.constructor.prototype, 'isPrototypeOf')) {
                    return false;
                }
            } catch (e) {
                return false;
            }
            var key;
            for (key in obj) {
            }
            return key === undefined || core_hasOwn.call(obj, key);
        };
    can.isPlainObject = isPlainObject;
    return can;
});
/*can@2.2.6#util/deferred*/
define('can/util/deferred', ['can/util/can'], function (can) {
    var extend = function (target, src) {
            for (var key in src) {
                if (src.hasOwnProperty(key)) {
                    target[key] = src[key];
                }
            }
        }, Deferred = function (func) {
            if (!(this instanceof Deferred)) {
                return new Deferred();
            }
            this._doneFuncs = [];
            this._failFuncs = [];
            this._resultArgs = null;
            this._status = '';
            if (func) {
                func.call(this, this);
            }
        };
    can.Deferred = Deferred;
    can.when = Deferred.when = function () {
        var args = can.makeArray(arguments);
        if (args.length < 2) {
            var obj = args[0];
            if (obj && (can.isFunction(obj.isResolved) && can.isFunction(obj.isRejected))) {
                return obj;
            } else {
                return Deferred().resolve(obj);
            }
        } else {
            var df = Deferred(), done = 0, rp = [];
            can.each(args, function (arg, j) {
                arg.done(function () {
                    rp[j] = arguments.length < 2 ? arguments[0] : arguments;
                    if (++done === args.length) {
                        df.resolve.apply(df, rp);
                    }
                }).fail(function () {
                    df.reject(arguments.length === 1 ? arguments[0] : arguments);
                });
            });
            return df;
        }
    };
    var resolveFunc = function (type, _status) {
            return function (context) {
                var args = this._resultArgs = arguments.length > 1 ? arguments[1] : [];
                return this.exec(context, this[type], args, _status);
            };
        }, doneFunc = function doneFunc(type, _status) {
            return function () {
                var self = this;
                can.each(Array.prototype.slice.call(arguments), function (v, i, args) {
                    if (!v) {
                        return;
                    }
                    if (v.constructor === Array) {
                        doneFunc.apply(self, v);
                    } else {
                        if (self._status === _status) {
                            v.apply(self, self._resultArgs || []);
                        }
                        self[type].push(v);
                    }
                });
                return this;
            };
        };
    var isDeferred = function (obj) {
        return obj && obj.then && obj.fail && obj.done;
    };
    var wire = function (parentDeferred, result, setter, value) {
        if (isDeferred(result)) {
            result.done(can.proxy(parentDeferred.resolve, parentDeferred)).fail(can.proxy(parentDeferred.reject, parentDeferred));
        } else {
            setter.call(parentDeferred, result !== undefined ? result : value);
        }
    };
    extend(Deferred.prototype, {
        then: function (done, fail) {
            var d = can.Deferred(), resolve = d.resolve, reject = d.reject;
            this.done(function (value) {
                if (typeof done === 'function') {
                    wire(d, done.apply(this, arguments), resolve, value);
                } else {
                    resolve.apply(d, arguments);
                }
            });
            this.fail(function (value) {
                if (typeof fail === 'function') {
                    wire(d, fail.apply(this, arguments), reject, value);
                } else {
                    reject.apply(d, arguments);
                }
            });
            return d;
        },
        resolveWith: resolveFunc('_doneFuncs', 'rs'),
        rejectWith: resolveFunc('_failFuncs', 'rj'),
        done: doneFunc('_doneFuncs', 'rs'),
        fail: doneFunc('_failFuncs', 'rj'),
        always: function () {
            var args = can.makeArray(arguments);
            if (args.length && args[0]) {
                this.done(args[0]).fail(args[0]);
            }
            return this;
        },
        state: function () {
            switch (this._status) {
            case 'rs':
                return 'resolved';
            case 'rj':
                return 'rejected';
            default:
                return 'pending';
            }
        },
        isResolved: function () {
            return this._status === 'rs';
        },
        isRejected: function () {
            return this._status === 'rj';
        },
        reject: function () {
            return this.rejectWith(this, arguments);
        },
        resolve: function () {
            return this.resolveWith(this, arguments);
        },
        exec: function (context, dst, args, st) {
            if (this._status !== '') {
                return this;
            }
            this._status = st;
            can.each(dst, function (d) {
                if (typeof d.apply === 'function') {
                    d.apply(context, args);
                }
            });
            return this;
        },
        promise: function () {
            var promise = this.then();
            promise.reject = promise.resolve = undefined;
            return promise;
        }
    });
    Deferred.prototype.pipe = Deferred.prototype.then;
    return can;
});
/*can@2.2.6#util/hashchange*/
define('can/util/hashchange', ['can/util/can'], function (can) {
    (function () {
        var addEvent = function (el, ev, fn) {
                if (el.addEventListener) {
                    el.addEventListener(ev, fn, false);
                } else if (el.attachEvent) {
                    el.attachEvent('on' + ev, fn);
                } else {
                    el['on' + ev] = fn;
                }
            }, onHashchange = function () {
                can.trigger(window, 'hashchange');
            };
        addEvent(window, 'hashchange', onHashchange);
    }());
});
/*can@2.2.6#util/inserted/inserted*/
define('can/util/inserted/inserted', ['can/util/can'], function (can) {
    can.inserted = function (elems) {
        elems = can.makeArray(elems);
        var inDocument = false, doc = can.$(document.contains ? document : document.body), children;
        for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
            if (!inDocument) {
                if (elem.getElementsByTagName) {
                    if (can.has(doc, elem).length) {
                        inDocument = true;
                    } else {
                        return;
                    }
                } else {
                    continue;
                }
            }
            if (inDocument && elem.getElementsByTagName) {
                children = can.makeArray(elem.getElementsByTagName('*'));
                can.trigger(elem, 'inserted', [], false);
                for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                    can.trigger(child, 'inserted', [], false);
                }
            }
        }
    };
    can.appendChild = function (el, child) {
        var children;
        if (child.nodeType === 11) {
            children = can.makeArray(child.childNodes);
        } else {
            children = [child];
        }
        el.appendChild(child);
        can.inserted(children);
    };
    can.insertBefore = function (el, child, ref) {
        var children;
        if (child.nodeType === 11) {
            children = can.makeArray(child.childNodes);
        } else {
            children = [child];
        }
        el.insertBefore(child, ref);
        can.inserted(children);
    };
});
/*can@2.2.6#util/util*/
define('can/util/util', [
    'can/util/can',
    'can/util/attr/attr',
    'can/yui/yui',
    'can/event/event',
    'can/util/fragment',
    'can/util/array/each',
    'can/util/object/isplain/isplain',
    'can/util/deferred',
    'can/util/hashchange',
    'can/util/inserted/inserted'
], function (can, attr, YUI) {
    YUI = YUI || window.YUI;
    YUI.add('can-modifications', function (Y, NAME) {
        var addHTML = Y.DOM.addHTML;
        Y.DOM.addHTML = function (node, content, where) {
            if (typeof content === 'string' || typeof content === 'number') {
                content = can.buildFragment(content);
            }
            var elems;
            if (content.nodeType === 11) {
                elems = can.makeArray(content.childNodes);
            } else {
                elems = [content];
            }
            var ret = addHTML.call(this, node, content, where);
            can.inserted(elems);
            return ret;
        };
        var oldOn = Y.Node.prototype.on;
        Y.Node.prototype.on = function (type, fn) {
            if (type === 'attributes') {
                var el = can.$(this);
                can.data(el, 'canHasAttributesBindings', (can.data(el, 'canHasAttributesBindings') || 0) + 1);
                var handle = oldOn.apply(this, arguments), oldDetach = handle.detach;
                handle.detach = function () {
                    var cur = can.data(el, 'canHasAttributesBindings') || 0;
                    if (cur <= 0) {
                        can.cleanData(el, 'canHasAttributesBindings');
                    } else {
                        can.data(el, 'canHasAttributesBindings', cur - 1);
                    }
                    return oldDetach.apply(this, arguments);
                };
                return handle;
            } else {
                return oldOn.apply(this, arguments);
            }
        };
    }, '3.7.3', { 'requires': ['node-base'] });
    var Y = can.Y = can.Y || YUI().use('*');
    can.trim = function (s) {
        return Y.Lang.trim(s);
    };
    can.makeArray = function (arr) {
        if (!arr) {
            return [];
        }
        return Y.Array(arr);
    };
    can.isArray = Y.Lang.isArray;
    can.inArray = function (item, arr, fromIndex) {
        if (!arr) {
            return -1;
        }
        return Y.Array.indexOf(arr, item, fromIndex);
    };
    can.map = function (arr, fn) {
        return Y.Array.map(can.makeArray(arr || []), fn);
    };
    can.extend = function (first) {
        var deep = first === true ? 1 : 0, target = arguments[deep], i = deep + 1, arg;
        for (; arg = arguments[i]; i++) {
            Y.mix(target, arg, true, null, null, !!deep);
        }
        return target;
    };
    can.param = function (object) {
        return Y.QueryString.stringify(object, { arrayKey: true });
    };
    can.isEmptyObject = function (object) {
        return Y.Object.isEmpty(object);
    };
    can.proxy = function (func, context) {
        return Y.bind.apply(Y, arguments);
    };
    can.isFunction = function (f) {
        return Y.Lang.isFunction(f);
    };
    var prepareNodeList = function (nodelist) {
        nodelist.each(function (node, i) {
            nodelist[i] = node.getDOMNode();
        });
        nodelist.length = nodelist.size();
        return nodelist;
    };
    can.$ = function (selector) {
        if (selector === window) {
            return window;
        } else if (selector instanceof Y.NodeList) {
            return prepareNodeList(selector);
        } else if (typeof selector === 'object' && !can.isArray(selector) && typeof selector.nodeType === 'undefined' && !selector.getDOMNode) {
            return new Y.NodeList(selector);
        } else {
            return prepareNodeList(Y.all(selector));
        }
    };
    can.get = function (wrapped, index) {
        return wrapped._nodes[index];
    };
    can.append = function (wrapped, html) {
        wrapped.each(function (node) {
            if (typeof html === 'string') {
                html = can.buildFragment(html, node);
            }
            node.append(html);
        });
    };
    can.addClass = function (wrapped, className) {
        return wrapped.addClass(className);
    };
    can.data = function (wrapped, key, value) {
        if (!wrapped.item(0)) {
            return;
        }
        if (value === undefined) {
            return wrapped.item(0).getData(key);
        } else {
            return wrapped.item(0).setData(key, value);
        }
    };
    can.remove = function (wrapped) {
        return wrapped.remove() && wrapped.destroy();
    };
    can.has = function (wrapped, node) {
        if (Y.DOM.contains(wrapped[0], node)) {
            return wrapped;
        } else {
            return [];
        }
    };
    can._yNodeRemove = can._yNodeRemove || Y.Node.prototype.remove;
    Y.Node.prototype.remove = function () {
        var node = this.getDOMNode();
        if (node.nodeType === 1) {
            can.trigger(this, 'removed', [], false);
            var elems = node.getElementsByTagName('*');
            for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
                can.trigger(elem, 'removed', [], false);
            }
        }
        can._yNodeRemove.apply(this, arguments);
    };
    Y.NodeList.addMethod('remove', Y.Node.prototype.remove);
    var optionsMap = {
            type: 'method',
            success: undefined,
            error: undefined
        };
    var updateDeferred = function (request, d) {
        if (request && request.io) {
            var xhr = request.io;
            for (var prop in xhr) {
                if (typeof d[prop] === 'function') {
                    d[prop] = function () {
                        xhr[prop].apply(xhr, arguments);
                    };
                } else {
                    d[prop] = prop[xhr];
                }
            }
        }
    };
    can.ajax = function (options) {
        var d = can.Deferred(), requestOptions = can.extend({}, options);
        for (var option in optionsMap) {
            if (requestOptions[option] !== undefined) {
                requestOptions[optionsMap[option]] = requestOptions[option];
                delete requestOptions[option];
            }
        }
        requestOptions.sync = !options.async;
        var success = options.success, error = options.error;
        requestOptions.on = {
            success: function (transactionid, response) {
                var data = response.responseText;
                if (options.dataType === 'json') {
                    data = eval('(' + data + ')');
                }
                updateDeferred(request, d);
                d.resolve(data);
                if (success) {
                    success(data, 'success', request);
                }
            },
            failure: function (transactionid, response) {
                updateDeferred(request, d);
                d.reject(request, 'error');
                if (error) {
                    error(request, 'error');
                }
            }
        };
        var request = Y.io(requestOptions.url, requestOptions);
        updateDeferred(request, d);
        return d;
    };
    var yuiEventId = 0, addBinding = function (nodelist, selector, ev, cb) {
            if (nodelist instanceof Y.NodeList || !nodelist.on || nodelist.getDOMNode) {
                nodelist.each(function (node) {
                    node = can.$(node);
                    var events = can.data(node, 'events'), eventName = ev + ':' + selector;
                    if (!events) {
                        can.data(node, 'events', events = {});
                    }
                    if (!events[eventName]) {
                        events[eventName] = {};
                    }
                    if (cb.__bindingsIds === undefined) {
                        cb.__bindingsIds = yuiEventId++;
                    }
                    events[eventName][cb.__bindingsIds] = selector ? node.item(0).delegate(ev, cb, selector) : node.item(0).on(ev, cb);
                });
            } else {
                var obj = nodelist, events = obj.__canEvents = obj.__canEvents || {};
                if (!events[ev]) {
                    events[ev] = {};
                }
                if (cb.__bindingsIds === undefined) {
                    cb.__bindingsIds = yuiEventId++;
                }
                events[ev][cb.__bindingsIds] = obj.on(ev, cb);
            }
        }, removeBinding = function (nodelist, selector, ev, cb) {
            if (nodelist instanceof Y.NodeList || !nodelist.on || nodelist.getDOMNode) {
                nodelist.each(function (node) {
                    node = can.$(node);
                    var events = can.data(node, 'events');
                    if (events) {
                        var eventName = ev + ':' + selector, handlers = events[eventName], handler = handlers[cb.__bindingsIds];
                        handler.detach();
                        delete handlers[cb.__bindingsIds];
                        if (can.isEmptyObject(handlers)) {
                            delete events[ev];
                        }
                        if (can.isEmptyObject(events)) {
                        }
                    }
                });
            } else {
                var obj = nodelist, events = obj.__canEvents || {}, handlers = events[ev], handler = handlers[cb.__bindingsIds];
                handler.detach();
                delete handlers[cb.__bindingsIds];
                if (can.isEmptyObject(handlers)) {
                    delete events[ev];
                }
                if (can.isEmptyObject(events)) {
                }
            }
        };
    can.bind = function (ev, cb) {
        if (this.bind && this.bind !== can.bind) {
            this.bind(ev, cb);
        } else if (this.on || this.nodeType) {
            addBinding(can.$(this), undefined, ev, cb);
        } else if (this.addEvent) {
            this.addEvent(ev, cb);
        } else {
            can.addEvent.call(this, ev, cb);
        }
        return this;
    };
    can.unbind = function (ev, cb) {
        if (this.unbind && this.unbind !== can.unbind) {
            this.unbind(ev, cb);
        } else if (this.on || this.nodeType) {
            removeBinding(can.$(this), undefined, ev, cb);
        } else {
            can.removeEvent.call(this, ev, cb);
        }
        return this;
    };
    can.on = can.bind;
    can.off = can.unbind;
    can.trigger = function (item, event, args, bubble) {
        if (item instanceof Y.NodeList) {
            item = item.item(0);
        }
        if (item.getDOMNode) {
            item = item.getDOMNode();
        }
        if (item.nodeName) {
            item = Y.Node(item);
            if (bubble === false) {
                item.once(event, function (ev) {
                    if (ev.stopPropagation) {
                        ev.stopPropagation();
                    }
                    ev.cancelBubble = true;
                    if (ev._stopper) {
                        ev._stopper();
                    }
                });
            }
            if (typeof event !== 'string') {
                args = event;
                event = args.type;
                delete args.type;
            }
            realTrigger(item.getDOMNode(), event, args || {});
        } else {
            if (typeof event === 'string') {
                event = { type: event };
            }
            event.target = event.target || item;
            can.dispatch.call(item, event, can.makeArray(args));
        }
    };
    Y.mix(Y.Node.DOM_EVENTS, {
        removed: true,
        inserted: true,
        attributes: true,
        foo: true
    });
    Y.Env.evt.plugins.attributes = {
        on: function () {
            var args = can.makeArray(arguments);
            return Y.Event._attach(args, { facade: false });
        }
    };
    can.delegate = function (selector, ev, cb) {
        if (this.on || this.nodeType) {
            addBinding(can.$(this), selector, ev, cb);
        } else if (this.delegate) {
            this.delegate(selector, ev, cb);
        } else {
            can.bind.call(this, ev, cb);
        }
        return this;
    };
    can.undelegate = function (selector, ev, cb) {
        if (this.on || this.nodeType) {
            removeBinding(can.$(this), selector, ev, cb);
        } else if (this.undelegate) {
            this.undelegate(selector, ev, cb);
        } else {
            can.unbind.call(this, ev, cb);
        }
        return this;
    };
    var realTrigger, realTriggerHandler = function (n, e, evdata) {
            var node = Y.Node(n), handlers = can.Y.Event.getListeners(node._yuid, e), i;
            if (handlers) {
                for (i = 0; i < handlers.length; i++) {
                    if (handlers[i].fire) {
                        handlers[i].fire(evdata);
                    } else if (handlers[i].handles) {
                        can.each(handlers[i].handles, function (handle) {
                            handle.evt.fire(evdata);
                        });
                    } else {
                        throw 'can not fire event';
                    }
                }
            }
        }, fakeTrigger = function (n, e, a) {
            var stop = false;
            var evdata = can.extend({
                    type: e,
                    target: n,
                    faux: true,
                    _stopper: function () {
                        stop = this.cancelBubble;
                    },
                    stopPropagation: function () {
                        stop = this.cancelBubble;
                    },
                    preventDefault: function () {
                    }
                }, a);
            realTriggerHandler(n, e, evdata);
            if (e === 'inserted' || e === 'removed') {
                return;
            }
            while (!stop && n !== document && n.parentNode) {
                n = n.parentNode;
                realTriggerHandler(n, e, evdata);
            }
        };
    if (document.createEvent) {
        realTrigger = function (n, e, a) {
            fakeTrigger(n, e, a);
            return;
        };
    } else {
        realTrigger = function (n, e, a) {
            fakeTrigger(n, e, a);
            return;
        };
    }
    can.attr = attr;
    delete attr.MutationObserver;
    return can;
});
/*can@2.2.6#view/view*/
define('can/view/view', ['can/util/util'], function (can) {
    var isFunction = can.isFunction, makeArray = can.makeArray, hookupId = 1;
    var makeRenderer = function (textRenderer) {
        var renderer = function () {
            return $view.frag(textRenderer.apply(this, arguments));
        };
        renderer.render = function () {
            return textRenderer.apply(textRenderer, arguments);
        };
        return renderer;
    };
    var checkText = function (text, url) {
        if (!text.length) {
            throw 'can.view: No template or empty template:' + url;
        }
    };
    var getRenderer = function (obj, async) {
        if (isFunction(obj)) {
            var def = can.Deferred();
            return def.resolve(obj);
        }
        var url = typeof obj === 'string' ? obj : obj.url, suffix = obj.engine && '.' + obj.engine || url.match(/\.[\w\d]+$/), type, el, id;
        if (url.match(/^#/)) {
            url = url.substr(1);
        }
        if (el = document.getElementById(url)) {
            suffix = '.' + el.type.match(/\/(x\-)?(.+)/)[2];
        }
        if (!suffix && !$view.cached[url]) {
            url += suffix = $view.ext;
        }
        if (can.isArray(suffix)) {
            suffix = suffix[0];
        }
        id = $view.toId(url);
        if (url.match(/^\/\//)) {
            url = url.substr(2);
            url = !window.steal ? url : steal.config().root.mapJoin('' + steal.id(url));
        }
        if (window.require) {
            if (require.toUrl) {
                url = require.toUrl(url);
            }
        }
        type = $view.types[suffix];
        if ($view.cached[id]) {
            return $view.cached[id];
        } else if (el) {
            return $view.registerView(id, el.innerHTML, type);
        } else {
            var d = new can.Deferred();
            can.ajax({
                async: async,
                url: url,
                dataType: 'text',
                error: function (jqXHR) {
                    checkText('', url);
                    d.reject(jqXHR);
                },
                success: function (text) {
                    checkText(text, url);
                    $view.registerView(id, text, type, d);
                }
            });
            return d;
        }
    };
    var getDeferreds = function (data) {
        var deferreds = [];
        if (can.isDeferred(data)) {
            return [data];
        } else {
            for (var prop in data) {
                if (can.isDeferred(data[prop])) {
                    deferreds.push(data[prop]);
                }
            }
        }
        return deferreds;
    };
    var usefulPart = function (resolved) {
        return can.isArray(resolved) && resolved[1] === 'success' ? resolved[0] : resolved;
    };
    var $view = can.view = can.template = function (view, data, helpers, callback) {
            if (isFunction(helpers)) {
                callback = helpers;
                helpers = undefined;
            }
            return $view.renderAs('fragment', view, data, helpers, callback);
        };
    can.extend($view, {
        frag: function (result, parentNode) {
            return $view.hookup($view.fragment(result), parentNode);
        },
        fragment: function (result) {
            if (typeof result !== 'string' && result.nodeType === 11) {
                return result;
            }
            var frag = can.buildFragment(result, document.body);
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
            return frag;
        },
        toId: function (src) {
            return can.map(src.toString().split(/\/|\./g), function (part) {
                if (part) {
                    return part;
                }
            }).join('_');
        },
        toStr: function (txt) {
            return txt == null ? '' : '' + txt;
        },
        hookup: function (fragment, parentNode) {
            var hookupEls = [], id, func;
            can.each(fragment.childNodes ? can.makeArray(fragment.childNodes) : fragment, function (node) {
                if (node.nodeType === 1) {
                    hookupEls.push(node);
                    hookupEls.push.apply(hookupEls, can.makeArray(node.getElementsByTagName('*')));
                }
            });
            can.each(hookupEls, function (el) {
                if (el.getAttribute && (id = el.getAttribute('data-view-id')) && (func = $view.hookups[id])) {
                    func(el, parentNode, id);
                    delete $view.hookups[id];
                    el.removeAttribute('data-view-id');
                }
            });
            return fragment;
        },
        hookups: {},
        hook: function (cb) {
            $view.hookups[++hookupId] = cb;
            return ' data-view-id=\'' + hookupId + '\'';
        },
        cached: {},
        cachedRenderers: {},
        cache: true,
        register: function (info) {
            this.types['.' + info.suffix] = info;
            can[info.suffix] = $view[info.suffix] = function (id, text) {
                var renderer, renderFunc;
                if (!text) {
                    renderFunc = function () {
                        if (!renderer) {
                            if (info.fragRenderer) {
                                renderer = info.fragRenderer(null, id);
                            } else {
                                renderer = makeRenderer(info.renderer(null, id));
                            }
                        }
                        return renderer.apply(this, arguments);
                    };
                    renderFunc.render = function () {
                        var textRenderer = info.renderer(null, id);
                        return textRenderer.apply(textRenderer, arguments);
                    };
                    return renderFunc;
                }
                var registeredRenderer = function () {
                    if (!renderer) {
                        if (info.fragRenderer) {
                            renderer = info.fragRenderer(id, text);
                        } else {
                            renderer = info.renderer(id, text);
                        }
                    }
                    return renderer.apply(this, arguments);
                };
                if (info.fragRenderer) {
                    return $view.preload(id, registeredRenderer);
                } else {
                    return $view.preloadStringRenderer(id, registeredRenderer);
                }
            };
        },
        types: {},
        ext: '.ejs',
        registerScript: function (type, id, src) {
            return 'can.view.preloadStringRenderer(\'' + id + '\',' + $view.types['.' + type].script(id, src) + ');';
        },
        preload: function (id, renderer) {
            var def = $view.cached[id] = new can.Deferred().resolve(function (data, helpers) {
                    return renderer.call(data, data, helpers);
                });
            def.__view_id = id;
            $view.cachedRenderers[id] = renderer;
            return renderer;
        },
        preloadStringRenderer: function (id, stringRenderer) {
            return this.preload(id, makeRenderer(stringRenderer));
        },
        render: function (view, data, helpers, callback) {
            return can.view.renderAs('string', view, data, helpers, callback);
        },
        renderTo: function (format, renderer, data, helpers) {
            return (format === 'string' && renderer.render ? renderer.render : renderer)(data, helpers);
        },
        renderAs: function (format, view, data, helpers, callback) {
            if (isFunction(helpers)) {
                callback = helpers;
                helpers = undefined;
            }
            var deferreds = getDeferreds(data);
            var reading, deferred, dataCopy, async, response;
            if (deferreds.length) {
                deferred = new can.Deferred();
                dataCopy = can.extend({}, data);
                deferreds.push(getRenderer(view, true));
                can.when.apply(can, deferreds).then(function (resolved) {
                    var objs = makeArray(arguments), renderer = objs.pop(), result;
                    if (can.isDeferred(data)) {
                        dataCopy = usefulPart(resolved);
                    } else {
                        for (var prop in data) {
                            if (can.isDeferred(data[prop])) {
                                dataCopy[prop] = usefulPart(objs.shift());
                            }
                        }
                    }
                    result = can.view.renderTo(format, renderer, dataCopy, helpers);
                    deferred.resolve(result, dataCopy);
                    if (callback) {
                        callback(result, dataCopy);
                    }
                }, function () {
                    deferred.reject.apply(deferred, arguments);
                });
                return deferred;
            } else {
                reading = can.__clearReading();
                async = isFunction(callback);
                deferred = getRenderer(view, async);
                if (reading) {
                    can.__setReading(reading);
                }
                if (async) {
                    response = deferred;
                    deferred.then(function (renderer) {
                        callback(data ? can.view.renderTo(format, renderer, data, helpers) : renderer);
                    });
                } else {
                    if (deferred.state() === 'resolved' && deferred.__view_id) {
                        var currentRenderer = $view.cachedRenderers[deferred.__view_id];
                        return data ? can.view.renderTo(format, currentRenderer, data, helpers) : currentRenderer;
                    } else {
                        deferred.then(function (renderer) {
                            response = data ? can.view.renderTo(format, renderer, data, helpers) : renderer;
                        });
                    }
                }
                return response;
            }
        },
        registerView: function (id, text, type, def) {
            var info = typeof type === 'object' ? type : $view.types[type || $view.ext], renderer;
            if (info.fragRenderer) {
                renderer = info.fragRenderer(id, text);
            } else {
                renderer = makeRenderer(info.renderer(id, text));
            }
            def = def || new can.Deferred();
            if ($view.cache) {
                $view.cached[id] = def;
                def.__view_id = id;
                $view.cachedRenderers[id] = renderer;
            }
            return def.resolve(renderer);
        }
    });
    return can;
});
/*can@2.2.6#view/callbacks/callbacks*/
define('can/view/callbacks/callbacks', [
    'can/util/util',
    'can/view/view'
], function (can) {
    var attr = can.view.attr = function (attributeName, attrHandler) {
            if (attrHandler) {
                if (typeof attributeName === 'string') {
                    attributes[attributeName] = attrHandler;
                } else {
                    regExpAttributes.push({
                        match: attributeName,
                        handler: attrHandler
                    });
                }
            } else {
                var cb = attributes[attributeName];
                if (!cb) {
                    for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                        var attrMatcher = regExpAttributes[i];
                        if (attrMatcher.match.test(attributeName)) {
                            cb = attrMatcher.handler;
                            break;
                        }
                    }
                }
                return cb;
            }
        };
    var attributes = {}, regExpAttributes = [], automaticCustomElementCharacters = /[-\:]/;
    var tag = can.view.tag = function (tagName, tagHandler) {
            if (tagHandler) {
                if (can.global.html5) {
                    can.global.html5.elements += ' ' + tagName;
                    can.global.html5.shivDocument();
                }
                tags[tagName.toLowerCase()] = tagHandler;
            } else {
                var cb = tags[tagName.toLowerCase()];
                if (!cb && automaticCustomElementCharacters.test(tagName)) {
                    cb = function () {
                    };
                }
                return cb;
            }
        };
    var tags = {};
    can.view.callbacks = {
        _tags: tags,
        _attributes: attributes,
        _regExpAttributes: regExpAttributes,
        tag: tag,
        attr: attr,
        tagHandler: function (el, tagName, tagData) {
            var helperTagCallback = tagData.options.attr('tags.' + tagName), tagCallback = helperTagCallback || tags[tagName];
            var scope = tagData.scope, res;
            if (tagCallback) {
                var reads = can.__clearReading();
                res = tagCallback(el, tagData);
                can.__setReading(reads);
            } else {
                res = scope;
            }
            if (res && tagData.subtemplate) {
                if (scope !== res) {
                    scope = scope.add(res);
                }
                var result = tagData.subtemplate(scope, tagData.options);
                var frag = typeof result === 'string' ? can.view.frag(result) : result;
                can.appendChild(el, frag);
            }
        }
    };
    return can.view.callbacks;
});
/*can@2.2.6#view/elements*/
define('can/view/elements', [
    'can/util/util',
    'can/view/view'
], function (can) {
    var doc = typeof document !== 'undefined' ? document : null;
    var selectsCommentNodes = doc && function () {
            return can.$(document.createComment('~')).length === 1;
        }();
    var elements = {
            tagToContentPropMap: {
                option: doc && 'textContent' in document.createElement('option') ? 'textContent' : 'innerText',
                textarea: 'value'
            },
            attrMap: can.attr.map,
            attrReg: /([^\s=]+)[\s]*=[\s]*/,
            defaultValue: can.attr.defaultValue,
            tagMap: {
                '': 'span',
                colgroup: 'col',
                table: 'tbody',
                tr: 'td',
                ol: 'li',
                ul: 'li',
                tbody: 'tr',
                thead: 'tr',
                tfoot: 'tr',
                select: 'option',
                optgroup: 'option'
            },
            reverseTagMap: {
                col: 'colgroup',
                tr: 'tbody',
                option: 'select',
                td: 'tr',
                th: 'tr',
                li: 'ul'
            },
            getParentNode: function (el, defaultParentNode) {
                return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
            },
            setAttr: can.attr.set,
            getAttr: can.attr.get,
            removeAttr: can.attr.remove,
            contentText: function (text) {
                if (typeof text === 'string') {
                    return text;
                }
                if (!text && text !== 0) {
                    return '';
                }
                return '' + text;
            },
            after: function (oldElements, newFrag) {
                var last = oldElements[oldElements.length - 1];
                if (last.nextSibling) {
                    can.insertBefore(last.parentNode, newFrag, last.nextSibling);
                } else {
                    can.appendChild(last.parentNode, newFrag);
                }
            },
            replace: function (oldElements, newFrag) {
                elements.after(oldElements, newFrag);
                if (can.remove(can.$(oldElements)).length < oldElements.length && !selectsCommentNodes) {
                    can.each(oldElements, function (el) {
                        if (el.nodeType === 8) {
                            el.parentNode.removeChild(el);
                        }
                    });
                }
            }
        };
    can.view.elements = elements;
    return elements;
});
/*can@2.2.6#util/string/string*/
define('can/util/string/string', ['can/util/util'], function (can) {
    var strUndHash = /_|-/, strColons = /\=\=/, strWords = /([A-Z]+)([A-Z][a-z])/g, strLowUp = /([a-z\d])([A-Z])/g, strDash = /([a-z\d])([A-Z])/g, strReplacer = /\{([^\}]+)\}/g, strQuote = /"/g, strSingleQuote = /'/g, strHyphenMatch = /-+(.)?/g, strCamelMatch = /[a-z][A-Z]/g, getNext = function (obj, prop, add) {
            var result = obj[prop];
            if (result === undefined && add === true) {
                result = obj[prop] = {};
            }
            return result;
        }, isContainer = function (current) {
            return /^f|^o/.test(typeof current);
        }, convertBadValues = function (content) {
            var isInvalid = content === null || content === undefined || isNaN(content) && '' + content === 'NaN';
            return '' + (isInvalid ? '' : content);
        };
    can.extend(can, {
        esc: function (content) {
            return convertBadValues(content).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(strQuote, '&#34;').replace(strSingleQuote, '&#39;');
        },
        getObject: function (name, roots, add) {
            var parts = name ? name.split('.') : [], length = parts.length, current, r = 0, i, container, rootsLength;
            roots = can.isArray(roots) ? roots : [roots || window];
            rootsLength = roots.length;
            if (!length) {
                return roots[0];
            }
            for (r; r < rootsLength; r++) {
                current = roots[r];
                container = undefined;
                for (i = 0; i < length && isContainer(current); i++) {
                    container = current;
                    current = getNext(container, parts[i]);
                }
                if (container !== undefined && current !== undefined) {
                    break;
                }
            }
            if (add === false && current !== undefined) {
                delete container[parts[i - 1]];
            }
            if (add === true && current === undefined) {
                current = roots[0];
                for (i = 0; i < length && isContainer(current); i++) {
                    current = getNext(current, parts[i], true);
                }
            }
            return current;
        },
        capitalize: function (s, cache) {
            return s.charAt(0).toUpperCase() + s.slice(1);
        },
        camelize: function (str) {
            return convertBadValues(str).replace(strHyphenMatch, function (match, chr) {
                return chr ? chr.toUpperCase() : '';
            });
        },
        hyphenate: function (str) {
            return convertBadValues(str).replace(strCamelMatch, function (str, offset) {
                return str.charAt(0) + '-' + str.charAt(1).toLowerCase();
            });
        },
        underscore: function (s) {
            return s.replace(strColons, '/').replace(strWords, '$1_$2').replace(strLowUp, '$1_$2').replace(strDash, '_').toLowerCase();
        },
        sub: function (str, data, remove) {
            var obs = [];
            str = str || '';
            obs.push(str.replace(strReplacer, function (whole, inside) {
                var ob = can.getObject(inside, data, remove === true ? false : undefined);
                if (ob === undefined || ob === null) {
                    obs = null;
                    return '';
                }
                if (isContainer(ob) && obs) {
                    obs.push(ob);
                    return '';
                }
                return '' + ob;
            }));
            return obs === null ? obs : obs.length <= 1 ? obs[0] : obs;
        },
        replacer: strReplacer,
        undHash: strUndHash
    });
    return can;
});
/*can@2.2.6#construct/construct*/
define('can/construct/construct', ['can/util/string/string'], function (can) {
    var initializing = 0;
    var canGetDescriptor;
    try {
        Object.getOwnPropertyDescriptor({});
        canGetDescriptor = true;
    } catch (e) {
        canGetDescriptor = false;
    }
    var getDescriptor = function (newProps, name) {
            var descriptor = Object.getOwnPropertyDescriptor(newProps, name);
            if (descriptor && (descriptor.get || descriptor.set)) {
                return descriptor;
            }
            return null;
        }, inheritGetterSetter = function (newProps, oldProps, addTo) {
            addTo = addTo || newProps;
            var descriptor;
            for (var name in newProps) {
                if (descriptor = getDescriptor(newProps, name)) {
                    this._defineProperty(addTo, oldProps, name, descriptor);
                } else {
                    can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
                }
            }
        }, simpleInherit = function (newProps, oldProps, addTo) {
            addTo = addTo || newProps;
            for (var name in newProps) {
                can.Construct._overwrite(addTo, oldProps, name, newProps[name]);
            }
        };
    can.Construct = function () {
        if (arguments.length) {
            return can.Construct.extend.apply(can.Construct, arguments);
        }
    };
    can.extend(can.Construct, {
        constructorExtends: true,
        newInstance: function () {
            var inst = this.instance(), args;
            if (inst.setup) {
                args = inst.setup.apply(inst, arguments);
            }
            if (inst.init) {
                inst.init.apply(inst, args || arguments);
            }
            return inst;
        },
        _inherit: canGetDescriptor ? inheritGetterSetter : simpleInherit,
        _defineProperty: function (what, oldProps, propName, descriptor) {
            Object.defineProperty(what, propName, descriptor);
        },
        _overwrite: function (what, oldProps, propName, val) {
            what[propName] = val;
        },
        setup: function (base, fullName) {
            this.defaults = can.extend(true, {}, base.defaults, this.defaults);
        },
        instance: function () {
            initializing = 1;
            var inst = new this();
            initializing = 0;
            return inst;
        },
        extend: function (name, staticProperties, instanceProperties) {
            var fullName = name, klass = staticProperties, proto = instanceProperties;
            if (typeof fullName !== 'string') {
                proto = klass;
                klass = fullName;
                fullName = null;
            }
            if (!proto) {
                proto = klass;
                klass = null;
            }
            proto = proto || {};
            var _super_class = this, _super = this.prototype, Constructor, parts, current, _fullName, _shortName, propName, shortName, namespace, prototype;
            prototype = this.instance();
            can.Construct._inherit(proto, _super, prototype);
            if (fullName) {
                parts = fullName.split('.');
                shortName = parts.pop();
            }
            if (typeof constructorName === 'undefined') {
                Constructor = function () {
                    return init.apply(this, arguments);
                };
            }
            function init() {
                if (!initializing) {
                    return this.constructor !== Constructor && arguments.length && Constructor.constructorExtends ? Constructor.extend.apply(Constructor, arguments) : Constructor.newInstance.apply(Constructor, arguments);
                }
            }
            for (propName in _super_class) {
                if (_super_class.hasOwnProperty(propName)) {
                    Constructor[propName] = _super_class[propName];
                }
            }
            can.Construct._inherit(klass, _super_class, Constructor);
            if (fullName) {
                current = can.getObject(parts.join('.'), window, true);
                namespace = current;
                _fullName = can.underscore(fullName.replace(/\./g, '_'));
                _shortName = can.underscore(shortName);
                current[shortName] = Constructor;
            }
            can.extend(Constructor, {
                constructor: Constructor,
                prototype: prototype,
                namespace: namespace,
                _shortName: _shortName,
                fullName: fullName,
                _fullName: _fullName
            });
            if (shortName !== undefined) {
                Constructor.shortName = shortName;
            }
            Constructor.prototype.constructor = Constructor;
            var t = [_super_class].concat(can.makeArray(arguments)), args = Constructor.setup.apply(Constructor, t);
            if (Constructor.init) {
                Constructor.init.apply(Constructor, args || t);
            }
            return Constructor;
        }
    });
    can.Construct.prototype.setup = function () {
    };
    can.Construct.prototype.init = function () {
    };
    return can.Construct;
});
/*can@2.2.6#control/control*/
define('can/control/control', [
    'can/util/util',
    'can/construct/construct'
], function (can) {
    var bind = function (el, ev, callback) {
            can.bind.call(el, ev, callback);
            return function () {
                can.unbind.call(el, ev, callback);
            };
        }, isFunction = can.isFunction, extend = can.extend, each = can.each, slice = [].slice, paramReplacer = /\{([^\}]+)\}/g, special = can.getObject('$.event.special', [can]) || {}, delegate = function (el, selector, ev, callback) {
            can.delegate.call(el, selector, ev, callback);
            return function () {
                can.undelegate.call(el, selector, ev, callback);
            };
        }, binder = function (el, ev, callback, selector) {
            return selector ? delegate(el, can.trim(selector), ev, callback) : bind(el, ev, callback);
        }, basicProcessor;
    var Control = can.Control = can.Construct({
            setup: function () {
                can.Construct.setup.apply(this, arguments);
                if (can.Control) {
                    var control = this, funcName;
                    control.actions = {};
                    for (funcName in control.prototype) {
                        if (control._isAction(funcName)) {
                            control.actions[funcName] = control._action(funcName);
                        }
                    }
                }
            },
            _shifter: function (context, name) {
                var method = typeof name === 'string' ? context[name] : name;
                if (!isFunction(method)) {
                    method = context[method];
                }
                return function () {
                    context.called = name;
                    return method.apply(context, [this.nodeName ? can.$(this) : this].concat(slice.call(arguments, 0)));
                };
            },
            _isAction: function (methodName) {
                var val = this.prototype[methodName], type = typeof val;
                return methodName !== 'constructor' && (type === 'function' || type === 'string' && isFunction(this.prototype[val])) && !!(special[methodName] || processors[methodName] || /[^\w]/.test(methodName));
            },
            _action: function (methodName, options) {
                paramReplacer.lastIndex = 0;
                if (options || !paramReplacer.test(methodName)) {
                    var convertedName = options ? can.sub(methodName, this._lookup(options)) : methodName;
                    if (!convertedName) {
                        return null;
                    }
                    var arr = can.isArray(convertedName), name = arr ? convertedName[1] : convertedName, parts = name.split(/\s+/g), event = parts.pop();
                    return {
                        processor: processors[event] || basicProcessor,
                        parts: [
                            name,
                            parts.join(' '),
                            event
                        ],
                        delegate: arr ? convertedName[0] : undefined
                    };
                }
            },
            _lookup: function (options) {
                return [
                    options,
                    window
                ];
            },
            processors: {},
            defaults: {}
        }, {
            setup: function (element, options) {
                var cls = this.constructor, pluginname = cls.pluginName || cls._fullName, arr;
                this.element = can.$(element);
                if (pluginname && pluginname !== 'can_control') {
                    this.element.addClass(pluginname);
                }
                arr = can.data(this.element, 'controls');
                if (!arr) {
                    arr = [];
                    can.data(this.element, 'controls', arr);
                }
                arr.push(this);
                this.options = extend({}, cls.defaults, options);
                this.on();
                return [
                    this.element,
                    this.options
                ];
            },
            on: function (el, selector, eventName, func) {
                if (!el) {
                    this.off();
                    var cls = this.constructor, bindings = this._bindings, actions = cls.actions, element = this.element, destroyCB = can.Control._shifter(this, 'destroy'), funcName, ready;
                    for (funcName in actions) {
                        if (actions.hasOwnProperty(funcName)) {
                            ready = actions[funcName] || cls._action(funcName, this.options, this);
                            if (ready) {
                                bindings.control[funcName] = ready.processor(ready.delegate || element, ready.parts[2], ready.parts[1], funcName, this);
                            }
                        }
                    }
                    can.bind.call(element, 'removed', destroyCB);
                    bindings.user.push(function (el) {
                        can.unbind.call(el, 'removed', destroyCB);
                    });
                    return bindings.user.length;
                }
                if (typeof el === 'string') {
                    func = eventName;
                    eventName = selector;
                    selector = el;
                    el = this.element;
                }
                if (func === undefined) {
                    func = eventName;
                    eventName = selector;
                    selector = null;
                }
                if (typeof func === 'string') {
                    func = can.Control._shifter(this, func);
                }
                this._bindings.user.push(binder(el, eventName, func, selector));
                return this._bindings.user.length;
            },
            off: function () {
                var el = this.element[0], bindings = this._bindings;
                if (bindings) {
                    each(bindings.user || [], function (value) {
                        value(el);
                    });
                    each(bindings.control || {}, function (value) {
                        value(el);
                    });
                }
                this._bindings = {
                    user: [],
                    control: {}
                };
            },
            destroy: function () {
                if (this.element === null) {
                    return;
                }
                var Class = this.constructor, pluginName = Class.pluginName || Class._fullName, controls;
                this.off();
                if (pluginName && pluginName !== 'can_control') {
                    this.element.removeClass(pluginName);
                }
                controls = can.data(this.element, 'controls');
                controls.splice(can.inArray(this, controls), 1);
                can.trigger(this, 'destroyed');
                this.element = null;
            }
        });
    var processors = can.Control.processors;
    basicProcessor = function (el, event, selector, methodName, control) {
        return binder(el, event, can.Control._shifter(control, methodName), selector);
    };
    each([
        'change',
        'click',
        'contextmenu',
        'dblclick',
        'keydown',
        'keyup',
        'keypress',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'reset',
        'resize',
        'scroll',
        'select',
        'submit',
        'focusin',
        'focusout',
        'mouseenter',
        'mouseleave',
        'touchstart',
        'touchmove',
        'touchcancel',
        'touchend',
        'touchleave',
        'inserted',
        'removed'
    ], function (v) {
        processors[v] = basicProcessor;
    });
    return Control;
});
/*can@2.2.6#util/bind/bind*/
define('can/util/bind/bind', ['can/util/util'], function (can) {
    can.bindAndSetup = function () {
        can.addEvent.apply(this, arguments);
        if (!this._init) {
            if (!this._bindings) {
                this._bindings = 1;
                if (this._bindsetup) {
                    this._bindsetup();
                }
            } else {
                this._bindings++;
            }
        }
        return this;
    };
    can.unbindAndTeardown = function (event, handler) {
        var handlers = this.__bindEvents[event] || [];
        var handlerCount = handlers.length;
        can.removeEvent.apply(this, arguments);
        if (this._bindings === null) {
            this._bindings = 0;
        } else {
            this._bindings = this._bindings - (handlerCount - handlers.length);
        }
        if (!this._bindings && this._bindteardown) {
            this._bindteardown();
        }
        return this;
    };
    return can;
});
/*can@2.2.6#map/bubble*/
define('can/map/bubble', ['can/util/util'], function (can) {
    var bubble = can.bubble = {
            event: function (map, boundEventName) {
                return map.constructor._bubbleRule(boundEventName, map);
            },
            childrenOf: function (parentMap, eventName) {
                parentMap._each(function (child, prop) {
                    if (child && child.bind) {
                        bubble.toParent(child, parentMap, prop, eventName);
                    }
                });
            },
            teardownChildrenFrom: function (parentMap, eventName) {
                parentMap._each(function (child) {
                    bubble.teardownFromParent(parentMap, child, eventName);
                });
            },
            toParent: function (child, parent, prop, eventName) {
                can.listenTo.call(parent, child, eventName, function () {
                    var args = can.makeArray(arguments), ev = args.shift();
                    args[0] = (can.List && parent instanceof can.List ? parent.indexOf(child) : prop) + (args[0] ? '.' + args[0] : '');
                    ev.triggeredNS = ev.triggeredNS || {};
                    if (ev.triggeredNS[parent._cid]) {
                        return;
                    }
                    ev.triggeredNS[parent._cid] = true;
                    can.trigger(parent, ev, args);
                });
            },
            teardownFromParent: function (parent, child, eventName) {
                if (child && child.unbind) {
                    can.stopListening.call(parent, child, eventName);
                }
            },
            isBubbling: function (parent, eventName) {
                return parent._bubbleBindings && parent._bubbleBindings[eventName];
            },
            bind: function (parent, eventName) {
                if (!parent._init) {
                    var bubbleEvents = bubble.event(parent, eventName), len = bubbleEvents.length, bubbleEvent;
                    if (!parent._bubbleBindings) {
                        parent._bubbleBindings = {};
                    }
                    for (var i = 0; i < len; i++) {
                        bubbleEvent = bubbleEvents[i];
                        if (!parent._bubbleBindings[bubbleEvent]) {
                            parent._bubbleBindings[bubbleEvent] = 1;
                            bubble.childrenOf(parent, bubbleEvent);
                        } else {
                            parent._bubbleBindings[bubbleEvent]++;
                        }
                    }
                }
            },
            unbind: function (parent, eventName) {
                var bubbleEvents = bubble.event(parent, eventName), len = bubbleEvents.length, bubbleEvent;
                for (var i = 0; i < len; i++) {
                    bubbleEvent = bubbleEvents[i];
                    if (parent._bubbleBindings) {
                        parent._bubbleBindings[bubbleEvent]--;
                    }
                    if (parent._bubbleBindings && !parent._bubbleBindings[bubbleEvent]) {
                        delete parent._bubbleBindings[bubbleEvent];
                        bubble.teardownChildrenFrom(parent, bubbleEvent);
                        if (can.isEmptyObject(parent._bubbleBindings)) {
                            delete parent._bubbleBindings;
                        }
                    }
                }
            },
            add: function (parent, child, prop) {
                if (child instanceof can.Map && parent._bubbleBindings) {
                    for (var eventName in parent._bubbleBindings) {
                        if (parent._bubbleBindings[eventName]) {
                            bubble.teardownFromParent(parent, child, eventName);
                            bubble.toParent(child, parent, prop, eventName);
                        }
                    }
                }
            },
            removeMany: function (parent, children) {
                for (var i = 0, len = children.length; i < len; i++) {
                    bubble.remove(parent, children[i]);
                }
            },
            remove: function (parent, child) {
                if (child instanceof can.Map && parent._bubbleBindings) {
                    for (var eventName in parent._bubbleBindings) {
                        if (parent._bubbleBindings[eventName]) {
                            bubble.teardownFromParent(parent, child, eventName);
                        }
                    }
                }
            },
            set: function (parent, prop, value, current) {
                if (can.Map.helpers.isObservable(value)) {
                    bubble.add(parent, value, prop);
                }
                if (can.Map.helpers.isObservable(current)) {
                    bubble.remove(parent, current);
                }
                return value;
            }
        };
    return bubble;
});
/*can@2.2.6#util/batch/batch*/
define('can/util/batch/batch', ['can/util/can'], function (can) {
    var batchNum = 1, transactions = 0, batchEvents = [], stopCallbacks = [], currentBatchEvents = null;
    can.batch = {
        start: function (batchStopHandler) {
            transactions++;
            if (batchStopHandler) {
                stopCallbacks.push(batchStopHandler);
            }
        },
        stop: function (force, callStart) {
            if (force) {
                transactions = 0;
            } else {
                transactions--;
            }
            if (transactions === 0) {
                if (currentBatchEvents !== null) {
                    return;
                }
                currentBatchEvents = batchEvents.slice(0);
                var callbacks = stopCallbacks.slice(0), i, len;
                batchEvents = [];
                stopCallbacks = [];
                can.batch.batchNum = batchNum;
                batchNum++;
                if (callStart) {
                    can.batch.start();
                }
                for (i = 0; i < currentBatchEvents.length; i++) {
                    can.dispatch.apply(currentBatchEvents[i][0], currentBatchEvents[i][1]);
                }
                currentBatchEvents = null;
                for (i = 0, len = callbacks.length; i < callbacks.length; i++) {
                    callbacks[i]();
                }
                can.batch.batchNum = undefined;
            }
        },
        trigger: function (item, event, args) {
            if (!item._init) {
                event = typeof event === 'string' ? { type: event } : event;
                if (currentBatchEvents) {
                    currentBatchEvents.push([
                        item,
                        [
                            event,
                            args
                        ]
                    ]);
                } else if (transactions === 0) {
                    return can.dispatch.call(item, event, args);
                } else {
                    event.batchNum = batchNum;
                    batchEvents.push([
                        item,
                        [
                            event,
                            args
                        ]
                    ]);
                }
            }
        },
        afterPreviousEvents: function (handler) {
            if (currentBatchEvents) {
                var obj = {};
                can.bind.call(obj, 'ready', handler);
                currentBatchEvents.push([
                    obj,
                    [
                        { type: 'ready' },
                        []
                    ]
                ]);
            } else {
                handler();
            }
        }
    };
});
/*can@2.2.6#map/map*/
define('can/map/map', [
    'can/util/util',
    'can/util/bind/bind',
    'can/map/bubble',
    'can/construct/construct',
    'can/util/batch/batch'
], function (can, bind, bubble) {
    var madeMap = null;
    var teardownMap = function () {
        for (var cid in madeMap) {
            if (madeMap[cid].added) {
                delete madeMap[cid].obj._cid;
            }
        }
        madeMap = null;
    };
    var getMapFromObject = function (obj) {
        return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
    };
    var serializeMap = null;
    var Map = can.Map = can.Construct.extend({
            setup: function () {
                can.Construct.setup.apply(this, arguments);
                if (can.Map) {
                    if (!this.defaults) {
                        this.defaults = {};
                    }
                    this._computes = [];
                    for (var prop in this.prototype) {
                        if (prop !== 'define' && prop !== 'constructor' && (typeof this.prototype[prop] !== 'function' || this.prototype[prop].prototype instanceof can.Construct)) {
                            this.defaults[prop] = this.prototype[prop];
                        } else if (this.prototype[prop].isComputed) {
                            this._computes.push(prop);
                        }
                    }
                    if (this.helpers.define) {
                        this.helpers.define(this);
                    }
                }
                if (can.List && !(this.prototype instanceof can.List)) {
                    this.List = Map.List.extend({ Map: this }, {});
                }
            },
            _bubble: bubble,
            _bubbleRule: function (eventName) {
                return eventName === 'change' || eventName.indexOf('.') >= 0 ? ['change'] : [];
            },
            _computes: [],
            bind: can.bindAndSetup,
            on: can.bindAndSetup,
            unbind: can.unbindAndTeardown,
            off: can.unbindAndTeardown,
            id: 'id',
            helpers: {
                define: null,
                attrParts: function (attr, keepKey) {
                    if (keepKey) {
                        return [attr];
                    }
                    return typeof attr === 'object' ? attr : ('' + attr).split('.');
                },
                addToMap: function (obj, instance) {
                    var teardown;
                    if (!madeMap) {
                        teardown = teardownMap;
                        madeMap = {};
                    }
                    var hasCid = obj._cid;
                    var cid = can.cid(obj);
                    if (!madeMap[cid]) {
                        madeMap[cid] = {
                            obj: obj,
                            instance: instance,
                            added: !hasCid
                        };
                    }
                    return teardown;
                },
                isObservable: function (obj) {
                    return obj instanceof can.Map || obj && obj === can.route;
                },
                canMakeObserve: function (obj) {
                    return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj));
                },
                serialize: function (map, how, where) {
                    var cid = can.cid(map), firstSerialize = false;
                    if (!serializeMap) {
                        firstSerialize = true;
                        serializeMap = {
                            attr: {},
                            serialize: {}
                        };
                    }
                    serializeMap[how][cid] = where;
                    map.each(function (val, name) {
                        var result, isObservable = Map.helpers.isObservable(val), serialized = isObservable && serializeMap[how][can.cid(val)];
                        if (serialized) {
                            result = serialized;
                        } else {
                            if (how === 'serialize') {
                                result = Map.helpers._serialize(map, name, val);
                            } else {
                                result = Map.helpers._getValue(map, name, val, how);
                            }
                        }
                        if (result !== undefined) {
                            where[name] = result;
                        }
                    });
                    can.__observe(map, '__keys');
                    if (firstSerialize) {
                        serializeMap = null;
                    }
                    return where;
                },
                _serialize: function (map, name, val) {
                    return Map.helpers._getValue(map, name, val, 'serialize');
                },
                _getValue: function (map, name, val, how) {
                    if (Map.helpers.isObservable(val)) {
                        return val[how]();
                    } else {
                        return val;
                    }
                }
            },
            keys: function (map) {
                var keys = [];
                can.__observe(map, '__keys');
                for (var keyName in map._data) {
                    keys.push(keyName);
                }
                return keys;
            }
        }, {
            setup: function (obj) {
                if (obj instanceof can.Map) {
                    obj = obj.serialize();
                }
                this._data = {};
                can.cid(this, '.map');
                this._init = 1;
                this._computedBindings = {};
                var defaultValues = this._setupDefaults(obj);
                this._setupComputes(defaultValues);
                var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);
                var data = can.extend(can.extend(true, {}, defaultValues), obj);
                this.attr(data);
                if (teardownMapping) {
                    teardownMapping();
                }
                this.bind('change', can.proxy(this._changes, this));
                delete this._init;
            },
            _setupComputes: function () {
                var computes = this.constructor._computes;
                for (var i = 0, len = computes.length, prop; i < len; i++) {
                    prop = computes[i];
                    this[prop] = this[prop].clone(this);
                    this._computedBindings[prop] = { count: 0 };
                }
            },
            _setupDefaults: function () {
                return this.constructor.defaults || {};
            },
            _bindsetup: function () {
            },
            _bindteardown: function () {
            },
            _changes: function (ev, attr, how, newVal, oldVal) {
                can.batch.trigger(this, {
                    type: attr,
                    batchNum: ev.batchNum,
                    target: ev.target
                }, [
                    newVal,
                    oldVal
                ]);
            },
            _triggerChange: function (attr, how, newVal, oldVal) {
                if (bubble.isBubbling(this, 'change')) {
                    can.batch.trigger(this, {
                        type: 'change',
                        target: this
                    }, [
                        attr,
                        how,
                        newVal,
                        oldVal
                    ]);
                } else {
                    can.batch.trigger(this, attr, [
                        newVal,
                        oldVal
                    ]);
                }
                if (how === 'remove' || how === 'add') {
                    can.batch.trigger(this, {
                        type: '__keys',
                        target: this
                    });
                }
            },
            _each: function (callback) {
                var data = this.__get();
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        callback(data[prop], prop);
                    }
                }
            },
            attr: function (attr, val) {
                var type = typeof attr;
                if (type !== 'string' && type !== 'number') {
                    return this._attrs(attr, val);
                } else if (arguments.length === 1) {
                    return this._get(attr);
                } else {
                    this._set(attr, val);
                    return this;
                }
            },
            each: function () {
                return can.each.apply(undefined, [this].concat(can.makeArray(arguments)));
            },
            removeAttr: function (attr) {
                var isList = can.List && this instanceof can.List, parts = can.Map.helpers.attrParts(attr), prop = parts.shift(), current = isList ? this[prop] : this._data[prop];
                if (parts.length && current) {
                    return current.removeAttr(parts);
                } else {
                    if (typeof attr === 'string' && !!~attr.indexOf('.')) {
                        prop = attr;
                    }
                    this._remove(prop, current);
                    return current;
                }
            },
            _remove: function (prop, current) {
                if (prop in this._data) {
                    delete this._data[prop];
                    if (!(prop in this.constructor.prototype)) {
                        delete this[prop];
                    }
                    this._triggerChange(prop, 'remove', undefined, current);
                }
            },
            _get: function (attr) {
                attr = '' + attr;
                var dotIndex = attr.indexOf('.');
                if (dotIndex >= 0) {
                    var value = this.__get(attr);
                    if (value !== undefined) {
                        return value;
                    }
                    var first = attr.substr(0, dotIndex), second = attr.substr(dotIndex + 1);
                    can.__observe(this, first);
                    var current = this.__get(first);
                    return current && current._get ? current._get(second) : undefined;
                } else {
                    can.__observe(this, attr);
                    return this.__get(attr);
                }
            },
            __get: function (attr) {
                if (attr) {
                    if (this._computedBindings[attr]) {
                        return this[attr]();
                    } else {
                        return this._data[attr];
                    }
                } else {
                    return this._data;
                }
            },
            __type: function (value, prop) {
                if (!(value instanceof can.Map) && can.Map.helpers.canMakeObserve(value)) {
                    var cached = getMapFromObject(value);
                    if (cached) {
                        return cached;
                    }
                    if (can.isArray(value)) {
                        var List = can.List;
                        return new List(value);
                    } else {
                        var Map = this.constructor.Map || can.Map;
                        return new Map(value);
                    }
                }
                return value;
            },
            _set: function (attr, value, keepKey) {
                attr = '' + attr;
                var dotIndex = attr.indexOf('.'), current;
                if (!keepKey && dotIndex >= 0) {
                    var first = attr.substr(0, dotIndex), second = attr.substr(dotIndex + 1);
                    current = this._init ? undefined : this.__get(first);
                    if (Map.helpers.isObservable(current)) {
                        current._set(second, value);
                    } else {
                        throw 'can.Map: Object does not exist';
                    }
                } else {
                    if (this.__convert) {
                        value = this.__convert(attr, value);
                    }
                    current = this._init ? undefined : this.__get(attr);
                    this.__set(attr, this.__type(value, attr), current);
                }
            },
            __set: function (prop, value, current) {
                if (value !== current) {
                    var changeType = current !== undefined || this.__get().hasOwnProperty(prop) ? 'set' : 'add';
                    this.___set(prop, this.constructor._bubble.set(this, prop, value, current));
                    if (!this._computedBindings[prop]) {
                        this._triggerChange(prop, changeType, value, current);
                    }
                    if (current) {
                        this.constructor._bubble.teardownFromParent(this, current);
                    }
                }
            },
            ___set: function (prop, val) {
                if (this._computedBindings[prop]) {
                    this[prop](val);
                } else {
                    this._data[prop] = val;
                }
                if (typeof this.constructor.prototype[prop] !== 'function' && !this._computedBindings[prop]) {
                    this[prop] = val;
                }
            },
            bind: function (eventName, handler) {
                var computedBinding = this._computedBindings && this._computedBindings[eventName];
                if (computedBinding) {
                    if (!computedBinding.count) {
                        computedBinding.count = 1;
                        var self = this;
                        computedBinding.handler = function (ev, newVal, oldVal) {
                            can.batch.trigger(self, {
                                type: eventName,
                                batchNum: ev.batchNum,
                                target: self
                            }, [
                                newVal,
                                oldVal
                            ]);
                        };
                        this[eventName].bind('change', computedBinding.handler);
                    } else {
                        computedBinding.count++;
                    }
                }
                this.constructor._bubble.bind(this, eventName);
                return can.bindAndSetup.apply(this, arguments);
            },
            unbind: function (eventName, handler) {
                var computedBinding = this._computedBindings && this._computedBindings[eventName];
                if (computedBinding) {
                    if (computedBinding.count === 1) {
                        computedBinding.count = 0;
                        this[eventName].unbind('change', computedBinding.handler);
                        delete computedBinding.handler;
                    } else {
                        computedBinding.count--;
                    }
                }
                this.constructor._bubble.unbind(this, eventName);
                return can.unbindAndTeardown.apply(this, arguments);
            },
            serialize: function () {
                return can.Map.helpers.serialize(this, 'serialize', {});
            },
            _attrs: function (props, remove) {
                if (props === undefined) {
                    return Map.helpers.serialize(this, 'attr', {});
                }
                props = can.simpleExtend({}, props);
                var prop, self = this, newVal;
                can.batch.start();
                this.each(function (curVal, prop) {
                    if (prop === '_cid') {
                        return;
                    }
                    newVal = props[prop];
                    if (newVal === undefined) {
                        if (remove) {
                            self.removeAttr(prop);
                        }
                        return;
                    }
                    if (self.__convert) {
                        newVal = self.__convert(prop, newVal);
                    }
                    if (Map.helpers.isObservable(newVal)) {
                        self.__set(prop, self.__type(newVal, prop), curVal);
                    } else if (Map.helpers.isObservable(curVal) && Map.helpers.canMakeObserve(newVal)) {
                        curVal.attr(newVal, remove);
                    } else if (curVal !== newVal) {
                        self.__set(prop, self.__type(newVal, prop), curVal);
                    }
                    delete props[prop];
                });
                for (prop in props) {
                    if (prop !== '_cid') {
                        newVal = props[prop];
                        this._set(prop, newVal, true);
                    }
                }
                can.batch.stop();
                return this;
            },
            compute: function (prop) {
                if (can.isFunction(this.constructor.prototype[prop])) {
                    return can.compute(this[prop], this);
                } else {
                    var reads = prop.split('.'), last = reads.length - 1, options = { args: [] };
                    return can.compute(function (newVal) {
                        if (arguments.length) {
                            can.compute.read(this, reads.slice(0, last)).value.attr(reads[last], newVal);
                        } else {
                            return can.compute.read(this, reads, options).value;
                        }
                    }, this);
                }
            }
        });
    Map.prototype.on = Map.prototype.bind;
    Map.prototype.off = Map.prototype.unbind;
    return Map;
});
/*can@2.2.6#list/list*/
define('can/list/list', [
    'can/util/util',
    'can/map/map',
    'can/map/bubble'
], function (can, Map, bubble) {
    var splice = [].splice, spliceRemovesProps = function () {
            var obj = {
                    0: 'a',
                    length: 1
                };
            splice.call(obj, 0, 1);
            return !obj[0];
        }();
    var list = Map.extend({ Map: Map }, {
            setup: function (instances, options) {
                this.length = 0;
                can.cid(this, '.map');
                this._init = 1;
                this._computedBindings = {};
                this._setupComputes();
                instances = instances || [];
                var teardownMapping;
                if (can.isDeferred(instances)) {
                    this.replace(instances);
                } else {
                    teardownMapping = instances.length && can.Map.helpers.addToMap(instances, this);
                    this.push.apply(this, can.makeArray(instances || []));
                }
                if (teardownMapping) {
                    teardownMapping();
                }
                this.bind('change', can.proxy(this._changes, this));
                can.simpleExtend(this, options);
                delete this._init;
            },
            _triggerChange: function (attr, how, newVal, oldVal) {
                Map.prototype._triggerChange.apply(this, arguments);
                var index = +attr;
                if (!~('' + attr).indexOf('.') && !isNaN(index)) {
                    if (how === 'add') {
                        can.batch.trigger(this, how, [
                            newVal,
                            index
                        ]);
                        can.batch.trigger(this, 'length', [this.length]);
                    } else if (how === 'remove') {
                        can.batch.trigger(this, how, [
                            oldVal,
                            index
                        ]);
                        can.batch.trigger(this, 'length', [this.length]);
                    } else {
                        can.batch.trigger(this, how, [
                            newVal,
                            index
                        ]);
                    }
                }
            },
            __get: function (attr) {
                if (attr) {
                    if (this[attr] && this[attr].isComputed && can.isFunction(this.constructor.prototype[attr])) {
                        return this[attr]();
                    } else {
                        return this[attr];
                    }
                } else {
                    return this;
                }
            },
            __set: function (prop, value, current) {
                prop = isNaN(+prop) || prop % 1 ? prop : +prop;
                if (typeof prop === 'number' && prop > this.length - 1) {
                    var newArr = new Array(prop + 1 - this.length);
                    newArr[newArr.length - 1] = value;
                    this.push.apply(this, newArr);
                    return newArr;
                }
                return can.Map.prototype.__set.call(this, '' + prop, value, current);
            },
            ___set: function (attr, val) {
                this[attr] = val;
                if (+attr >= this.length) {
                    this.length = +attr + 1;
                }
            },
            _remove: function (prop, current) {
                if (isNaN(+prop)) {
                    delete this[prop];
                    this._triggerChange(prop, 'remove', undefined, current);
                } else {
                    this.splice(prop, 1);
                }
            },
            _each: function (callback) {
                var data = this.__get();
                for (var i = 0; i < data.length; i++) {
                    callback(data[i], i);
                }
            },
            serialize: function () {
                return Map.helpers.serialize(this, 'serialize', []);
            },
            splice: function (index, howMany) {
                var args = can.makeArray(arguments), added = [], i, len, listIndex, allSame = args.length > 2;
                index = index || 0;
                for (i = 0, len = args.length - 2; i < len; i++) {
                    listIndex = i + 2;
                    args[listIndex] = this.__type(args[listIndex], listIndex);
                    added.push(args[listIndex]);
                    if (this[i + index] !== args[listIndex]) {
                        allSame = false;
                    }
                }
                if (allSame && this.length <= added.length) {
                    return added;
                }
                if (howMany === undefined) {
                    howMany = args[1] = this.length - index;
                }
                var removed = splice.apply(this, args);
                if (!spliceRemovesProps) {
                    for (i = this.length; i < removed.length + this.length; i++) {
                        delete this[i];
                    }
                }
                can.batch.start();
                if (howMany > 0) {
                    bubble.removeMany(this, removed);
                    this._triggerChange('' + index, 'remove', undefined, removed);
                }
                if (args.length > 2) {
                    for (i = 0, len = added.length; i < len; i++) {
                        bubble.set(this, i, added[i]);
                    }
                    this._triggerChange('' + index, 'add', added, removed);
                }
                can.batch.stop();
                return removed;
            },
            _attrs: function (items, remove) {
                if (items === undefined) {
                    return Map.helpers.serialize(this, 'attr', []);
                }
                items = can.makeArray(items);
                can.batch.start();
                this._updateAttrs(items, remove);
                can.batch.stop();
            },
            _updateAttrs: function (items, remove) {
                var len = Math.min(items.length, this.length);
                for (var prop = 0; prop < len; prop++) {
                    var curVal = this[prop], newVal = items[prop];
                    if (Map.helpers.isObservable(curVal) && Map.helpers.canMakeObserve(newVal)) {
                        curVal.attr(newVal, remove);
                    } else if (curVal !== newVal) {
                        this._set(prop, newVal);
                    } else {
                    }
                }
                if (items.length > this.length) {
                    this.push.apply(this, items.slice(this.length));
                } else if (items.length < this.length && remove) {
                    this.splice(items.length);
                }
            }
        }), getArgs = function (args) {
            return args[0] && can.isArray(args[0]) ? args[0] : can.makeArray(args);
        };
    can.each({
        push: 'length',
        unshift: 0
    }, function (where, name) {
        var orig = [][name];
        list.prototype[name] = function () {
            var args = [], len = where ? this.length : 0, i = arguments.length, res, val;
            while (i--) {
                val = arguments[i];
                args[i] = bubble.set(this, i, this.__type(val, i));
            }
            res = orig.apply(this, args);
            if (!this.comparator || args.length) {
                this._triggerChange('' + len, 'add', args, undefined);
            }
            return res;
        };
    });
    can.each({
        pop: 'length',
        shift: 0
    }, function (where, name) {
        list.prototype[name] = function () {
            if (!this.length) {
                return undefined;
            }
            var args = getArgs(arguments), len = where && this.length ? this.length - 1 : 0;
            var res = [][name].apply(this, args);
            this._triggerChange('' + len, 'remove', undefined, [res]);
            if (res && res.unbind) {
                bubble.remove(this, res);
            }
            return res;
        };
    });
    can.extend(list.prototype, {
        indexOf: function (item, fromIndex) {
            this.attr('length');
            return can.inArray(item, this, fromIndex);
        },
        join: function () {
            return [].join.apply(this.attr(), arguments);
        },
        reverse: function () {
            var list = [].reverse.call(can.makeArray(this));
            this.replace(list);
        },
        slice: function () {
            var temp = Array.prototype.slice.apply(this, arguments);
            return new this.constructor(temp);
        },
        concat: function () {
            var args = [];
            can.each(can.makeArray(arguments), function (arg, i) {
                args[i] = arg instanceof can.List ? arg.serialize() : arg;
            });
            return new this.constructor(Array.prototype.concat.apply(this.serialize(), args));
        },
        forEach: function (cb, thisarg) {
            return can.each(this, cb, thisarg || this);
        },
        replace: function (newList) {
            if (can.isDeferred(newList)) {
                newList.then(can.proxy(this.replace, this));
            } else {
                this.splice.apply(this, [
                    0,
                    this.length
                ].concat(can.makeArray(newList || [])));
            }
            return this;
        },
        filter: function (callback, thisArg) {
            var filteredList = new can.List(), self = this, filtered;
            this.each(function (item, index, list) {
                filtered = callback.call(thisArg | self, item, index, self);
                if (filtered) {
                    filteredList.push(item);
                }
            });
            return filteredList;
        }
    });
    can.List = Map.List = list;
    return can.List;
});
/*can@2.2.6#compute/read*/
define('can/compute/read', ['can/util/util'], function (can) {
    var read = function (parent, reads, options) {
        options = options || {};
        var state = { foundObservable: false };
        var cur = readValue(parent, 0, reads, options, state), type, prev, readLength = reads.length, i = 0;
        while (i < readLength) {
            prev = cur;
            for (var r = 0, readersLength = read.propertyReaders.length; r < readersLength; r++) {
                var reader = read.propertyReaders[r];
                if (reader.test(cur)) {
                    cur = reader.read(cur, reads[i], i, options, state);
                    break;
                }
            }
            i = i + 1;
            cur = readValue(cur, i, reads, options, state, prev);
            type = typeof cur;
            if (i < reads.length && (cur === null || type !== 'function' && type !== 'object')) {
                if (options.earlyExit) {
                    options.earlyExit(prev, i - 1, cur);
                }
                return {
                    value: undefined,
                    parent: prev
                };
            }
        }
        if (cur === undefined) {
            if (options.earlyExit) {
                options.earlyExit(prev, i - 1);
            }
        }
        return {
            value: cur,
            parent: prev
        };
    };
    var readValue = function (value, index, reads, options, state, prev) {
        var usedValueReader;
        do {
            usedValueReader = false;
            for (var i = 0, len = read.valueReaders.length; i < len; i++) {
                if (read.valueReaders[i].test(value, index, reads, options)) {
                    value = read.valueReaders[i].read(value, index, reads, options, state, prev);
                }
            }
        } while (usedValueReader);
        return value;
    };
    read.valueReaders = [
        {
            name: 'compute',
            test: function (value, i, reads, options) {
                return value && value.isComputed;
            },
            read: function (value, i, reads, options, state) {
                if (options.isArgument && i === reads.length) {
                    return value;
                }
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, i);
                    state.foundObservable = true;
                }
                return value instanceof can.Compute ? value.get() : value();
            }
        },
        {
            name: 'function',
            test: function (value, i, reads, options) {
                var type = typeof value;
                return type === 'function' && !value.isComputed && (options.executeAnonymousFunctions || options.isArgument && i === reads.length) && !(can.Construct && value.prototype instanceof can.Construct) && !(can.route && value === can.route);
            },
            read: function (value, i, reads, options, state, prev) {
                if (options.isArgument && i === reads.length) {
                    return options.proxyMethods !== false ? can.proxy(value, prev) : value;
                }
                return value.call(prev);
            }
        }
    ];
    read.propertyReaders = [
        {
            name: 'map',
            test: can.isMapLike,
            read: function (value, prop, index, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, index);
                    state.foundObservable = true;
                }
                if (typeof value[prop] === 'function' && value.constructor.prototype[prop] === value[prop]) {
                    if (options.returnObserveMethods) {
                        return value[prop];
                    } else if (prop === 'constructor' && value instanceof can.Construct || value[prop].prototype instanceof can.Construct) {
                        return value[prop];
                    } else {
                        return value[prop].apply(value, options.args || []);
                    }
                } else {
                    return value.attr(prop);
                }
            }
        },
        {
            name: 'promise',
            test: function (value) {
                return can.isPromise(value);
            },
            read: function (value, prop, index, options, state) {
                if (!state.foundObservable && options.foundObservable) {
                    options.foundObservable(value, index);
                    state.foundObservable = true;
                }
                var observeData = value.__observeData;
                if (!value.__observeData) {
                    observeData = value.__observeData = {
                        isPending: true,
                        state: 'pending',
                        isResolved: false,
                        isRejected: false,
                        value: undefined,
                        reason: undefined
                    };
                    can.cid(observeData);
                    can.simpleExtend(observeData, can.event);
                    value.then(function (value) {
                        observeData.isPending = false;
                        observeData.isResolved = true;
                        observeData.value = value;
                        observeData.state = 'resolved';
                        observeData.dispatch('state', [
                            'resolved',
                            'pending'
                        ]);
                    }, function (reason) {
                        observeData.isPending = false;
                        observeData.isRejected = true;
                        observeData.reason = reason;
                        observeData.state = 'rejected';
                        observeData.dispatch('state', [
                            'rejected',
                            'pending'
                        ]);
                    });
                }
                can.__observe(observeData, 'state');
                return prop in observeData ? observeData[prop] : value[prop];
            }
        },
        {
            name: 'object',
            test: function () {
                return true;
            },
            read: function (value, prop) {
                if (value == null) {
                    return undefined;
                } else {
                    return value[prop];
                }
            }
        }
    ];
    read.write = function (parent, key, value, options) {
        options = options || {};
        if (can.isMapLike(parent)) {
            if (!options.isArgument && parent._data && parent._data[key] && parent._data[key].isComputed) {
                return parent._data[key](value);
            } else {
                return parent.attr(key, value);
            }
        }
        if (parent[key] && parent[key].isComputed) {
            return parent[key](value);
        }
        if (typeof parent === 'object') {
            parent[key] = value;
        }
    };
    return read;
});
/*can@2.2.6#compute/get_value_and_bind*/
define('can/compute/get_value_and_bind', ['can/util/util'], function () {
    function observe(func, context, oldInfo, onchanged) {
        var info = getValueAndObserved(func, context), newObserveSet = info.observed, oldObserved = oldInfo.observed;
        if (info.names !== oldInfo.names) {
            bindNewSet(oldObserved, newObserveSet, onchanged);
            unbindOldSet(oldObserved, onchanged);
        }
        can.batch.afterPreviousEvents(function () {
            info.ready = true;
        });
        return info;
    }
    var observedStack = [];
    can.__isRecordingObserves = function () {
        return observedStack.length;
    };
    can.__observe = can.__reading = function (obj, event) {
        if (observedStack.length) {
            var name = obj._cid + '|' + event, top = observedStack[observedStack.length - 1];
            top.names += name;
            top.observed[name] = {
                obj: obj,
                event: event + ''
            };
        }
    };
    can.__notObserve = function (fn) {
        return function () {
            var previousReads = can.__clearObserved();
            var res = fn.apply(this, arguments);
            can.__setObserved(previousReads);
            return res;
        };
    };
    can.__clearObserved = can.__clearReading = function () {
        if (observedStack.length) {
            var ret = observedStack[observedStack.length - 1];
            observedStack[observedStack.length - 1] = { observed: {} };
            return ret;
        }
    };
    can.__setObserved = can.__setReading = function (o) {
        if (observedStack.length) {
            observedStack[observedStack.length - 1] = o;
        }
    };
    can.__addObserved = can.__addReading = function (o) {
        if (observedStack.length) {
            can.simpleExtend(observedStack[observedStack.length - 1], o);
        }
    };
    var getValueAndObserved = function (func, self) {
        observedStack.push({
            names: '',
            observed: {}
        });
        var value = func.call(self);
        var stackItem = observedStack.pop();
        stackItem.value = value;
        return stackItem;
    };
    var bindNewSet = function (oldObserved, newObserveSet, onchanged) {
        for (var name in newObserveSet) {
            bindOrPreventUnbinding(oldObserved, newObserveSet, name, onchanged);
        }
    };
    var bindOrPreventUnbinding = function (oldObserved, newObserveSet, name, onchanged) {
        if (oldObserved[name]) {
            delete oldObserved[name];
        } else {
            var obEv = newObserveSet[name];
            obEv.obj.bind(obEv.event, onchanged);
        }
    };
    var unbindOldSet = function (oldObserved, onchanged) {
        for (var name in oldObserved) {
            var obEv = oldObserved[name];
            obEv.obj.unbind(obEv.event, onchanged);
        }
    };
    return observe;
});
/*can@2.2.6#compute/proto_compute*/
define('can/compute/proto_compute', [
    'can/util/util',
    'can/util/bind/bind',
    'can/compute/read',
    'can/compute/get_value_and_bind',
    'can/util/batch/batch'
], function (can, bind, read, getValueAndBind) {
    var updateOnChange = function (compute, newValue, oldValue, batchNum) {
        if (newValue !== oldValue) {
            can.batch.trigger(compute, batchNum ? {
                type: 'change',
                batchNum: batchNum
            } : 'change', [
                newValue,
                oldValue
            ]);
        }
    };
    var setupComputeHandlers = function (compute, func, context, singleBind) {
        var readInfo, onchanged, batchNum;
        singleBind = false;
        return {
            on: function (updater) {
                var self = this;
                if (!onchanged) {
                    onchanged = function (ev) {
                        if (readInfo.ready && compute.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {
                            var oldValue = readInfo.value, newValue;
                            if (singleBind) {
                                newValue = func.call(context);
                                readInfo.value = newValue;
                            } else {
                                readInfo = getValueAndBind(func, context, readInfo, onchanged);
                                newValue = readInfo.value;
                            }
                            self.updater(newValue, oldValue, ev.batchNum);
                            batchNum = batchNum = ev.batchNum;
                        }
                    };
                }
                readInfo = getValueAndBind(func, context, { observed: {} }, onchanged);
                if (singleBind) {
                    func = can.__notObserve(func);
                }
                compute.value = readInfo.value;
                compute.hasDependencies = !can.isEmptyObject(readInfo.observed);
            },
            off: function (updater) {
                for (var name in readInfo.observed) {
                    var ob = readInfo.observed[name];
                    ob.obj.unbind(ob.event, onchanged);
                }
            }
        };
    };
    var k = function () {
    };
    var updater = function (newVal, oldVal, batchNum) {
            this.value = newVal;
            updateOnChange(this, newVal, oldVal, batchNum);
        }, asyncGet = function (fn, context, lastSetValue) {
            return function () {
                return fn.call(context, lastSetValue.get());
            };
        }, asyncUpdater = function (context, oldUpdater) {
            return function (newVal) {
                if (newVal !== undefined) {
                    oldUpdater(newVal, context.value);
                }
            };
        };
    can.Compute = function (getterSetter, context, eventName, bindOnce) {
        var args = [];
        for (var i = 0, arglen = arguments.length; i < arglen; i++) {
            args[i] = arguments[i];
        }
        var contextType = typeof args[1];
        if (typeof args[0] === 'function') {
            this._setupGetterSetterFn(args[0], args[1], args[2], args[3]);
        } else if (args[1]) {
            if (contextType === 'string') {
                this._setupContextString(args[0], args[1], args[2]);
            } else if (contextType === 'function') {
                this._setupContextFunction(args[0], args[1], args[2]);
            } else {
                if (args[1] && args[1].fn) {
                    this._setupAsyncCompute(args[0], args[1]);
                } else {
                    this._setupContextSettings(args[0], args[1]);
                }
            }
        } else {
            this._setupInitialValue(args[0]);
        }
        this._args = args;
        this.isComputed = true;
        can.cid(this, 'compute');
    };
    can.simpleExtend(can.Compute.prototype, {
        _bindsetup: can.__notObserve(function () {
            this.bound = true;
            this._on(this.updater);
        }),
        _bindteardown: function () {
            this._off(this.updater);
            this.bound = false;
        },
        bind: can.bindAndSetup,
        unbind: can.unbindAndTeardown,
        clone: function (context) {
            if (context && typeof this._args[0] === 'function') {
                this._args[1] = context;
            } else if (context) {
                this._args[2] = context;
            }
            return new can.Compute(this._args[0], this._args[1], this._args[2], this._args[3]);
        },
        _on: k,
        _off: k,
        get: function () {
            if (can.__isRecordingObserves() && this._canObserve !== false) {
                can.__observe(this, 'change');
                if (!this.bound) {
                    can.Compute.temporarilyBind(this);
                }
            }
            if (this.bound) {
                return this.value;
            } else {
                return this._get();
            }
        },
        _get: function () {
            return this.value;
        },
        set: function (newVal) {
            var old = this.value;
            var setVal = this._set(newVal, old);
            if (this.hasDependencies) {
                if (this._setUpdates) {
                    return this.value;
                }
                return this._get();
            }
            if (setVal === undefined) {
                this.value = this._get();
            } else {
                this.value = setVal;
            }
            updateOnChange(this, this.value, old);
            return this.value;
        },
        _set: function (newVal) {
            return this.value = newVal;
        },
        updater: updater,
        _computeFn: function (newVal) {
            if (arguments.length) {
                return this.set(newVal);
            }
            return this.get();
        },
        toFunction: function () {
            return can.proxy(this._computeFn, this);
        },
        _setupGetterSetterFn: function (getterSetter, context, eventName, bindOnce) {
            this._set = can.proxy(getterSetter, context);
            this._get = can.proxy(getterSetter, context);
            this._canObserve = eventName === false ? false : true;
            var handlers = setupComputeHandlers(this, getterSetter, context || this, bindOnce);
            this._on = handlers.on;
            this._off = handlers.off;
        },
        _setupContextString: function (target, propertyName, eventName) {
            var isObserve = can.isMapLike(target), self = this, handler = function (ev, newVal, oldVal) {
                    self.updater(newVal, oldVal, ev.batchNum);
                };
            if (isObserve) {
                this.hasDependencies = true;
                this._get = function () {
                    return target.attr(propertyName);
                };
                this._set = function (val) {
                    target.attr(propertyName, val);
                };
                this._on = function (update) {
                    target.bind(eventName || propertyName, handler);
                    this.value = this._get();
                };
                this._off = function () {
                    return target.unbind(eventName || propertyName, handler);
                };
            } else {
                this._get = can.proxy(this._get, target);
                this._set = can.proxy(this._set, target);
            }
        },
        _setupContextFunction: function (initialValue, setter, eventName) {
            this.value = initialValue;
            this._set = setter;
            can.simpleExtend(this, eventName);
        },
        _setupContextSettings: function (initialValue, settings) {
            this.value = initialValue;
            this._set = settings.set ? can.proxy(settings.set, settings) : this._set;
            this._get = settings.get ? can.proxy(settings.get, settings) : this._get;
            if (!settings.__selfUpdater) {
                var self = this, oldUpdater = this.updater;
                this.updater = function () {
                    oldUpdater.call(self, self._get(), self.value);
                };
            }
            this._on = settings.on ? settings.on : this._on;
            this._off = settings.off ? settings.off : this._off;
        },
        _setupAsyncCompute: function (initialValue, settings) {
            this.value = initialValue;
            var oldUpdater = can.proxy(this.updater, this), self = this, fn = settings.fn, data;
            this.updater = oldUpdater;
            var lastSetValue = new can.Compute(initialValue);
            this.lastSetValue = lastSetValue;
            this._setUpdates = true;
            this._set = function (newVal) {
                if (newVal === lastSetValue.get()) {
                    return this.value;
                }
                return lastSetValue.set(newVal);
            };
            this._get = asyncGet(fn, settings.context, lastSetValue);
            if (fn.length === 0) {
                data = setupComputeHandlers(this, fn, settings.context);
            } else if (fn.length === 1) {
                data = setupComputeHandlers(this, function () {
                    return fn.call(settings.context, lastSetValue.get());
                }, settings);
            } else {
                this.updater = asyncUpdater(this, oldUpdater);
                data = setupComputeHandlers(this, function () {
                    var res = fn.call(settings.context, lastSetValue.get(), function (newVal) {
                            oldUpdater(newVal, self.value);
                        });
                    return res !== undefined ? res : this.value;
                }, settings);
            }
            this._on = data.on;
            this._off = data.off;
        },
        _setupInitialValue: function (initialValue) {
            this.value = initialValue;
        }
    });
    var computes, unbindComputes = function () {
            for (var i = 0, len = computes.length; i < len; i++) {
                computes[i].unbind('change', k);
            }
            computes = null;
        };
    can.Compute.temporarilyBind = function (compute) {
        compute.bind('change', k);
        if (!computes) {
            computes = [];
            setTimeout(unbindComputes, 10);
        }
        computes.push(compute);
    };
    can.Compute.async = function (initialValue, asyncComputer, context) {
        return new can.Compute(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    can.Compute.read = read;
    can.Compute.set = read.write;
    can.Compute.truthy = function (compute) {
        return new can.Compute(function () {
            var res = compute.get();
            if (typeof res === 'function') {
                res = res.get();
            }
            return !!res;
        });
    };
    return can.Compute;
});
/*can@2.2.6#compute/compute*/
define('can/compute/compute', [
    'can/util/util',
    'can/util/bind/bind',
    'can/util/batch/batch',
    'can/compute/proto_compute'
], function (can, bind) {
    can.compute = function (getterSetter, context, eventName, bindOnce) {
        var internalCompute = new can.Compute(getterSetter, context, eventName, bindOnce);
        var compute = function (val) {
            if (arguments.length) {
                return internalCompute.set(val);
            }
            return internalCompute.get();
        };
        compute.bind = can.proxy(internalCompute.bind, internalCompute);
        compute.unbind = can.proxy(internalCompute.unbind, internalCompute);
        compute.isComputed = internalCompute.isComputed;
        compute.clone = function (ctx) {
            if (typeof getterSetter === 'function') {
                context = ctx;
            }
            return can.compute(getterSetter, context, ctx, bindOnce);
        };
        compute.computeInstance = internalCompute;
        return compute;
    };
    var k = function () {
    };
    var computes, unbindComputes = function () {
            for (var i = 0, len = computes.length; i < len; i++) {
                computes[i].unbind('change', k);
            }
            computes = null;
        };
    can.compute.temporarilyBind = function (compute) {
        compute.bind('change', k);
        if (!computes) {
            computes = [];
            setTimeout(unbindComputes, 10);
        }
        computes.push(compute);
    };
    can.compute.truthy = function (compute) {
        return can.compute(function () {
            var res = compute();
            if (typeof res === 'function') {
                res = res();
            }
            return !!res;
        });
    };
    can.compute.async = function (initialValue, asyncComputer, context) {
        return can.compute(initialValue, {
            fn: asyncComputer,
            context: context
        });
    };
    can.compute.read = can.Compute.read;
    can.compute.set = can.Compute.set;
    return can.compute;
});
/*can@2.2.6#observe/observe*/
define('can/observe/observe', [
    'can/util/util',
    'can/map/map',
    'can/list/list',
    'can/compute/compute'
], function (can) {
    can.Observe = can.Map;
    can.Observe.startBatch = can.batch.start;
    can.Observe.stopBatch = can.batch.stop;
    can.Observe.triggerBatch = can.batch.trigger;
    return can;
});
/*can@2.2.6#view/scope/compute_data*/
define('can/view/scope/compute_data', [
    'can/util/util',
    'can/compute/compute',
    'can/compute/get_value_and_bind'
], function (can, compute, getValueAndBind) {
    var isFastPath = function (computeData) {
        return computeData.reads && computeData.reads.length === 1 && computeData.root instanceof can.Map && !can.isFunction(computeData.root[computeData.reads[0]]);
    };
    var getValueAndBindScopeRead = function (scopeRead, scopeReadChanged) {
        return getValueAndBind(scopeRead, null, { observed: {} }, scopeReadChanged);
    };
    var unbindScopeRead = function (readInfo, scopeReadChanged) {
        for (var name in readInfo.observed) {
            var ob = readInfo.observed[name];
            ob.obj.unbind(ob.event, scopeReadChanged);
        }
    };
    var getValueAndBindSinglePropertyRead = function (computeData, singlePropertyReadChanged) {
        var target = computeData.root, prop = computeData.reads[0];
        target.bind(prop, singlePropertyReadChanged);
        return {
            value: computeData.initialValue,
            observed: { something: true }
        };
    };
    var unbindSinglePropertyRead = function (computeData, singlePropertyReadChanged) {
        computeData.root.unbind(computeData.reads[0], singlePropertyReadChanged);
    };
    var scopeReader = function (scope, key, options, computeData, newVal) {
        if (arguments.length > 4) {
            if (computeData.root.isComputed) {
                computeData.root(newVal);
            } else if (computeData.reads.length) {
                var last = computeData.reads.length - 1;
                var obj = computeData.reads.length ? can.compute.read(computeData.root, computeData.reads.slice(0, last)).value : computeData.root;
                can.compute.set(obj, computeData.reads[last], newVal, options);
            }
        } else {
            if (computeData.root) {
                return can.compute.read(computeData.root, computeData.reads, options).value;
            }
            var data = scope.read(key, options);
            computeData.scope = data.scope;
            computeData.initialValue = data.value;
            computeData.reads = data.reads;
            computeData.root = data.rootObserve;
            return data.value;
        }
    };
    return function (scope, key, options) {
        options = options || { args: [] };
        var computeData = {}, scopeRead = function (newVal) {
                if (arguments.length) {
                    return scopeReader(scope, key, options, computeData, newVal);
                } else {
                    return scopeReader(scope, key, options, computeData);
                }
            }, batchNum, readInfo, scopeReadChanged = function (ev) {
                if (readInfo.ready && compute.computeInstance.bound && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {
                    var oldValue = readInfo.value, newValue;
                    readInfo = getValueAndBind(scopeRead, null, readInfo, scopeReadChanged);
                    newValue = readInfo.value;
                    compute.computeInstance.updater(newValue, oldValue, ev.batchNum);
                    batchNum = batchNum = ev.batchNum;
                }
            }, singlePropertyReadChanged = function (ev, newVal, oldVal) {
                if (typeof newVal !== 'function') {
                    compute.computeInstance.updater(newVal, oldVal, ev.batchNum);
                } else {
                    unbindSinglePropertyRead(computeData, singlePropertyReadChanged);
                    readInfo = getValueAndBindScopeRead(scopeRead, scopeReadChanged);
                    isFastPathBound = false;
                    compute.computeInstance.updater(readInfo.value, oldVal, ev.batchNum);
                }
            }, isFastPathBound = false, compute = can.compute(undefined, {
                on: function () {
                    readInfo = getValueAndBindScopeRead(scopeRead, scopeReadChanged);
                    if (isFastPath(computeData)) {
                        var oldReadInfo = readInfo;
                        readInfo = getValueAndBindSinglePropertyRead(computeData, singlePropertyReadChanged);
                        unbindScopeRead(oldReadInfo, scopeReadChanged);
                        isFastPathBound = true;
                    }
                    compute.computeInstance.value = readInfo.value;
                    compute.computeInstance.hasDependencies = !can.isEmptyObject(readInfo.observed);
                },
                off: function () {
                    if (isFastPathBound) {
                        unbindSinglePropertyRead(computeData, singlePropertyReadChanged);
                    } else {
                        unbindScopeRead(readInfo, scopeReadChanged);
                    }
                },
                set: scopeRead,
                get: scopeRead,
                __selfUpdater: true
            });
        computeData.compute = compute;
        return computeData;
    };
});
/*can@2.2.6#view/scope/scope*/
define('can/view/scope/scope', [
    'can/util/util',
    'can/view/scope/compute_data',
    'can/construct/construct',
    'can/map/map',
    'can/list/list',
    'can/view/view',
    'can/compute/compute'
], function (can, makeComputeData) {
    var escapeReg = /(\\)?\./g, escapeDotReg = /\\\./g, getNames = function (attr) {
            var names = [], last = 0;
            attr.replace(escapeReg, function (first, second, index) {
                if (!second) {
                    names.push(attr.slice(last, index).replace(escapeDotReg, '.'));
                    last = index + first.length;
                }
            });
            names.push(attr.slice(last).replace(escapeDotReg, '.'));
            return names;
        };
    var Scope = can.Construct.extend({ read: can.compute.read }, {
            init: function (context, parent) {
                this._context = context;
                this._parent = parent;
                this.__cache = {};
            },
            attr: can.__notObserve(function (key, value) {
                var options = {
                        isArgument: true,
                        returnObserveMethods: true,
                        proxyMethods: false
                    }, res = this.read(key, options);
                if (arguments.length === 2) {
                    var lastIndex = key.lastIndexOf('.'), readKey = lastIndex !== -1 ? key.substring(0, lastIndex) : '.', obj = this.read(readKey, options).value;
                    if (lastIndex !== -1) {
                        key = key.substring(lastIndex + 1, key.length);
                    }
                    can.compute.set(obj, key, value, options);
                }
                return res.value;
            }),
            add: function (context) {
                if (context !== this._context) {
                    return new this.constructor(context, this);
                } else {
                    return this;
                }
            },
            computeData: function (key, options) {
                return makeComputeData(this, key, options);
            },
            compute: function (key, options) {
                return this.computeData(key, options).compute;
            },
            read: function (attr, options) {
                var stopLookup;
                if (attr.substr(0, 2) === './') {
                    stopLookup = true;
                    attr = attr.substr(2);
                } else if (attr.substr(0, 3) === '../') {
                    return this._parent.read(attr.substr(3), options);
                } else if (attr === '..') {
                    return { value: this._parent._context };
                } else if (attr === '.' || attr === 'this') {
                    return { value: this._context };
                }
                var names = attr.indexOf('\\.') === -1 ? attr.split('.') : getNames(attr), context, scope = this, defaultObserve, defaultReads = [], defaultPropertyDepth = -1, defaultComputeReadings, defaultScope, currentObserve, currentReads;
                while (scope) {
                    context = scope._context;
                    if (context !== null && (typeof context === 'object' || typeof context === 'function')) {
                        var data = can.compute.read(context, names, can.simpleExtend({
                                foundObservable: function (observe, nameIndex) {
                                    currentObserve = observe;
                                    currentReads = names.slice(nameIndex);
                                },
                                earlyExit: function (parentValue, nameIndex) {
                                    if (nameIndex > defaultPropertyDepth) {
                                        defaultObserve = currentObserve;
                                        defaultReads = currentReads;
                                        defaultPropertyDepth = nameIndex;
                                        defaultScope = scope;
                                        defaultComputeReadings = can.__clearReading();
                                    }
                                },
                                executeAnonymousFunctions: true
                            }, options));
                        if (data.value !== undefined) {
                            return {
                                scope: scope,
                                rootObserve: currentObserve,
                                value: data.value,
                                reads: currentReads
                            };
                        }
                    }
                    can.__clearReading();
                    if (!stopLookup) {
                        scope = scope._parent;
                    } else {
                        scope = null;
                    }
                }
                if (defaultObserve) {
                    can.__setReading(defaultComputeReadings);
                    return {
                        scope: defaultScope,
                        rootObserve: defaultObserve,
                        reads: defaultReads,
                        value: undefined
                    };
                } else {
                    return {
                        names: names,
                        value: undefined
                    };
                }
            }
        });
    can.view.Scope = Scope;
    return Scope;
});
/*can@2.2.6#view/scanner*/
define('can/view/scanner', [
    'can/view/view',
    'can/view/elements',
    'can/view/callbacks/callbacks'
], function (can, elements, viewCallbacks) {
    var newLine = /(\r|\n)+/g, notEndTag = /\//, clean = function (content) {
            return content.split('\\').join('\\\\').split('\n').join('\\n').split('"').join('\\"').split('\t').join('\\t');
        }, getTag = function (tagName, tokens, i) {
            if (tagName) {
                return tagName;
            } else {
                while (i < tokens.length) {
                    if (tokens[i] === '<' && !notEndTag.test(tokens[i + 1])) {
                        return elements.reverseTagMap[tokens[i + 1]] || 'span';
                    }
                    i++;
                }
            }
            return '';
        }, bracketNum = function (content) {
            return --content.split('{').length - --content.split('}').length;
        }, myEval = function (script) {
            eval(script);
        }, attrReg = /([^\s]+)[\s]*=[\s]*$/, startTxt = 'var ___v1ew = [];', finishTxt = 'return ___v1ew.join(\'\')', put_cmd = '___v1ew.push(\n', insert_cmd = put_cmd, htmlTag = null, quote = null, beforeQuote = null, rescan = null, getAttrName = function () {
            var matches = beforeQuote.match(attrReg);
            return matches && matches[1];
        }, status = function () {
            return quote ? '\'' + getAttrName() + '\'' : htmlTag ? 1 : 0;
        }, top = function (stack) {
            return stack[stack.length - 1];
        }, Scanner;
    can.view.Scanner = Scanner = function (options) {
        can.extend(this, {
            text: {},
            tokens: []
        }, options);
        this.text.options = this.text.options || '';
        this.tokenReg = [];
        this.tokenSimple = {
            '<': '<',
            '>': '>',
            '"': '"',
            '\'': '\''
        };
        this.tokenComplex = [];
        this.tokenMap = {};
        for (var i = 0, token; token = this.tokens[i]; i++) {
            if (token[2]) {
                this.tokenReg.push(token[2]);
                this.tokenComplex.push({
                    abbr: token[1],
                    re: new RegExp(token[2]),
                    rescan: token[3]
                });
            } else {
                this.tokenReg.push(token[1]);
                this.tokenSimple[token[1]] = token[0];
            }
            this.tokenMap[token[0]] = token[1];
        }
        this.tokenReg = new RegExp('(' + this.tokenReg.slice(0).concat([
            '<',
            '>',
            '"',
            '\''
        ]).join('|') + ')', 'g');
    };
    Scanner.prototype = {
        helpers: [],
        scan: function (source, name) {
            var tokens = [], last = 0, simple = this.tokenSimple, complex = this.tokenComplex;
            source = source.replace(newLine, '\n');
            if (this.transform) {
                source = this.transform(source);
            }
            source.replace(this.tokenReg, function (whole, part) {
                var offset = arguments[arguments.length - 2];
                if (offset > last) {
                    tokens.push(source.substring(last, offset));
                }
                if (simple[whole]) {
                    tokens.push(whole);
                } else {
                    for (var i = 0, token; token = complex[i]; i++) {
                        if (token.re.test(whole)) {
                            tokens.push(token.abbr);
                            if (token.rescan) {
                                tokens.push(token.rescan(part));
                            }
                            break;
                        }
                    }
                }
                last = offset + part.length;
            });
            if (last < source.length) {
                tokens.push(source.substr(last));
            }
            var content = '', buff = [startTxt + (this.text.start || '')], put = function (content, bonus) {
                    buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
                }, endStack = [], lastToken, startTag = null, magicInTag = false, specialStates = {
                    attributeHookups: [],
                    tagHookups: [],
                    lastTagHookup: ''
                }, popTagHookup = function () {
                    specialStates.lastTagHookup = specialStates.tagHookups.pop() + specialStates.tagHookups.length;
                }, tagName = '', tagNames = [], popTagName = false, bracketCount, specialAttribute = false, i = 0, token, tmap = this.tokenMap, attrName;
            htmlTag = quote = beforeQuote = null;
            for (; (token = tokens[i++]) !== undefined;) {
                if (startTag === null) {
                    switch (token) {
                    case tmap.left:
                    case tmap.escapeLeft:
                    case tmap.returnLeft:
                        magicInTag = htmlTag && 1;
                    case tmap.commentLeft:
                        startTag = token;
                        if (content.length) {
                            put(content);
                        }
                        content = '';
                        break;
                    case tmap.escapeFull:
                        magicInTag = htmlTag && 1;
                        rescan = 1;
                        startTag = tmap.escapeLeft;
                        if (content.length) {
                            put(content);
                        }
                        rescan = tokens[i++];
                        content = rescan.content || rescan;
                        if (rescan.before) {
                            put(rescan.before);
                        }
                        tokens.splice(i, 0, tmap.right);
                        break;
                    case tmap.commentFull:
                        break;
                    case tmap.templateLeft:
                        content += tmap.left;
                        break;
                    case '<':
                        if (tokens[i].indexOf('!--') !== 0) {
                            htmlTag = 1;
                            magicInTag = 0;
                        }
                        content += token;
                        break;
                    case '>':
                        htmlTag = 0;
                        var emptyElement = content.substr(content.length - 1) === '/' || content.substr(content.length - 2) === '--', attrs = '';
                        if (specialStates.attributeHookups.length) {
                            attrs = 'attrs: [\'' + specialStates.attributeHookups.join('\',\'') + '\'], ';
                            specialStates.attributeHookups = [];
                        }
                        if (tagName + specialStates.tagHookups.length !== specialStates.lastTagHookup && tagName === top(specialStates.tagHookups)) {
                            if (emptyElement) {
                                content = content.substr(0, content.length - 1);
                            }
                            buff.push(put_cmd, '"', clean(content), '"', ',can.view.pending({tagName:\'' + tagName + '\',' + attrs + 'scope: ' + (this.text.scope || 'this') + this.text.options);
                            if (emptyElement) {
                                buff.push('}));');
                                content = '/>';
                                popTagHookup();
                            } else if (tokens[i] === '<' && tokens[i + 1] === '/' + tagName) {
                                buff.push('}));');
                                content = token;
                                popTagHookup();
                            } else {
                                buff.push(',subtemplate: function(' + this.text.argNames + '){\n' + startTxt + (this.text.start || ''));
                                content = '';
                            }
                        } else if (magicInTag || !popTagName && elements.tagToContentPropMap[tagNames[tagNames.length - 1]] || attrs) {
                            var pendingPart = ',can.view.pending({' + attrs + 'scope: ' + (this.text.scope || 'this') + this.text.options + '}),"';
                            if (emptyElement) {
                                put(content.substr(0, content.length - 1), pendingPart + '/>"');
                            } else {
                                put(content, pendingPart + '>"');
                            }
                            content = '';
                            magicInTag = 0;
                        } else {
                            content += token;
                        }
                        if (emptyElement || popTagName) {
                            tagNames.pop();
                            tagName = tagNames[tagNames.length - 1];
                            popTagName = false;
                        }
                        specialStates.attributeHookups = [];
                        break;
                    case '\'':
                    case '"':
                        if (htmlTag) {
                            if (quote && quote === token) {
                                quote = null;
                                var attr = getAttrName();
                                if (viewCallbacks.attr(attr)) {
                                    specialStates.attributeHookups.push(attr);
                                }
                                if (specialAttribute) {
                                    content += token;
                                    put(content);
                                    buff.push(finishTxt, '}));\n');
                                    content = '';
                                    specialAttribute = false;
                                    break;
                                }
                            } else if (quote === null) {
                                quote = token;
                                beforeQuote = lastToken;
                                attrName = getAttrName();
                                if (tagName === 'img' && attrName === 'src' || attrName === 'style') {
                                    put(content.replace(attrReg, ''));
                                    content = '';
                                    specialAttribute = true;
                                    buff.push(insert_cmd, 'can.view.txt(2,\'' + getTag(tagName, tokens, i) + '\',' + status() + ',this,function(){', startTxt);
                                    put(attrName + '=' + token);
                                    break;
                                }
                            }
                        }
                    default:
                        if (lastToken === '<') {
                            tagName = token.substr(0, 3) === '!--' ? '!--' : token.split(/\s/)[0];
                            var isClosingTag = false, cleanedTagName;
                            if (tagName.indexOf('/') === 0) {
                                isClosingTag = true;
                                cleanedTagName = tagName.substr(1);
                            }
                            if (isClosingTag) {
                                if (top(tagNames) === cleanedTagName) {
                                    tagName = cleanedTagName;
                                    popTagName = true;
                                }
                                if (top(specialStates.tagHookups) === cleanedTagName) {
                                    put(content.substr(0, content.length - 1));
                                    buff.push(finishTxt + '}}) );');
                                    content = '><';
                                    popTagHookup();
                                }
                            } else {
                                if (tagName.lastIndexOf('/') === tagName.length - 1) {
                                    tagName = tagName.substr(0, tagName.length - 1);
                                }
                                if (tagName !== '!--' && viewCallbacks.tag(tagName)) {
                                    if (tagName === 'content' && elements.tagMap[top(tagNames)]) {
                                        token = token.replace('content', elements.tagMap[top(tagNames)]);
                                    }
                                    specialStates.tagHookups.push(tagName);
                                }
                                tagNames.push(tagName);
                            }
                        }
                        content += token;
                        break;
                    }
                } else {
                    switch (token) {
                    case tmap.right:
                    case tmap.returnRight:
                        switch (startTag) {
                        case tmap.left:
                            bracketCount = bracketNum(content);
                            if (bracketCount === 1) {
                                buff.push(insert_cmd, 'can.view.txt(0,\'' + getTag(tagName, tokens, i) + '\',' + status() + ',this,function(){', startTxt, content);
                                endStack.push({
                                    before: '',
                                    after: finishTxt + '}));\n'
                                });
                            } else {
                                last = endStack.length && bracketCount === -1 ? endStack.pop() : { after: ';' };
                                if (last.before) {
                                    buff.push(last.before);
                                }
                                buff.push(content, ';', last.after);
                            }
                            break;
                        case tmap.escapeLeft:
                        case tmap.returnLeft:
                            bracketCount = bracketNum(content);
                            if (bracketCount) {
                                endStack.push({
                                    before: finishTxt,
                                    after: '}));\n'
                                });
                            }
                            var escaped = startTag === tmap.escapeLeft ? 1 : 0, commands = {
                                    insert: insert_cmd,
                                    tagName: getTag(tagName, tokens, i),
                                    status: status(),
                                    specialAttribute: specialAttribute
                                };
                            for (var ii = 0; ii < this.helpers.length; ii++) {
                                var helper = this.helpers[ii];
                                if (helper.name.test(content)) {
                                    content = helper.fn(content, commands);
                                    if (helper.name.source === /^>[\s]*\w*/.source) {
                                        escaped = 0;
                                    }
                                    break;
                                }
                            }
                            if (typeof content === 'object') {
                                if (content.startTxt && content.end && specialAttribute) {
                                    buff.push(insert_cmd, 'can.view.toStr( ', content.content, '() ) );');
                                } else {
                                    if (content.startTxt) {
                                        buff.push(insert_cmd, 'can.view.txt(\n' + (typeof status() === 'string' || (content.escaped != null ? content.escaped : escaped)) + ',\n\'' + tagName + '\',\n' + status() + ',\nthis,\n');
                                    } else if (content.startOnlyTxt) {
                                        buff.push(insert_cmd, 'can.view.onlytxt(this,\n');
                                    }
                                    buff.push(content.content);
                                    if (content.end) {
                                        buff.push('));');
                                    }
                                }
                            } else if (specialAttribute) {
                                buff.push(insert_cmd, content, ');');
                            } else {
                                buff.push(insert_cmd, 'can.view.txt(\n' + (typeof status() === 'string' || escaped) + ',\n\'' + tagName + '\',\n' + status() + ',\nthis,\nfunction(){ ' + (this.text.escape || '') + 'return ', content, bracketCount ? startTxt : '}));\n');
                            }
                            if (rescan && rescan.after && rescan.after.length) {
                                put(rescan.after.length);
                                rescan = null;
                            }
                            break;
                        }
                        startTag = null;
                        content = '';
                        break;
                    case tmap.templateLeft:
                        content += tmap.left;
                        break;
                    default:
                        content += token;
                        break;
                    }
                }
                lastToken = token;
            }
            if (content.length) {
                put(content);
            }
            buff.push(';');
            var template = buff.join(''), out = { out: (this.text.outStart || '') + template + ' ' + finishTxt + (this.text.outEnd || '') };
            myEval.call(out, 'this.fn = (function(' + this.text.argNames + '){' + out.out + '});\r\n//# sourceURL=' + name + '.js');
            return out;
        }
    };
    can.view.pending = function (viewData) {
        var hooks = can.view.getHooks();
        return can.view.hook(function (el) {
            can.each(hooks, function (fn) {
                fn(el);
            });
            viewData.templateType = 'legacy';
            if (viewData.tagName) {
                viewCallbacks.tagHandler(el, viewData.tagName, viewData);
            }
            can.each(viewData && viewData.attrs || [], function (attributeName) {
                viewData.attributeName = attributeName;
                var callback = viewCallbacks.attr(attributeName);
                if (callback) {
                    callback(el, viewData);
                }
            });
        });
    };
    can.view.tag('content', function (el, tagData) {
        return tagData.scope;
    });
    can.view.Scanner = Scanner;
    return Scanner;
});
/*can@2.2.6#view/node_lists/node_lists*/
define('can/view/node_lists/node_lists', [
    'can/util/util',
    'can/view/elements'
], function (can) {
    var canExpando = true;
    try {
        document.createTextNode('')._ = 0;
    } catch (ex) {
        canExpando = false;
    }
    var nodeMap = {}, textNodeMap = {}, expando = 'ejs_' + Math.random(), _id = 0, id = function (node, localMap) {
            var _textNodeMap = localMap || textNodeMap;
            var id = readId(node, _textNodeMap);
            if (id) {
                return id;
            } else {
                if (canExpando || node.nodeType !== 3) {
                    ++_id;
                    return node[expando] = (node.nodeName ? 'element_' : 'obj_') + _id;
                } else {
                    ++_id;
                    _textNodeMap['text_' + _id] = node;
                    return 'text_' + _id;
                }
            }
        }, readId = function (node, textNodeMap) {
            if (canExpando || node.nodeType !== 3) {
                return node[expando];
            } else {
                for (var textNodeID in textNodeMap) {
                    if (textNodeMap[textNodeID] === node) {
                        return textNodeID;
                    }
                }
            }
        }, splice = [].splice, push = [].push, itemsInChildListTree = function (list) {
            var count = 0;
            for (var i = 0, len = list.length; i < len; i++) {
                var item = list[i];
                if (item.nodeType) {
                    count++;
                } else {
                    count += itemsInChildListTree(item);
                }
            }
            return count;
        }, replacementMap = function (replacements, idMap) {
            var map = {};
            for (var i = 0, len = replacements.length; i < len; i++) {
                var node = nodeLists.first(replacements[i]);
                map[id(node, idMap)] = replacements[i];
            }
            return map;
        };
    var nodeLists = {
            id: id,
            update: function (nodeList, newNodes) {
                var oldNodes = nodeLists.unregisterChildren(nodeList);
                newNodes = can.makeArray(newNodes);
                var oldListLength = nodeList.length;
                splice.apply(nodeList, [
                    0,
                    oldListLength
                ].concat(newNodes));
                if (nodeList.replacements) {
                    nodeLists.nestReplacements(nodeList);
                } else {
                    nodeLists.nestList(nodeList);
                }
                return oldNodes;
            },
            nestReplacements: function (list) {
                var index = 0, idMap = {}, rMap = replacementMap(list.replacements, idMap), rCount = list.replacements.length;
                while (index < list.length && rCount) {
                    var node = list[index], replacement = rMap[readId(node, idMap)];
                    if (replacement) {
                        list.splice(index, itemsInChildListTree(replacement), replacement);
                        rCount--;
                    }
                    index++;
                }
                list.replacements = [];
            },
            nestList: function (list) {
                var index = 0;
                while (index < list.length) {
                    var node = list[index], childNodeList = nodeMap[id(node)];
                    if (childNodeList) {
                        if (childNodeList !== list) {
                            list.splice(index, itemsInChildListTree(childNodeList), childNodeList);
                        }
                    } else {
                        nodeMap[id(node)] = list;
                    }
                    index++;
                }
            },
            last: function (nodeList) {
                var last = nodeList[nodeList.length - 1];
                if (last.nodeType) {
                    return last;
                } else {
                    return nodeLists.last(last);
                }
            },
            first: function (nodeList) {
                var first = nodeList[0];
                if (first.nodeType) {
                    return first;
                } else {
                    return nodeLists.first(first);
                }
            },
            flatten: function (nodeList) {
                var items = [];
                for (var i = 0; i < nodeList.length; i++) {
                    var item = nodeList[i];
                    if (item.nodeType) {
                        items.push(item);
                    } else {
                        items.push.apply(items, nodeLists.flatten(item));
                    }
                }
                return items;
            },
            register: function (nodeList, unregistered, parent) {
                nodeList.unregistered = unregistered;
                nodeList.parentList = parent;
                if (parent === true) {
                    nodeList.replacements = [];
                } else if (parent) {
                    parent.replacements.push(nodeList);
                    nodeList.replacements = [];
                } else {
                    nodeLists.nestList(nodeList);
                }
                return nodeList;
            },
            unregisterChildren: function (nodeList) {
                var nodes = [];
                can.each(nodeList, function (node) {
                    if (node.nodeType) {
                        if (!nodeList.replacements) {
                            delete nodeMap[id(node)];
                        }
                        nodes.push(node);
                    } else {
                        push.apply(nodes, nodeLists.unregister(node));
                    }
                });
                return nodes;
            },
            unregister: function (nodeList) {
                var nodes = nodeLists.unregisterChildren(nodeList);
                if (nodeList.unregistered) {
                    var unregisteredCallback = nodeList.unregistered;
                    delete nodeList.unregistered;
                    delete nodeList.replacements;
                    unregisteredCallback();
                }
                return nodes;
            },
            nodeMap: nodeMap
        };
    can.view.nodeLists = nodeLists;
    return nodeLists;
});
/*can@2.2.6#view/parser/parser*/
define('can/view/parser/parser', ['can/view/view'], function (can) {
    function makeMap(str) {
        var obj = {}, items = str.split(',');
        for (var i = 0; i < items.length; i++) {
            obj[items[i]] = true;
        }
        return obj;
    }
    function handleIntermediate(intermediate, handler) {
        for (var i = 0, len = intermediate.length; i < len; i++) {
            var item = intermediate[i];
            handler[item.tokenType].apply(handler, item.args);
        }
        return intermediate;
    }
    var alphaNumericHU = '-:A-Za-z0-9_', attributeNames = '[a-zA-Z_:][' + alphaNumericHU + ':.]*', spaceEQspace = '\\s*=\\s*', dblQuote2dblQuote = '"((?:\\\\.|[^"])*)"', quote2quote = '\'((?:\\\\.|[^\'])*)\'', attributeEqAndValue = '(?:' + spaceEQspace + '(?:' + '(?:"[^"]*")|(?:\'[^\']*\')|[^>\\s]+))?', matchStash = '\\{\\{[^\\}]*\\}\\}\\}?', stash = '\\{\\{([^\\}]*)\\}\\}\\}?', startTag = new RegExp('^<([' + alphaNumericHU + ']+)' + '(' + '(?:\\s*' + '(?:(?:' + '(?:' + attributeNames + ')?' + attributeEqAndValue + ')|' + '(?:' + matchStash + ')+)' + ')*' + ')\\s*(\\/?)>'), endTag = new RegExp('^<\\/([' + alphaNumericHU + ']+)[^>]*>'), attr = new RegExp('(?:' + '(?:(' + attributeNames + ')|' + stash + ')' + '(?:' + spaceEQspace + '(?:' + '(?:' + dblQuote2dblQuote + ')|(?:' + quote2quote + ')|([^>\\s]+)' + ')' + ')?)', 'g'), mustache = new RegExp(stash, 'g'), txtBreak = /<|\{\{/;
    var empty = makeMap('area,base,basefont,br,col,frame,hr,img,input,isindex,link,meta,param,embed');
    var block = makeMap('a,address,article,applet,aside,audio,blockquote,button,canvas,center,dd,del,dir,div,dl,dt,fieldset,figcaption,figure,footer,form,frameset,h1,h2,h3,h4,h5,h6,header,hgroup,hr,iframe,ins,isindex,li,map,menu,noframes,noscript,object,ol,output,p,pre,section,script,table,tbody,td,tfoot,th,thead,tr,ul,video');
    var inline = makeMap('abbr,acronym,applet,b,basefont,bdo,big,br,button,cite,code,del,dfn,em,font,i,iframe,img,input,ins,kbd,label,map,object,q,s,samp,script,select,small,span,strike,strong,sub,sup,textarea,tt,u,var');
    var closeSelf = makeMap('colgroup,dd,dt,li,options,p,td,tfoot,th,thead,tr');
    var fillAttrs = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected');
    var special = makeMap('script,style');
    var tokenTypes = 'start,end,close,attrStart,attrEnd,attrValue,chars,comment,special,done'.split(',');
    var fn = function () {
    };
    var HTMLParser = function (html, handler, returnIntermediate) {
        if (typeof html === 'object') {
            return handleIntermediate(html, handler);
        }
        var intermediate = [];
        handler = handler || {};
        if (returnIntermediate) {
            can.each(tokenTypes, function (name) {
                var callback = handler[name] || fn;
                handler[name] = function () {
                    if (callback.apply(this, arguments) !== false) {
                        intermediate.push({
                            tokenType: name,
                            args: can.makeArray(arguments)
                        });
                    }
                };
            });
        }
        function parseStartTag(tag, tagName, rest, unary) {
            tagName = tagName.toLowerCase();
            if (block[tagName]) {
                while (stack.last() && inline[stack.last()]) {
                    parseEndTag('', stack.last());
                }
            }
            if (closeSelf[tagName] && stack.last() === tagName) {
                parseEndTag('', tagName);
            }
            unary = empty[tagName] || !!unary;
            handler.start(tagName, unary);
            if (!unary) {
                stack.push(tagName);
            }
            HTMLParser.parseAttrs(rest, handler);
            handler.end(tagName, unary);
        }
        function parseEndTag(tag, tagName) {
            var pos;
            if (!tagName) {
                pos = 0;
            } else {
                for (pos = stack.length - 1; pos >= 0; pos--) {
                    if (stack[pos] === tagName) {
                        break;
                    }
                }
            }
            if (pos >= 0) {
                for (var i = stack.length - 1; i >= pos; i--) {
                    if (handler.close) {
                        handler.close(stack[i]);
                    }
                }
                stack.length = pos;
            }
        }
        function parseMustache(mustache, inside) {
            if (handler.special) {
                handler.special(inside);
            }
        }
        var index, chars, match, stack = [], last = html;
        stack.last = function () {
            return this[this.length - 1];
        };
        while (html) {
            chars = true;
            if (!stack.last() || !special[stack.last()]) {
                if (html.indexOf('<!--') === 0) {
                    index = html.indexOf('-->');
                    if (index >= 0) {
                        if (handler.comment) {
                            handler.comment(html.substring(4, index));
                        }
                        html = html.substring(index + 3);
                        chars = false;
                    }
                } else if (html.indexOf('</') === 0) {
                    match = html.match(endTag);
                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(endTag, parseEndTag);
                        chars = false;
                    }
                } else if (html.indexOf('<') === 0) {
                    match = html.match(startTag);
                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(startTag, parseStartTag);
                        chars = false;
                    }
                } else if (html.indexOf('{{') === 0) {
                    match = html.match(mustache);
                    if (match) {
                        html = html.substring(match[0].length);
                        match[0].replace(mustache, parseMustache);
                    }
                }
                if (chars) {
                    index = html.search(txtBreak);
                    var text = index < 0 ? html : html.substring(0, index);
                    html = index < 0 ? '' : html.substring(index);
                    if (handler.chars && text) {
                        handler.chars(text);
                    }
                }
            } else {
                html = html.replace(new RegExp('([\\s\\S]*?)</' + stack.last() + '[^>]*>'), function (all, text) {
                    text = text.replace(/<!--([\s\S]*?)-->|<!\[CDATA\[([\s\S]*?)]]>/g, '$1$2');
                    if (handler.chars) {
                        handler.chars(text);
                    }
                    return '';
                });
                parseEndTag('', stack.last());
            }
            if (html === last) {
                throw 'Parse Error: ' + html;
            }
            last = html;
        }
        parseEndTag();
        handler.done();
        return intermediate;
    };
    HTMLParser.parseAttrs = function (rest, handler) {
        (rest != null ? rest : '').replace(attr, function (text, name, special, dblQuote, singleQuote, val) {
            if (special) {
                handler.special(special);
            }
            if (name || dblQuote || singleQuote || val) {
                var value = arguments[3] ? arguments[3] : arguments[4] ? arguments[4] : arguments[5] ? arguments[5] : fillAttrs[name.toLowerCase()] ? name : '';
                handler.attrStart(name || '');
                var last = mustache.lastIndex = 0, res = mustache.exec(value), chars;
                while (res) {
                    chars = value.substring(last, mustache.lastIndex - res[0].length);
                    if (chars.length) {
                        handler.attrValue(chars);
                    }
                    handler.special(res[1]);
                    last = mustache.lastIndex;
                    res = mustache.exec(value);
                }
                chars = value.substr(last, value.length);
                if (chars) {
                    handler.attrValue(chars);
                }
                handler.attrEnd(name || '');
            }
        });
    };
    can.view.parser = HTMLParser;
    return HTMLParser;
});
/*can@2.2.6#view/live/live*/
define('can/view/live/live', [
    'can/util/util',
    'can/view/elements',
    'can/view/view',
    'can/view/node_lists/node_lists',
    'can/view/parser/parser'
], function (can, elements, view, nodeLists, parser) {
    elements = elements || can.view.elements;
    nodeLists = nodeLists || can.view.NodeLists;
    parser = parser || can.view.parser;
    var setup = function (el, bind, unbind) {
            var tornDown = false, teardown = function () {
                    if (!tornDown) {
                        tornDown = true;
                        unbind(data);
                        can.unbind.call(el, 'removed', teardown);
                    }
                    return true;
                }, data = {
                    teardownCheck: function (parent) {
                        return parent ? false : teardown();
                    }
                };
            can.bind.call(el, 'removed', teardown);
            bind(data);
            return data;
        }, listen = function (el, compute, change) {
            return setup(el, function () {
                compute.bind('change', change);
            }, function (data) {
                compute.unbind('change', change);
                if (data.nodeList) {
                    nodeLists.unregister(data.nodeList);
                }
            });
        }, getAttributeParts = function (newVal) {
            var attrs = {}, attr;
            parser.parseAttrs(newVal, {
                attrStart: function (name) {
                    attrs[name] = '';
                    attr = name;
                },
                attrValue: function (value) {
                    attrs[attr] += value;
                },
                attrEnd: function () {
                }
            });
            return attrs;
        }, splice = [].splice, isNode = function (obj) {
            return obj && obj.nodeType;
        }, addTextNodeIfNoChildren = function (frag) {
            if (!frag.childNodes.length) {
                frag.appendChild(document.createTextNode(''));
            }
        };
    var live = {
            list: function (el, compute, render, context, parentNode, nodeList) {
                var masterNodeList = nodeList || [el], indexMap = [], afterPreviousEvents = false, isTornDown = false, add = function (ev, items, index) {
                        if (!afterPreviousEvents) {
                            return;
                        }
                        var frag = document.createDocumentFragment(), newNodeLists = [], newIndicies = [];
                        can.each(items, function (item, key) {
                            var itemNodeList = [];
                            if (nodeList) {
                                nodeLists.register(itemNodeList, null, true);
                            }
                            var itemIndex = can.compute(key + index), itemHTML = render.call(context, item, itemIndex, itemNodeList), gotText = typeof itemHTML === 'string', itemFrag = can.frag(itemHTML);
                            itemFrag = gotText ? can.view.hookup(itemFrag) : itemFrag;
                            var childNodes = can.makeArray(itemFrag.childNodes);
                            if (nodeList) {
                                nodeLists.update(itemNodeList, childNodes);
                                newNodeLists.push(itemNodeList);
                            } else {
                                newNodeLists.push(nodeLists.register(childNodes));
                            }
                            frag.appendChild(itemFrag);
                            newIndicies.push(itemIndex);
                        });
                        var masterListIndex = index + 1;
                        if (!masterNodeList[masterListIndex]) {
                            elements.after(masterListIndex === 1 ? [text] : [nodeLists.last(masterNodeList[masterListIndex - 1])], frag);
                        } else {
                            var el = nodeLists.first(masterNodeList[masterListIndex]);
                            can.insertBefore(el.parentNode, frag, el);
                        }
                        splice.apply(masterNodeList, [
                            masterListIndex,
                            0
                        ].concat(newNodeLists));
                        splice.apply(indexMap, [
                            index,
                            0
                        ].concat(newIndicies));
                        for (var i = index + newIndicies.length, len = indexMap.length; i < len; i++) {
                            indexMap[i](i);
                        }
                    }, remove = function (ev, items, index, duringTeardown, fullTeardown) {
                        if (!afterPreviousEvents) {
                            return;
                        }
                        if (!duringTeardown && data.teardownCheck(text.parentNode)) {
                            return;
                        }
                        if (index < 0) {
                            index = indexMap.length + index;
                        }
                        var removedMappings = masterNodeList.splice(index + 1, items.length), itemsToRemove = [];
                        can.each(removedMappings, function (nodeList) {
                            var nodesToRemove = nodeLists.unregister(nodeList);
                            [].push.apply(itemsToRemove, nodesToRemove);
                        });
                        indexMap.splice(index, items.length);
                        for (var i = index, len = indexMap.length; i < len; i++) {
                            indexMap[i](i);
                        }
                        if (!fullTeardown) {
                            can.remove(can.$(itemsToRemove));
                        } else {
                            nodeLists.unregister(masterNodeList);
                        }
                    }, move = function (ev, item, newIndex, currentIndex) {
                        if (!afterPreviousEvents) {
                            return;
                        }
                        newIndex = newIndex + 1;
                        currentIndex = currentIndex + 1;
                        var referenceNodeList = masterNodeList[newIndex];
                        var movedElements = can.frag(nodeLists.flatten(masterNodeList[currentIndex]));
                        var referenceElement;
                        if (currentIndex < newIndex) {
                            referenceElement = nodeLists.last(referenceNodeList).nextSibling;
                        } else {
                            referenceElement = nodeLists.first(referenceNodeList);
                        }
                        var parentNode = masterNodeList[0].parentNode;
                        parentNode.insertBefore(movedElements, referenceElement);
                        var temp = masterNodeList[currentIndex];
                        [].splice.apply(masterNodeList, [
                            currentIndex,
                            1
                        ]);
                        [].splice.apply(masterNodeList, [
                            newIndex,
                            0,
                            temp
                        ]);
                    }, text = document.createTextNode(''), list, teardownList = function (fullTeardown) {
                        if (list && list.unbind) {
                            list.unbind('add', add).unbind('remove', remove).unbind('move', move);
                        }
                        remove({}, { length: masterNodeList.length - 1 }, 0, true, fullTeardown);
                    }, updateList = function (ev, newList, oldList) {
                        if (isTornDown) {
                            return;
                        }
                        teardownList();
                        list = newList || [];
                        if (list.bind) {
                            list.bind('add', add).bind('remove', remove).bind('move', move);
                        }
                        afterPreviousEvents = true;
                        add({}, list, 0);
                        afterPreviousEvents = false;
                        can.batch.afterPreviousEvents(function () {
                            afterPreviousEvents = true;
                        });
                    };
                parentNode = elements.getParentNode(el, parentNode);
                var data = setup(parentNode, function () {
                        if (can.isFunction(compute)) {
                            compute.bind('change', updateList);
                        }
                    }, function () {
                        if (can.isFunction(compute)) {
                            compute.unbind('change', updateList);
                        }
                        teardownList(true);
                    });
                if (!nodeList) {
                    live.replace(masterNodeList, text, data.teardownCheck);
                } else {
                    elements.replace(masterNodeList, text);
                    nodeLists.update(masterNodeList, [text]);
                    nodeList.unregistered = function () {
                        data.teardownCheck();
                        isTornDown = true;
                    };
                }
                updateList({}, can.isFunction(compute) ? compute() : compute);
            },
            html: function (el, compute, parentNode, nodeList) {
                var data;
                parentNode = elements.getParentNode(el, parentNode);
                data = listen(parentNode, compute, function (ev, newVal, oldVal) {
                    var attached = nodeLists.first(nodes).parentNode;
                    if (attached) {
                        makeAndPut(newVal);
                    }
                    data.teardownCheck(nodeLists.first(nodes).parentNode);
                });
                var nodes = nodeList || [el], makeAndPut = function (val) {
                        var isFunction = typeof val === 'function', aNode = isNode(val), frag = can.frag(isFunction ? '' : val), oldNodes = can.makeArray(nodes);
                        addTextNodeIfNoChildren(frag);
                        if (!aNode && !isFunction) {
                            frag = can.view.hookup(frag, parentNode);
                        }
                        oldNodes = nodeLists.update(nodes, frag.childNodes);
                        if (isFunction) {
                            val(frag.childNodes[0]);
                        }
                        elements.replace(oldNodes, frag);
                    };
                data.nodeList = nodes;
                if (!nodeList) {
                    nodeLists.register(nodes, data.teardownCheck);
                } else {
                    nodeList.unregistered = data.teardownCheck;
                }
                makeAndPut(compute());
            },
            replace: function (nodes, val, teardown) {
                var oldNodes = nodes.slice(0), frag = can.frag(val);
                nodeLists.register(nodes, teardown);
                if (typeof val === 'string') {
                    frag = can.view.hookup(frag, nodes[0].parentNode);
                }
                nodeLists.update(nodes, frag.childNodes);
                elements.replace(oldNodes, frag);
                return nodes;
            },
            text: function (el, compute, parentNode, nodeList) {
                var parent = elements.getParentNode(el, parentNode);
                var data = listen(parent, compute, function (ev, newVal, oldVal) {
                        if (typeof node.nodeValue !== 'unknown') {
                            node.nodeValue = can.view.toStr(newVal);
                        }
                        data.teardownCheck(node.parentNode);
                    });
                var node = document.createTextNode(can.view.toStr(compute()));
                if (nodeList) {
                    nodeList.unregistered = data.teardownCheck;
                    data.nodeList = nodeList;
                    nodeLists.update(nodeList, [node]);
                    elements.replace([el], node);
                } else {
                    data.nodeList = live.replace([el], node, data.teardownCheck);
                }
            },
            setAttributes: function (el, newVal) {
                var attrs = getAttributeParts(newVal);
                for (var name in attrs) {
                    can.attr.set(el, name, attrs[name]);
                }
            },
            attributes: function (el, compute, currentValue) {
                var oldAttrs = {};
                var setAttrs = function (newVal) {
                    var newAttrs = getAttributeParts(newVal), name;
                    for (name in newAttrs) {
                        var newValue = newAttrs[name], oldValue = oldAttrs[name];
                        if (newValue !== oldValue) {
                            can.attr.set(el, name, newValue);
                        }
                        delete oldAttrs[name];
                    }
                    for (name in oldAttrs) {
                        elements.removeAttr(el, name);
                    }
                    oldAttrs = newAttrs;
                };
                listen(el, compute, function (ev, newVal) {
                    setAttrs(newVal);
                });
                if (arguments.length >= 3) {
                    oldAttrs = getAttributeParts(currentValue);
                } else {
                    setAttrs(compute());
                }
            },
            attributePlaceholder: '__!!__',
            attributeReplace: /__!!__/g,
            attribute: function (el, attributeName, compute) {
                listen(el, compute, function (ev, newVal) {
                    elements.setAttr(el, attributeName, hook.render());
                });
                var wrapped = can.$(el), hooks;
                hooks = can.data(wrapped, 'hooks');
                if (!hooks) {
                    can.data(wrapped, 'hooks', hooks = {});
                }
                var attr = elements.getAttr(el, attributeName), parts = attr.split(live.attributePlaceholder), goodParts = [], hook;
                goodParts.push(parts.shift(), parts.join(live.attributePlaceholder));
                if (hooks[attributeName]) {
                    hooks[attributeName].computes.push(compute);
                } else {
                    hooks[attributeName] = {
                        render: function () {
                            var i = 0, newAttr = attr ? attr.replace(live.attributeReplace, function () {
                                    return elements.contentText(hook.computes[i++]());
                                }) : elements.contentText(hook.computes[i++]());
                            return newAttr;
                        },
                        computes: [compute],
                        batchNum: undefined
                    };
                }
                hook = hooks[attributeName];
                goodParts.splice(1, 0, compute());
                elements.setAttr(el, attributeName, goodParts.join(''));
            },
            specialAttribute: function (el, attributeName, compute) {
                listen(el, compute, function (ev, newVal) {
                    elements.setAttr(el, attributeName, getValue(newVal));
                });
                elements.setAttr(el, attributeName, getValue(compute()));
            },
            simpleAttribute: function (el, attributeName, compute) {
                listen(el, compute, function (ev, newVal) {
                    elements.setAttr(el, attributeName, newVal);
                });
                elements.setAttr(el, attributeName, compute());
            }
        };
    live.attr = live.simpleAttribute;
    live.attrs = live.attributes;
    var newLine = /(\r|\n)+/g;
    var getValue = function (val) {
        var regexp = /^["'].*["']$/;
        val = val.replace(elements.attrReg, '').replace(newLine, '');
        return regexp.test(val) ? val.substr(1, val.length - 2) : val;
    };
    can.view.live = live;
    return live;
});
/*can@2.2.6#view/render*/
define('can/view/render', [
    'can/view/view',
    'can/view/elements',
    'can/view/live/live',
    'can/util/string/string'
], function (can, elements, live) {
    var pendingHookups = [], tagChildren = function (tagName) {
            var newTag = elements.tagMap[tagName] || 'span';
            if (newTag === 'span') {
                return '@@!!@@';
            }
            return '<' + newTag + '>' + tagChildren(newTag) + '</' + newTag + '>';
        }, contentText = function (input, tag) {
            if (typeof input === 'string') {
                return input;
            }
            if (!input && input !== 0) {
                return '';
            }
            var hook = input.hookup && function (el, id) {
                    input.hookup.call(input, el, id);
                } || typeof input === 'function' && input;
            if (hook) {
                if (tag) {
                    return '<' + tag + ' ' + can.view.hook(hook) + '></' + tag + '>';
                } else {
                    pendingHookups.push(hook);
                }
                return '';
            }
            return '' + input;
        }, contentEscape = function (txt, tag) {
            return typeof txt === 'string' || typeof txt === 'number' ? can.esc(txt) : contentText(txt, tag);
        }, withinTemplatedSectionWithinAnElement = false, emptyHandler = function () {
        };
    var lastHookups;
    can.extend(can.view, {
        live: live,
        setupLists: function () {
            var old = can.view.lists, data;
            can.view.lists = function (list, renderer) {
                data = {
                    list: list,
                    renderer: renderer
                };
                return Math.random();
            };
            return function () {
                can.view.lists = old;
                return data;
            };
        },
        getHooks: function () {
            var hooks = pendingHookups.slice(0);
            lastHookups = hooks;
            pendingHookups = [];
            return hooks;
        },
        onlytxt: function (self, func) {
            return contentEscape(func.call(self));
        },
        txt: function (escape, tagName, status, self, func) {
            var tag = elements.tagMap[tagName] || 'span', setupLiveBinding = false, value, listData, compute, unbind = emptyHandler, attributeName;
            if (withinTemplatedSectionWithinAnElement) {
                value = func.call(self);
            } else {
                if (typeof status === 'string' || status === 1) {
                    withinTemplatedSectionWithinAnElement = true;
                }
                var listTeardown = can.view.setupLists();
                unbind = function () {
                    compute.unbind('change', emptyHandler);
                };
                compute = can.compute(func, self, false);
                compute.bind('change', emptyHandler);
                listData = listTeardown();
                value = compute();
                withinTemplatedSectionWithinAnElement = false;
                setupLiveBinding = compute.computeInstance.hasDependencies;
            }
            if (listData) {
                unbind();
                return '<' + tag + can.view.hook(function (el, parentNode) {
                    live.list(el, listData.list, listData.renderer, self, parentNode);
                }) + '></' + tag + '>';
            }
            if (!setupLiveBinding || typeof value === 'function') {
                unbind();
                return (withinTemplatedSectionWithinAnElement || escape === 2 || !escape ? contentText : contentEscape)(value, status === 0 && tag);
            }
            var contentProp = elements.tagToContentPropMap[tagName];
            if (status === 0 && !contentProp) {
                return '<' + tag + can.view.hook(escape && typeof value !== 'object' ? function (el, parentNode) {
                    live.text(el, compute, parentNode);
                    unbind();
                } : function (el, parentNode) {
                    live.html(el, compute, parentNode);
                    unbind();
                }) + '>' + tagChildren(tag) + '</' + tag + '>';
            } else if (status === 1) {
                pendingHookups.push(function (el) {
                    live.attributes(el, compute, compute());
                    unbind();
                });
                return compute();
            } else if (escape === 2) {
                attributeName = status;
                pendingHookups.push(function (el) {
                    live.specialAttribute(el, attributeName, compute);
                    unbind();
                });
                return compute();
            } else {
                attributeName = status === 0 ? contentProp : status;
                (status === 0 ? lastHookups : pendingHookups).push(function (el) {
                    live.attribute(el, attributeName, compute);
                    unbind();
                });
                return live.attributePlaceholder;
            }
        }
    });
    return can;
});
/*can@2.2.6#view/stache/utils*/
define('can/view/stache/utils', ['can/util/util'], function () {
    return {
        isArrayLike: function (obj) {
            return obj && obj.splice && typeof obj.length === 'number';
        },
        isObserveLike: function (obj) {
            return obj instanceof can.Map || obj && !!obj._get;
        },
        emptyHandler: function () {
        },
        jsonParse: function (str) {
            if (str[0] === '\'') {
                return str.substr(1, str.length - 2);
            } else if (str === 'undefined') {
                return undefined;
            } else if (can.global.JSON) {
                return JSON.parse(str);
            } else {
                return eval('(' + str + ')');
            }
        },
        mixins: {
            last: function () {
                return this.stack[this.stack.length - 1];
            },
            add: function (chars) {
                this.last().add(chars);
            },
            subSectionDepth: function () {
                return this.stack.length - 1;
            }
        }
    };
});
/*can@2.2.6#view/stache/mustache_helpers*/
define('can/view/stache/mustache_helpers', [
    'can/util/util',
    'can/view/stache/utils',
    'can/view/live/live'
], function (can, utils, live) {
    live = live || can.view.live;
    var resolve = function (value) {
        if (utils.isObserveLike(value) && utils.isArrayLike(value) && value.attr('length')) {
            return value;
        } else if (can.isFunction(value)) {
            return value();
        } else {
            return value;
        }
    };
    var helpers = {
            'each': function (items, options) {
                var resolved = resolve(items), result = [], keys, key, i;
                if (resolved instanceof can.List) {
                    return function (el) {
                        var nodeList = [el];
                        nodeList.expression = 'live.list';
                        can.view.nodeLists.register(nodeList, null, options.nodeList);
                        can.view.nodeLists.update(options.nodeList, [el]);
                        var cb = function (item, index, parentNodeList) {
                            return options.fn(options.scope.add({ '@index': index }).add(item), options.options, parentNodeList);
                        };
                        live.list(el, items, cb, options.context, el.parentNode, nodeList);
                    };
                }
                var expr = resolved;
                if (!!expr && utils.isArrayLike(expr)) {
                    for (i = 0; i < expr.length; i++) {
                        result.push(options.fn(options.scope.add({ '@index': i }).add(expr[i])));
                    }
                } else if (utils.isObserveLike(expr)) {
                    keys = can.Map.keys(expr);
                    for (i = 0; i < keys.length; i++) {
                        key = keys[i];
                        result.push(options.fn(options.scope.add({ '@key': key }).add(expr[key])));
                    }
                } else if (expr instanceof Object) {
                    for (key in expr) {
                        result.push(options.fn(options.scope.add({ '@key': key }).add(expr[key])));
                    }
                }
                return result;
            },
            '@index': function (offset, options) {
                if (!options) {
                    options = offset;
                    offset = 0;
                }
                var index = options.scope.attr('@index');
                return '' + ((can.isFunction(index) ? index() : index) + offset);
            },
            'if': function (expr, options) {
                var value;
                if (can.isFunction(expr)) {
                    value = can.compute.truthy(expr)();
                } else {
                    value = !!resolve(expr);
                }
                if (value) {
                    return options.fn(options.scope || this);
                } else {
                    return options.inverse(options.scope || this);
                }
            },
            'is': function () {
                var lastValue, curValue, options = arguments[arguments.length - 1];
                if (arguments.length - 2 <= 0) {
                    return options.inverse();
                }
                for (var i = 0; i < arguments.length - 1; i++) {
                    curValue = resolve(arguments[i]);
                    curValue = can.isFunction(curValue) ? curValue() : curValue;
                    if (i > 0) {
                        if (curValue !== lastValue) {
                            return options.inverse();
                        }
                    }
                    lastValue = curValue;
                }
                return options.fn();
            },
            'eq': function () {
                return helpers.is.apply(this, arguments);
            },
            'unless': function (expr, options) {
                return helpers['if'].apply(this, [
                    can.isFunction(expr) ? can.compute(function () {
                        return !expr();
                    }) : !expr,
                    options
                ]);
            },
            'with': function (expr, options) {
                var ctx = expr;
                expr = resolve(expr);
                if (!!expr) {
                    return options.fn(ctx);
                }
            },
            'log': function (expr, options) {
                if (typeof console !== 'undefined' && console.log) {
                    if (!options) {
                        console.log(expr.context);
                    } else {
                        console.log(expr, options.context);
                    }
                }
            },
            'data': function (attr) {
                var data = arguments.length === 2 ? this : arguments[1];
                return function (el) {
                    can.data(can.$(el), attr, data || this.context);
                };
            }
        };
    return {
        registerHelper: function (name, callback) {
            helpers[name] = callback;
        },
        getHelper: function (name, options) {
            var helper = options.attr('helpers.' + name);
            if (!helper) {
                helper = helpers[name];
            }
            if (helper) {
                return { fn: helper };
            }
        }
    };
});
/*can@2.2.6#view/stache/mustache_core*/
define('can/view/stache/mustache_core', [
    'can/util/util',
    'can/view/stache/utils',
    'can/view/stache/mustache_helpers',
    'can/view/live/live',
    'can/view/elements',
    'can/view/scope/scope',
    'can/view/node_lists/node_lists'
], function (can, utils, mustacheHelpers, live, elements, Scope, nodeLists) {
    live = live || can.view.live;
    elements = elements || can.view.elements;
    Scope = Scope || can.view.Scope;
    nodeLists = nodeLists || can.view.nodeLists;
    var argumentsRegExp = /((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g, literalNumberStringBooleanRegExp = /^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/, mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g, isLookup = function (obj) {
            return obj && typeof obj.get === 'string';
        }, getItemsFragContent = function (items, isObserveList, helperOptions, options) {
            var frag = document.createDocumentFragment();
            for (var i = 0, len = items.length; i < len; i++) {
                append(frag, helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options));
            }
            return frag;
        }, append = function (frag, content) {
            if (content) {
                frag.appendChild(typeof content === 'string' ? document.createTextNode(content) : content);
            }
        }, getItemsStringContent = function (items, isObserveList, helperOptions, options) {
            var txt = '';
            for (var i = 0, len = items.length; i < len; i++) {
                txt += helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options);
            }
            return txt;
        }, getKeyComputeData = function (key, scope, isArgument) {
            var data = scope.computeData(key, {
                    isArgument: isArgument,
                    args: [
                        scope.attr('.'),
                        scope
                    ]
                });
            can.compute.temporarilyBind(data.compute);
            return data;
        }, getKeyArgValue = function (key, scope) {
            var data = getKeyComputeData(key, scope, true);
            if (!data.compute.computeInstance.hasDependencies) {
                return data.initialValue;
            } else {
                return data.compute;
            }
        }, convertToScopes = function (helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer) {
            if (truthyRenderer) {
                helperOptions.fn = makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
            }
            if (falseyRenderer) {
                helperOptions.inverse = makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
            }
        }, makeRendererConvertScopes = function (renderer, parentScope, parentOptions, nodeList) {
            var rendererWithScope = function (ctx, opts, parentNodeList) {
                return renderer(ctx || parentScope, opts, parentNodeList);
            };
            return can.__notObserve(function (newScope, newOptions, parentNodeList) {
                if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
                    newScope = parentScope.add(newScope);
                }
                if (newOptions !== undefined && !(newOptions instanceof core.Options)) {
                    newOptions = parentOptions.add(newOptions);
                }
                var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList || nodeList);
                return result;
            });
        };
    var core = {
            expressionData: function (expression) {
                var args = [], hashes = {}, i = 0;
                (can.trim(expression) + ' ').replace(argumentsRegExp, function (whole, arg) {
                    var m;
                    if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
                        if (m[1] || m[2]) {
                            args.push(utils.jsonParse(m[1] || m[2]));
                        } else {
                            hashes[m[3]] = m[6] ? { get: m[6] } : utils.jsonParse(m[4] || m[5]);
                        }
                    } else {
                        args.push({ get: arg });
                    }
                    i++;
                });
                return {
                    name: args.shift(),
                    args: args,
                    hash: hashes
                };
            },
            makeEvaluator: function (scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {
                var args = [], hash = {}, helperOptions = {
                        fn: function () {
                        },
                        inverse: function () {
                        }
                    }, context = scope.attr('.'), name = exprData.name, helper, looksLikeAHelper = exprData.args.length || !can.isEmptyObject(exprData.hash), initialValue, helperEvaluator;
                for (var i = 0, len = exprData.args.length; i < len; i++) {
                    var arg = exprData.args[i];
                    if (arg && isLookup(arg)) {
                        args.push(getKeyArgValue(arg.get, scope, true));
                    } else {
                        args.push(arg);
                    }
                }
                for (var prop in exprData.hash) {
                    if (isLookup(exprData.hash[prop])) {
                        hash[prop] = getKeyArgValue(exprData.hash[prop].get, scope);
                    } else {
                        hash[prop] = exprData.hash[prop];
                    }
                }
                if (isLookup(name)) {
                    if (looksLikeAHelper) {
                        helper = mustacheHelpers.getHelper(name.get, options);
                        if (!helper && typeof context[name.get] === 'function') {
                            helper = { fn: context[name.get] };
                        }
                    }
                    if (!helper) {
                        var get = name.get;
                        var computeData = getKeyComputeData(name.get, scope, false), compute = computeData.compute;
                        initialValue = computeData.initialValue;
                        if (computeData.compute.computeInstance.hasDependencies) {
                            name = compute;
                        } else {
                            name = initialValue;
                        }
                        if (!looksLikeAHelper && initialValue === undefined) {
                            helper = mustacheHelpers.getHelper(get, options);
                        } else if (typeof initialValue === 'function') {
                            helper = { fn: initialValue };
                        }
                    }
                }
                if (mode === '^') {
                    var temp = truthyRenderer;
                    truthyRenderer = falseyRenderer;
                    falseyRenderer = temp;
                }
                if (helper) {
                    convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);
                    can.simpleExtend(helperOptions, {
                        context: context,
                        scope: scope,
                        contexts: scope,
                        hash: hash,
                        nodeList: nodeList,
                        exprData: exprData
                    });
                    args.push(helperOptions);
                    helperEvaluator = function () {
                        return helper.fn.apply(context, args) || '';
                    };
                    helperEvaluator.bindOnce = false;
                    return helperEvaluator;
                }
                if (!mode) {
                    if (name && name.isComputed) {
                        return name;
                    } else {
                        return function () {
                            return '' + (name != null ? name : '');
                        };
                    }
                } else if (mode === '#' || mode === '^') {
                    convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);
                    var evaluator = function () {
                        var value;
                        if (can.isFunction(name) && name.isComputed) {
                            value = name();
                        } else {
                            value = name;
                        }
                        if (utils.isArrayLike(value)) {
                            var isObserveList = utils.isObserveLike(value);
                            if (isObserveList ? value.attr('length') : value.length) {
                                return (stringOnly ? getItemsStringContent : getItemsFragContent)(value, isObserveList, helperOptions, options);
                            } else {
                                return helperOptions.inverse(scope, options);
                            }
                        } else {
                            return value ? helperOptions.fn(value || scope, options) : helperOptions.inverse(scope, options);
                        }
                    };
                    evaluator.bindOnce = false;
                    return evaluator;
                } else {
                }
            },
            makeLiveBindingPartialRenderer: function (partialName, state) {
                partialName = can.trim(partialName);
                return function (scope, options, parentSectionNodeList) {
                    var nodeList = [this];
                    nodeList.expression = '>' + partialName;
                    nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true : true);
                    var partialFrag = can.compute(function () {
                            var localPartialName = partialName;
                            var partial = options.attr('partials.' + localPartialName), res;
                            if (partial) {
                                res = partial.render ? partial.render(scope, options) : partial(scope, options);
                            } else {
                                var scopePartialName = scope.read(localPartialName, {
                                        isArgument: true,
                                        returnObserveMethods: true,
                                        proxyMethods: false
                                    }).value;
                                if (scopePartialName) {
                                    localPartialName = scopePartialName;
                                }
                                res = can.view.render(localPartialName, scope, options);
                            }
                            return can.frag(res);
                        });
                    live.html(this, partialFrag, this.parentNode, nodeList);
                };
            },
            makeStringBranchRenderer: function (mode, expression) {
                var exprData = expressionData(expression), fullExpression = mode + expression;
                return function branchRenderer(scope, options, truthyRenderer, falseyRenderer) {
                    var evaluator = scope.__cache[fullExpression];
                    if (mode || !evaluator) {
                        evaluator = makeEvaluator(scope, options, null, mode, exprData, truthyRenderer, falseyRenderer, true);
                        if (!mode) {
                            scope.__cache[fullExpression] = evaluator;
                        }
                    }
                    var res = evaluator();
                    return res == null ? '' : '' + res;
                };
            },
            makeLiveBindingBranchRenderer: function (mode, expression, state) {
                var exprData = expressionData(expression);
                return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer) {
                    var nodeList = [this];
                    nodeList.expression = expression;
                    nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true : true);
                    var evaluator = makeEvaluator(scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, state.tag);
                    var compute = can.compute(evaluator, null, false, evaluator.bindOnce === false ? false : true);
                    compute.bind('change', can.k);
                    var value = compute();
                    if (typeof value === 'function') {
                        var old = can.__clearReading();
                        value(this);
                        can.__setReading(old);
                    } else if (compute.computeInstance.hasDependencies) {
                        if (state.attr) {
                            live.simpleAttribute(this, state.attr, compute);
                        } else if (state.tag) {
                            live.attributes(this, compute);
                        } else if (state.text && typeof value !== 'object') {
                            live.text(this, compute, this.parentNode, nodeList);
                        } else {
                            live.html(this, compute, this.parentNode, nodeList);
                        }
                    } else {
                        if (state.attr) {
                            can.attr.set(this, state.attr, value);
                        } else if (state.tag) {
                            live.setAttributes(this, value);
                        } else if (state.text && typeof value === 'string') {
                            this.nodeValue = value;
                        } else if (value) {
                            elements.replace([this], can.frag(value));
                        }
                    }
                    compute.unbind('change', can.k);
                };
            },
            splitModeFromExpression: function (expression, state) {
                expression = can.trim(expression);
                var mode = expression.charAt(0);
                if ('#/{&^>!'.indexOf(mode) >= 0) {
                    expression = can.trim(expression.substr(1));
                } else {
                    mode = null;
                }
                if (mode === '{' && state.node) {
                    mode = null;
                }
                return {
                    mode: mode,
                    expression: expression
                };
            },
            cleanLineEndings: function (template) {
                return template.replace(mustacheLineBreakRegExp, function (whole, returnBefore, spaceBefore, special, expression, spaceAfter, returnAfter, spaceLessSpecial, spaceLessExpression, matchIndex) {
                    spaceAfter = spaceAfter || '';
                    returnBefore = returnBefore || '';
                    spaceBefore = spaceBefore || '';
                    var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression, {});
                    if (spaceLessSpecial || '>{'.indexOf(modeAndExpression.mode) >= 0) {
                        return whole;
                    } else if ('^#!/'.indexOf(modeAndExpression.mode) >= 0) {
                        return special + (matchIndex !== 0 && returnAfter.length ? returnBefore + '\n' : '');
                    } else {
                        return spaceBefore + special + spaceAfter + (spaceBefore.length || matchIndex !== 0 ? returnBefore + '\n' : '');
                    }
                });
            },
            Options: can.view.Scope.extend({
                init: function (data, parent) {
                    if (!data.helpers && !data.partials && !data.tags) {
                        data = { helpers: data };
                    }
                    can.view.Scope.prototype.init.apply(this, arguments);
                }
            })
        };
    var makeEvaluator = core.makeEvaluator, expressionData = core.expressionData, splitModeFromExpression = core.splitModeFromExpression;
    return core;
});
/*can@2.2.6#view/bindings/bindings*/
define('can/view/bindings/bindings', [
    'can/util/util',
    'can/view/stache/mustache_core',
    'can/view/callbacks/callbacks',
    'can/control/control',
    'can/view/scope/scope'
], function (can, mustacheCore) {
    var isContentEditable = function () {
            var values = {
                    '': true,
                    'true': true,
                    'false': false
                };
            var editable = function (el) {
                if (!el || !el.getAttribute) {
                    return;
                }
                var attr = el.getAttribute('contenteditable');
                return values[attr];
            };
            return function (el) {
                var val = editable(el);
                if (typeof val === 'boolean') {
                    return val;
                } else {
                    return !!editable(el.parentNode);
                }
            };
        }(), removeCurly = function (value) {
            if (value[0] === '{' && value[value.length - 1] === '}') {
                return value.substr(1, value.length - 2);
            }
            return value;
        };
    can.view.attr('can-value', function (el, data) {
        var attr = can.trim(removeCurly(el.getAttribute('can-value'))), value = data.scope.computeData(attr, { args: [] }).compute, trueValue, falseValue;
        if (el.nodeName.toLowerCase() === 'input') {
            if (el.type === 'checkbox') {
                if (can.attr.has(el, 'can-true-value')) {
                    trueValue = el.getAttribute('can-true-value');
                } else {
                    trueValue = true;
                }
                if (can.attr.has(el, 'can-false-value')) {
                    falseValue = el.getAttribute('can-false-value');
                } else {
                    falseValue = false;
                }
            }
            if (el.type === 'checkbox' || el.type === 'radio') {
                new Checked(el, {
                    value: value,
                    trueValue: trueValue,
                    falseValue: falseValue
                });
                return;
            }
        }
        if (el.nodeName.toLowerCase() === 'select' && el.multiple) {
            new Multiselect(el, { value: value });
            return;
        }
        if (isContentEditable(el)) {
            new Content(el, { value: value });
            return;
        }
        new Value(el, { value: value });
    });
    var special = {
            enter: function (data, el, original) {
                return {
                    event: 'keyup',
                    handler: function (ev) {
                        if (ev.keyCode === 13) {
                            return original.call(this, ev);
                        }
                    }
                };
            }
        };
    can.view.attr(/can-[\w\.]+/, function (el, data) {
        var attributeName = data.attributeName, event = attributeName.substr('can-'.length), handler = function (ev) {
                var attrVal = el.getAttribute(attributeName);
                if (!attrVal) {
                    return;
                }
                var attrInfo = mustacheCore.expressionData(removeCurly(attrVal));
                var scopeData = data.scope.read(attrInfo.name.get, {
                        returnObserveMethods: true,
                        isArgument: true,
                        executeAnonymousFunctions: true
                    });
                var args = [];
                var $el = can.$(this);
                var viewModel = can.viewModel($el[0]);
                var localScope = data.scope.add({
                        '@element': $el,
                        '@event': ev,
                        '@viewModel': viewModel,
                        '@scope': data.scope,
                        '@context': data.scope._context
                    });
                if (!can.isEmptyObject(attrInfo.hash)) {
                    var hash = {};
                    can.each(attrInfo.hash, function (val, key) {
                        if (val && val.hasOwnProperty('get')) {
                            var s = !val.get.indexOf('@') ? localScope : data.scope;
                            hash[key] = s.read(val.get, {}).value;
                        } else {
                            hash[key] = val;
                        }
                    });
                    args.unshift(hash);
                }
                if (attrInfo.args.length) {
                    var arg;
                    for (var i = attrInfo.args.length - 1; i >= 0; i--) {
                        arg = attrInfo.args[i];
                        if (arg && arg.hasOwnProperty('get')) {
                            var s = !arg.get.indexOf('@') ? localScope : data.scope;
                            args.unshift(s.read(arg.get, {}).value);
                        } else {
                            args.unshift(arg);
                        }
                    }
                }
                if (!args.length) {
                    args = [
                        data.scope._context,
                        $el
                    ].concat(can.makeArray(arguments));
                }
                return scopeData.value.apply(scopeData.parent, args);
            };
        if (special[event]) {
            var specialData = special[event](data, el, handler);
            handler = specialData.handler;
            event = specialData.event;
        }
        can.bind.call(el, event, handler);
    });
    var Value = can.Control.extend({
            init: function () {
                if (this.element[0].nodeName.toUpperCase() === 'SELECT') {
                    setTimeout(can.proxy(this.set, this), 1);
                } else {
                    this.set();
                }
            },
            '{value} change': 'set',
            set: function () {
                if (!this.element) {
                    return;
                }
                var val = this.options.value();
                this.element[0].value = val == null ? '' : val;
            },
            'change': function () {
                if (!this.element) {
                    return;
                }
                var el = this.element[0];
                this.options.value(el.value);
                var newVal = this.options.value();
                if (el.value !== newVal) {
                    el.value = newVal;
                }
            }
        }), Checked = can.Control.extend({
            init: function () {
                this.isCheckbox = this.element[0].type.toLowerCase() === 'checkbox';
                this.check();
            },
            '{value} change': 'check',
            check: function () {
                if (this.isCheckbox) {
                    var value = this.options.value(), trueValue = this.options.trueValue || true;
                    this.element[0].checked = value == trueValue;
                } else {
                    var setOrRemove = this.options.value() == this.element[0].value ? 'set' : 'remove';
                    can.attr[setOrRemove](this.element[0], 'checked', true);
                }
            },
            'change': function () {
                if (this.isCheckbox) {
                    this.options.value(this.element[0].checked ? this.options.trueValue : this.options.falseValue);
                } else {
                    if (this.element[0].checked) {
                        this.options.value(this.element[0].value);
                    }
                }
            }
        }), Multiselect = Value.extend({
            init: function () {
                this.delimiter = ';';
                setTimeout(can.proxy(this.set, this), 1);
            },
            set: function () {
                var newVal = this.options.value();
                if (typeof newVal === 'string') {
                    newVal = newVal.split(this.delimiter);
                    this.isString = true;
                } else if (newVal) {
                    newVal = can.makeArray(newVal);
                }
                var isSelected = {};
                can.each(newVal, function (val) {
                    isSelected[val] = true;
                });
                can.each(this.element[0].childNodes, function (option) {
                    if (option.value) {
                        option.selected = !!isSelected[option.value];
                    }
                });
            },
            get: function () {
                var values = [], children = this.element[0].childNodes;
                can.each(children, function (child) {
                    if (child.selected && child.value) {
                        values.push(child.value);
                    }
                });
                return values;
            },
            'change': function () {
                var value = this.get(), currentValue = this.options.value();
                if (this.isString || typeof currentValue === 'string') {
                    this.isString = true;
                    this.options.value(value.join(this.delimiter));
                } else if (currentValue instanceof can.List) {
                    currentValue.attr(value, true);
                } else {
                    this.options.value(value);
                }
            }
        }), Content = can.Control.extend({
            init: function () {
                this.set();
                this.on('blur', 'setValue');
            },
            '{value} change': 'set',
            set: function () {
                var val = this.options.value();
                this.element[0].innerHTML = typeof val === 'undefined' ? '' : val;
            },
            setValue: function () {
                this.options.value(this.element[0].innerHTML);
            }
        });
});
/*can@2.2.6#view/mustache/mustache*/
define('can/view/mustache/mustache', [
    'can/util/util',
    'can/view/scope/scope',
    'can/view/view',
    'can/view/scanner',
    'can/compute/compute',
    'can/view/render',
    'can/view/bindings/bindings'
], function (can) {
    can.view.ext = '.mustache';
    var SCOPE = 'scope', HASH = '___h4sh', CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options}', SPECIAL_CONTEXT_OBJ = '{scope:' + SCOPE + ',options:options, special: true}', ARG_NAMES = SCOPE + ',options', argumentsRegExp = /((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g, literalNumberStringBooleanRegExp = /^(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false|null|undefined)|((.+?)=(('.*?'|".*?"|[0-9]+\.?[0-9]*|true|false)|(.+))))$/, makeLookupLiteral = function (type) {
            return '{get:"' + type.replace(/"/g, '\\"') + '"}';
        }, isLookup = function (obj) {
            return obj && typeof obj.get === 'string';
        }, isObserveLike = function (obj) {
            return obj instanceof can.Map || obj && !!obj._get;
        }, isArrayLike = function (obj) {
            return obj && obj.splice && typeof obj.length === 'number';
        }, makeConvertToScopes = function (original, scope, options) {
            var originalWithScope = function (ctx, opts) {
                return original(ctx || scope, opts);
            };
            return function (updatedScope, updatedOptions) {
                if (updatedScope !== undefined && !(updatedScope instanceof can.view.Scope)) {
                    updatedScope = scope.add(updatedScope);
                }
                if (updatedOptions !== undefined && !(updatedOptions instanceof can.view.Options)) {
                    updatedOptions = options.add(updatedOptions);
                }
                return originalWithScope(updatedScope, updatedOptions || options);
            };
        };
    var Mustache = function (options, helpers) {
        if (this.constructor !== Mustache) {
            var mustache = new Mustache(options);
            return function (data, options) {
                return mustache.render(data, options);
            };
        }
        if (typeof options === 'function') {
            this.template = { fn: options };
            return;
        }
        can.extend(this, options);
        this.template = this.scanner.scan(this.text, this.name);
    };
    can.Mustache = can.global.Mustache = Mustache;
    Mustache.prototype.render = function (data, options) {
        if (!(data instanceof can.view.Scope)) {
            data = new can.view.Scope(data || {});
        }
        if (!(options instanceof can.view.Options)) {
            options = new can.view.Options(options || {});
        }
        options = options || {};
        return this.template.fn.call(data, data, options);
    };
    can.extend(Mustache.prototype, {
        scanner: new can.view.Scanner({
            text: {
                start: '',
                scope: SCOPE,
                options: ',options: options',
                argNames: ARG_NAMES
            },
            tokens: [
                [
                    'returnLeft',
                    '{{{',
                    '{{[{&]'
                ],
                [
                    'commentFull',
                    '{{!}}',
                    '^[\\s\\t]*{{!.+?}}\\n'
                ],
                [
                    'commentLeft',
                    '{{!',
                    '(\\n[\\s\\t]*{{!|{{!)'
                ],
                [
                    'escapeFull',
                    '{{}}',
                    '(^[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}\\n|\\n[\\s\\t]*{{[#/^][^}]+?}}$)',
                    function (content) {
                        return {
                            before: /^\n.+?\n$/.test(content) ? '\n' : '',
                            content: content.match(/\{\{(.+?)\}\}/)[1] || ''
                        };
                    }
                ],
                [
                    'escapeLeft',
                    '{{'
                ],
                [
                    'returnRight',
                    '}}}'
                ],
                [
                    'right',
                    '}}'
                ]
            ],
            helpers: [
                {
                    name: /^>[\s]*\w*/,
                    fn: function (content, cmd) {
                        var templateName = can.trim(content.replace(/^>\s?/, '')).replace(/["|']/g, '');
                        return 'can.Mustache.renderPartial(\'' + templateName + '\',' + ARG_NAMES + ')';
                    }
                },
                {
                    name: /^\s*data\s/,
                    fn: function (content, cmd) {
                        var attr = content.match(/["|'](.*)["|']/)[1];
                        return 'can.proxy(function(__){' + 'can.data(can.$(__),\'' + attr + '\', this.attr(\'.\')); }, ' + SCOPE + ')';
                    }
                },
                {
                    name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                    fn: function (content) {
                        var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/, parts = content.match(quickFunc);
                        return 'can.proxy(function(__){var ' + parts[1] + '=can.$(__);with(' + SCOPE + '.attr(\'.\')){' + parts[2] + '}}, this);';
                    }
                },
                {
                    name: /^.*$/,
                    fn: function (content, cmd) {
                        var mode = false, result = {
                                content: '',
                                startTxt: false,
                                startOnlyTxt: false,
                                end: false
                            };
                        content = can.trim(content);
                        if (content.length && (mode = content.match(/^([#^\/]|else$)/))) {
                            mode = mode[0];
                            switch (mode) {
                            case '#':
                            case '^':
                                if (cmd.specialAttribute) {
                                    result.startOnlyTxt = true;
                                } else {
                                    result.startTxt = true;
                                    result.escaped = 0;
                                }
                                break;
                            case '/':
                                result.end = true;
                                result.content += 'return ___v1ew.join("");}}])';
                                return result;
                            }
                            content = content.substring(1);
                        }
                        if (mode !== 'else') {
                            var args = [], hashes = [], i = 0, m;
                            result.content += 'can.Mustache.txt(\n' + (cmd.specialAttribute ? SPECIAL_CONTEXT_OBJ : CONTEXT_OBJ) + ',\n' + (mode ? '"' + mode + '"' : 'null') + ',';
                            (can.trim(content) + ' ').replace(argumentsRegExp, function (whole, arg) {
                                if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
                                    if (m[2]) {
                                        args.push(m[0]);
                                    } else {
                                        hashes.push(m[4] + ':' + (m[6] ? m[6] : makeLookupLiteral(m[5])));
                                    }
                                } else {
                                    args.push(makeLookupLiteral(arg));
                                }
                                i++;
                            });
                            result.content += args.join(',');
                            if (hashes.length) {
                                result.content += ',{' + HASH + ':{' + hashes.join(',') + '}}';
                            }
                        }
                        if (mode && mode !== 'else') {
                            result.content += ',[\n\n';
                        }
                        switch (mode) {
                        case '^':
                        case '#':
                            result.content += '{fn:function(' + ARG_NAMES + '){var ___v1ew = [];';
                            break;
                        case 'else':
                            result.content += 'return ___v1ew.join("");}},\n{inverse:function(' + ARG_NAMES + '){\nvar ___v1ew = [];';
                            break;
                        default:
                            result.content += ')';
                            break;
                        }
                        if (!mode) {
                            result.startTxt = true;
                            result.end = true;
                        }
                        return result;
                    }
                }
            ]
        })
    });
    var helpers = can.view.Scanner.prototype.helpers;
    for (var i = 0; i < helpers.length; i++) {
        Mustache.prototype.scanner.helpers.unshift(helpers[i]);
    }
    Mustache.txt = function (scopeAndOptions, mode, name) {
        var scope = scopeAndOptions.scope, options = scopeAndOptions.options, args = [], helperOptions = {
                fn: function () {
                },
                inverse: function () {
                }
            }, hash, context = scope.attr('.'), getHelper = true, helper;
        for (var i = 3; i < arguments.length; i++) {
            var arg = arguments[i];
            if (mode && can.isArray(arg)) {
                helperOptions = can.extend.apply(can, [helperOptions].concat(arg));
            } else if (arg && arg[HASH]) {
                hash = arg[HASH];
                for (var prop in hash) {
                    if (isLookup(hash[prop])) {
                        hash[prop] = Mustache.get(hash[prop].get, scopeAndOptions, false, true);
                    }
                }
            } else if (arg && isLookup(arg)) {
                args.push(Mustache.get(arg.get, scopeAndOptions, false, true, true));
            } else {
                args.push(arg);
            }
        }
        if (isLookup(name)) {
            var get = name.get;
            name = Mustache.get(name.get, scopeAndOptions, args.length, false);
            getHelper = get === name;
        }
        helperOptions.fn = makeConvertToScopes(helperOptions.fn, scope, options);
        helperOptions.inverse = makeConvertToScopes(helperOptions.inverse, scope, options);
        if (mode === '^') {
            var tmp = helperOptions.fn;
            helperOptions.fn = helperOptions.inverse;
            helperOptions.inverse = tmp;
        }
        if (helper = getHelper && (typeof name === 'string' && Mustache.getHelper(name, options)) || can.isFunction(name) && !name.isComputed && { fn: name }) {
            can.extend(helperOptions, {
                context: context,
                scope: scope,
                contexts: scope,
                hash: hash
            });
            args.push(helperOptions);
            return function () {
                return helper.fn.apply(context, args) || '';
            };
        }
        return function () {
            var value;
            if (can.isFunction(name) && name.isComputed) {
                value = name();
            } else {
                value = name;
            }
            var validArgs = args.length ? args : [value], valid = true, result = [], i, argIsObserve, arg;
            if (mode) {
                for (i = 0; i < validArgs.length; i++) {
                    arg = validArgs[i];
                    argIsObserve = typeof arg !== 'undefined' && isObserveLike(arg);
                    if (isArrayLike(arg)) {
                        if (mode === '#') {
                            valid = valid && !!(argIsObserve ? arg.attr('length') : arg.length);
                        } else if (mode === '^') {
                            valid = valid && !(argIsObserve ? arg.attr('length') : arg.length);
                        }
                    } else {
                        valid = mode === '#' ? valid && !!arg : mode === '^' ? valid && !arg : valid;
                    }
                }
            }
            if (valid) {
                if (mode === '#') {
                    if (isArrayLike(value)) {
                        var isObserveList = isObserveLike(value);
                        for (i = 0; i < value.length; i++) {
                            result.push(helperOptions.fn(isObserveList ? value.attr('' + i) : value[i]));
                        }
                        return result.join('');
                    } else {
                        return helperOptions.fn(value || {}) || '';
                    }
                } else if (mode === '^') {
                    return helperOptions.inverse(value || {}) || '';
                } else {
                    return '' + (value != null ? value : '');
                }
            }
            return '';
        };
    };
    Mustache.get = function (key, scopeAndOptions, isHelper, isArgument, isLookup) {
        var context = scopeAndOptions.scope.attr('.'), options = scopeAndOptions.options || {};
        if (isHelper) {
            if (Mustache.getHelper(key, options)) {
                return key;
            }
            if (scopeAndOptions.scope && can.isFunction(context[key])) {
                return context[key];
            }
        }
        var computeData = scopeAndOptions.scope.computeData(key, {
                isArgument: isArgument,
                args: [
                    context,
                    scopeAndOptions.scope
                ]
            }), compute = computeData.compute;
        can.compute.temporarilyBind(compute);
        var initialValue = computeData.initialValue, helperObj = Mustache.getHelper(key, options);
        if (!isLookup && (initialValue === undefined || computeData.scope !== scopeAndOptions.scope) && Mustache.getHelper(key, options)) {
            return key;
        }
        if (!compute.computeInstance.hasDependencies) {
            return initialValue;
        } else {
            return compute;
        }
    };
    Mustache.resolve = function (value) {
        if (isObserveLike(value) && isArrayLike(value) && value.attr('length')) {
            return value;
        } else if (can.isFunction(value)) {
            return value();
        } else {
            return value;
        }
    };
    can.view.Options = can.view.Scope.extend({
        init: function (data, parent) {
            if (!data.helpers && !data.partials && !data.tags) {
                data = { helpers: data };
            }
            can.view.Scope.prototype.init.apply(this, arguments);
        }
    });
    Mustache._helpers = {};
    Mustache.registerHelper = function (name, fn) {
        this._helpers[name] = {
            name: name,
            fn: fn
        };
    };
    Mustache.getHelper = function (name, options) {
        var helper;
        if (options) {
            helper = options.attr('helpers.' + name);
        }
        return helper ? { fn: helper } : this._helpers[name];
    };
    Mustache.render = function (partial, scope, options) {
        if (!can.view.cached[partial]) {
            var reads = can.__clearReading();
            var scopePartialName = scope.attr(partial);
            if (scopePartialName) {
                partial = scopePartialName;
            }
            can.__setReading(reads);
        }
        return can.view.render(partial, scope, options);
    };
    Mustache.safeString = function (str) {
        return {
            toString: function () {
                return str;
            }
        };
    };
    Mustache.renderPartial = function (partialName, scope, options) {
        var partial = options.attr('partials.' + partialName);
        if (partial) {
            return partial.render ? partial.render(scope, options) : partial(scope, options);
        } else {
            return can.Mustache.render(partialName, scope, options);
        }
    };
    can.each({
        'if': function (expr, options) {
            var value;
            if (can.isFunction(expr)) {
                value = can.compute.truthy(expr)();
            } else {
                value = !!Mustache.resolve(expr);
            }
            if (value) {
                return options.fn(options.contexts || this);
            } else {
                return options.inverse(options.contexts || this);
            }
        },
        'is': function () {
            var lastValue, curValue, options = arguments[arguments.length - 1];
            if (arguments.length - 2 <= 0) {
                return options.inverse();
            }
            for (var i = 0; i < arguments.length - 1; i++) {
                curValue = Mustache.resolve(arguments[i]);
                curValue = can.isFunction(curValue) ? curValue() : curValue;
                if (i > 0) {
                    if (curValue !== lastValue) {
                        return options.inverse();
                    }
                }
                lastValue = curValue;
            }
            return options.fn();
        },
        'eq': function () {
            return Mustache._helpers.is.fn.apply(this, arguments);
        },
        'unless': function (expr, options) {
            return Mustache._helpers['if'].fn.apply(this, [
                can.isFunction(expr) ? can.compute(function () {
                    return !expr();
                }) : !expr,
                options
            ]);
        },
        'each': function (expr, options) {
            var resolved = Mustache.resolve(expr), result = [], keys, key, i;
            if (can.view.lists && (resolved instanceof can.List || expr && expr.isComputed && resolved === undefined)) {
                return can.view.lists(expr, function (item, index) {
                    return options.fn(options.scope.add({ '@index': index }).add(item));
                });
            }
            expr = resolved;
            if (!!expr && isArrayLike(expr)) {
                for (i = 0; i < expr.length; i++) {
                    result.push(options.fn(options.scope.add({ '@index': i }).add(expr[i])));
                }
                return result.join('');
            } else if (isObserveLike(expr)) {
                keys = can.Map.keys(expr);
                for (i = 0; i < keys.length; i++) {
                    key = keys[i];
                    result.push(options.fn(options.scope.add({ '@key': key }).add(expr[key])));
                }
                return result.join('');
            } else if (expr instanceof Object) {
                for (key in expr) {
                    result.push(options.fn(options.scope.add({ '@key': key }).add(expr[key])));
                }
                return result.join('');
            }
        },
        'with': function (expr, options) {
            var ctx = expr;
            expr = Mustache.resolve(expr);
            if (!!expr) {
                return options.fn(ctx);
            }
        },
        'log': function (expr, options) {
            if (typeof console !== 'undefined' && console.log) {
                if (!options) {
                    console.log(expr.context);
                } else {
                    console.log(expr, options.context);
                }
            }
        },
        '@index': function (offset, options) {
            if (!options) {
                options = offset;
                offset = 0;
            }
            var index = options.scope.attr('@index');
            return '' + ((can.isFunction(index) ? index() : index) + offset);
        }
    }, function (fn, name) {
        Mustache.registerHelper(name, fn);
    });
    can.view.register({
        suffix: 'mustache',
        contentType: 'x-mustache-template',
        script: function (id, src) {
            return 'can.Mustache(function(' + ARG_NAMES + ') { ' + new Mustache({
                text: src,
                name: id
            }).template.out + ' })';
        },
        renderer: function (id, text) {
            return Mustache({
                text: text,
                name: id
            });
        }
    });
    can.mustache.registerHelper = can.proxy(can.Mustache.registerHelper, can.Mustache);
    can.mustache.safeString = can.Mustache.safeString;
    return can;
});
/*can@2.2.6#component/component*/
define('can/component/component', [
    'can/util/util',
    'can/view/callbacks/callbacks',
    'can/view/elements',
    'can/control/control',
    'can/observe/observe',
    'can/view/mustache/mustache',
    'can/view/bindings/bindings'
], function (can, viewCallbacks, elements) {
    var ignoreAttributesRegExp = /^(dataViewId|class|id)$/i, paramReplacer = /\{([^\}]+)\}/g;
    var Component = can.Component = can.Construct.extend({
            setup: function () {
                can.Construct.setup.apply(this, arguments);
                if (can.Component) {
                    var self = this, scope = this.prototype.scope || this.prototype.viewModel;
                    this.Control = ComponentControl.extend(this.prototype.events);
                    if (!scope || typeof scope === 'object' && !(scope instanceof can.Map)) {
                        this.Map = can.Map.extend(scope || {});
                    } else if (scope.prototype instanceof can.Map) {
                        this.Map = scope;
                    }
                    this.attributeScopeMappings = {};
                    can.each(this.Map ? this.Map.defaults : {}, function (val, prop) {
                        if (val === '@') {
                            self.attributeScopeMappings[prop] = prop;
                        }
                    });
                    if (this.prototype.template) {
                        if (typeof this.prototype.template === 'function') {
                            var temp = this.prototype.template;
                            this.renderer = function () {
                                return can.view.frag(temp.apply(null, arguments));
                            };
                        } else {
                            this.renderer = can.view.mustache(this.prototype.template);
                        }
                    }
                    can.view.tag(this.prototype.tag, function (el, options) {
                        new self(el, options);
                    });
                }
            }
        }, {
            setup: function (el, hookupOptions) {
                var initialScopeData = {}, component = this, lexicalContent = (typeof this.leakScope === 'undefined' ? false : !this.leakScope) && this.template, twoWayBindings = {}, scope = this.scope || this.viewModel, viewModelPropertyUpdates = {}, componentScope, frag, teardownFunctions = [], callTeardownFunctions = function () {
                        for (var i = 0, len = teardownFunctions.length; i < len; i++) {
                            teardownFunctions[i]();
                        }
                    };
                can.each(this.constructor.attributeScopeMappings, function (val, prop) {
                    initialScopeData[prop] = el.getAttribute(can.hyphenate(val));
                });
                can.each(can.makeArray(el.attributes), function (node, index) {
                    var name = can.camelize(node.nodeName.toLowerCase()), value = node.value;
                    if (component.constructor.attributeScopeMappings[name] || ignoreAttributesRegExp.test(name) || viewCallbacks.attr(node.nodeName)) {
                        return;
                    }
                    if (value[0] === '{' && value[value.length - 1] === '}') {
                        value = value.substr(1, value.length - 2);
                    } else {
                        if (hookupOptions.templateType !== 'legacy') {
                            initialScopeData[name] = value;
                            return;
                        }
                    }
                    var computeData = hookupOptions.scope.computeData(value, { args: [] }), compute = computeData.compute;
                    var handler = function (ev, newVal) {
                        viewModelPropertyUpdates[name] = (viewModelPropertyUpdates[name] || 0) + 1;
                        componentScope.attr(name, newVal);
                        can.batch.afterPreviousEvents(function () {
                            --viewModelPropertyUpdates[name];
                        });
                    };
                    compute.bind('change', handler);
                    initialScopeData[name] = compute();
                    if (!compute.computeInstance.hasDependencies) {
                        compute.unbind('change', handler);
                    } else {
                        teardownFunctions.push(function () {
                            compute.unbind('change', handler);
                        });
                        twoWayBindings[name] = computeData;
                    }
                });
                if (this.constructor.Map) {
                    componentScope = new this.constructor.Map(initialScopeData);
                } else if (scope instanceof can.Map) {
                    componentScope = scope;
                } else if (can.isFunction(scope)) {
                    var scopeResult = scope.call(this, initialScopeData, hookupOptions.scope, el);
                    if (scopeResult instanceof can.Map) {
                        componentScope = scopeResult;
                    } else if (scopeResult.prototype instanceof can.Map) {
                        componentScope = new scopeResult(initialScopeData);
                    } else {
                        componentScope = new (can.Map.extend(scopeResult))(initialScopeData);
                    }
                }
                var handlers = {};
                can.each(twoWayBindings, function (computeData, prop) {
                    handlers[prop] = function (ev, newVal) {
                        if (!viewModelPropertyUpdates[prop]) {
                            computeData.compute(newVal);
                        }
                    };
                    componentScope.bind(prop, handlers[prop]);
                });
                if (!can.isEmptyObject(this.constructor.attributeScopeMappings) || hookupOptions.templateType !== 'legacy') {
                    can.bind.call(el, 'attributes', function (ev) {
                        var camelized = can.camelize(ev.attributeName);
                        if (!twoWayBindings[camelized] && !ignoreAttributesRegExp.test(camelized)) {
                            componentScope.attr(camelized, el.getAttribute(ev.attributeName));
                        }
                    });
                }
                this.scope = this.viewModel = componentScope;
                can.data(can.$(el), 'scope', this.scope);
                can.data(can.$(el), 'viewModel', this.scope);
                var renderedScope = lexicalContent ? this.scope : hookupOptions.scope.add(this.scope), options = { helpers: {} };
                can.each(this.helpers || {}, function (val, prop) {
                    if (can.isFunction(val)) {
                        options.helpers[prop] = function () {
                            return val.apply(componentScope, arguments);
                        };
                    }
                });
                teardownFunctions.push(function () {
                    can.each(handlers, function (handler, prop) {
                        componentScope.unbind(prop, handlers[prop]);
                    });
                });
                this._control = new this.constructor.Control(el, {
                    scope: this.scope,
                    viewModel: this.scope
                });
                if (this._control && this._control.destroy) {
                    var oldDestroy = this._control.destroy;
                    this._control.destroy = function () {
                        oldDestroy.apply(this, arguments);
                        callTeardownFunctions();
                    };
                    this._control.on();
                } else {
                    can.bind.call(el, 'removed', function () {
                        callTeardownFunctions();
                    });
                }
                var nodeList = can.view.nodeLists.register([], undefined, true);
                teardownFunctions.push(function () {
                    can.view.nodeLists.unregister(nodeList);
                });
                if (this.constructor.renderer) {
                    if (!options.tags) {
                        options.tags = {};
                    }
                    options.tags.content = function contentHookup(el, rendererOptions) {
                        var subtemplate = hookupOptions.subtemplate || rendererOptions.subtemplate;
                        if (subtemplate) {
                            delete options.tags.content;
                            var opts = !lexicalContent || subtemplate !== hookupOptions.subtemplate ? rendererOptions : hookupOptions;
                            if (rendererOptions.parentNodeList) {
                                var frag = subtemplate(opts.scope, opts.options, rendererOptions.parentNodeList);
                                elements.replace([el], frag);
                            } else {
                                can.view.live.replace([el], subtemplate(opts.scope, opts.options));
                            }
                            options.tags.content = contentHookup;
                        }
                    };
                    frag = this.constructor.renderer(renderedScope, hookupOptions.options.add(options), nodeList);
                } else {
                    if (hookupOptions.templateType === 'legacy') {
                        frag = can.view.frag(hookupOptions.subtemplate ? hookupOptions.subtemplate(renderedScope, hookupOptions.options.add(options)) : '');
                    } else {
                        frag = hookupOptions.subtemplate ? hookupOptions.subtemplate(renderedScope, hookupOptions.options.add(options), nodeList) : document.createDocumentFragment();
                    }
                }
                can.appendChild(el, frag);
                can.view.nodeLists.update(nodeList, el.childNodes);
            }
        });
    var ComponentControl = can.Control.extend({
            _lookup: function (options) {
                return [
                    options.scope,
                    options,
                    window
                ];
            },
            _action: function (methodName, options, controlInstance) {
                var hasObjectLookup, readyCompute;
                paramReplacer.lastIndex = 0;
                hasObjectLookup = paramReplacer.test(methodName);
                if (!controlInstance && hasObjectLookup) {
                    return;
                } else if (!hasObjectLookup) {
                    return can.Control._action.apply(this, arguments);
                } else {
                    readyCompute = can.compute(function () {
                        var delegate;
                        var name = methodName.replace(paramReplacer, function (matched, key) {
                                var value;
                                if (key === 'scope' || key === 'viewModel') {
                                    delegate = options.scope;
                                    return '';
                                }
                                key = key.replace(/^(scope|^viewModel)\./, '');
                                value = can.compute.read(options.scope, key.split('.'), { isArgument: true }).value;
                                if (value === undefined) {
                                    value = can.getObject(key);
                                }
                                if (typeof value === 'string') {
                                    return value;
                                } else {
                                    delegate = value;
                                    return '';
                                }
                            });
                        var parts = name.split(/\s+/g), event = parts.pop();
                        return {
                            processor: this.processors[event] || this.processors.click,
                            parts: [
                                name,
                                parts.join(' '),
                                event
                            ],
                            delegate: delegate || undefined
                        };
                    }, this);
                    var handler = function (ev, ready) {
                        controlInstance._bindings.control[methodName](controlInstance.element);
                        controlInstance._bindings.control[methodName] = ready.processor(ready.delegate || controlInstance.element, ready.parts[2], ready.parts[1], methodName, controlInstance);
                    };
                    readyCompute.bind('change', handler);
                    controlInstance._bindings.readyComputes[methodName] = {
                        compute: readyCompute,
                        handler: handler
                    };
                    return readyCompute();
                }
            }
        }, {
            setup: function (el, options) {
                this.scope = options.scope;
                this.viewModel = options.viewModel;
                return can.Control.prototype.setup.call(this, el, options);
            },
            off: function () {
                if (this._bindings) {
                    can.each(this._bindings.readyComputes || {}, function (value) {
                        value.compute.unbind('change', value.handler);
                    });
                }
                can.Control.prototype.off.apply(this, arguments);
                this._bindings.readyComputes = {};
            }
        });
    var $ = can.$;
    if ($.fn) {
        $.fn.scope = $.fn.viewModel = function () {
            return can.viewModel.apply(can, [this].concat(can.makeArray(arguments)));
        };
    }
    return Component;
});
/*can@2.2.6#model/model*/
define('can/model/model', [
    'can/util/util',
    'can/map/map',
    'can/list/list'
], function (can) {
    var pipe = function (def, thisArg, func) {
            var d = new can.Deferred();
            def.then(function () {
                var args = can.makeArray(arguments), success = true;
                try {
                    args[0] = func.apply(thisArg, args);
                } catch (e) {
                    success = false;
                    d.rejectWith(d, [e].concat(args));
                }
                if (success) {
                    d.resolveWith(d, args);
                }
            }, function () {
                d.rejectWith(this, arguments);
            });
            if (typeof def.abort === 'function') {
                d.abort = function () {
                    return def.abort();
                };
            }
            return d;
        }, modelNum = 0, getId = function (inst) {
            can.__observe(inst, inst.constructor.id);
            return inst.__get(inst.constructor.id);
        }, ajax = function (ajaxOb, data, type, dataType, success, error) {
            var params = {};
            if (typeof ajaxOb === 'string') {
                var parts = ajaxOb.split(/\s+/);
                params.url = parts.pop();
                if (parts.length) {
                    params.type = parts.pop();
                }
            } else {
                can.extend(params, ajaxOb);
            }
            params.data = typeof data === 'object' && !can.isArray(data) ? can.extend(params.data || {}, data) : data;
            params.url = can.sub(params.url, params.data, true);
            return can.ajax(can.extend({
                type: type || 'post',
                dataType: dataType || 'json',
                success: success,
                error: error
            }, params));
        }, makeRequest = function (modelObj, type, success, error, method) {
            var args;
            if (can.isArray(modelObj)) {
                args = modelObj[1];
                modelObj = modelObj[0];
            } else {
                args = modelObj.serialize();
            }
            args = [args];
            var deferred, model = modelObj.constructor, jqXHR;
            if (type === 'update' || type === 'destroy') {
                args.unshift(getId(modelObj));
            }
            jqXHR = model[type].apply(model, args);
            deferred = pipe(jqXHR, modelObj, function (data) {
                modelObj[method || type + 'd'](data, jqXHR);
                return modelObj;
            });
            if (jqXHR.abort) {
                deferred.abort = function () {
                    jqXHR.abort();
                };
            }
            deferred.then(success, error);
            return deferred;
        }, converters = {
            models: function (instancesRawData, oldList, xhr) {
                can.Model._reqs++;
                if (!instancesRawData) {
                    return;
                }
                if (instancesRawData instanceof this.List) {
                    return instancesRawData;
                }
                var self = this, tmp = [], ListClass = self.List || ML, modelList = oldList instanceof can.List ? oldList : new ListClass(), rawDataIsList = instancesRawData instanceof ML, raw = rawDataIsList ? instancesRawData.serialize() : instancesRawData;
                raw = self.parseModels(raw, xhr);
                if (raw.data) {
                    instancesRawData = raw;
                    raw = raw.data;
                }
                if (typeof raw === 'undefined' || !can.isArray(raw)) {
                    throw new Error('Could not get any raw data while converting using .models');
                }
                if (modelList.length) {
                    modelList.splice(0);
                }
                can.each(raw, function (rawPart) {
                    tmp.push(self.model(rawPart, xhr));
                });
                modelList.push.apply(modelList, tmp);
                if (!can.isArray(instancesRawData)) {
                    can.each(instancesRawData, function (val, prop) {
                        if (prop !== 'data') {
                            modelList.attr(prop, val);
                        }
                    });
                }
                setTimeout(can.proxy(this._clean, this), 1);
                return modelList;
            },
            model: function (attributes, oldModel, xhr) {
                if (!attributes) {
                    return;
                }
                if (typeof attributes.serialize === 'function') {
                    attributes = attributes.serialize();
                } else {
                    attributes = this.parseModel(attributes, xhr);
                }
                var id = attributes[this.id];
                if ((id || id === 0) && this.store[id]) {
                    oldModel = this.store[id];
                }
                var model = oldModel && can.isFunction(oldModel.attr) ? oldModel.attr(attributes, this.removeAttr || false) : new this(attributes);
                return model;
            }
        }, makeParser = {
            parseModel: function (prop) {
                return function (attributes) {
                    return prop ? can.getObject(prop, attributes) : attributes;
                };
            },
            parseModels: function (prop) {
                return function (attributes) {
                    if (can.isArray(attributes)) {
                        return attributes;
                    }
                    prop = prop || 'data';
                    var result = can.getObject(prop, attributes);
                    if (!can.isArray(result)) {
                        throw new Error('Could not get any raw data while converting using .models');
                    }
                    return result;
                };
            }
        }, ajaxMethods = {
            create: {
                url: '_shortName',
                type: 'post'
            },
            update: {
                data: function (id, attrs) {
                    attrs = attrs || {};
                    var identity = this.id;
                    if (attrs[identity] && attrs[identity] !== id) {
                        attrs['new' + can.capitalize(id)] = attrs[identity];
                        delete attrs[identity];
                    }
                    attrs[identity] = id;
                    return attrs;
                },
                type: 'put'
            },
            destroy: {
                type: 'delete',
                data: function (id, attrs) {
                    attrs = attrs || {};
                    attrs.id = attrs[this.id] = id;
                    return attrs;
                }
            },
            findAll: { url: '_shortName' },
            findOne: {}
        }, ajaxMaker = function (ajaxMethod, str) {
            return function (data) {
                data = ajaxMethod.data ? ajaxMethod.data.apply(this, arguments) : data;
                return ajax(str || this[ajaxMethod.url || '_url'], data, ajaxMethod.type || 'get');
            };
        }, createURLFromResource = function (model, name) {
            if (!model.resource) {
                return;
            }
            var resource = model.resource.replace(/\/+$/, '');
            if (name === 'findAll' || name === 'create') {
                return resource;
            } else {
                return resource + '/{' + model.id + '}';
            }
        };
    can.Model = can.Map.extend({
        fullName: 'can.Model',
        _reqs: 0,
        setup: function (base, fullName, staticProps, protoProps) {
            if (typeof fullName !== 'string') {
                protoProps = staticProps;
                staticProps = fullName;
            }
            if (!protoProps) {
                protoProps = staticProps;
            }
            this.store = {};
            can.Map.setup.apply(this, arguments);
            if (!can.Model) {
                return;
            }
            if (staticProps && staticProps.List) {
                this.List = staticProps.List;
                this.List.Map = this;
            } else {
                this.List = base.List.extend({ Map: this }, {});
            }
            var self = this, clean = can.proxy(this._clean, self);
            can.each(ajaxMethods, function (method, name) {
                if (staticProps && staticProps[name] && (typeof staticProps[name] === 'string' || typeof staticProps[name] === 'object')) {
                    self[name] = ajaxMaker(method, staticProps[name]);
                } else if (staticProps && staticProps.resource && !can.isFunction(staticProps[name])) {
                    self[name] = ajaxMaker(method, createURLFromResource(self, name));
                }
                if (self['make' + can.capitalize(name)]) {
                    var newMethod = self['make' + can.capitalize(name)](self[name]);
                    can.Construct._overwrite(self, base, name, function () {
                        can.Model._reqs++;
                        var def = newMethod.apply(this, arguments);
                        var then = def.then(clean, clean);
                        then.abort = def.abort;
                        return then;
                    });
                }
            });
            var hasCustomConverter = {};
            can.each(converters, function (converter, name) {
                var parseName = 'parse' + can.capitalize(name), dataProperty = staticProps && staticProps[name] || self[name];
                if (typeof dataProperty === 'string') {
                    self[parseName] = dataProperty;
                    can.Construct._overwrite(self, base, name, converter);
                } else if (staticProps && staticProps[name]) {
                    hasCustomConverter[parseName] = true;
                }
            });
            can.each(makeParser, function (maker, parseName) {
                var prop = staticProps && staticProps[parseName] || self[parseName];
                if (typeof prop === 'string') {
                    can.Construct._overwrite(self, base, parseName, maker(prop));
                } else if ((!staticProps || !can.isFunction(staticProps[parseName])) && !self[parseName]) {
                    var madeParser = maker();
                    madeParser.useModelConverter = hasCustomConverter[parseName];
                    can.Construct._overwrite(self, base, parseName, madeParser);
                }
            });
            if (self.fullName === 'can.Model' || !self.fullName) {
                self.fullName = 'Model' + ++modelNum;
            }
            can.Model._reqs = 0;
            this._url = this._shortName + '/{' + this.id + '}';
        },
        _ajax: ajaxMaker,
        _makeRequest: makeRequest,
        _clean: function () {
            can.Model._reqs--;
            if (!can.Model._reqs) {
                for (var id in this.store) {
                    if (!this.store[id]._bindings) {
                        delete this.store[id];
                    }
                }
            }
            return arguments[0];
        },
        models: converters.models,
        model: converters.model
    }, {
        setup: function (attrs) {
            var id = attrs && attrs[this.constructor.id];
            if (can.Model._reqs && id != null) {
                this.constructor.store[id] = this;
            }
            can.Map.prototype.setup.apply(this, arguments);
        },
        isNew: function () {
            var id = getId(this);
            return !(id || id === 0);
        },
        save: function (success, error) {
            return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
        },
        destroy: function (success, error) {
            if (this.isNew()) {
                var self = this;
                var def = can.Deferred();
                def.then(success, error);
                return def.done(function (data) {
                    self.destroyed(data);
                }).resolve(self);
            }
            return makeRequest(this, 'destroy', success, error, 'destroyed');
        },
        _bindsetup: function () {
            var modelInstance = this.__get(this.constructor.id);
            if (modelInstance != null) {
                this.constructor.store[modelInstance] = this;
            }
            return can.Map.prototype._bindsetup.apply(this, arguments);
        },
        _bindteardown: function () {
            delete this.constructor.store[getId(this)];
            return can.Map.prototype._bindteardown.apply(this, arguments);
        },
        ___set: function (prop, val) {
            can.Map.prototype.___set.call(this, prop, val);
            if (prop === this.constructor.id && this._bindings) {
                this.constructor.store[getId(this)] = this;
            }
        }
    });
    var makeGetterHandler = function (name) {
            return function (data, readyState, xhr) {
                return this[name](data, null, xhr);
            };
        }, createUpdateDestroyHandler = function (data) {
            if (this.parseModel.useModelConverter) {
                return this.model(data);
            }
            return this.parseModel(data);
        };
    var responseHandlers = {
            makeFindAll: makeGetterHandler('models'),
            makeFindOne: makeGetterHandler('model'),
            makeCreate: createUpdateDestroyHandler,
            makeUpdate: createUpdateDestroyHandler,
            makeDestroy: createUpdateDestroyHandler
        };
    can.each(responseHandlers, function (method, name) {
        can.Model[name] = function (oldMethod) {
            return function () {
                var args = can.makeArray(arguments), oldArgs = can.isFunction(args[1]) ? args.splice(0, 1) : args.splice(0, 2), def = pipe(oldMethod.apply(this, oldArgs), this, method);
                def.then(args[0], args[1]);
                return def;
            };
        };
    });
    can.each([
        'created',
        'updated',
        'destroyed'
    ], function (funcName) {
        can.Model.prototype[funcName] = function (attrs) {
            var self = this, constructor = self.constructor;
            if (attrs && typeof attrs === 'object') {
                this.attr(can.isFunction(attrs.attr) ? attrs.attr() : attrs);
            }
            can.dispatch.call(this, {
                type: 'change',
                target: this
            }, [funcName]);
            can.dispatch.call(constructor, funcName, [this]);
        };
    });
    var ML = can.Model.List = can.List.extend({
            _bubbleRule: function (eventName, list) {
                var bubbleRules = can.List._bubbleRule(eventName, list);
                bubbleRules.push('destroyed');
                return bubbleRules;
            }
        }, {
            setup: function (params) {
                if (can.isPlainObject(params) && !can.isArray(params)) {
                    can.List.prototype.setup.apply(this);
                    this.replace(can.isDeferred(params) ? params : this.constructor.Map.findAll(params));
                } else {
                    can.List.prototype.setup.apply(this, arguments);
                }
                this._init = 1;
                this.bind('destroyed', can.proxy(this._destroyed, this));
                delete this._init;
            },
            _destroyed: function (ev, attr) {
                if (/\w+/.test(attr)) {
                    var index;
                    while ((index = this.indexOf(ev.target)) > -1) {
                        this.splice(index, 1);
                    }
                }
            }
        });
    return can.Model;
});
/*can@2.2.6#util/string/deparam/deparam*/
define('can/util/string/deparam/deparam', [
    'can/util/util',
    'can/util/string/string'
], function (can) {
    var digitTest = /^\d+$/, keyBreaker = /([^\[\]]+)|(\[\])/g, paramTest = /([^?#]*)(#.*)?$/, prep = function (str) {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        };
    can.extend(can, {
        deparam: function (params) {
            var data = {}, pairs, lastPart;
            if (params && paramTest.test(params)) {
                pairs = params.split('&');
                can.each(pairs, function (pair) {
                    var parts = pair.split('='), key = prep(parts.shift()), value = prep(parts.join('=')), current = data;
                    if (key) {
                        parts = key.match(keyBreaker);
                        for (var j = 0, l = parts.length - 1; j < l; j++) {
                            if (!current[parts[j]]) {
                                current[parts[j]] = digitTest.test(parts[j + 1]) || parts[j + 1] === '[]' ? [] : {};
                            }
                            current = current[parts[j]];
                        }
                        lastPart = parts.pop();
                        if (lastPart === '[]') {
                            current.push(value);
                        } else {
                            current[lastPart] = value;
                        }
                    }
                });
            }
            return data;
        }
    });
    return can;
});
/*can@2.2.6#route/route*/
define('can/route/route', [
    'can/util/util',
    'can/map/map',
    'can/list/list',
    'can/util/string/deparam/deparam'
], function (can) {
    var matcher = /\:([\w\.]+)/g, paramsMatcher = /^(?:&[^=]+=[^&]*)+/, makeProps = function (props) {
            var tags = [];
            can.each(props, function (val, name) {
                tags.push((name === 'className' ? 'class' : name) + '="' + (name === 'href' ? val : can.esc(val)) + '"');
            });
            return tags.join(' ');
        }, matchesData = function (route, data) {
            var count = 0, i = 0, defaults = {};
            for (var name in route.defaults) {
                if (route.defaults[name] === data[name]) {
                    defaults[name] = 1;
                    count++;
                }
            }
            for (; i < route.names.length; i++) {
                if (!data.hasOwnProperty(route.names[i])) {
                    return -1;
                }
                if (!defaults[route.names[i]]) {
                    count++;
                }
            }
            return count;
        }, location = window.location, wrapQuote = function (str) {
            return (str + '').replace(/([.?*+\^$\[\]\\(){}|\-])/g, '\\$1');
        }, each = can.each, extend = can.extend, stringify = function (obj) {
            if (obj && typeof obj === 'object') {
                if (obj instanceof can.Map) {
                    obj = obj.attr();
                } else {
                    obj = can.isFunction(obj.slice) ? obj.slice() : can.extend({}, obj);
                }
                can.each(obj, function (val, prop) {
                    obj[prop] = stringify(val);
                });
            } else if (obj !== undefined && obj !== null && can.isFunction(obj.toString)) {
                obj = obj.toString();
            }
            return obj;
        }, removeBackslash = function (str) {
            return str.replace(/\\/g, '');
        }, timer, curParams, lastHash, changingData, changedAttrs = [], onRouteDataChange = function (ev, attr, how, newval) {
            changingData = 1;
            changedAttrs.push(attr);
            clearTimeout(timer);
            timer = setTimeout(function () {
                changingData = 0;
                var serialized = can.route.data.serialize(), path = can.route.param(serialized, true);
                can.route._call('setURL', path, changedAttrs);
                can.batch.trigger(eventsObject, '__url', [
                    path,
                    lastHash
                ]);
                lastHash = path;
                changedAttrs = [];
            }, 10);
        }, eventsObject = can.extend({}, can.event);
    can.route = function (url, defaults) {
        var root = can.route._call('root');
        if (root.lastIndexOf('/') === root.length - 1 && url.indexOf('/') === 0) {
            url = url.substr(1);
        }
        defaults = defaults || {};
        var names = [], res, test = '', lastIndex = matcher.lastIndex = 0, next, querySeparator = can.route._call('querySeparator'), matchSlashes = can.route._call('matchSlashes');
        while (res = matcher.exec(url)) {
            names.push(res[1]);
            test += removeBackslash(url.substring(lastIndex, matcher.lastIndex - res[0].length));
            next = '\\' + (removeBackslash(url.substr(matcher.lastIndex, 1)) || querySeparator + (matchSlashes ? '' : '|/'));
            test += '([^' + next + ']' + (defaults[res[1]] ? '*' : '+') + ')';
            lastIndex = matcher.lastIndex;
        }
        test += url.substr(lastIndex).replace('\\', '');
        can.route.routes[url] = {
            test: new RegExp('^' + test + '($|' + wrapQuote(querySeparator) + ')'),
            route: url,
            names: names,
            defaults: defaults,
            length: url.split('/').length
        };
        return can.route;
    };
    extend(can.route, {
        param: function (data, _setRoute) {
            var route, matches = 0, matchCount, routeName = data.route, propCount = 0;
            delete data.route;
            each(data, function () {
                propCount++;
            });
            each(can.route.routes, function (temp, name) {
                matchCount = matchesData(temp, data);
                if (matchCount > matches) {
                    route = temp;
                    matches = matchCount;
                }
                if (matchCount >= propCount) {
                    return false;
                }
            });
            if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data) === matches) {
                route = can.route.routes[routeName];
            }
            if (route) {
                var cpy = extend({}, data), res = route.route.replace(matcher, function (whole, name) {
                        delete cpy[name];
                        return data[name] === route.defaults[name] ? '' : encodeURIComponent(data[name]);
                    }).replace('\\', ''), after;
                each(route.defaults, function (val, name) {
                    if (cpy[name] === val) {
                        delete cpy[name];
                    }
                });
                after = can.param(cpy);
                if (_setRoute) {
                    can.route.attr('route', route.route);
                }
                return res + (after ? can.route._call('querySeparator') + after : '');
            }
            return can.isEmptyObject(data) ? '' : can.route._call('querySeparator') + can.param(data);
        },
        deparam: function (url) {
            var root = can.route._call('root');
            if (root.lastIndexOf('/') === root.length - 1 && url.indexOf('/') === 0) {
                url = url.substr(1);
            }
            var route = { length: -1 }, querySeparator = can.route._call('querySeparator'), paramsMatcher = can.route._call('paramsMatcher');
            each(can.route.routes, function (temp, name) {
                if (temp.test.test(url) && temp.length > route.length) {
                    route = temp;
                }
            });
            if (route.length > -1) {
                var parts = url.match(route.test), start = parts.shift(), remainder = url.substr(start.length - (parts[parts.length - 1] === querySeparator ? 1 : 0)), obj = remainder && paramsMatcher.test(remainder) ? can.deparam(remainder.slice(1)) : {};
                obj = extend(true, {}, route.defaults, obj);
                each(parts, function (part, i) {
                    if (part && part !== querySeparator) {
                        obj[route.names[i]] = decodeURIComponent(part);
                    }
                });
                obj.route = route.route;
                return obj;
            }
            if (url.charAt(0) !== querySeparator) {
                url = querySeparator + url;
            }
            return paramsMatcher.test(url) ? can.deparam(url.slice(1)) : {};
        },
        data: new can.Map({}),
        map: function (data) {
            var appState;
            if (data.prototype instanceof can.Map) {
                appState = new data();
            } else {
                appState = data;
            }
            can.route.data = appState;
        },
        routes: {},
        ready: function (val) {
            if (val !== true) {
                can.route._setup();
                can.route.setState();
            }
            return can.route;
        },
        url: function (options, merge) {
            if (merge) {
                options = can.extend({}, can.route.deparam(can.route._call('matchingPartOfURL')), options);
            }
            return can.route._call('root') + can.route.param(options);
        },
        link: function (name, options, props, merge) {
            return '<a ' + makeProps(extend({ href: can.route.url(options, merge) }, props)) + '>' + name + '</a>';
        },
        current: function (options) {
            can.__observe(eventsObject, '__url');
            return this._call('matchingPartOfURL') === can.route.param(options);
        },
        bindings: {
            hashchange: {
                paramsMatcher: paramsMatcher,
                querySeparator: '&',
                matchSlashes: false,
                bind: function () {
                    can.bind.call(window, 'hashchange', setState);
                },
                unbind: function () {
                    can.unbind.call(window, 'hashchange', setState);
                },
                matchingPartOfURL: function () {
                    return location.href.split(/#!?/)[1] || '';
                },
                setURL: function (path) {
                    if (location.hash !== '#' + path) {
                        location.hash = '!' + path;
                    }
                    return path;
                },
                root: '#!'
            }
        },
        defaultBinding: 'hashchange',
        currentBinding: null,
        _setup: function () {
            if (!can.route.currentBinding) {
                can.route._call('bind');
                can.route.bind('change', onRouteDataChange);
                can.route.currentBinding = can.route.defaultBinding;
            }
        },
        _teardown: function () {
            if (can.route.currentBinding) {
                can.route._call('unbind');
                can.route.unbind('change', onRouteDataChange);
                can.route.currentBinding = null;
            }
            clearTimeout(timer);
            changingData = 0;
        },
        _call: function () {
            var args = can.makeArray(arguments), prop = args.shift(), binding = can.route.bindings[can.route.currentBinding || can.route.defaultBinding], method = binding[prop];
            if (method.apply) {
                return method.apply(binding, args);
            } else {
                return method;
            }
        }
    });
    each([
        'bind',
        'unbind',
        'on',
        'off',
        'delegate',
        'undelegate',
        'removeAttr',
        'compute',
        '_get',
        '__get',
        'each'
    ], function (name) {
        can.route[name] = function () {
            if (!can.route.data[name]) {
                return;
            }
            return can.route.data[name].apply(can.route.data, arguments);
        };
    });
    can.route.attr = function (attr, val) {
        var type = typeof attr, newArguments;
        if (val === undefined) {
            newArguments = arguments;
        } else if (type !== 'string' && type !== 'number') {
            newArguments = [
                stringify(attr),
                val
            ];
        } else {
            newArguments = [
                attr,
                stringify(val)
            ];
        }
        return can.route.data.attr.apply(can.route.data, newArguments);
    };
    var setState = can.route.setState = function () {
            var hash = can.route._call('matchingPartOfURL');
            var oldParams = curParams;
            curParams = can.route.deparam(hash);
            if (!changingData || hash !== lastHash) {
                can.batch.start();
                recursiveClean(oldParams, curParams, can.route.data);
                can.route.attr(curParams);
                can.batch.trigger(eventsObject, '__url', [
                    hash,
                    lastHash
                ]);
                can.batch.stop();
            }
        };
    var recursiveClean = function (old, cur, data) {
        for (var attr in old) {
            if (cur[attr] === undefined) {
                data.removeAttr(attr);
            } else if (Object.prototype.toString.call(old[attr]) === '[object Object]') {
                recursiveClean(old[attr], cur[attr], data.attr(attr));
            }
        }
    };
    return can.route;
});
/*can@2.2.6#control/route/route*/
define('can/control/route/route', [
    'can/util/util',
    'can/route/route',
    'can/control/control'
], function (can) {
    can.Control.processors.route = function (el, event, selector, funcName, controller) {
        selector = selector || '';
        if (!can.route.routes[selector]) {
            if (selector[0] === '/') {
                selector = selector.substring(1);
            }
            can.route(selector);
        }
        var batchNum, check = function (ev, attr, how) {
                if (can.route.attr('route') === selector && (ev.batchNum === undefined || ev.batchNum !== batchNum)) {
                    batchNum = ev.batchNum;
                    var d = can.route.attr();
                    delete d.route;
                    if (can.isFunction(controller[funcName])) {
                        controller[funcName](d);
                    } else {
                        controller[controller[funcName]](d);
                    }
                }
            };
        can.route.bind('change', check);
        return function () {
            can.route.unbind('change', check);
        };
    };
    return can;
});
/*[global-shim-end]*/
(function (){
	window._define = window.define;
	window.define = window.define.orig;
})();
