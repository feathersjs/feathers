/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/deferred*/
define(['can/util/can'], function (can) {
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
