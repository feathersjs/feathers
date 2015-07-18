/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/callbacks/callbacks*/
define([
    'can/util/library',
    'can/view'
], function (can) {
    var attr = can.view.attr = function (attributeName, attrHandler) {
            if (attrHandler) {
                if (typeof attributeName === 'string') {
                    attributes[attributeName] = attrHandler;
                } else {
                    regExpAttributes.push({
                        match: attributeName,
                        handler: attrHandler
                    });
                }
            } else {
                var cb = attributes[attributeName];
                if (!cb) {
                    for (var i = 0, len = regExpAttributes.length; i < len; i++) {
                        var attrMatcher = regExpAttributes[i];
                        if (attrMatcher.match.test(attributeName)) {
                            cb = attrMatcher.handler;
                            break;
                        }
                    }
                }
                return cb;
            }
        };
    var attributes = {}, regExpAttributes = [], automaticCustomElementCharacters = /[-\:]/;
    var tag = can.view.tag = function (tagName, tagHandler) {
            if (tagHandler) {
                if (typeof tags[tagName.toLowerCase()] !== 'undefined') {
                    can.dev.warn('Custom tag: ' + tagName.toLowerCase() + ' is already defined');
                }
                if (can.global.html5) {
                    can.global.html5.elements += ' ' + tagName;
                    can.global.html5.shivDocument();
                }
                tags[tagName.toLowerCase()] = tagHandler;
            } else {
                var cb = tags[tagName.toLowerCase()];
                if (!cb && automaticCustomElementCharacters.test(tagName)) {
                    cb = function () {
                    };
                }
                return cb;
            }
        };
    var tags = {};
    can.view.callbacks = {
        _tags: tags,
        _attributes: attributes,
        _regExpAttributes: regExpAttributes,
        tag: tag,
        attr: attr,
        tagHandler: function (el, tagName, tagData) {
            var helperTagCallback = tagData.options.attr('tags.' + tagName), tagCallback = helperTagCallback || tags[tagName];
            var scope = tagData.scope, res;
            if (tagCallback) {
                var reads = can.__clearReading();
                res = tagCallback(el, tagData);
                can.__setReading(reads);
            } else {
                res = scope;
            }
            if (!tagCallback) {
                can.dev.warn('can/view/scanner.js: No custom element found for ' + tagName);
            }
            if (res && tagData.subtemplate) {
                if (scope !== res) {
                    scope = scope.add(res);
                }
                var result = tagData.subtemplate(scope, tagData.options);
                var frag = typeof result === 'string' ? can.view.frag(result) : result;
                can.appendChild(el, frag);
            }
        }
    };
    return can.view.callbacks;
});
