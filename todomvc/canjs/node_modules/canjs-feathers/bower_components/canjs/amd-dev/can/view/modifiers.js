/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/modifiers/modifiers*/
define([
    'jquery',
    'can/util/library',
    'can/view'
], function ($, can) {
    $ = $ || window.$;
    var convert, modify, isTemplate, isHTML, isDOM, getCallback, noHookup = {
            'val': true,
            'text': true
        };
    convert = function (func_name) {
        var old = $.fn[func_name];
        $.fn[func_name] = function () {
            var args = can.makeArray(arguments), callbackNum, callback, self = this, result;
            if (can.isDeferred(args[0])) {
                args[0].done(function (res) {
                    modify.call(self, [res], old);
                });
                return this;
            } else if (isTemplate(args)) {
                if (callbackNum = getCallback(args)) {
                    callback = args[callbackNum];
                    args[callbackNum] = function (result) {
                        modify.call(self, [result], old);
                        callback.call(self, result);
                    };
                    can.view.apply(can.view, args);
                    return this;
                }
                result = can.view.apply(can.view, args);
                if (!can.isDeferred(result)) {
                    args = [result];
                } else {
                    result.done(function (res) {
                        modify.call(self, [res], old);
                    });
                    return this;
                }
            }
            return noHookup[func_name] ? old.apply(this, args) : modify.call(this, args, old);
        };
    };
    modify = function (args, old) {
        var res;
        for (var hasHookups in can.view.hookups) {
            break;
        }
        if (hasHookups && args[0] && isHTML(args[0])) {
            args[0] = can.view.frag(args[0]).childNodes;
        }
        res = old.apply(this, args);
        return res;
    };
    isTemplate = function (args) {
        var secArgType = typeof args[1];
        return typeof args[0] === 'string' && (secArgType === 'object' || secArgType === 'function') && !isDOM(args[1]);
    };
    isDOM = function (arg) {
        return arg.nodeType || arg[0] && arg[0].nodeType;
    };
    isHTML = function (arg) {
        if (isDOM(arg)) {
            return true;
        } else if (typeof arg === 'string') {
            arg = can.trim(arg);
            return arg.substr(0, 1) === '<' && arg.substr(arg.length - 1, 1) === '>' && arg.length >= 3;
        } else {
            return false;
        }
    };
    getCallback = function (args) {
        return typeof args[3] === 'function' ? 3 : typeof args[2] === 'function' && 2;
    };
    $.fn.hookup = function () {
        can.view.frag(this);
        return this;
    };
    can.each([
        'prepend',
        'append',
        'after',
        'before',
        'text',
        'html',
        'replaceWith',
        'val'
    ], function (func) {
        convert(func);
    });
    return can;
});
