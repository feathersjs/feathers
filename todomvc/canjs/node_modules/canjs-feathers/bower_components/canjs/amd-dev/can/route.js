/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#route/route*/
define([
    'can/util/library',
    'can/map',
    'can/list',
    'can/util/string/deparam'
], function (can) {
    var matcher = /\:([\w\.]+)/g, paramsMatcher = /^(?:&[^=]+=[^&]*)+/, makeProps = function (props) {
            var tags = [];
            can.each(props, function (val, name) {
                tags.push((name === 'className' ? 'class' : name) + '="' + (name === 'href' ? val : can.esc(val)) + '"');
            });
            return tags.join(' ');
        }, matchesData = function (route, data) {
            var count = 0, i = 0, defaults = {};
            for (var name in route.defaults) {
                if (route.defaults[name] === data[name]) {
                    defaults[name] = 1;
                    count++;
                }
            }
            for (; i < route.names.length; i++) {
                if (!data.hasOwnProperty(route.names[i])) {
                    return -1;
                }
                if (!defaults[route.names[i]]) {
                    count++;
                }
            }
            return count;
        }, location = window.location, wrapQuote = function (str) {
            return (str + '').replace(/([.?*+\^$\[\]\\(){}|\-])/g, '\\$1');
        }, each = can.each, extend = can.extend, stringify = function (obj) {
            if (obj && typeof obj === 'object') {
                if (obj instanceof can.Map) {
                    obj = obj.attr();
                } else {
                    obj = can.isFunction(obj.slice) ? obj.slice() : can.extend({}, obj);
                }
                can.each(obj, function (val, prop) {
                    obj[prop] = stringify(val);
                });
            } else if (obj !== undefined && obj !== null && can.isFunction(obj.toString)) {
                obj = obj.toString();
            }
            return obj;
        }, removeBackslash = function (str) {
            return str.replace(/\\/g, '');
        }, timer, curParams, lastHash, changingData, changedAttrs = [], onRouteDataChange = function (ev, attr, how, newval) {
            changingData = 1;
            changedAttrs.push(attr);
            clearTimeout(timer);
            timer = setTimeout(function () {
                changingData = 0;
                var serialized = can.route.data.serialize(), path = can.route.param(serialized, true);
                can.route._call('setURL', path, changedAttrs);
                can.batch.trigger(eventsObject, '__url', [
                    path,
                    lastHash
                ]);
                lastHash = path;
                changedAttrs = [];
            }, 10);
        }, eventsObject = can.extend({}, can.event);
    can.route = function (url, defaults) {
        var root = can.route._call('root');
        if (root.lastIndexOf('/') === root.length - 1 && url.indexOf('/') === 0) {
            url = url.substr(1);
        }
        defaults = defaults || {};
        var names = [], res, test = '', lastIndex = matcher.lastIndex = 0, next, querySeparator = can.route._call('querySeparator'), matchSlashes = can.route._call('matchSlashes');
        while (res = matcher.exec(url)) {
            names.push(res[1]);
            test += removeBackslash(url.substring(lastIndex, matcher.lastIndex - res[0].length));
            next = '\\' + (removeBackslash(url.substr(matcher.lastIndex, 1)) || querySeparator + (matchSlashes ? '' : '|/'));
            test += '([^' + next + ']' + (defaults[res[1]] ? '*' : '+') + ')';
            lastIndex = matcher.lastIndex;
        }
        test += url.substr(lastIndex).replace('\\', '');
        can.route.routes[url] = {
            test: new RegExp('^' + test + '($|' + wrapQuote(querySeparator) + ')'),
            route: url,
            names: names,
            defaults: defaults,
            length: url.split('/').length
        };
        return can.route;
    };
    extend(can.route, {
        param: function (data, _setRoute) {
            var route, matches = 0, matchCount, routeName = data.route, propCount = 0;
            delete data.route;
            each(data, function () {
                propCount++;
            });
            each(can.route.routes, function (temp, name) {
                matchCount = matchesData(temp, data);
                if (matchCount > matches) {
                    route = temp;
                    matches = matchCount;
                }
                if (matchCount >= propCount) {
                    return false;
                }
            });
            if (can.route.routes[routeName] && matchesData(can.route.routes[routeName], data) === matches) {
                route = can.route.routes[routeName];
            }
            if (route) {
                var cpy = extend({}, data), res = route.route.replace(matcher, function (whole, name) {
                        delete cpy[name];
                        return data[name] === route.defaults[name] ? '' : encodeURIComponent(data[name]);
                    }).replace('\\', ''), after;
                each(route.defaults, function (val, name) {
                    if (cpy[name] === val) {
                        delete cpy[name];
                    }
                });
                after = can.param(cpy);
                if (_setRoute) {
                    can.route.attr('route', route.route);
                }
                return res + (after ? can.route._call('querySeparator') + after : '');
            }
            return can.isEmptyObject(data) ? '' : can.route._call('querySeparator') + can.param(data);
        },
        deparam: function (url) {
            var root = can.route._call('root');
            if (root.lastIndexOf('/') === root.length - 1 && url.indexOf('/') === 0) {
                url = url.substr(1);
            }
            var route = { length: -1 }, querySeparator = can.route._call('querySeparator'), paramsMatcher = can.route._call('paramsMatcher');
            each(can.route.routes, function (temp, name) {
                if (temp.test.test(url) && temp.length > route.length) {
                    route = temp;
                }
            });
            if (route.length > -1) {
                var parts = url.match(route.test), start = parts.shift(), remainder = url.substr(start.length - (parts[parts.length - 1] === querySeparator ? 1 : 0)), obj = remainder && paramsMatcher.test(remainder) ? can.deparam(remainder.slice(1)) : {};
                obj = extend(true, {}, route.defaults, obj);
                each(parts, function (part, i) {
                    if (part && part !== querySeparator) {
                        obj[route.names[i]] = decodeURIComponent(part);
                    }
                });
                obj.route = route.route;
                return obj;
            }
            if (url.charAt(0) !== querySeparator) {
                url = querySeparator + url;
            }
            return paramsMatcher.test(url) ? can.deparam(url.slice(1)) : {};
        },
        data: new can.Map({}),
        map: function (data) {
            var appState;
            if (data.prototype instanceof can.Map) {
                appState = new data();
            } else {
                appState = data;
            }
            can.route.data = appState;
        },
        routes: {},
        ready: function (val) {
            if (val !== true) {
                can.route._setup();
                can.route.setState();
            }
            return can.route;
        },
        url: function (options, merge) {
            if (merge) {
                options = can.extend({}, can.route.deparam(can.route._call('matchingPartOfURL')), options);
            }
            return can.route._call('root') + can.route.param(options);
        },
        link: function (name, options, props, merge) {
            return '<a ' + makeProps(extend({ href: can.route.url(options, merge) }, props)) + '>' + name + '</a>';
        },
        current: function (options) {
            can.__observe(eventsObject, '__url');
            return this._call('matchingPartOfURL') === can.route.param(options);
        },
        bindings: {
            hashchange: {
                paramsMatcher: paramsMatcher,
                querySeparator: '&',
                matchSlashes: false,
                bind: function () {
                    can.bind.call(window, 'hashchange', setState);
                },
                unbind: function () {
                    can.unbind.call(window, 'hashchange', setState);
                },
                matchingPartOfURL: function () {
                    return location.href.split(/#!?/)[1] || '';
                },
                setURL: function (path) {
                    if (location.hash !== '#' + path) {
                        location.hash = '!' + path;
                    }
                    return path;
                },
                root: '#!'
            }
        },
        defaultBinding: 'hashchange',
        currentBinding: null,
        _setup: function () {
            if (!can.route.currentBinding) {
                can.route._call('bind');
                can.route.bind('change', onRouteDataChange);
                can.route.currentBinding = can.route.defaultBinding;
            }
        },
        _teardown: function () {
            if (can.route.currentBinding) {
                can.route._call('unbind');
                can.route.unbind('change', onRouteDataChange);
                can.route.currentBinding = null;
            }
            clearTimeout(timer);
            changingData = 0;
        },
        _call: function () {
            var args = can.makeArray(arguments), prop = args.shift(), binding = can.route.bindings[can.route.currentBinding || can.route.defaultBinding], method = binding[prop];
            if (method.apply) {
                return method.apply(binding, args);
            } else {
                return method;
            }
        }
    });
    each([
        'bind',
        'unbind',
        'on',
        'off',
        'delegate',
        'undelegate',
        'removeAttr',
        'compute',
        '_get',
        '__get',
        'each'
    ], function (name) {
        can.route[name] = function () {
            if (!can.route.data[name]) {
                return;
            }
            return can.route.data[name].apply(can.route.data, arguments);
        };
    });
    can.route.attr = function (attr, val) {
        var type = typeof attr, newArguments;
        if (val === undefined) {
            newArguments = arguments;
        } else if (type !== 'string' && type !== 'number') {
            newArguments = [
                stringify(attr),
                val
            ];
        } else {
            newArguments = [
                attr,
                stringify(val)
            ];
        }
        return can.route.data.attr.apply(can.route.data, newArguments);
    };
    var setState = can.route.setState = function () {
            var hash = can.route._call('matchingPartOfURL');
            var oldParams = curParams;
            curParams = can.route.deparam(hash);
            if (!changingData || hash !== lastHash) {
                can.batch.start();
                recursiveClean(oldParams, curParams, can.route.data);
                can.route.attr(curParams);
                can.batch.trigger(eventsObject, '__url', [
                    hash,
                    lastHash
                ]);
                can.batch.stop();
            }
        };
    var recursiveClean = function (old, cur, data) {
        for (var attr in old) {
            if (cur[attr] === undefined) {
                data.removeAttr(attr);
            } else if (Object.prototype.toString.call(old[attr]) === '[object Object]') {
                recursiveClean(old[attr], cur[attr], data.attr(attr));
            }
        }
    };
    return can.route;
});
