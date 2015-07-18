/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/dojo/dojo*/
'format steal';
define([
    'can/util/can',
    'can/util/attr',
    'dojo/main',
    'can/event',
    'can/fragment',
    'can/util/each',
    'can/util/object/isplain',
    'can/deferred',
    'can/hashchange',
    'can/util/inserted'
], function (can, attr, djo) {
    var dojo = djo || window.dojo;
    define('plugd/trigger', ['dojo/main'], function () {
        var d = dojo;
        var isfn = d.isFunction;
        var leaveRe = /mouse(enter|leave)/;
        var _fix = function (_, p) {
            return 'mouse' + (p === 'enter' ? 'over' : 'out');
        };
        var mix = d._mixin;
        var realTrigger;
        if (d.doc.createEvent) {
            realTrigger = function (n, e, a) {
                var ev = d.doc.createEvent('HTMLEvents');
                e = e.replace(leaveRe, _fix);
                ev.initEvent(e, e === 'removed' || e === 'inserted' ? false : true, true);
                if (a) {
                    mix(ev, a);
                }
                n.dispatchEvent(ev);
            };
        } else {
            realTrigger = function (n, e, a) {
                var ev = 'on' + e, stop = false;
                try {
                    var evObj = document.createEventObject();
                    if (e === 'inserted' || e === 'removed') {
                        evObj.cancelBubble = true;
                    }
                    mix(evObj, a);
                    n.fireEvent(ev, evObj);
                } catch (er) {
                    var evdata = mix({
                            type: e,
                            target: n,
                            faux: true,
                            _stopper: function () {
                                stop = this.cancelBubble;
                            }
                        }, a);
                    if (isfn(n[ev])) {
                        n[ev](evdata);
                    }
                    if (e === 'inserted' || e === 'removed') {
                        return;
                    }
                    while (!stop && n !== d.doc && n.parentNode) {
                        n = n.parentNode;
                        if (isfn(n[ev])) {
                            n[ev](evdata);
                        }
                    }
                }
            };
        }
        d._trigger = function (node, event, extraArgs) {
            if (typeof event !== 'string') {
                extraArgs = event;
                event = extraArgs.type;
                delete extraArgs.type;
            }
            var n = d.byId(node), ev = event && event.slice(0, 2) === 'on' ? event.slice(2) : event;
            realTrigger(n, ev, extraArgs);
        };
        d.trigger = function (obj, event, extraArgs) {
            return isfn(obj) || isfn(event) || isfn(obj[event]) ? d.hitch.apply(d, arguments)() : d._trigger.apply(d, arguments);
        };
        d.NodeList.prototype.trigger = d.NodeList._adaptAsForEach(d._trigger);
        if (d._Node && !d._Node.prototype.trigger) {
            d.extend(d._Node, {
                trigger: function (ev, data) {
                    d._trigger(this, ev, data);
                    return this;
                }
            });
        }
        return d.trigger;
    });
    require([
        'dojo/main',
        'dojo/query',
        'plugd/trigger',
        'dojo/NodeList-dom'
    ]);
    can.trim = function (s) {
        return s && dojo.trim(s);
    };
    can.makeArray = function (arr) {
        var array = [];
        dojo.forEach(arr, function (item) {
            array.push(item);
        });
        return array;
    };
    can.isArray = dojo.isArray;
    can.inArray = function (item, arr, from) {
        return dojo.indexOf(arr, item, from);
    };
    can.map = function (arr, fn) {
        return dojo.map(can.makeArray(arr || []), fn);
    };
    can.extend = function (first) {
        if (first === true) {
            var args = can.makeArray(arguments);
            args.shift();
            return dojo.mixin.apply(dojo, args);
        }
        return dojo.mixin.apply(dojo, arguments);
    };
    can.isEmptyObject = function (object) {
        var prop;
        for (prop in object) {
            break;
        }
        return prop === undefined;
    };
    can.param = function (object) {
        var pairs = [], add = function (key, value) {
                pairs.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
            };
        for (var name in object) {
            can.buildParam(name, object[name], add);
        }
        return pairs.join('&').replace(/%20/g, '+');
    };
    can.buildParam = function (prefix, obj, add) {
        if (can.isArray(obj)) {
            for (var i = 0, l = obj.length; i < l; ++i) {
                add(prefix + '[]', obj[i]);
            }
        } else if (dojo.isObject(obj)) {
            for (var name in obj) {
                can.buildParam(prefix + '[' + name + ']', obj[name], add);
            }
        } else {
            add(prefix, obj);
        }
    };
    can.proxy = function (func, context) {
        return dojo.hitch(context, func);
    };
    can.isFunction = function (f) {
        return dojo.isFunction(f);
    };
    var dojoId = 0, dojoAddBinding = function (nodelist, ev, cb) {
            nodelist.forEach(function (node) {
                node = new dojo.NodeList(node.nodeName === 'SELECT' ? [node] : node);
                var events = can.data(node, 'events');
                if (!events) {
                    can.data(node, 'events', events = {});
                }
                if (!events[ev]) {
                    events[ev] = {};
                }
                if (cb.__bindingsIds === undefined) {
                    cb.__bindingsIds = dojoId++;
                }
                events[ev][cb.__bindingsIds] = node.on(ev, cb)[0];
            });
        }, dojoRemoveBinding = function (nodelist, ev, cb) {
            nodelist.forEach(function (node) {
                var currentNode = new dojo.NodeList(node), events = can.data(currentNode, 'events');
                if (!events) {
                    return;
                }
                var handlers = events[ev];
                if (!handlers) {
                    return;
                }
                var handler = handlers[cb.__bindingsIds];
                dojo.disconnect(handler);
                delete handlers[cb.__bindingsIds];
                if (can.isEmptyObject(handlers)) {
                    delete events[ev];
                }
            });
        };
    can.bind = function (ev, cb) {
        if (this.bind && this.bind !== can.bind) {
            this.bind(ev, cb);
        } else if (this.on || this.nodeType) {
            dojoAddBinding(new dojo.NodeList(this.nodeName === 'SELECT' ? [this] : this), ev, cb);
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
            dojoRemoveBinding(new dojo.NodeList(this), ev, cb);
        } else {
            can.removeEvent.call(this, ev, cb);
        }
        return this;
    };
    can.on = can.bind;
    can.off = can.unbind;
    can.trigger = function (item, event, args, bubble) {
        if (!(item instanceof dojo.NodeList) && (item.nodeName || item === window)) {
            item = can.$(item);
        }
        if (item.trigger) {
            if (bubble === false) {
                if (!item[0] || item[0].nodeType === 3) {
                    return;
                }
                var connect = item.on(event, function (ev) {
                        if (ev.stopPropagation) {
                            ev.stopPropagation();
                        }
                        ev.cancelBubble = true;
                        if (ev._stopper) {
                            ev._stopper();
                        }
                        dojo.disconnect(connect);
                    });
                item.trigger(event, args);
            } else {
                item.trigger(event, args);
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
        if (!selector) {
            can.bind.call(this, ev, cb);
        } else if (this.on || this.nodeType) {
            dojoAddBinding(new dojo.NodeList(this), selector + ':' + ev, cb);
        } else if (this.delegate) {
            this.delegate(selector, ev, cb);
        } else {
            can.bind.call(this, ev, cb);
        }
        return this;
    };
    can.undelegate = function (selector, ev, cb) {
        if (!selector) {
            can.unbind.call(this, ev, cb);
        } else if (this.on || this.nodeType) {
            dojoRemoveBinding(new dojo.NodeList(this), selector + ':' + ev, cb);
        } else if (this.undelegate) {
            this.undelegate(selector, ev, cb);
        } else {
            can.unbind.call(this, ev, cb);
        }
        return this;
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
        var type = can.capitalize((options.type || 'get').toLowerCase()), method = dojo['xhr' + type];
        var success = options.success, error = options.error, d = new can.Deferred();
        var def = method({
                url: options.url,
                handleAs: options.dataType,
                sync: !options.async,
                headers: options.headers,
                content: options.data
            });
        def.then(function (data, ioargs) {
            updateDeferred(xhr, d);
            d.resolve(data, 'success', xhr);
            if (success) {
                success(data, 'success', xhr);
            }
        }, function (data, ioargs) {
            updateDeferred(xhr, d);
            d.reject(xhr, 'error');
            error(xhr, 'error');
        });
        var xhr = def.ioArgs.xhr;
        updateDeferred(xhr, d);
        return d;
    };
    can.$ = function (selector) {
        if (selector === window) {
            return window;
        }
        if (typeof selector === 'string') {
            return dojo.query(selector);
        } else {
            return new dojo.NodeList(selector && selector.nodeName ? [selector] : selector);
        }
    };
    can.append = function (wrapped, html) {
        return wrapped.forEach(function (node) {
            dojo.place(html, node);
        });
    };
    var data = {}, uuid = can.uuid = +new Date(), exp = can.expando = 'can' + uuid;
    function getData(node, name) {
        var id = node[exp], store = id && data[id];
        return name === undefined ? store || setData(node) : store && store[name];
    }
    function setData(node, name, value) {
        var id = node[exp] || (node[exp] = ++uuid), store = data[id] || (data[id] = {});
        if (name !== undefined) {
            store[name] = value;
        }
        return store;
    }
    var cleanData = function (elems) {
        var nodes = [];
        for (var i = 0, len = elems.length; i < len; i++) {
            if (elems[i].nodeType === 1) {
                nodes.push(elems[i]);
            }
        }
        can.trigger(new dojo.NodeList(nodes), 'removed', [], false);
        i = 0;
        for (var elem; (elem = elems[i]) !== undefined; i++) {
            var id = elem[exp];
            delete data[id];
        }
    };
    can.data = function (wrapped, name, value) {
        return value === undefined ? wrapped.length === 0 ? undefined : getData(wrapped[0], name) : wrapped.forEach(function (node) {
            setData(node, name, value);
        });
    };
    can.cleanData = function (elem, prop) {
        var id = elem[exp];
        delete data[id][prop];
    };
    dojo.empty = function (node) {
        for (var c; c = node.lastChild;) {
            dojo.destroy(c);
        }
    };
    var destroy = dojo.destroy;
    dojo.destroy = function (node) {
        node = dojo.byId(node);
        var nodes = [node];
        if (node.getElementsByTagName) {
            nodes.concat(can.makeArray(node.getElementsByTagName('*')));
        }
        cleanData(nodes);
        return destroy.apply(dojo, arguments);
    };
    var place = dojo.place;
    dojo.place = function (node, refNode, position) {
        if (typeof node === 'string' && /^\s*</.test(node)) {
            node = can.buildFragment(node);
        }
        var elems;
        if (node.nodeType === 11) {
            elems = can.makeArray(node.childNodes);
        } else {
            elems = [node];
        }
        var ret = place.call(this, node, refNode, position);
        can.inserted(elems);
        return ret;
    };
    can.addClass = function (wrapped, className) {
        return wrapped.addClass(className);
    };
    can.remove = function (wrapped) {
        var nodes = [];
        wrapped.forEach(function (node) {
            nodes.push(node);
            if (node.getElementsByTagName) {
                nodes.push.apply(nodes, can.makeArray(node.getElementsByTagName('*')));
            }
        });
        cleanData(nodes);
        wrapped.forEach(destroy);
        return wrapped;
    };
    can.get = function (wrapped, index) {
        return wrapped[index];
    };
    can.has = function (wrapped, element) {
        if (dojo.isDescendant(element, wrapped[0])) {
            return wrapped;
        } else {
            return [];
        }
    };
    can.extend(dojo.Deferred.prototype, {
        pipe: function (done, fail) {
            var d = new dojo.Deferred();
            this.addCallback(function () {
                d.resolve(done.apply(this, arguments));
            });
            this.addErrback(function () {
                if (fail) {
                    d.reject(fail.apply(this, arguments));
                } else {
                    d.reject.apply(d, arguments);
                }
            });
            return d;
        }
    });
    can.attr = attr;
    delete attr.MutationObserver;
    var oldOn = dojo.NodeList.prototype.on;
    dojo.NodeList.prototype.on = function (event) {
        if (event === 'attributes') {
            this.forEach(function (node) {
                var el = can.$(node);
                can.data(el, 'canHasAttributesBindings', (can.data(el, 'canHasAttributesBindings') || 0) + 1);
            });
        }
        var handles = oldOn.apply(this, arguments);
        if (event === 'attributes') {
            var self = this;
            can.each(handles, function (handle, i) {
                var oldRemove = handle.remove;
                handle.remove = function () {
                    var el = can.$(self[i]), cur = can.data(el, 'canHasAttributesBindings') || 0;
                    if (cur <= 0) {
                        can.cleanData(self[i], 'canHasAttributesBindings');
                    } else {
                        can.data(el, 'canHasAttributesBindings', cur - 1);
                    }
                    return oldRemove.call(this, arguments);
                };
            });
        }
        return handles;
    };
    var oldSetAttr = dojo.setAttr;
    dojo.setAttr = function (node, name, value) {
        var oldValue = dojo.getAttr(node, name);
        var res = oldSetAttr.apply(this, arguments);
        var newValue = dojo.getAttr(node, name);
        if (newValue !== oldValue) {
            can.attr.trigger(node, name, oldValue);
        }
        return res;
    };
    var oldRemoveAttr = dojo.removeAttr;
    dojo.removeAttr = function (node, name) {
        var oldValue = dojo.getAttr(node, name), res = oldRemoveAttr.apply(this, arguments);
        if (oldValue != null) {
            can.attr.trigger(node, name, oldValue);
        }
        return res;
    };
    return can;
});
