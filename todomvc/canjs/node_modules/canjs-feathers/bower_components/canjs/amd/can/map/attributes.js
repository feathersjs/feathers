/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#map/attributes/attributes*/
define([
    'can/util/library',
    'can/map',
    'can/list'
], function (can, Map) {
    can.each([
        can.Map,
        can.Model
    ], function (clss) {
        if (clss === undefined) {
            return;
        }
        var isObject = function (obj) {
            return typeof obj === 'object' && obj !== null && obj;
        };
        can.extend(clss, {
            attributes: {},
            convert: {
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
                    return parseFloat(val);
                },
                'boolean': function (val) {
                    if (val === 'false' || val === '0' || !val) {
                        return false;
                    }
                    return true;
                },
                'default': function (val, oldVal, error, type) {
                    if (can.Map.prototype.isPrototypeOf(type.prototype) && typeof type.model === 'function' && typeof type.models === 'function') {
                        return type[can.isArray(val) ? 'models' : 'model'](val);
                    }
                    if (can.Map.prototype.isPrototypeOf(type.prototype)) {
                        if (can.isArray(val) && typeof type.List === 'function') {
                            return new type.List(val);
                        }
                        return new type(val);
                    }
                    if (typeof type === 'function') {
                        return type(val, oldVal);
                    }
                    var construct = can.getObject(type), context = window, realType;
                    if (type.indexOf('.') >= 0) {
                        realType = type.substring(0, type.lastIndexOf('.'));
                        context = can.getObject(realType);
                    }
                    return typeof construct === 'function' ? construct.call(context, val, oldVal) : val;
                }
            },
            serialize: {
                'default': function (val, type) {
                    return isObject(val) && val.serialize ? val.serialize() : val;
                },
                'date': function (val) {
                    return val && val.getTime();
                }
            }
        });
        var oldSetup = clss.setup;
        clss.setup = function (superClass, stat, proto) {
            var self = this;
            oldSetup.call(self, superClass, stat, proto);
            can.each(['attributes'], function (name) {
                if (!self[name] || superClass[name] === self[name]) {
                    self[name] = {};
                }
            });
            can.each([
                'convert',
                'serialize'
            ], function (name) {
                if (superClass[name] !== self[name]) {
                    self[name] = can.extend({}, superClass[name], self[name]);
                }
            });
        };
    });
    can.Map.prototype.__convert = function (prop, value) {
        var Class = this.constructor, oldVal = this.__get(prop), type, converter;
        if (Class.attributes) {
            type = Class.attributes[prop];
            converter = Class.convert[type] || Class.convert['default'];
        }
        return value === null || !type ? value : converter.call(Class, value, oldVal, function () {
        }, type);
    };
    var oldSerialize = can.Map.helpers._serialize;
    can.Map.helpers._serialize = function (map, name, val) {
        var constructor = map.constructor, type = constructor.attributes ? constructor.attributes[name] : 0, converter = constructor.serialize ? constructor.serialize[type] : 0;
        return val && typeof val.serialize === 'function' ? oldSerialize.apply(this, arguments) : converter ? converter(val, type) : oldSerialize.apply(this, arguments);
    };
    var mapSerialize = can.Map.prototype.serialize;
    can.Map.prototype.serialize = function (attrName) {
        var baseResult = mapSerialize.apply(this, arguments);
        if (attrName) {
            return baseResult[attrName];
        } else {
            return baseResult;
        }
    };
    return can.Map;
});
