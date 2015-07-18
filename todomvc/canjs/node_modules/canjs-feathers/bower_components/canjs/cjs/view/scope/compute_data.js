/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/scope/compute_data*/
var can = require('../../util/util.js');
var compute = require('../../compute/compute.js');
var getValueAndBind = require('../../compute/get_value_and_bind.js');
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
module.exports = function (scope, key, options) {
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
