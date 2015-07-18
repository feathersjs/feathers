/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#map/map*/
define([
    'can/util/library',
    'can/util/bind',
    'can/bubble',
    'can/construct',
    'can/util/batch'
], function (can, bind, bubble) {
    var madeMap = null;
    var teardownMap = function () {
        for (var cid in madeMap) {
            if (madeMap[cid].added) {
                delete madeMap[cid].obj._cid;
            }
        }
        madeMap = null;
    };
    var getMapFromObject = function (obj) {
        return madeMap && madeMap[obj._cid] && madeMap[obj._cid].instance;
    };
    var serializeMap = null;
    var Map = can.Map = can.Construct.extend({
            setup: function () {
                can.Construct.setup.apply(this, arguments);
                if (can.Map) {
                    if (!this.defaults) {
                        this.defaults = {};
                    }
                    this._computes = [];
                    if (this.prototype.define && !this.helpers.define) {
                        can.dev.warn('can/map/define is not included, yet there is a define property ' + 'used. You may want to add this plugin.');
                    }
                    if (this.define && !this.helpers.define) {
                        can.dev.warn('The define property should be on the map\'s prototype properties, ' + 'not the static properies. Also, can/map/define is not included.');
                    }
                    for (var prop in this.prototype) {
                        if (prop !== 'define' && prop !== 'constructor' && (typeof this.prototype[prop] !== 'function' || this.prototype[prop].prototype instanceof can.Construct)) {
                            this.defaults[prop] = this.prototype[prop];
                        } else if (this.prototype[prop].isComputed) {
                            this._computes.push(prop);
                        }
                    }
                    if (this.helpers.define) {
                        this.helpers.define(this);
                    }
                }
                if (can.List && !(this.prototype instanceof can.List)) {
                    this.List = Map.List.extend({ Map: this }, {});
                }
            },
            _bubble: bubble,
            _bubbleRule: function (eventName) {
                return eventName === 'change' || eventName.indexOf('.') >= 0 ? ['change'] : [];
            },
            _computes: [],
            bind: can.bindAndSetup,
            on: can.bindAndSetup,
            unbind: can.unbindAndTeardown,
            off: can.unbindAndTeardown,
            id: 'id',
            helpers: {
                define: null,
                attrParts: function (attr, keepKey) {
                    if (keepKey) {
                        return [attr];
                    }
                    return typeof attr === 'object' ? attr : ('' + attr).split('.');
                },
                addToMap: function (obj, instance) {
                    var teardown;
                    if (!madeMap) {
                        teardown = teardownMap;
                        madeMap = {};
                    }
                    var hasCid = obj._cid;
                    var cid = can.cid(obj);
                    if (!madeMap[cid]) {
                        madeMap[cid] = {
                            obj: obj,
                            instance: instance,
                            added: !hasCid
                        };
                    }
                    return teardown;
                },
                isObservable: function (obj) {
                    return obj instanceof can.Map || obj && obj === can.route;
                },
                canMakeObserve: function (obj) {
                    return obj && !can.isDeferred(obj) && (can.isArray(obj) || can.isPlainObject(obj));
                },
                serialize: function (map, how, where) {
                    var cid = can.cid(map), firstSerialize = false;
                    if (!serializeMap) {
                        firstSerialize = true;
                        serializeMap = {
                            attr: {},
                            serialize: {}
                        };
                    }
                    serializeMap[how][cid] = where;
                    map.each(function (val, name) {
                        var result, isObservable = Map.helpers.isObservable(val), serialized = isObservable && serializeMap[how][can.cid(val)];
                        if (serialized) {
                            result = serialized;
                        } else {
                            if (how === 'serialize') {
                                result = Map.helpers._serialize(map, name, val);
                            } else {
                                result = Map.helpers._getValue(map, name, val, how);
                            }
                        }
                        if (result !== undefined) {
                            where[name] = result;
                        }
                    });
                    can.__observe(map, '__keys');
                    if (firstSerialize) {
                        serializeMap = null;
                    }
                    return where;
                },
                _serialize: function (map, name, val) {
                    return Map.helpers._getValue(map, name, val, 'serialize');
                },
                _getValue: function (map, name, val, how) {
                    if (Map.helpers.isObservable(val)) {
                        return val[how]();
                    } else {
                        return val;
                    }
                }
            },
            keys: function (map) {
                var keys = [];
                can.__observe(map, '__keys');
                for (var keyName in map._data) {
                    keys.push(keyName);
                }
                return keys;
            }
        }, {
            setup: function (obj) {
                if (obj instanceof can.Map) {
                    obj = obj.serialize();
                }
                this._data = {};
                can.cid(this, '.map');
                this._init = 1;
                this._computedBindings = {};
                var defaultValues = this._setupDefaults(obj);
                this._setupComputes(defaultValues);
                var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);
                var data = can.extend(can.extend(true, {}, defaultValues), obj);
                this.attr(data);
                if (teardownMapping) {
                    teardownMapping();
                }
                this.bind('change', can.proxy(this._changes, this));
                delete this._init;
            },
            _setupComputes: function () {
                var computes = this.constructor._computes;
                for (var i = 0, len = computes.length, prop; i < len; i++) {
                    prop = computes[i];
                    this[prop] = this[prop].clone(this);
                    this._computedBindings[prop] = { count: 0 };
                }
            },
            _setupDefaults: function () {
                return this.constructor.defaults || {};
            },
            _bindsetup: function () {
            },
            _bindteardown: function () {
            },
            _changes: function (ev, attr, how, newVal, oldVal) {
                can.batch.trigger(this, {
                    type: attr,
                    batchNum: ev.batchNum,
                    target: ev.target
                }, [
                    newVal,
                    oldVal
                ]);
            },
            _triggerChange: function (attr, how, newVal, oldVal) {
                if (bubble.isBubbling(this, 'change')) {
                    can.batch.trigger(this, {
                        type: 'change',
                        target: this
                    }, [
                        attr,
                        how,
                        newVal,
                        oldVal
                    ]);
                } else {
                    can.batch.trigger(this, attr, [
                        newVal,
                        oldVal
                    ]);
                }
                if (how === 'remove' || how === 'add') {
                    can.batch.trigger(this, {
                        type: '__keys',
                        target: this
                    });
                }
            },
            _each: function (callback) {
                var data = this.__get();
                for (var prop in data) {
                    if (data.hasOwnProperty(prop)) {
                        callback(data[prop], prop);
                    }
                }
            },
            attr: function (attr, val) {
                var type = typeof attr;
                if (type !== 'string' && type !== 'number') {
                    return this._attrs(attr, val);
                } else if (arguments.length === 1) {
                    return this._get(attr);
                } else {
                    this._set(attr, val);
                    return this;
                }
            },
            each: function () {
                return can.each.apply(undefined, [this].concat(can.makeArray(arguments)));
            },
            removeAttr: function (attr) {
                var isList = can.List && this instanceof can.List, parts = can.Map.helpers.attrParts(attr), prop = parts.shift(), current = isList ? this[prop] : this._data[prop];
                if (parts.length && current) {
                    return current.removeAttr(parts);
                } else {
                    if (typeof attr === 'string' && !!~attr.indexOf('.')) {
                        prop = attr;
                    }
                    this._remove(prop, current);
                    return current;
                }
            },
            _remove: function (prop, current) {
                if (prop in this._data) {
                    delete this._data[prop];
                    if (!(prop in this.constructor.prototype)) {
                        delete this[prop];
                    }
                    this._triggerChange(prop, 'remove', undefined, current);
                }
            },
            _get: function (attr) {
                attr = '' + attr;
                var dotIndex = attr.indexOf('.');
                if (dotIndex >= 0) {
                    var value = this.__get(attr);
                    if (value !== undefined) {
                        return value;
                    }
                    var first = attr.substr(0, dotIndex), second = attr.substr(dotIndex + 1);
                    can.__observe(this, first);
                    var current = this.__get(first);
                    return current && current._get ? current._get(second) : undefined;
                } else {
                    can.__observe(this, attr);
                    return this.__get(attr);
                }
            },
            __get: function (attr) {
                if (attr) {
                    if (this._computedBindings[attr]) {
                        return this[attr]();
                    } else {
                        return this._data[attr];
                    }
                } else {
                    return this._data;
                }
            },
            __type: function (value, prop) {
                if (!(value instanceof can.Map) && can.Map.helpers.canMakeObserve(value)) {
                    var cached = getMapFromObject(value);
                    if (cached) {
                        return cached;
                    }
                    if (can.isArray(value)) {
                        var List = can.List;
                        return new List(value);
                    } else {
                        var Map = this.constructor.Map || can.Map;
                        return new Map(value);
                    }
                }
                return value;
            },
            _set: function (attr, value, keepKey) {
                attr = '' + attr;
                var dotIndex = attr.indexOf('.'), current;
                if (!keepKey && dotIndex >= 0) {
                    var first = attr.substr(0, dotIndex), second = attr.substr(dotIndex + 1);
                    current = this._init ? undefined : this.__get(first);
                    if (Map.helpers.isObservable(current)) {
                        current._set(second, value);
                    } else {
                        throw 'can.Map: Object does not exist';
                    }
                } else {
                    if (this.__convert) {
                        value = this.__convert(attr, value);
                    }
                    current = this._init ? undefined : this.__get(attr);
                    this.__set(attr, this.__type(value, attr), current);
                }
            },
            __set: function (prop, value, current) {
                if (value !== current) {
                    var changeType = current !== undefined || this.__get().hasOwnProperty(prop) ? 'set' : 'add';
                    this.___set(prop, this.constructor._bubble.set(this, prop, value, current));
                    if (!this._computedBindings[prop]) {
                        this._triggerChange(prop, changeType, value, current);
                    }
                    if (current) {
                        this.constructor._bubble.teardownFromParent(this, current);
                    }
                }
            },
            ___set: function (prop, val) {
                if (this._computedBindings[prop]) {
                    this[prop](val);
                } else {
                    this._data[prop] = val;
                }
                if (typeof this.constructor.prototype[prop] !== 'function' && !this._computedBindings[prop]) {
                    this[prop] = val;
                }
            },
            bind: function (eventName, handler) {
                var computedBinding = this._computedBindings && this._computedBindings[eventName];
                if (computedBinding) {
                    if (!computedBinding.count) {
                        computedBinding.count = 1;
                        var self = this;
                        computedBinding.handler = function (ev, newVal, oldVal) {
                            can.batch.trigger(self, {
                                type: eventName,
                                batchNum: ev.batchNum,
                                target: self
                            }, [
                                newVal,
                                oldVal
                            ]);
                        };
                        this[eventName].bind('change', computedBinding.handler);
                    } else {
                        computedBinding.count++;
                    }
                }
                this.constructor._bubble.bind(this, eventName);
                return can.bindAndSetup.apply(this, arguments);
            },
            unbind: function (eventName, handler) {
                var computedBinding = this._computedBindings && this._computedBindings[eventName];
                if (computedBinding) {
                    if (computedBinding.count === 1) {
                        computedBinding.count = 0;
                        this[eventName].unbind('change', computedBinding.handler);
                        delete computedBinding.handler;
                    } else {
                        computedBinding.count--;
                    }
                }
                this.constructor._bubble.unbind(this, eventName);
                return can.unbindAndTeardown.apply(this, arguments);
            },
            serialize: function () {
                return can.Map.helpers.serialize(this, 'serialize', {});
            },
            _attrs: function (props, remove) {
                if (props === undefined) {
                    return Map.helpers.serialize(this, 'attr', {});
                }
                props = can.simpleExtend({}, props);
                var prop, self = this, newVal;
                can.batch.start();
                this.each(function (curVal, prop) {
                    if (prop === '_cid') {
                        return;
                    }
                    newVal = props[prop];
                    if (newVal === undefined) {
                        if (remove) {
                            self.removeAttr(prop);
                        }
                        return;
                    }
                    if (self.__convert) {
                        newVal = self.__convert(prop, newVal);
                    }
                    if (Map.helpers.isObservable(newVal)) {
                        self.__set(prop, self.__type(newVal, prop), curVal);
                    } else if (Map.helpers.isObservable(curVal) && Map.helpers.canMakeObserve(newVal)) {
                        curVal.attr(newVal, remove);
                    } else if (curVal !== newVal) {
                        self.__set(prop, self.__type(newVal, prop), curVal);
                    }
                    delete props[prop];
                });
                for (prop in props) {
                    if (prop !== '_cid') {
                        newVal = props[prop];
                        this._set(prop, newVal, true);
                    }
                }
                can.batch.stop();
                return this;
            },
            compute: function (prop) {
                if (can.isFunction(this.constructor.prototype[prop])) {
                    return can.compute(this[prop], this);
                } else {
                    var reads = prop.split('.'), last = reads.length - 1, options = { args: [] };
                    return can.compute(function (newVal) {
                        if (arguments.length) {
                            can.compute.read(this, reads.slice(0, last)).value.attr(reads[last], newVal);
                        } else {
                            return can.compute.read(this, reads, options).value;
                        }
                    }, this);
                }
            }
        });
    Map.prototype.on = Map.prototype.bind;
    Map.prototype.off = Map.prototype.unbind;
    return Map;
});
