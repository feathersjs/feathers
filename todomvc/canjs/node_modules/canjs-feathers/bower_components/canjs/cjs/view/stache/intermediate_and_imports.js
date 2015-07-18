/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/stache/intermediate_and_imports*/
var mustacheCore = require('./mustache_core.js');
var parser = require('../parser/parser.js');
module.exports = function (source) {
    var template = mustacheCore.cleanLineEndings(source);
    var imports = [], inImport = false, inFrom = false;
    var keepToken = function () {
        return inImport ? false : true;
    };
    var intermediate = parser(template, {
            start: function (tagName, unary) {
                if (tagName === 'can-import') {
                    inImport = true;
                }
                return keepToken();
            },
            end: function (tagName, unary) {
                if (tagName === 'can-import') {
                    inImport = false;
                    return false;
                }
                return keepToken();
            },
            attrStart: function (attrName) {
                if (attrName === 'from') {
                    inFrom = true;
                }
                return keepToken();
            },
            attrEnd: function (attrName) {
                if (attrName === 'from') {
                    inFrom = false;
                }
                return keepToken();
            },
            attrValue: function (value) {
                if (inFrom && inImport) {
                    imports.push(value);
                }
                return keepToken();
            },
            chars: keepToken,
            comment: keepToken,
            special: keepToken,
            done: keepToken
        }, true);
    return {
        intermediate: intermediate,
        imports: imports
    };
};
