/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#compute/get_value_and_bind*/
define(['can/util/library'], function () {
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
