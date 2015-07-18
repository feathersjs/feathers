/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#model/model*/
define([
    'can/util/library',
    'can/map',
    'can/list'
], function (can) {
    var pipe = function (def, thisArg, func) {
            var d = new can.Deferred();
            def.then(function () {
                var args = can.makeArray(arguments), success = true;
                try {
                    args[0] = func.apply(thisArg, args);
                } catch (e) {
                    success = false;
                    d.rejectWith(d, [e].concat(args));
                }
                if (success) {
                    d.resolveWith(d, args);
                }
            }, function () {
                d.rejectWith(this, arguments);
            });
            if (typeof def.abort === 'function') {
                d.abort = function () {
                    return def.abort();
                };
            }
            return d;
        }, modelNum = 0, getId = function (inst) {
            can.__observe(inst, inst.constructor.id);
            return inst.__get(inst.constructor.id);
        }, ajax = function (ajaxOb, data, type, dataType, success, error) {
            var params = {};
            if (typeof ajaxOb === 'string') {
                var parts = ajaxOb.split(/\s+/);
                params.url = parts.pop();
                if (parts.length) {
                    params.type = parts.pop();
                }
            } else {
                can.extend(params, ajaxOb);
            }
            params.data = typeof data === 'object' && !can.isArray(data) ? can.extend(params.data || {}, data) : data;
            params.url = can.sub(params.url, params.data, true);
            return can.ajax(can.extend({
                type: type || 'post',
                dataType: dataType || 'json',
                success: success,
                error: error
            }, params));
        }, makeRequest = function (modelObj, type, success, error, method) {
            var args;
            if (can.isArray(modelObj)) {
                args = modelObj[1];
                modelObj = modelObj[0];
            } else {
                args = modelObj.serialize();
            }
            args = [args];
            var deferred, model = modelObj.constructor, jqXHR;
            if (type === 'update' || type === 'destroy') {
                args.unshift(getId(modelObj));
            }
            jqXHR = model[type].apply(model, args);
            deferred = pipe(jqXHR, modelObj, function (data) {
                modelObj[method || type + 'd'](data, jqXHR);
                return modelObj;
            });
            if (jqXHR.abort) {
                deferred.abort = function () {
                    jqXHR.abort();
                };
            }
            deferred.then(success, error);
            return deferred;
        }, converters = {
            models: function (instancesRawData, oldList, xhr) {
                can.Model._reqs++;
                if (!instancesRawData) {
                    return;
                }
                if (instancesRawData instanceof this.List) {
                    return instancesRawData;
                }
                var self = this, tmp = [], ListClass = self.List || ML, modelList = oldList instanceof can.List ? oldList : new ListClass(), rawDataIsList = instancesRawData instanceof ML, raw = rawDataIsList ? instancesRawData.serialize() : instancesRawData;
                raw = self.parseModels(raw, xhr);
                if (raw.data) {
                    instancesRawData = raw;
                    raw = raw.data;
                }
                if (typeof raw === 'undefined' || !can.isArray(raw)) {
                    throw new Error('Could not get any raw data while converting using .models');
                }
                if (!raw.length) {
                    can.dev.warn('model.js models has no data.');
                }
                if (modelList.length) {
                    modelList.splice(0);
                }
                can.each(raw, function (rawPart) {
                    tmp.push(self.model(rawPart, xhr));
                });
                modelList.push.apply(modelList, tmp);
                if (!can.isArray(instancesRawData)) {
                    can.each(instancesRawData, function (val, prop) {
                        if (prop !== 'data') {
                            modelList.attr(prop, val);
                        }
                    });
                }
                setTimeout(can.proxy(this._clean, this), 1);
                return modelList;
            },
            model: function (attributes, oldModel, xhr) {
                if (!attributes) {
                    return;
                }
                if (typeof attributes.serialize === 'function') {
                    attributes = attributes.serialize();
                } else {
                    attributes = this.parseModel(attributes, xhr);
                }
                var id = attributes[this.id];
                if ((id || id === 0) && this.store[id]) {
                    oldModel = this.store[id];
                }
                var model = oldModel && can.isFunction(oldModel.attr) ? oldModel.attr(attributes, this.removeAttr || false) : new this(attributes);
                return model;
            }
        }, makeParser = {
            parseModel: function (prop) {
                return function (attributes) {
                    return prop ? can.getObject(prop, attributes) : attributes;
                };
            },
            parseModels: function (prop) {
                return function (attributes) {
                    if (can.isArray(attributes)) {
                        return attributes;
                    }
                    prop = prop || 'data';
                    var result = can.getObject(prop, attributes);
                    if (!can.isArray(result)) {
                        throw new Error('Could not get any raw data while converting using .models');
                    }
                    return result;
                };
            }
        }, ajaxMethods = {
            create: {
                url: '_shortName',
                type: 'post'
            },
            update: {
                data: function (id, attrs) {
                    attrs = attrs || {};
                    var identity = this.id;
                    if (attrs[identity] && attrs[identity] !== id) {
                        attrs['new' + can.capitalize(id)] = attrs[identity];
                        delete attrs[identity];
                    }
                    attrs[identity] = id;
                    return attrs;
                },
                type: 'put'
            },
            destroy: {
                type: 'delete',
                data: function (id, attrs) {
                    attrs = attrs || {};
                    attrs.id = attrs[this.id] = id;
                    return attrs;
                }
            },
            findAll: { url: '_shortName' },
            findOne: {}
        }, ajaxMaker = function (ajaxMethod, str) {
            return function (data) {
                data = ajaxMethod.data ? ajaxMethod.data.apply(this, arguments) : data;
                return ajax(str || this[ajaxMethod.url || '_url'], data, ajaxMethod.type || 'get');
            };
        }, createURLFromResource = function (model, name) {
            if (!model.resource) {
                return;
            }
            var resource = model.resource.replace(/\/+$/, '');
            if (name === 'findAll' || name === 'create') {
                return resource;
            } else {
                return resource + '/{' + model.id + '}';
            }
        };
    can.Model = can.Map.extend({
        fullName: 'can.Model',
        _reqs: 0,
        setup: function (base, fullName, staticProps, protoProps) {
            if (typeof fullName !== 'string') {
                protoProps = staticProps;
                staticProps = fullName;
            }
            if (!protoProps) {
                can.dev.warn('can/model/model.js: can.Model extended without static properties.');
                protoProps = staticProps;
            }
            this.store = {};
            can.Map.setup.apply(this, arguments);
            if (!can.Model) {
                return;
            }
            if (staticProps && staticProps.List) {
                this.List = staticProps.List;
                this.List.Map = this;
            } else {
                this.List = base.List.extend({ Map: this }, {});
            }
            var self = this, clean = can.proxy(this._clean, self);
            can.each(ajaxMethods, function (method, name) {
                if (staticProps && staticProps[name] && (typeof staticProps[name] === 'string' || typeof staticProps[name] === 'object')) {
                    self[name] = ajaxMaker(method, staticProps[name]);
                } else if (staticProps && staticProps.resource && !can.isFunction(staticProps[name])) {
                    self[name] = ajaxMaker(method, createURLFromResource(self, name));
                }
                if (self['make' + can.capitalize(name)]) {
                    var newMethod = self['make' + can.capitalize(name)](self[name]);
                    can.Construct._overwrite(self, base, name, function () {
                        can.Model._reqs++;
                        var def = newMethod.apply(this, arguments);
                        var then = def.then(clean, clean);
                        then.abort = def.abort;
                        return then;
                    });
                }
            });
            var hasCustomConverter = {};
            can.each(converters, function (converter, name) {
                var parseName = 'parse' + can.capitalize(name), dataProperty = staticProps && staticProps[name] || self[name];
                if (typeof dataProperty === 'string') {
                    self[parseName] = dataProperty;
                    can.Construct._overwrite(self, base, name, converter);
                } else if (staticProps && staticProps[name]) {
                    hasCustomConverter[parseName] = true;
                }
            });
            can.each(makeParser, function (maker, parseName) {
                var prop = staticProps && staticProps[parseName] || self[parseName];
                if (typeof prop === 'string') {
                    can.Construct._overwrite(self, base, parseName, maker(prop));
                } else if ((!staticProps || !can.isFunction(staticProps[parseName])) && !self[parseName]) {
                    var madeParser = maker();
                    madeParser.useModelConverter = hasCustomConverter[parseName];
                    can.Construct._overwrite(self, base, parseName, madeParser);
                }
            });
            if (self.fullName === 'can.Model' || !self.fullName) {
                self.fullName = 'Model' + ++modelNum;
            }
            can.Model._reqs = 0;
            this._url = this._shortName + '/{' + this.id + '}';
        },
        _ajax: ajaxMaker,
        _makeRequest: makeRequest,
        _clean: function () {
            can.Model._reqs--;
            if (!can.Model._reqs) {
                for (var id in this.store) {
                    if (!this.store[id]._bindings) {
                        delete this.store[id];
                    }
                }
            }
            return arguments[0];
        },
        models: converters.models,
        model: converters.model
    }, {
        setup: function (attrs) {
            var id = attrs && attrs[this.constructor.id];
            if (can.Model._reqs && id != null) {
                this.constructor.store[id] = this;
            }
            can.Map.prototype.setup.apply(this, arguments);
        },
        isNew: function () {
            var id = getId(this);
            return !(id || id === 0);
        },
        save: function (success, error) {
            return makeRequest(this, this.isNew() ? 'create' : 'update', success, error);
        },
        destroy: function (success, error) {
            if (this.isNew()) {
                var self = this;
                var def = can.Deferred();
                def.then(success, error);
                return def.done(function (data) {
                    self.destroyed(data);
                }).resolve(self);
            }
            return makeRequest(this, 'destroy', success, error, 'destroyed');
        },
        _bindsetup: function () {
            var modelInstance = this.__get(this.constructor.id);
            if (modelInstance != null) {
                this.constructor.store[modelInstance] = this;
            }
            return can.Map.prototype._bindsetup.apply(this, arguments);
        },
        _bindteardown: function () {
            delete this.constructor.store[getId(this)];
            return can.Map.prototype._bindteardown.apply(this, arguments);
        },
        ___set: function (prop, val) {
            can.Map.prototype.___set.call(this, prop, val);
            if (prop === this.constructor.id && this._bindings) {
                this.constructor.store[getId(this)] = this;
            }
        }
    });
    var makeGetterHandler = function (name) {
            return function (data, readyState, xhr) {
                return this[name](data, null, xhr);
            };
        }, createUpdateDestroyHandler = function (data) {
            if (this.parseModel.useModelConverter) {
                return this.model(data);
            }
            return this.parseModel(data);
        };
    var responseHandlers = {
            makeFindAll: makeGetterHandler('models'),
            makeFindOne: makeGetterHandler('model'),
            makeCreate: createUpdateDestroyHandler,
            makeUpdate: createUpdateDestroyHandler,
            makeDestroy: createUpdateDestroyHandler
        };
    can.each(responseHandlers, function (method, name) {
        can.Model[name] = function (oldMethod) {
            return function () {
                var args = can.makeArray(arguments), oldArgs = can.isFunction(args[1]) ? args.splice(0, 1) : args.splice(0, 2), def = pipe(oldMethod.apply(this, oldArgs), this, method);
                def.then(args[0], args[1]);
                return def;
            };
        };
    });
    can.each([
        'created',
        'updated',
        'destroyed'
    ], function (funcName) {
        can.Model.prototype[funcName] = function (attrs) {
            var self = this, constructor = self.constructor;
            if (attrs && typeof attrs === 'object') {
                this.attr(can.isFunction(attrs.attr) ? attrs.attr() : attrs);
            }
            can.dispatch.call(this, {
                type: 'change',
                target: this
            }, [funcName]);
            can.dev.log('Model.js - ' + constructor.shortName + ' ' + funcName);
            can.dispatch.call(constructor, funcName, [this]);
        };
    });
    var ML = can.Model.List = can.List.extend({
            _bubbleRule: function (eventName, list) {
                var bubbleRules = can.List._bubbleRule(eventName, list);
                bubbleRules.push('destroyed');
                return bubbleRules;
            }
        }, {
            setup: function (params) {
                if (can.isPlainObject(params) && !can.isArray(params)) {
                    can.List.prototype.setup.apply(this);
                    this.replace(can.isDeferred(params) ? params : this.constructor.Map.findAll(params));
                } else {
                    can.List.prototype.setup.apply(this, arguments);
                }
                this._init = 1;
                this.bind('destroyed', can.proxy(this._destroyed, this));
                delete this._init;
            },
            _destroyed: function (ev, attr) {
                if (/\w+/.test(attr)) {
                    var index;
                    while ((index = this.indexOf(ev.target)) > -1) {
                        this.splice(index, 1);
                    }
                }
            }
        });
    return can.Model;
});
