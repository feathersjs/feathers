/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/mootools/mootools*/
define([
    'can/util/can',
    'can/util/attr',
    'mootools',
    'can/event',
    'can/fragment',
    'can/deferred',
    'can/util/each',
    'can/util/object/isplain',
    'can/util/inserted'
], function (can, attr) {
    can.trim = function (s) {
        return s ? s.trim() : s;
    };
    var extend = function () {
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
            if ((options = arguments[i]) !== null) {
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
    can.extend = extend;
    can.makeArray = function (item) {
        if (item === null) {
            return [];
        }
        try {
            return Type.isEnumerable(item) && typeof item !== 'string' ? Array.prototype.slice.call(item) : [item];
        } catch (ex) {
            var arr = [], i;
            for (i = 0; i < item.length; ++i) {
                arr.push(item[i]);
            }
            return arr;
        }
    };
    can.isArray = function (arr) {
        return typeOf(arr) === 'array';
    };
    can.inArray = function (item, arr, fromIndex) {
        if (!arr) {
            return -1;
        }
        return Array.prototype.indexOf.call(arr, item, fromIndex);
    };
    can.map = function (arr, fn) {
        return Array.from(arr || []).map(fn);
    };
    can.param = function (object) {
        return Object.toQueryString(object);
    };
    can.isEmptyObject = function (object) {
        return Object.keys(object).length === 0;
    };
    can.isFunction = function (f) {
        return typeOf(f) === 'function';
    };
    can.bind = function (ev, cb) {
        if (this.bind && this.bind !== can.bind) {
            this.bind(ev, cb);
        } else if (this.nodeName && (this.nodeType && this.nodeType !== 11)) {
            can.$(this).addEvent(ev, cb);
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
        } else if (this.nodeName && (this.nodeType && this.nodeType !== 11)) {
            can.$(this).removeEvent(ev, cb);
        } else if (this.removeEvent) {
            this.removeEvent(ev, cb);
        } else {
            can.removeEvent.call(this, ev, cb);
        }
        return this;
    };
    can.on = can.bind;
    can.off = can.unbind;
    can.trigger = function (item, event, args, bubble) {
        bubble = bubble === undefined ? true : bubble;
        args = args || [];
        var propagating = true;
        if (item.fireEvent) {
            item = item[0] || item;
            while (item && propagating) {
                if (!event.type) {
                    event = {
                        type: event,
                        target: item,
                        stopPropagation: function () {
                            propagating = false;
                        }
                    };
                }
                var events = item !== window ? can.$(item).retrieve('events')[0] : item.retrieve('events');
                if (events && events[event.type]) {
                    events[event.type].keys.each(function (fn) {
                        fn.apply(item, [event].concat(args));
                    }, this);
                }
                if (bubble && item.parentNode && item.parentNode.nodeType !== 11) {
                    item = item.parentNode;
                } else {
                    item = null;
                }
            }
        } else {
            if (typeof event === 'string') {
                event = { type: event };
            }
            event.target = event.target || item;
            can.dispatch.call(item, event, can.makeArray(args));
        }
    };
    can.delegate = function (selector, ev, cb) {
        if (this.delegate) {
            this.delegate(selector, ev, cb);
        } else if (this.addEvent) {
            this.addEvent(ev + ':relay(' + selector + ')', cb);
        } else {
            can.bind.call(this, ev, cb);
        }
        return this;
    };
    can.undelegate = function (selector, ev, cb) {
        if (this.undelegate) {
            this.undelegate(selector, ev, cb);
        } else if (this.removeEvent) {
            this.removeEvent(ev + ':relay(' + selector + ')', cb);
        } else {
            can.unbind.call(this, ev, cb);
        }
        return this;
    };
    var optionsMap = {
            type: 'method',
            success: undefined,
            error: undefined
        };
    var updateDeferred = function (xhr, d) {
        for (var prop in xhr) {
            if (typeof d[prop] === 'function') {
                d[prop] = function () {
                    xhr[prop].apply(xhr, arguments);
                };
            } else {
                d[prop] = prop[xhr];
            }
        }
    };
    can.ajax = function (options) {
        var d = can.Deferred(), requestOptions = can.extend({}, options), request;
        for (var option in optionsMap) {
            if (requestOptions[option] !== undefined) {
                requestOptions[optionsMap[option]] = requestOptions[option];
                delete requestOptions[option];
            }
        }
        requestOptions.method = requestOptions.method || 'get';
        requestOptions.url = requestOptions.url.toString();
        var success = options.onSuccess || options.success, error = options.onFailure || options.error;
        requestOptions.onSuccess = function (response, xml) {
            var data = response;
            updateDeferred(request.xhr, d);
            d.resolve(data, 'success', request.xhr);
            if (success) {
                success(data, 'success', request.xhr);
            }
        };
        requestOptions.onFailure = function () {
            updateDeferred(request.xhr, d);
            d.reject(request.xhr, 'error');
            if (error) {
                error(request.xhr, 'error');
            }
        };
        if (options.dataType === 'json') {
            request = new Request.JSON(requestOptions);
        } else {
            request = new Request(requestOptions);
        }
        request.send();
        updateDeferred(request.xhr, d);
        return d;
    };
    can.$ = function (selector) {
        if (selector === window) {
            return window;
        }
        return $$(selector && selector.nodeName ? [selector] : selector);
    };
    var old = document.id;
    document.id = function (el) {
        if (el && el.nodeType === 11) {
            return el;
        } else {
            return old.apply(document, arguments);
        }
    };
    can.append = function (wrapped, html) {
        if (typeof html === 'string') {
            html = can.buildFragment(html);
        }
        return wrapped.grab(html);
    };
    can.filter = function (wrapped, filter) {
        return wrapped.filter(filter);
    };
    can.data = function (wrapped, key, value) {
        if (value === undefined) {
            return wrapped[0].retrieve(key);
        } else {
            return wrapped.store(key, value);
        }
    };
    can.addClass = function (wrapped, className) {
        return wrapped.addClass(className);
    };
    can.remove = function (wrapped) {
        var filtered = wrapped.filter(function (node) {
                if (node.nodeType !== 1) {
                    node.parentNode.removeChild(node);
                } else {
                    return true;
                }
            });
        filtered.destroy();
        return filtered;
    };
    can.has = function (wrapped, element) {
        if (Slick.contains(wrapped[0], element)) {
            return wrapped;
        } else {
            return [];
        }
    };
    var destroy = Element.prototype.destroy, grab = Element.prototype.grab, oldSet = Element.prototype.set;
    Element.implement({
        destroy: function () {
            can.trigger(this, 'removed', [], false);
            var elems = this.getElementsByTagName('*');
            for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
                can.trigger(elem, 'removed', [], false);
            }
            destroy.apply(this, arguments);
        },
        grab: function (el) {
            var elems;
            if (el && el.nodeType === 11) {
                elems = can.makeArray(el.childNodes);
            } else {
                elems = [el];
            }
            var ret = grab.apply(this, arguments);
            can.inserted(elems);
            return ret;
        },
        set: function (attrName, value) {
            var isAttributeOrProp = can.inArray(attrName, [
                    'events',
                    'html',
                    'load',
                    'morph',
                    'send',
                    'tag',
                    'tween'
                ]) === -1, newValue, oldValue;
            if (isAttributeOrProp) {
                oldValue = this.get(attrName);
            }
            var res = oldSet.apply(this, arguments);
            if (isAttributeOrProp) {
                newValue = this.get(attrName);
            }
            if (newValue !== oldValue) {
                can.attr.trigger(this, attrName, oldValue);
            }
            return res;
        }.overloadSetter()
    });
    can.get = function (wrapped, index) {
        return wrapped[index];
    };
    var idOf = Slick.uidOf;
    Slick.uidOf = function (node) {
        if (node.nodeType === 1 || node === window || node.document === document) {
            return idOf(node);
        } else {
            return Math.random();
        }
    };
    Element.NativeEvents.hashchange = 2;
    can.attr = attr;
    delete attr.MutationObserver;
    Element.Events.attributes = {
        onAdd: function () {
            var el = can.$(this);
            can.data(el, 'canHasAttributesBindings', (can.data(el, 'canHasAttributesBindings') || 0) + 1);
        },
        onRemove: function () {
            var el = can.$(this), cur = can.data(el, 'canHasAttributesBindings') || 0;
            if (cur <= 0) {
                can.cleanData(el, 'canHasAttributesBindings');
            } else {
                can.data(el, 'canHasAttributesBindings', cur - 1);
            }
        }
    };
    return can;
});
