/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/yui/yui*/
define([
    'can/util/can',
    'can/util/attr',
    'yui',
    'can/event',
    'can/fragment',
    'can/util/each',
    'can/util/object/isplain',
    'can/deferred',
    'can/hashchange',
    'can/util/inserted'
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
