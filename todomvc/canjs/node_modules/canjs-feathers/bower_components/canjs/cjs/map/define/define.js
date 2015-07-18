/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#map/define/define*/
var can = require('../../util/util.js');
require('../../observe/observe.js');
var define = can.define = {};
var getPropDefineBehavior = function (behavior, attr, define) {
    var prop, defaultProp;
    if (define) {
        prop = define[attr];
        defaultProp = define['*'];
        if (prop && prop[behavior] !== undefined) {
            return prop[behavior];
        } else if (defaultProp && defaultProp[behavior] !== undefined) {
            return defaultProp[behavior];
        }
    }
};
can.Map.helpers.define = function (Map) {
    var definitions = Map.prototype.define;
    Map.defaultGenerators = {};
    for (var prop in definitions) {
        var type = definitions[prop].type;
        if (typeof type === 'string') {
            if (typeof define.types[type] === 'object') {
                delete definitions[prop].type;
                can.extend(definitions[prop], define.types[type]);
            }
        }
        if ('value' in definitions[prop]) {
            if (typeof definitions[prop].value === 'function') {
                Map.defaultGenerators[prop] = definitions[prop].value;
            } else {
                Map.defaults[prop] = definitions[prop].value;
            }
        }
        if (typeof definitions[prop].Value === 'function') {
            (function (Constructor) {
                Map.defaultGenerators[prop] = function () {
                    return new Constructor();
                };
            }(definitions[prop].Value));
        }
    }
};
var oldSetupDefaults = can.Map.prototype._setupDefaults;
can.Map.prototype._setupDefaults = function (obj) {
    var defaults = oldSetupDefaults.call(this), propsCommittedToAttr = {}, Map = this.constructor, originalGet = this._get;
    this._get = function (originalProp) {
        prop = originalProp.indexOf('.') !== -1 ? originalProp.substr(0, originalProp.indexOf('.')) : prop;
        if (prop in defaults && !(prop in propsCommittedToAttr)) {
            this.attr(prop, defaults[prop]);
            propsCommittedToAttr[prop] = true;
        }
        return originalGet.apply(this, arguments);
    };
    for (var prop in Map.defaultGenerators) {
        if (!obj || !(prop in obj)) {
            defaults[prop] = Map.defaultGenerators[prop].call(this);
        }
    }
    this._get = originalGet;
    return defaults;
};
var proto = can.Map.prototype, oldSet = proto.__set;
proto.__set = function (prop, value, current, success, error) {
    var errorCallback = function (errors) {
            var stub = error && error.call(self, errors);
            if (stub !== false) {
                can.trigger(self, 'error', [
                    prop,
                    errors
                ], true);
            }
            return false;
        }, self = this, setter = getPropDefineBehavior('set', prop, this.define), getter = getPropDefineBehavior('get', prop, this.define);
    if (setter) {
        can.batch.start();
        var setterCalled = false, setValue = setter.call(this, value, function (value) {
                if (getter) {
                    self[prop](value);
                } else {
                    oldSet.call(self, prop, value, current, success, errorCallback);
                }
                setterCalled = true;
            }, errorCallback, getter ? this[prop].computeInstance.lastSetValue.get() : current);
        if (getter) {
            if (setValue !== undefined && !setterCalled && setter.length >= 1) {
                this[prop](setValue);
            }
            can.batch.stop();
            return;
        } else if (setValue === undefined && !setterCalled && setter.length >= 1) {
            can.batch.stop();
            return;
        } else {
            if (!setterCalled) {
                oldSet.call(self, prop, setter.length === 0 && setValue === undefined ? value : setValue, current, success, errorCallback);
            }
            can.batch.stop();
            return this;
        }
    } else {
        oldSet.call(self, prop, value, current, success, errorCallback);
    }
    return this;
};
define.types = {
    'date': function (str) {
        var type = typeof str;
        if (type === 'string') {
            str = Date.parse(str);
            return isNaN(str) ? null : new Date(str);
        } else if (type === 'number') {
            return new Date(str);
        } else {
            return str;
        }
    },
    'number': function (val) {
        if (val == null) {
            return val;
        }
        return +val;
    },
    'boolean': function (val) {
        if (val === 'false' || val === '0' || !val) {
            return false;
        }
        return true;
    },
    'htmlbool': function (val) {
        return typeof val === 'string' || !!val;
    },
    '*': function (val) {
        return val;
    },
    'string': function (val) {
        if (val == null) {
            return val;
        }
        return '' + val;
    },
    'compute': {
        set: function (newValue, setVal, setErr, oldValue) {
            if (newValue.isComputed) {
                return newValue;
            }
            if (oldValue && oldValue.isComputed) {
                oldValue(newValue);
                return oldValue;
            }
            return newValue;
        },
        get: function (value) {
            return value && value.isComputed ? value() : value;
        }
    }
};
var oldType = proto.__type;
proto.__type = function (value, prop) {
    var type = getPropDefineBehavior('type', prop, this.define), Type = getPropDefineBehavior('Type', prop, this.define), newValue = value;
    if (typeof type === 'string') {
        type = define.types[type];
    }
    if (type || Type) {
        if (type) {
            newValue = type.call(this, newValue, prop);
        }
        if (Type && !(newValue instanceof Type)) {
            newValue = new Type(newValue);
        }
        return newValue;
    } else if (can.isPlainObject(newValue) && newValue.define) {
        newValue = can.Map.extend(newValue);
        newValue = new newValue();
    }
    return oldType.call(this, newValue, prop);
};
var oldRemove = proto._remove;
proto._remove = function (prop, current) {
    var remove = getPropDefineBehavior('remove', prop, this.define), res;
    if (remove) {
        can.batch.start();
        res = remove.call(this, current);
        if (res === false) {
            can.batch.stop();
            return;
        } else {
            res = oldRemove.call(this, prop, current);
            can.batch.stop();
            return res;
        }
    }
    return oldRemove.call(this, prop, current);
};
var oldSetupComputes = proto._setupComputes;
proto._setupComputes = function (defaultsValues) {
    oldSetupComputes.apply(this, arguments);
    for (var attr in this.define) {
        var def = this.define[attr], get = def.get;
        if (get) {
            this[attr] = can.compute.async(defaultsValues[attr], get, this);
            this._computedBindings[attr] = { count: 0 };
        }
    }
};
var oldSingleSerialize = can.Map.helpers._serialize;
can.Map.helpers._serialize = function (map, name, val) {
    return serializeProp(map, name, val);
};
var serializeProp = function (map, attr, val) {
    var serializer = attr === '*' ? false : getPropDefineBehavior('serialize', attr, map.define);
    if (serializer === undefined) {
        return oldSingleSerialize.apply(this, arguments);
    } else if (serializer !== false) {
        return typeof serializer === 'function' ? serializer.call(map, val, attr) : oldSingleSerialize.apply(this, arguments);
    }
};
var oldSerialize = proto.serialize;
proto.serialize = function (property) {
    var serialized = oldSerialize.apply(this, arguments);
    if (property) {
        return serialized;
    }
    var serializer, val;
    for (var attr in this.define) {
        if (!(attr in serialized)) {
            serializer = this.define && this.define[attr] && this.define[attr].serialize;
            if (serializer) {
                val = serializeProp(this, attr, this.attr(attr));
                if (val !== undefined) {
                    serialized[attr] = val;
                }
            }
        }
    }
    return serialized;
};
module.exports = can.define;
