/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#compute/proto_compute*/
var can = require('../util/util.js');
var bind = require('../util/bind/bind.js');
var read = require('./read.js');
var getValueAndBind = require('./get_value_and_bind.js');
require('../util/batch/batch.js');
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
module.exports = can.Compute;
