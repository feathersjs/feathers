/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#map/lazy/lazy*/
var can = require('../../util/util.js');
var bubble = require('./bubble.js');
require('../map.js');
require('../../list/list.js');
require('./nested_reference.js');
can.LazyMap = can.Map.extend({ _bubble: bubble }, {
    setup: function (obj) {
        this.constructor.Map = this.constructor;
        this.constructor.List = can.LazyList;
        this._data = can.extend(can.extend(true, {}, this._setupDefaults() || {}), obj);
        can.cid(this, '.lazyMap');
        this._init = 1;
        this._computedBindings = {};
        this._setupComputes();
        var teardownMapping = obj && can.Map.helpers.addToMap(obj, this);
        this._nestedReference = new can.NestedReference(this._data);
        if (teardownMapping) {
            teardownMapping();
        }
        can.each(this._data, can.proxy(function (value, prop) {
            this.___set(prop, value);
        }, this));
        this.bind('change', can.proxy(this._changes, this));
        delete this._init;
    },
    _addChild: function (path, newChild, setNewChild) {
        var self = this;
        this._nestedReference.removeChildren(path, function (oldChild, oldChildPath) {
            bubble.remove(self, oldChild);
            if (newChild) {
                var newChildPath = oldChildPath.replace(path + '.', '');
                if (path === newChildPath) {
                    oldChild._nestedReference.each(function (obj, path) {
                        newChild._nestedReference.make(path());
                        if (self._bindings) {
                            bubble.add(this, newChild, path());
                        }
                    });
                } else {
                    var reference = newChild._nestedReference.make(newChildPath);
                    if (self._bindings) {
                        bubble.add(oldChild, newChild, reference());
                    }
                }
            }
        });
        if (setNewChild) {
            setNewChild();
        }
        if (newChild) {
            var reference = this._nestedReference.make(path);
            if (this._bindings) {
                bubble.add(this, newChild, reference());
            }
        }
        return newChild;
    },
    removeAttr: function (attr) {
        var data = this._goto(attr);
        if (data.parts.length) {
            return data.value.removeAttr(data.parts.join('.'));
        } else {
            if (can.isArray(data.parent)) {
                data.parent.splice(data.prop, 1);
                this._triggerChange(attr, 'remove', undefined, [this.__type(data.value, data.prop)]);
            } else {
                if (data.parent[data.prop]) {
                    delete data.parent[data.prop];
                    can.batch.trigger(this, data.path.length ? data.path.join('.') + '.__keys' : '__keys');
                    this._triggerChange(attr, 'remove', undefined, this.__type(data.value, data.prop));
                }
            }
            this._nestedReference.removeChildren();
            return data.value;
        }
    },
    __type: function (value, prop) {
        if (!(value instanceof can.LazyMap) && can.Map.helpers.canMakeObserve(value)) {
            if (can.isArray(value)) {
                var List = can.LazyList;
                return new List(value);
            } else {
                var Map = this.constructor.Map || can.LazyMap;
                return new Map(value);
            }
        }
        return value;
    },
    _goto: function (attr, keepKey) {
        var parts = can.Map.helpers.attrParts(attr, keepKey).slice(0), prev, path = [], part;
        var cur = this instanceof can.List ? this[parts.shift()] : this.__get();
        while (cur && !can.Map.helpers.isObservable(cur) && parts.length) {
            if (part !== undefined) {
                path.push(part);
            }
            prev = cur;
            cur = cur[part = parts.shift()];
        }
        return {
            parts: parts,
            prop: part,
            value: cur,
            parent: prev,
            path: path
        };
    },
    _get: function (attr) {
        can.__observe(this, attr);
        var data = this._goto(attr);
        if (can.Map.helpers.isObservable(data.value)) {
            if (data.parts.length) {
                return data.value._get(data.parts);
            } else {
                return data.value;
            }
        } else if (data.value && can.Map.helpers.canMakeObserve(data.value)) {
            var converted = this.__type(data.value, data.prop);
            this._addChild(attr, converted, function () {
                data.parent[data.prop] = converted;
            });
            return converted;
        } else if (data.value !== undefined) {
            return data.value;
        } else {
            return this.__get(attr);
        }
    },
    _set: function (attr, value, keepKey) {
        var data = this._goto(attr, keepKey);
        if (can.Map.helpers.isObservable(data.value) && data.parts.length) {
            return data.value._set(data.parts, value);
        } else if (!data.parts.length) {
            this.__set(attr, value, data.value, data);
        } else {
            throw 'can.LazyMap: object does not exist';
        }
    },
    __set: function (prop, value, current, data, convert) {
        convert = convert || true;
        if (value !== current) {
            var changeType = data.parent.hasOwnProperty(data.prop) ? 'set' : 'add';
            if (convert && can.Map.helpers.canMakeObserve(value)) {
                value = this.__type(value, prop);
                var self = this;
                this._addChild(prop, value, function () {
                    self.___set(prop, value, data);
                });
            } else {
                this.___set(prop, value, data);
            }
            if (changeType === 'add') {
                can.batch.trigger(this, data.path.length ? data.path.join('.') + '.__keys' : '__keys', undefined);
            }
            this._triggerChange(prop, changeType, value, current);
        }
    },
    ___set: function (prop, val, data) {
        if (this[prop] && this[prop].isComputed && can.isFunction(this.constructor.prototype[prop])) {
            this[prop](val);
        } else if (data) {
            data.parent[data.prop] = val;
        } else {
            this._data[prop] = val;
        }
        if (!can.isFunction(this.constructor.prototype[prop])) {
            this[prop] = val;
        }
    },
    _attrs: function (props, remove) {
        if (props === undefined) {
            return can.Map.helpers.serialize(this, 'attr', {});
        }
        props = can.extend({}, props);
        var self = this, prop, data, newVal;
        can.batch.start();
        this.each(function (curVal, prop) {
            newVal = props[prop];
            data = self._goto(prop, true);
            if (newVal === undefined) {
                if (remove) {
                    self.removeAttr(prop);
                }
                return;
            } else if (!can.Map.helpers.isObservable(curVal) && can.Map.helpers.canMakeObserve(curVal)) {
                curVal = self.attr(prop);
            }
            if (self.__convert) {
                newVal = self.__convert(prop, newVal);
            }
            if (newVal instanceof can.Map) {
                self.__set(prop, newVal, curVal, data);
            } else if (can.Map.helpers.isObservable(curVal) && can.Map.helpers.canMakeObserve(newVal) && curVal.attr) {
                curVal.attr(newVal, remove);
            } else if (curVal !== newVal) {
                self.__set(prop, newVal, curVal, data);
            }
            delete props[prop];
        });
        for (prop in props) {
            newVal = props[prop];
            this._set(prop, newVal, true);
        }
        can.batch.stop();
        return this;
    }
});
can.LazyList = can.List.extend({ Map: can.LazyMap }, {
    setup: function () {
        can.List.prototype.setup.apply(this, arguments);
        this._nestedReference = new can.NestedReference(this);
    }
});
module.exports = can.LazyMap;
