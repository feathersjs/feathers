/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#view/stache/mustache_core*/
define([
    'can/util/library',
    'can/view/utils',
    'can/view/mustache_helpers',
    'can/view/live',
    'can/elements',
    'can/view/scope',
    'can/view/node_lists'
], function (can, utils, mustacheHelpers, live, elements, Scope, nodeLists) {
    live = live || can.view.live;
    elements = elements || can.view.elements;
    Scope = Scope || can.view.Scope;
    nodeLists = nodeLists || can.view.nodeLists;
    var argumentsRegExp = /((([^'"\s]+?=)?('.*?'|".*?"))|.*?)\s/g, literalNumberStringBooleanRegExp = /^(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(?:(.+?)=(?:(?:('.*?'|".*?")|([0-9]+\.?[0-9]*|true|false|null|undefined))|(.+))))$/, mustacheLineBreakRegExp = /(?:(?:^|(\r?)\n)(\s*)(\{\{([^\}]*)\}\}\}?)([^\S\n\r]*)($|\r?\n))|(\{\{([^\}]*)\}\}\}?)/g, isLookup = function (obj) {
            return obj && typeof obj.get === 'string';
        }, getItemsFragContent = function (items, isObserveList, helperOptions, options) {
            var frag = document.createDocumentFragment();
            for (var i = 0, len = items.length; i < len; i++) {
                append(frag, helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options));
            }
            return frag;
        }, append = function (frag, content) {
            if (content) {
                frag.appendChild(typeof content === 'string' ? document.createTextNode(content) : content);
            }
        }, getItemsStringContent = function (items, isObserveList, helperOptions, options) {
            var txt = '';
            for (var i = 0, len = items.length; i < len; i++) {
                txt += helperOptions.fn(isObserveList ? items.attr('' + i) : items[i], options);
            }
            return txt;
        }, getKeyComputeData = function (key, scope, isArgument) {
            var data = scope.computeData(key, {
                    isArgument: isArgument,
                    args: [
                        scope.attr('.'),
                        scope
                    ]
                });
            can.compute.temporarilyBind(data.compute);
            return data;
        }, getKeyArgValue = function (key, scope) {
            var data = getKeyComputeData(key, scope, true);
            if (!data.compute.computeInstance.hasDependencies) {
                return data.initialValue;
            } else {
                return data.compute;
            }
        }, convertToScopes = function (helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer) {
            if (truthyRenderer) {
                helperOptions.fn = makeRendererConvertScopes(truthyRenderer, scope, options, nodeList);
            }
            if (falseyRenderer) {
                helperOptions.inverse = makeRendererConvertScopes(falseyRenderer, scope, options, nodeList);
            }
        }, makeRendererConvertScopes = function (renderer, parentScope, parentOptions, nodeList) {
            var rendererWithScope = function (ctx, opts, parentNodeList) {
                return renderer(ctx || parentScope, opts, parentNodeList);
            };
            return can.__notObserve(function (newScope, newOptions, parentNodeList) {
                if (newScope !== undefined && !(newScope instanceof can.view.Scope)) {
                    newScope = parentScope.add(newScope);
                }
                if (newOptions !== undefined && !(newOptions instanceof core.Options)) {
                    newOptions = parentOptions.add(newOptions);
                }
                var result = rendererWithScope(newScope, newOptions || parentOptions, parentNodeList || nodeList);
                return result;
            });
        };
    var core = {
            expressionData: function (expression) {
                var args = [], hashes = {}, i = 0;
                (can.trim(expression) + ' ').replace(argumentsRegExp, function (whole, arg) {
                    var m;
                    if (i && (m = arg.match(literalNumberStringBooleanRegExp))) {
                        if (m[1] || m[2]) {
                            args.push(utils.jsonParse(m[1] || m[2]));
                        } else {
                            hashes[m[3]] = m[6] ? { get: m[6] } : utils.jsonParse(m[4] || m[5]);
                        }
                    } else {
                        args.push({ get: arg });
                    }
                    i++;
                });
                return {
                    name: args.shift(),
                    args: args,
                    hash: hashes
                };
            },
            makeEvaluator: function (scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, stringOnly) {
                var args = [], hash = {}, helperOptions = {
                        fn: function () {
                        },
                        inverse: function () {
                        }
                    }, context = scope.attr('.'), name = exprData.name, helper, looksLikeAHelper = exprData.args.length || !can.isEmptyObject(exprData.hash), initialValue, helperEvaluator;
                for (var i = 0, len = exprData.args.length; i < len; i++) {
                    var arg = exprData.args[i];
                    if (arg && isLookup(arg)) {
                        args.push(getKeyArgValue(arg.get, scope, true));
                    } else {
                        args.push(arg);
                    }
                }
                for (var prop in exprData.hash) {
                    if (isLookup(exprData.hash[prop])) {
                        hash[prop] = getKeyArgValue(exprData.hash[prop].get, scope);
                    } else {
                        hash[prop] = exprData.hash[prop];
                    }
                }
                if (isLookup(name)) {
                    if (looksLikeAHelper) {
                        helper = mustacheHelpers.getHelper(name.get, options);
                        if (!helper && typeof context[name.get] === 'function') {
                            helper = { fn: context[name.get] };
                        }
                    }
                    if (!helper) {
                        var get = name.get;
                        var computeData = getKeyComputeData(name.get, scope, false), compute = computeData.compute;
                        initialValue = computeData.initialValue;
                        if (computeData.compute.computeInstance.hasDependencies) {
                            name = compute;
                        } else {
                            name = initialValue;
                        }
                        if (!looksLikeAHelper && initialValue === undefined) {
                            helper = mustacheHelpers.getHelper(get, options);
                        } else if (typeof initialValue === 'function') {
                            helper = { fn: initialValue };
                        }
                    }
                }
                if (mode === '^') {
                    var temp = truthyRenderer;
                    truthyRenderer = falseyRenderer;
                    falseyRenderer = temp;
                }
                if (helper) {
                    convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);
                    can.simpleExtend(helperOptions, {
                        context: context,
                        scope: scope,
                        contexts: scope,
                        hash: hash,
                        nodeList: nodeList,
                        exprData: exprData
                    });
                    args.push(helperOptions);
                    helperEvaluator = function () {
                        return helper.fn.apply(context, args) || '';
                    };
                    helperEvaluator.bindOnce = false;
                    return helperEvaluator;
                }
                if (!mode) {
                    if (name && name.isComputed) {
                        return name;
                    } else {
                        return function () {
                            return '' + (name != null ? name : '');
                        };
                    }
                } else if (mode === '#' || mode === '^') {
                    convertToScopes(helperOptions, scope, options, nodeList, truthyRenderer, falseyRenderer);
                    var evaluator = function () {
                        var value;
                        if (can.isFunction(name) && name.isComputed) {
                            value = name();
                        } else {
                            value = name;
                        }
                        if (utils.isArrayLike(value)) {
                            var isObserveList = utils.isObserveLike(value);
                            if (isObserveList ? value.attr('length') : value.length) {
                                return (stringOnly ? getItemsStringContent : getItemsFragContent)(value, isObserveList, helperOptions, options);
                            } else {
                                return helperOptions.inverse(scope, options);
                            }
                        } else {
                            return value ? helperOptions.fn(value || scope, options) : helperOptions.inverse(scope, options);
                        }
                    };
                    evaluator.bindOnce = false;
                    return evaluator;
                } else {
                }
            },
            makeLiveBindingPartialRenderer: function (partialName, state) {
                partialName = can.trim(partialName);
                return function (scope, options, parentSectionNodeList) {
                    var nodeList = [this];
                    nodeList.expression = '>' + partialName;
                    nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true : true);
                    var partialFrag = can.compute(function () {
                            var localPartialName = partialName;
                            var partial = options.attr('partials.' + localPartialName), res;
                            if (partial) {
                                res = partial.render ? partial.render(scope, options) : partial(scope, options);
                            } else {
                                var scopePartialName = scope.read(localPartialName, {
                                        isArgument: true,
                                        returnObserveMethods: true,
                                        proxyMethods: false
                                    }).value;
                                if (scopePartialName) {
                                    localPartialName = scopePartialName;
                                }
                                res = can.view.render(localPartialName, scope, options);
                            }
                            return can.frag(res);
                        });
                    live.html(this, partialFrag, this.parentNode, nodeList);
                };
            },
            makeStringBranchRenderer: function (mode, expression) {
                var exprData = expressionData(expression), fullExpression = mode + expression;
                return function branchRenderer(scope, options, truthyRenderer, falseyRenderer) {
                    var evaluator = scope.__cache[fullExpression];
                    if (mode || !evaluator) {
                        evaluator = makeEvaluator(scope, options, null, mode, exprData, truthyRenderer, falseyRenderer, true);
                        if (!mode) {
                            scope.__cache[fullExpression] = evaluator;
                        }
                    }
                    var res = evaluator();
                    return res == null ? '' : '' + res;
                };
            },
            makeLiveBindingBranchRenderer: function (mode, expression, state) {
                var exprData = expressionData(expression);
                return function branchRenderer(scope, options, parentSectionNodeList, truthyRenderer, falseyRenderer) {
                    var nodeList = [this];
                    nodeList.expression = expression;
                    nodeLists.register(nodeList, null, state.directlyNested ? parentSectionNodeList || true : true);
                    var evaluator = makeEvaluator(scope, options, nodeList, mode, exprData, truthyRenderer, falseyRenderer, state.tag);
                    var compute = can.compute(evaluator, null, false, evaluator.bindOnce === false ? false : true);
                    compute.bind('change', can.k);
                    var value = compute();
                    if (typeof value === 'function') {
                        var old = can.__clearReading();
                        value(this);
                        can.__setReading(old);
                    } else if (compute.computeInstance.hasDependencies) {
                        if (state.attr) {
                            live.simpleAttribute(this, state.attr, compute);
                        } else if (state.tag) {
                            live.attributes(this, compute);
                        } else if (state.text && typeof value !== 'object') {
                            live.text(this, compute, this.parentNode, nodeList);
                        } else {
                            live.html(this, compute, this.parentNode, nodeList);
                        }
                    } else {
                        if (state.attr) {
                            can.attr.set(this, state.attr, value);
                        } else if (state.tag) {
                            live.setAttributes(this, value);
                        } else if (state.text && typeof value === 'string') {
                            this.nodeValue = value;
                        } else if (value) {
                            elements.replace([this], can.frag(value));
                        }
                    }
                    compute.unbind('change', can.k);
                };
            },
            splitModeFromExpression: function (expression, state) {
                expression = can.trim(expression);
                var mode = expression.charAt(0);
                if ('#/{&^>!'.indexOf(mode) >= 0) {
                    expression = can.trim(expression.substr(1));
                } else {
                    mode = null;
                }
                if (mode === '{' && state.node) {
                    mode = null;
                }
                return {
                    mode: mode,
                    expression: expression
                };
            },
            cleanLineEndings: function (template) {
                return template.replace(mustacheLineBreakRegExp, function (whole, returnBefore, spaceBefore, special, expression, spaceAfter, returnAfter, spaceLessSpecial, spaceLessExpression, matchIndex) {
                    spaceAfter = spaceAfter || '';
                    returnBefore = returnBefore || '';
                    spaceBefore = spaceBefore || '';
                    var modeAndExpression = splitModeFromExpression(expression || spaceLessExpression, {});
                    if (spaceLessSpecial || '>{'.indexOf(modeAndExpression.mode) >= 0) {
                        return whole;
                    } else if ('^#!/'.indexOf(modeAndExpression.mode) >= 0) {
                        return special + (matchIndex !== 0 && returnAfter.length ? returnBefore + '\n' : '');
                    } else {
                        return spaceBefore + special + spaceAfter + (spaceBefore.length || matchIndex !== 0 ? returnBefore + '\n' : '');
                    }
                });
            },
            Options: can.view.Scope.extend({
                init: function (data, parent) {
                    if (!data.helpers && !data.partials && !data.tags) {
                        data = { helpers: data };
                    }
                    can.view.Scope.prototype.init.apply(this, arguments);
                }
            })
        };
    var makeEvaluator = core.makeEvaluator, expressionData = core.expressionData, splitModeFromExpression = core.splitModeFromExpression;
    return core;
});
