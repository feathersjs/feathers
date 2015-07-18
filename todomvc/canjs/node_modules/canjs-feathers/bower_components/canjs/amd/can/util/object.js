/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/object/object*/
define(['can/util/library'], function (can) {
    var isArray = can.isArray;
    can.Object = {};
    var same = can.Object.same = function (a, b, compares, aParent, bParent, deep) {
            var aType = typeof a, aArray = isArray(a), comparesType = typeof compares, compare;
            if (comparesType === 'string' || compares === null) {
                compares = compareMethods[compares];
                comparesType = 'function';
            }
            if (comparesType === 'function') {
                return compares(a, b, aParent, bParent);
            }
            compares = compares || {};
            if (a === null || b === null) {
                return a === b;
            }
            if (a instanceof Date || b instanceof Date) {
                return a === b;
            }
            if (deep === -1) {
                return aType === 'object' || a === b;
            }
            if (aType !== typeof b || aArray !== isArray(b)) {
                return false;
            }
            if (a === b) {
                return true;
            }
            if (aArray) {
                if (a.length !== b.length) {
                    return false;
                }
                for (var i = 0; i < a.length; i++) {
                    compare = compares[i] === undefined ? compares['*'] : compares[i];
                    if (!same(a[i], b[i], a, b, compare)) {
                        return false;
                    }
                }
                return true;
            } else if (aType === 'object' || aType === 'function') {
                var bCopy = can.extend({}, b);
                for (var prop in a) {
                    compare = compares[prop] === undefined ? compares['*'] : compares[prop];
                    if (!same(a[prop], b[prop], compare, a, b, deep === false ? -1 : undefined)) {
                        return false;
                    }
                    delete bCopy[prop];
                }
                for (prop in bCopy) {
                    if (compares[prop] === undefined || !same(undefined, b[prop], compares[prop], a, b, deep === false ? -1 : undefined)) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
    can.Object.subsets = function (checkSet, sets, compares) {
        var len = sets.length, subsets = [];
        for (var i = 0; i < len; i++) {
            var set = sets[i];
            if (can.Object.subset(checkSet, set, compares)) {
                subsets.push(set);
            }
        }
        return subsets;
    };
    can.Object.subset = function (subset, set, compares) {
        compares = compares || {};
        for (var prop in set) {
            if (!same(subset[prop], set[prop], compares[prop], subset, set)) {
                return false;
            }
        }
        return true;
    };
    var compareMethods = {
            'null': function () {
                return true;
            },
            i: function (a, b) {
                return ('' + a).toLowerCase() === ('' + b).toLowerCase();
            },
            eq: function (a, b) {
                return a === b;
            },
            similar: function (a, b) {
                return a == b;
            }
        };
    compareMethods.eqeq = compareMethods.similar;
    return can.Object;
});
