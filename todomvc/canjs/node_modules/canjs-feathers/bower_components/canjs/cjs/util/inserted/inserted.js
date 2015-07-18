/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/inserted/inserted*/
var can = require('../can.js');
can.inserted = function (elems) {
    elems = can.makeArray(elems);
    var inDocument = false, doc = can.$(document.contains ? document : document.body), children;
    for (var i = 0, elem; (elem = elems[i]) !== undefined; i++) {
        if (!inDocument) {
            if (elem.getElementsByTagName) {
                if (can.has(doc, elem).length) {
                    inDocument = true;
                } else {
                    return;
                }
            } else {
                continue;
            }
        }
        if (inDocument && elem.getElementsByTagName) {
            children = can.makeArray(elem.getElementsByTagName('*'));
            can.trigger(elem, 'inserted', [], false);
            for (var j = 0, child; (child = children[j]) !== undefined; j++) {
                can.trigger(child, 'inserted', [], false);
            }
        }
    }
};
can.appendChild = function (el, child) {
    var children;
    if (child.nodeType === 11) {
        children = can.makeArray(child.childNodes);
    } else {
        children = [child];
    }
    el.appendChild(child);
    can.inserted(children);
};
can.insertBefore = function (el, child, ref) {
    var children;
    if (child.nodeType === 11) {
        children = can.makeArray(child.childNodes);
    } else {
        children = [child];
    }
    el.insertBefore(child, ref);
    can.inserted(children);
};
