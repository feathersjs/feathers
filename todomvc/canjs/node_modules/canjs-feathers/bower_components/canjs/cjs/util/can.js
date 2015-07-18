/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/can*/
var glbl = typeof window !== 'undefined' ? window : global;
var can = {};
if (typeof GLOBALCAN === 'undefined' || GLOBALCAN !== false) {
    glbl.can = can;
}
can.global = glbl;
can.k = function () {
};
can.isDeferred = can.isPromise = function (obj) {
    return obj && typeof obj.then === 'function' && typeof obj.pipe === 'function';
};
can.isMapLike = function (obj) {
    return can.Map && (obj instanceof can.Map || obj && obj.__get);
};
var cid = 0;
can.cid = function (object, name) {
    if (!object._cid) {
        cid++;
        object._cid = (name || '') + cid;
    }
    return object._cid;
};
can.VERSION = '2.2.6';
can.simpleExtend = function (d, s) {
    for (var prop in s) {
        d[prop] = s[prop];
    }
    return d;
};
can.last = function (arr) {
    return arr && arr[arr.length - 1];
};
var protoBind = Function.prototype.bind;
if (protoBind) {
    can.proxy = function (fn, context) {
        return protoBind.call(fn, context);
    };
} else {
    can.proxy = function (fn, context) {
        return function () {
            return fn.apply(context, arguments);
        };
    };
}
can.frag = function (item) {
    var frag;
    if (!item || typeof item === 'string') {
        frag = can.buildFragment(item == null ? '' : '' + item, document.body);
        if (!frag.childNodes.length) {
            frag.appendChild(document.createTextNode(''));
        }
        return frag;
    } else if (item.nodeType === 11) {
        return item;
    } else if (typeof item.nodeType === 'number') {
        frag = document.createDocumentFragment();
        frag.appendChild(item);
        return frag;
    } else if (typeof item.length === 'number') {
        frag = document.createDocumentFragment();
        can.each(item, function (item) {
            frag.appendChild(can.frag(item));
        });
        return frag;
    } else {
        frag = can.buildFragment('' + item, document.body);
        if (!frag.childNodes.length) {
            frag.appendChild(document.createTextNode(''));
        }
        return frag;
    }
};
can.scope = can.viewModel = function (el, attr, val) {
    el = can.$(el);
    var scope = can.data(el, 'scope') || can.data(el, 'viewModel');
    if (!scope) {
        scope = new can.Map();
        can.data(el, 'scope', scope);
        can.data(el, 'viewModel', scope);
    }
    switch (arguments.length) {
    case 0:
    case 1:
        return scope;
    case 2:
        return scope.attr(attr);
    default:
        scope.attr(attr, val);
        return el;
    }
};
can['import'] = function (moduleName) {
    var deferred = new can.Deferred();
    if (typeof window.System === 'object' && can.isFunction(window.System['import'])) {
        window.System['import'](moduleName).then(can.proxy(deferred.resolve, deferred), can.proxy(deferred.reject, deferred));
    } else if (window.define && window.define.amd) {
        window.require([moduleName], function (value) {
            deferred.resolve(value);
        });
    } else if (window.steal) {
        steal.steal(moduleName, function (value) {
            deferred.resolve(value);
        });
    } else if (window.require) {
        deferred.resolve(window.require(moduleName));
    } else {
        deferred.resolve();
    }
    return deferred.promise();
};
can.__observe = function () {
};
module.exports = can;
