/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/render*/
var can = require('./view.js');
var elements = require('./elements.js');
var live = require('./live/live.js');
require('../util/string/string.js');
var pendingHookups = [], tagChildren = function (tagName) {
        var newTag = elements.tagMap[tagName] || 'span';
        if (newTag === 'span') {
            return '@@!!@@';
        }
        return '<' + newTag + '>' + tagChildren(newTag) + '</' + newTag + '>';
    }, contentText = function (input, tag) {
        if (typeof input === 'string') {
            return input;
        }
        if (!input && input !== 0) {
            return '';
        }
        var hook = input.hookup && function (el, id) {
                input.hookup.call(input, el, id);
            } || typeof input === 'function' && input;
        if (hook) {
            if (tag) {
                return '<' + tag + ' ' + can.view.hook(hook) + '></' + tag + '>';
            } else {
                pendingHookups.push(hook);
            }
            return '';
        }
        return '' + input;
    }, contentEscape = function (txt, tag) {
        return typeof txt === 'string' || typeof txt === 'number' ? can.esc(txt) : contentText(txt, tag);
    }, withinTemplatedSectionWithinAnElement = false, emptyHandler = function () {
    };
var lastHookups;
can.extend(can.view, {
    live: live,
    setupLists: function () {
        var old = can.view.lists, data;
        can.view.lists = function (list, renderer) {
            data = {
                list: list,
                renderer: renderer
            };
            return Math.random();
        };
        return function () {
            can.view.lists = old;
            return data;
        };
    },
    getHooks: function () {
        var hooks = pendingHookups.slice(0);
        lastHookups = hooks;
        pendingHookups = [];
        return hooks;
    },
    onlytxt: function (self, func) {
        return contentEscape(func.call(self));
    },
    txt: function (escape, tagName, status, self, func) {
        var tag = elements.tagMap[tagName] || 'span', setupLiveBinding = false, value, listData, compute, unbind = emptyHandler, attributeName;
        if (withinTemplatedSectionWithinAnElement) {
            value = func.call(self);
        } else {
            if (typeof status === 'string' || status === 1) {
                withinTemplatedSectionWithinAnElement = true;
            }
            var listTeardown = can.view.setupLists();
            unbind = function () {
                compute.unbind('change', emptyHandler);
            };
            compute = can.compute(func, self, false);
            compute.bind('change', emptyHandler);
            listData = listTeardown();
            value = compute();
            withinTemplatedSectionWithinAnElement = false;
            setupLiveBinding = compute.computeInstance.hasDependencies;
        }
        if (listData) {
            unbind();
            return '<' + tag + can.view.hook(function (el, parentNode) {
                live.list(el, listData.list, listData.renderer, self, parentNode);
            }) + '></' + tag + '>';
        }
        if (!setupLiveBinding || typeof value === 'function') {
            unbind();
            return (withinTemplatedSectionWithinAnElement || escape === 2 || !escape ? contentText : contentEscape)(value, status === 0 && tag);
        }
        var contentProp = elements.tagToContentPropMap[tagName];
        if (status === 0 && !contentProp) {
            return '<' + tag + can.view.hook(escape && typeof value !== 'object' ? function (el, parentNode) {
                live.text(el, compute, parentNode);
                unbind();
            } : function (el, parentNode) {
                live.html(el, compute, parentNode);
                unbind();
            }) + '>' + tagChildren(tag) + '</' + tag + '>';
        } else if (status === 1) {
            pendingHookups.push(function (el) {
                live.attributes(el, compute, compute());
                unbind();
            });
            return compute();
        } else if (escape === 2) {
            attributeName = status;
            pendingHookups.push(function (el) {
                live.specialAttribute(el, attributeName, compute);
                unbind();
            });
            return compute();
        } else {
            attributeName = status === 0 ? contentProp : status;
            (status === 0 ? lastHookups : pendingHookups).push(function (el) {
                live.attribute(el, attributeName, compute);
                unbind();
            });
            return live.attributePlaceholder;
        }
    }
});
module.exports = can;
