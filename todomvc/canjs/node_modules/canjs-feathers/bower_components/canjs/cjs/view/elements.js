/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/elements*/
var can = require('../util/util.js');
require('./view.js');
var doc = typeof document !== 'undefined' ? document : null;
var selectsCommentNodes = doc && function () {
        return can.$(document.createComment('~')).length === 1;
    }();
var elements = {
        tagToContentPropMap: {
            option: doc && 'textContent' in document.createElement('option') ? 'textContent' : 'innerText',
            textarea: 'value'
        },
        attrMap: can.attr.map,
        attrReg: /([^\s=]+)[\s]*=[\s]*/,
        defaultValue: can.attr.defaultValue,
        tagMap: {
            '': 'span',
            colgroup: 'col',
            table: 'tbody',
            tr: 'td',
            ol: 'li',
            ul: 'li',
            tbody: 'tr',
            thead: 'tr',
            tfoot: 'tr',
            select: 'option',
            optgroup: 'option'
        },
        reverseTagMap: {
            col: 'colgroup',
            tr: 'tbody',
            option: 'select',
            td: 'tr',
            th: 'tr',
            li: 'ul'
        },
        getParentNode: function (el, defaultParentNode) {
            return defaultParentNode && el.parentNode.nodeType === 11 ? defaultParentNode : el.parentNode;
        },
        setAttr: can.attr.set,
        getAttr: can.attr.get,
        removeAttr: can.attr.remove,
        contentText: function (text) {
            if (typeof text === 'string') {
                return text;
            }
            if (!text && text !== 0) {
                return '';
            }
            return '' + text;
        },
        after: function (oldElements, newFrag) {
            var last = oldElements[oldElements.length - 1];
            if (last.nextSibling) {
                can.insertBefore(last.parentNode, newFrag, last.nextSibling);
            } else {
                can.appendChild(last.parentNode, newFrag);
            }
        },
        replace: function (oldElements, newFrag) {
            elements.after(oldElements, newFrag);
            if (can.remove(can.$(oldElements)).length < oldElements.length && !selectsCommentNodes) {
                can.each(oldElements, function (el) {
                    if (el.nodeType === 8) {
                        el.parentNode.removeChild(el);
                    }
                });
            }
        }
    };
can.view.elements = elements;
module.exports = elements;
