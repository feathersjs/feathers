/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/scanner*/
var can = require('./view.js');
var elements = require('./elements.js');
var viewCallbacks = require('./callbacks/callbacks.js');
var newLine = /(\r|\n)+/g, notEndTag = /\//, clean = function (content) {
        return content.split('\\').join('\\\\').split('\n').join('\\n').split('"').join('\\"').split('\t').join('\\t');
    }, getTag = function (tagName, tokens, i) {
        if (tagName) {
            return tagName;
        } else {
            while (i < tokens.length) {
                if (tokens[i] === '<' && !notEndTag.test(tokens[i + 1])) {
                    return elements.reverseTagMap[tokens[i + 1]] || 'span';
                }
                i++;
            }
        }
        return '';
    }, bracketNum = function (content) {
        return --content.split('{').length - --content.split('}').length;
    }, myEval = function (script) {
        eval(script);
    }, attrReg = /([^\s]+)[\s]*=[\s]*$/, startTxt = 'var ___v1ew = [];', finishTxt = 'return ___v1ew.join(\'\')', put_cmd = '___v1ew.push(\n', insert_cmd = put_cmd, htmlTag = null, quote = null, beforeQuote = null, rescan = null, getAttrName = function () {
        var matches = beforeQuote.match(attrReg);
        return matches && matches[1];
    }, status = function () {
        return quote ? '\'' + getAttrName() + '\'' : htmlTag ? 1 : 0;
    }, top = function (stack) {
        return stack[stack.length - 1];
    }, Scanner;
can.view.Scanner = Scanner = function (options) {
    can.extend(this, {
        text: {},
        tokens: []
    }, options);
    this.text.options = this.text.options || '';
    this.tokenReg = [];
    this.tokenSimple = {
        '<': '<',
        '>': '>',
        '"': '"',
        '\'': '\''
    };
    this.tokenComplex = [];
    this.tokenMap = {};
    for (var i = 0, token; token = this.tokens[i]; i++) {
        if (token[2]) {
            this.tokenReg.push(token[2]);
            this.tokenComplex.push({
                abbr: token[1],
                re: new RegExp(token[2]),
                rescan: token[3]
            });
        } else {
            this.tokenReg.push(token[1]);
            this.tokenSimple[token[1]] = token[0];
        }
        this.tokenMap[token[0]] = token[1];
    }
    this.tokenReg = new RegExp('(' + this.tokenReg.slice(0).concat([
        '<',
        '>',
        '"',
        '\''
    ]).join('|') + ')', 'g');
};
Scanner.prototype = {
    helpers: [],
    scan: function (source, name) {
        var tokens = [], last = 0, simple = this.tokenSimple, complex = this.tokenComplex;
        source = source.replace(newLine, '\n');
        if (this.transform) {
            source = this.transform(source);
        }
        source.replace(this.tokenReg, function (whole, part) {
            var offset = arguments[arguments.length - 2];
            if (offset > last) {
                tokens.push(source.substring(last, offset));
            }
            if (simple[whole]) {
                tokens.push(whole);
            } else {
                for (var i = 0, token; token = complex[i]; i++) {
                    if (token.re.test(whole)) {
                        tokens.push(token.abbr);
                        if (token.rescan) {
                            tokens.push(token.rescan(part));
                        }
                        break;
                    }
                }
            }
            last = offset + part.length;
        });
        if (last < source.length) {
            tokens.push(source.substr(last));
        }
        var content = '', buff = [startTxt + (this.text.start || '')], put = function (content, bonus) {
                buff.push(put_cmd, '"', clean(content), '"' + (bonus || '') + ');');
            }, endStack = [], lastToken, startTag = null, magicInTag = false, specialStates = {
                attributeHookups: [],
                tagHookups: [],
                lastTagHookup: ''
            }, popTagHookup = function () {
                specialStates.lastTagHookup = specialStates.tagHookups.pop() + specialStates.tagHookups.length;
            }, tagName = '', tagNames = [], popTagName = false, bracketCount, specialAttribute = false, i = 0, token, tmap = this.tokenMap, attrName;
        htmlTag = quote = beforeQuote = null;
        for (; (token = tokens[i++]) !== undefined;) {
            if (startTag === null) {
                switch (token) {
                case tmap.left:
                case tmap.escapeLeft:
                case tmap.returnLeft:
                    magicInTag = htmlTag && 1;
                case tmap.commentLeft:
                    startTag = token;
                    if (content.length) {
                        put(content);
                    }
                    content = '';
                    break;
                case tmap.escapeFull:
                    magicInTag = htmlTag && 1;
                    rescan = 1;
                    startTag = tmap.escapeLeft;
                    if (content.length) {
                        put(content);
                    }
                    rescan = tokens[i++];
                    content = rescan.content || rescan;
                    if (rescan.before) {
                        put(rescan.before);
                    }
                    tokens.splice(i, 0, tmap.right);
                    break;
                case tmap.commentFull:
                    break;
                case tmap.templateLeft:
                    content += tmap.left;
                    break;
                case '<':
                    if (tokens[i].indexOf('!--') !== 0) {
                        htmlTag = 1;
                        magicInTag = 0;
                    }
                    content += token;
                    break;
                case '>':
                    htmlTag = 0;
                    var emptyElement = content.substr(content.length - 1) === '/' || content.substr(content.length - 2) === '--', attrs = '';
                    if (specialStates.attributeHookups.length) {
                        attrs = 'attrs: [\'' + specialStates.attributeHookups.join('\',\'') + '\'], ';
                        specialStates.attributeHookups = [];
                    }
                    if (tagName + specialStates.tagHookups.length !== specialStates.lastTagHookup && tagName === top(specialStates.tagHookups)) {
                        if (emptyElement) {
                            content = content.substr(0, content.length - 1);
                        }
                        buff.push(put_cmd, '"', clean(content), '"', ',can.view.pending({tagName:\'' + tagName + '\',' + attrs + 'scope: ' + (this.text.scope || 'this') + this.text.options);
                        if (emptyElement) {
                            buff.push('}));');
                            content = '/>';
                            popTagHookup();
                        } else if (tokens[i] === '<' && tokens[i + 1] === '/' + tagName) {
                            buff.push('}));');
                            content = token;
                            popTagHookup();
                        } else {
                            buff.push(',subtemplate: function(' + this.text.argNames + '){\n' + startTxt + (this.text.start || ''));
                            content = '';
                        }
                    } else if (magicInTag || !popTagName && elements.tagToContentPropMap[tagNames[tagNames.length - 1]] || attrs) {
                        var pendingPart = ',can.view.pending({' + attrs + 'scope: ' + (this.text.scope || 'this') + this.text.options + '}),"';
                        if (emptyElement) {
                            put(content.substr(0, content.length - 1), pendingPart + '/>"');
                        } else {
                            put(content, pendingPart + '>"');
                        }
                        content = '';
                        magicInTag = 0;
                    } else {
                        content += token;
                    }
                    if (emptyElement || popTagName) {
                        tagNames.pop();
                        tagName = tagNames[tagNames.length - 1];
                        popTagName = false;
                    }
                    specialStates.attributeHookups = [];
                    break;
                case '\'':
                case '"':
                    if (htmlTag) {
                        if (quote && quote === token) {
                            quote = null;
                            var attr = getAttrName();
                            if (viewCallbacks.attr(attr)) {
                                specialStates.attributeHookups.push(attr);
                            }
                            if (specialAttribute) {
                                content += token;
                                put(content);
                                buff.push(finishTxt, '}));\n');
                                content = '';
                                specialAttribute = false;
                                break;
                            }
                        } else if (quote === null) {
                            quote = token;
                            beforeQuote = lastToken;
                            attrName = getAttrName();
                            if (tagName === 'img' && attrName === 'src' || attrName === 'style') {
                                put(content.replace(attrReg, ''));
                                content = '';
                                specialAttribute = true;
                                buff.push(insert_cmd, 'can.view.txt(2,\'' + getTag(tagName, tokens, i) + '\',' + status() + ',this,function(){', startTxt);
                                put(attrName + '=' + token);
                                break;
                            }
                        }
                    }
                default:
                    if (lastToken === '<') {
                        tagName = token.substr(0, 3) === '!--' ? '!--' : token.split(/\s/)[0];
                        var isClosingTag = false, cleanedTagName;
                        if (tagName.indexOf('/') === 0) {
                            isClosingTag = true;
                            cleanedTagName = tagName.substr(1);
                        }
                        if (isClosingTag) {
                            if (top(tagNames) === cleanedTagName) {
                                tagName = cleanedTagName;
                                popTagName = true;
                            }
                            if (top(specialStates.tagHookups) === cleanedTagName) {
                                put(content.substr(0, content.length - 1));
                                buff.push(finishTxt + '}}) );');
                                content = '><';
                                popTagHookup();
                            }
                        } else {
                            if (tagName.lastIndexOf('/') === tagName.length - 1) {
                                tagName = tagName.substr(0, tagName.length - 1);
                            }
                            if (tagName !== '!--' && viewCallbacks.tag(tagName)) {
                                if (tagName === 'content' && elements.tagMap[top(tagNames)]) {
                                    token = token.replace('content', elements.tagMap[top(tagNames)]);
                                }
                                specialStates.tagHookups.push(tagName);
                            }
                            tagNames.push(tagName);
                        }
                    }
                    content += token;
                    break;
                }
            } else {
                switch (token) {
                case tmap.right:
                case tmap.returnRight:
                    switch (startTag) {
                    case tmap.left:
                        bracketCount = bracketNum(content);
                        if (bracketCount === 1) {
                            buff.push(insert_cmd, 'can.view.txt(0,\'' + getTag(tagName, tokens, i) + '\',' + status() + ',this,function(){', startTxt, content);
                            endStack.push({
                                before: '',
                                after: finishTxt + '}));\n'
                            });
                        } else {
                            last = endStack.length && bracketCount === -1 ? endStack.pop() : { after: ';' };
                            if (last.before) {
                                buff.push(last.before);
                            }
                            buff.push(content, ';', last.after);
                        }
                        break;
                    case tmap.escapeLeft:
                    case tmap.returnLeft:
                        bracketCount = bracketNum(content);
                        if (bracketCount) {
                            endStack.push({
                                before: finishTxt,
                                after: '}));\n'
                            });
                        }
                        var escaped = startTag === tmap.escapeLeft ? 1 : 0, commands = {
                                insert: insert_cmd,
                                tagName: getTag(tagName, tokens, i),
                                status: status(),
                                specialAttribute: specialAttribute
                            };
                        for (var ii = 0; ii < this.helpers.length; ii++) {
                            var helper = this.helpers[ii];
                            if (helper.name.test(content)) {
                                content = helper.fn(content, commands);
                                if (helper.name.source === /^>[\s]*\w*/.source) {
                                    escaped = 0;
                                }
                                break;
                            }
                        }
                        if (typeof content === 'object') {
                            if (content.startTxt && content.end && specialAttribute) {
                                buff.push(insert_cmd, 'can.view.toStr( ', content.content, '() ) );');
                            } else {
                                if (content.startTxt) {
                                    buff.push(insert_cmd, 'can.view.txt(\n' + (typeof status() === 'string' || (content.escaped != null ? content.escaped : escaped)) + ',\n\'' + tagName + '\',\n' + status() + ',\nthis,\n');
                                } else if (content.startOnlyTxt) {
                                    buff.push(insert_cmd, 'can.view.onlytxt(this,\n');
                                }
                                buff.push(content.content);
                                if (content.end) {
                                    buff.push('));');
                                }
                            }
                        } else if (specialAttribute) {
                            buff.push(insert_cmd, content, ');');
                        } else {
                            buff.push(insert_cmd, 'can.view.txt(\n' + (typeof status() === 'string' || escaped) + ',\n\'' + tagName + '\',\n' + status() + ',\nthis,\nfunction(){ ' + (this.text.escape || '') + 'return ', content, bracketCount ? startTxt : '}));\n');
                        }
                        if (rescan && rescan.after && rescan.after.length) {
                            put(rescan.after.length);
                            rescan = null;
                        }
                        break;
                    }
                    startTag = null;
                    content = '';
                    break;
                case tmap.templateLeft:
                    content += tmap.left;
                    break;
                default:
                    content += token;
                    break;
                }
            }
            lastToken = token;
        }
        if (content.length) {
            put(content);
        }
        buff.push(';');
        var template = buff.join(''), out = { out: (this.text.outStart || '') + template + ' ' + finishTxt + (this.text.outEnd || '') };
        myEval.call(out, 'this.fn = (function(' + this.text.argNames + '){' + out.out + '});\r\n//# sourceURL=' + name + '.js');
        return out;
    }
};
can.view.pending = function (viewData) {
    var hooks = can.view.getHooks();
    return can.view.hook(function (el) {
        can.each(hooks, function (fn) {
            fn(el);
        });
        viewData.templateType = 'legacy';
        if (viewData.tagName) {
            viewCallbacks.tagHandler(el, viewData.tagName, viewData);
        }
        can.each(viewData && viewData.attrs || [], function (attributeName) {
            viewData.attributeName = attributeName;
            var callback = viewCallbacks.attr(attributeName);
            if (callback) {
                callback(el, viewData);
            }
        });
    });
};
can.view.tag('content', function (el, tagData) {
    return tagData.scope;
});
can.view.Scanner = Scanner;
module.exports = Scanner;
