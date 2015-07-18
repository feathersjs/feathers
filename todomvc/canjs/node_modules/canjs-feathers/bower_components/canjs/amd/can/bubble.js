/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#map/bubble*/
define(['can/util/library'], function (can) {
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
