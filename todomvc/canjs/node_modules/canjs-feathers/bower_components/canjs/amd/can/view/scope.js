/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/scope/scope*/
define([
    'can/util/library',
    'can/view/compute_data',
    'can/construct',
    'can/map',
    'can/list',
    'can/view',
    'can/compute'
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
