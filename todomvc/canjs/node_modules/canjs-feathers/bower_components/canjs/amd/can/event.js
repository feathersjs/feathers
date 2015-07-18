/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#event/event*/
define(['can/util/can'], function (can) {
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
