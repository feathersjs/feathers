/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#util/fixture/fixture*/
var can = require('../util.js');
require('../string/string.js');
require('../object/object.js');
if (!can.Object) {
    throw new Error('can.fixture depends on can.Object. Please include it before can.fixture.');
}
var getUrl = function (url) {
    if (typeof steal !== 'undefined') {
        if (steal.joinURIs) {
            var base = steal.config('baseUrl');
            var joined = steal.joinURIs(base, url);
            return joined;
        }
        if (can.isFunction(steal.config)) {
            if (steal.System) {
                return steal.joinURIs(steal.config('baseURL'), url);
            } else {
                return steal.config().root.mapJoin(url).toString();
            }
        }
        return steal.root.join(url).toString();
    }
    return (can.fixture.rootUrl || '') + url;
};
var updateSettings = function (settings, originalOptions) {
        if (!can.fixture.on || settings.fixture === false) {
            return;
        }
        var log = function () {
        };
        settings.type = settings.type || settings.method || 'GET';
        var data = overwrite(settings);
        if (!settings.fixture) {
            if (window.location.protocol === 'file:') {
                log('ajax request to ' + settings.url + ', no fixture found');
            }
            return;
        }
        if (typeof settings.fixture === 'string' && can.fixture[settings.fixture]) {
            settings.fixture = can.fixture[settings.fixture];
        }
        if (typeof settings.fixture === 'string') {
            var url = settings.fixture;
            if (/^\/\//.test(url)) {
                url = getUrl(settings.fixture.substr(2));
            }
            if (data) {
                url = can.sub(url, data);
            }
            delete settings.fixture;
            settings.url = url;
            settings.data = null;
            settings.type = 'GET';
            if (!settings.error) {
                settings.error = function (xhr, error, message) {
                    throw 'fixtures.js Error ' + error + ' ' + message;
                };
            }
        } else {
            if (settings.dataTypes) {
                settings.dataTypes.splice(0, 0, 'fixture');
            }
            if (data && originalOptions) {
                originalOptions.data = originalOptions.data || {};
                can.extend(originalOptions.data, data);
            }
        }
    }, extractResponse = function (status, statusText, responses, headers) {
        if (typeof status !== 'number') {
            headers = statusText;
            responses = status;
            statusText = 'success';
            status = 200;
        }
        if (typeof statusText !== 'string') {
            headers = responses;
            responses = statusText;
            statusText = 'success';
        }
        if (status >= 400 && status <= 599) {
            this.dataType = 'text';
        }
        return [
            status,
            statusText,
            extractResponses(this, responses),
            headers
        ];
    }, extractResponses = function (settings, responses) {
        var next = settings.dataTypes ? settings.dataTypes[0] : settings.dataType || 'json';
        if (!responses || !responses[next]) {
            var tmp = {};
            tmp[next] = responses;
            responses = tmp;
        }
        return responses;
    };
if (can.ajaxPrefilter && can.ajaxTransport) {
    can.ajaxPrefilter(updateSettings);
    can.ajaxTransport('fixture', function (s, original) {
        s.dataTypes.shift();
        var timeout, stopped = false;
        return {
            send: function (headers, callback) {
                timeout = setTimeout(function () {
                    var success = function () {
                            if (stopped === false) {
                                callback.apply(null, extractResponse.apply(s, arguments));
                            }
                        }, result = s.fixture(original, success, headers, s);
                    if (result !== undefined) {
                        callback(200, 'success', extractResponses(s, result), {});
                    }
                }, can.fixture.delay);
            },
            abort: function () {
                stopped = true;
                clearTimeout(timeout);
            }
        };
    });
} else {
    var AJAX = can.ajax;
    can.ajax = function (settings) {
        updateSettings(settings, settings);
        if (settings.fixture) {
            var timeout, deferred = new can.Deferred(), stopped = false;
            deferred.getResponseHeader = function () {
            };
            deferred.then(settings.success, settings.fail);
            deferred.abort = function () {
                clearTimeout(timeout);
                stopped = true;
                deferred.reject(deferred);
            };
            timeout = setTimeout(function () {
                var success = function () {
                        var response = extractResponse.apply(settings, arguments), status = response[0];
                        if ((status >= 200 && status < 300 || status === 304) && stopped === false) {
                            deferred.resolve(response[2][settings.dataType]);
                        } else {
                            deferred.reject(deferred, 'error', response[1]);
                        }
                    }, result = settings.fixture(settings, success, settings.headers, settings);
                if (result !== undefined) {
                    deferred.resolve(result);
                }
            }, can.fixture.delay);
            return deferred;
        } else {
            return AJAX(settings);
        }
    };
}
var overwrites = [], find = function (settings, exact) {
        for (var i = 0; i < overwrites.length; i++) {
            if ($fixture._similar(settings, overwrites[i], exact)) {
                return i;
            }
        }
        return -1;
    }, overwrite = function (settings) {
        var index = find(settings);
        if (index > -1) {
            settings.fixture = overwrites[index].fixture;
            return $fixture._getData(overwrites[index].url, settings.url);
        }
    }, getId = function (settings) {
        var id = settings.data.id;
        if (id === undefined && typeof settings.data === 'number') {
            id = settings.data;
        }
        if (id === undefined) {
            settings.url.replace(/\/(\d+)(\/|$|\.)/g, function (all, num) {
                id = num;
            });
        }
        if (id === undefined) {
            id = settings.url.replace(/\/(\w+)(\/|$|\.)/g, function (all, num) {
                if (num !== 'update') {
                    id = num;
                }
            });
        }
        if (id === undefined) {
            id = Math.round(Math.random() * 1000);
        }
        return id;
    };
var $fixture = can.fixture = function (settings, fixture) {
        if (fixture !== undefined) {
            if (typeof settings === 'string') {
                var matches = settings.match(/(GET|POST|PUT|DELETE) (.+)/i);
                if (!matches) {
                    settings = { url: settings };
                } else {
                    settings = {
                        url: matches[2],
                        type: matches[1]
                    };
                }
            }
            var index = find(settings, !!fixture);
            if (index > -1) {
                overwrites.splice(index, 1);
            }
            if (fixture == null) {
                return;
            }
            settings.fixture = fixture;
            overwrites.push(settings);
        } else {
            can.each(settings, function (fixture, url) {
                $fixture(url, fixture);
            });
        }
    };
var replacer = can.replacer;
can.extend(can.fixture, {
    _similar: function (settings, overwrite, exact) {
        if (exact) {
            return can.Object.same(settings, overwrite, { fixture: null });
        } else {
            return can.Object.subset(settings, overwrite, can.fixture._compare);
        }
    },
    _compare: {
        url: function (a, b) {
            return !!$fixture._getData(b, a);
        },
        fixture: null,
        type: 'i'
    },
    _getData: function (fixtureUrl, url) {
        var order = [], fixtureUrlAdjusted = fixtureUrl.replace('.', '\\.').replace('?', '\\?'), res = new RegExp(fixtureUrlAdjusted.replace(replacer, function (whole, part) {
                order.push(part);
                return '([^/]+)';
            }) + '$').exec(url), data = {};
        if (!res) {
            return null;
        }
        res.shift();
        can.each(order, function (name) {
            data[name] = res.shift();
        });
        return data;
    },
    store: function (count, make, filter) {
        var currentId = 0, findOne = function (id) {
                for (var i = 0; i < items.length; i++) {
                    if (id == items[i].id) {
                        return items[i];
                    }
                }
            }, methods = {}, types, items, reset;
        if (can.isArray(count) && typeof count[0] === 'string') {
            types = count;
            count = make;
            make = filter;
            filter = arguments[3];
        } else if (typeof count === 'string') {
            types = [
                count + 's',
                count
            ];
            count = make;
            make = filter;
            filter = arguments[3];
        }
        if (typeof count === 'number') {
            items = [];
            reset = function () {
                items = [];
                for (var i = 0; i < count; i++) {
                    var item = make(i, items);
                    if (!item.id) {
                        item.id = i;
                    }
                    currentId = Math.max(item.id + 1, currentId + 1) || items.length;
                    items.push(item);
                }
                if (can.isArray(types)) {
                    can.fixture['~' + types[0]] = items;
                    can.fixture['-' + types[0]] = methods.findAll;
                    can.fixture['-' + types[1]] = methods.findOne;
                    can.fixture['-' + types[1] + 'Update'] = methods.update;
                    can.fixture['-' + types[1] + 'Destroy'] = methods.destroy;
                    can.fixture['-' + types[1] + 'Create'] = methods.create;
                }
            };
        } else {
            filter = make;
            var initialItems = count;
            reset = function () {
                items = initialItems.slice(0);
            };
        }
        can.extend(methods, {
            findAll: function (request) {
                request = request || {};
                var retArr = items.slice(0);
                request.data = request.data || {};
                can.each((request.data.order || []).slice(0).reverse(), function (name) {
                    var split = name.split(' ');
                    retArr = retArr.sort(function (a, b) {
                        if (split[1].toUpperCase() !== 'ASC') {
                            if (a[split[0]] < b[split[0]]) {
                                return 1;
                            } else if (a[split[0]] === b[split[0]]) {
                                return 0;
                            } else {
                                return -1;
                            }
                        } else {
                            if (a[split[0]] < b[split[0]]) {
                                return -1;
                            } else if (a[split[0]] === b[split[0]]) {
                                return 0;
                            } else {
                                return 1;
                            }
                        }
                    });
                });
                can.each((request.data.group || []).slice(0).reverse(), function (name) {
                    var split = name.split(' ');
                    retArr = retArr.sort(function (a, b) {
                        return a[split[0]] > b[split[0]];
                    });
                });
                var offset = parseInt(request.data.offset, 10) || 0, limit = parseInt(request.data.limit, 10) || items.length - offset, i = 0;
                for (var param in request.data) {
                    i = 0;
                    if (request.data[param] !== undefined && (param.indexOf('Id') !== -1 || param.indexOf('_id') !== -1)) {
                        while (i < retArr.length) {
                            if (request.data[param] != retArr[i][param]) {
                                retArr.splice(i, 1);
                            } else {
                                i++;
                            }
                        }
                    }
                }
                if (typeof filter === 'function') {
                    i = 0;
                    while (i < retArr.length) {
                        if (!filter(retArr[i], request)) {
                            retArr.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                } else if (typeof filter === 'object') {
                    i = 0;
                    while (i < retArr.length) {
                        if (!can.Object.subset(retArr[i], request.data, filter)) {
                            retArr.splice(i, 1);
                        } else {
                            i++;
                        }
                    }
                }
                return {
                    'count': retArr.length,
                    'limit': request.data.limit,
                    'offset': request.data.offset,
                    'data': retArr.slice(offset, offset + limit)
                };
            },
            findOne: function (request, response) {
                var item = findOne(getId(request));
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                response(item);
            },
            update: function (request, response) {
                var id = getId(request), item = findOne(id);
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                can.extend(item, request.data);
                response({ id: id }, { location: request.url || '/' + getId(request) });
            },
            destroy: function (request, response) {
                var id = getId(request), item = findOne(id);
                if (typeof item === 'undefined') {
                    return response(404, 'Requested resource not found');
                }
                for (var i = 0; i < items.length; i++) {
                    if (items[i].id == id) {
                        items.splice(i, 1);
                        break;
                    }
                }
                return {};
            },
            create: function (settings, response) {
                var item = typeof make === 'function' ? make(items.length, items) : {};
                can.extend(item, settings.data);
                if (!item.id) {
                    item.id = currentId++;
                }
                items.push(item);
                response({ id: item.id }, { location: settings.url + '/' + item.id });
            }
        });
        reset();
        return can.extend({
            getId: getId,
            find: function (settings) {
                return findOne(getId(settings));
            },
            reset: reset
        }, methods);
    },
    rand: function randomize(arr, min, max) {
        if (typeof arr === 'number') {
            if (typeof min === 'number') {
                return arr + Math.floor(Math.random() * (min - arr));
            } else {
                return Math.floor(Math.random() * arr);
            }
        }
        var rand = randomize;
        if (min === undefined) {
            return rand(arr, rand(arr.length + 1));
        }
        var res = [];
        arr = arr.slice(0);
        if (!max) {
            max = min;
        }
        max = min + Math.round(rand(max - min));
        for (var i = 0; i < max; i++) {
            res.push(arr.splice(rand(arr.length), 1)[0]);
        }
        return res;
    },
    xhr: function (xhr) {
        return can.extend({}, {
            abort: can.noop,
            getAllResponseHeaders: function () {
                return '';
            },
            getResponseHeader: function () {
                return '';
            },
            open: can.noop,
            overrideMimeType: can.noop,
            readyState: 4,
            responseText: '',
            responseXML: null,
            send: can.noop,
            setRequestHeader: can.noop,
            status: 200,
            statusText: 'OK'
        }, xhr);
    },
    on: true
});
can.fixture.delay = 200;
can.fixture.rootUrl = getUrl('');
can.fixture['-handleFunction'] = function (settings) {
    if (typeof settings.fixture === 'string' && can.fixture[settings.fixture]) {
        settings.fixture = can.fixture[settings.fixture];
    }
    if (typeof settings.fixture === 'function') {
        setTimeout(function () {
            if (settings.success) {
                settings.success.apply(null, settings.fixture(settings, 'success'));
            }
            if (settings.complete) {
                settings.complete.apply(null, settings.fixture(settings, 'complete'));
            }
        }, can.fixture.delay);
        return true;
    }
    return false;
};
can.fixture.overwrites = overwrites;
can.fixture.make = can.fixture.store;
module.exports = can.fixture;
