/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/ejs/ejs*/
var can = require('../../util/util.js');
require('../view.js');
require('../../util/string/string.js');
require('../../compute/compute.js');
require('../scanner.js');
require('../render.js');
var extend = can.extend, EJS = function (options) {
        if (this.constructor !== EJS) {
            var ejs = new EJS(options);
            return function (data, helpers) {
                return ejs.render(data, helpers);
            };
        }
        if (typeof options === 'function') {
            this.template = { fn: options };
            return;
        }
        extend(this, options);
        this.template = this.scanner.scan(this.text, this.name);
    };
can.EJS = EJS;
EJS.prototype.render = function (object, extraHelpers) {
    object = object || {};
    return this.template.fn.call(object, object, new EJS.Helpers(object, extraHelpers || {}));
};
extend(EJS.prototype, {
    scanner: new can.view.Scanner({
        text: {
            outStart: 'with(_VIEW) { with (_CONTEXT) {',
            outEnd: '}}',
            argNames: '_CONTEXT,_VIEW',
            context: 'this'
        },
        tokens: [
            [
                'templateLeft',
                '<%%'
            ],
            [
                'templateRight',
                '%>'
            ],
            [
                'returnLeft',
                '<%=='
            ],
            [
                'escapeLeft',
                '<%='
            ],
            [
                'commentLeft',
                '<%#'
            ],
            [
                'left',
                '<%'
            ],
            [
                'right',
                '%>'
            ],
            [
                'returnRight',
                '%>'
            ]
        ],
        helpers: [{
                name: /\s*\(([\$\w]+)\)\s*->([^\n]*)/,
                fn: function (content) {
                    var quickFunc = /\s*\(([\$\w]+)\)\s*->([^\n]*)/, parts = content.match(quickFunc);
                    return 'can.proxy(function(__){var ' + parts[1] + '=can.$(__);' + parts[2] + '}, this);';
                }
            }],
        transform: function (source) {
            return source.replace(/<%([\s\S]+?)%>/gm, function (whole, part) {
                var brackets = [], foundBracketPair, i;
                part.replace(/[{}]/gm, function (bracket, offset) {
                    brackets.push([
                        bracket,
                        offset
                    ]);
                });
                do {
                    foundBracketPair = false;
                    for (i = brackets.length - 2; i >= 0; i--) {
                        if (brackets[i][0] === '{' && brackets[i + 1][0] === '}') {
                            brackets.splice(i, 2);
                            foundBracketPair = true;
                            break;
                        }
                    }
                } while (foundBracketPair);
                if (brackets.length >= 2) {
                    var result = ['<%'], bracket, last = 0;
                    for (i = 0; bracket = brackets[i]; i++) {
                        result.push(part.substring(last, last = bracket[1]));
                        if (bracket[0] === '{' && i < brackets.length - 1 || bracket[0] === '}' && i > 0) {
                            result.push(bracket[0] === '{' ? '{ %><% ' : ' %><% }');
                        } else {
                            result.push(bracket[0]);
                        }
                        ++last;
                    }
                    result.push(part.substring(last), '%>');
                    return result.join('');
                } else {
                    return '<%' + part + '%>';
                }
            });
        }
    })
});
EJS.Helpers = function (data, extras) {
    this._data = data;
    this._extras = extras;
    extend(this, extras);
};
EJS.Helpers.prototype = {
    list: function (list, cb) {
        can.each(list, function (item, i) {
            cb(item, i, list);
        });
    },
    each: function (list, cb) {
        if (can.isArray(list)) {
            this.list(list, cb);
        } else {
            can.view.lists(list, cb);
        }
    }
};
can.view.register({
    suffix: 'ejs',
    script: function (id, src) {
        return 'can.EJS(function(_CONTEXT,_VIEW) { ' + new EJS({
            text: src,
            name: id
        }).template.out + ' })';
    },
    renderer: function (id, text) {
        return EJS({
            text: text,
            name: id
        });
    }
});
can.ejs.Helpers = EJS.Helpers;
module.exports = can;
