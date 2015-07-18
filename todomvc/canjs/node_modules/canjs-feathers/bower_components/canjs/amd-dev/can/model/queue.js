/*!
 * CanJS - 2.2.6
 * http://canjs.com/
 * Copyright (c) 2015 Bitovi
 * Wed, 20 May 2015 23:00:01 GMT
 * Licensed MIT
 */

/*can@2.2.6#model/queue/queue*/
define([
    'can/util/library',
    'can/model',
    'can/map/backup'
], function (can) {
    var cleanAttrs = function (changedAttrs, attrs) {
            var newAttrs = can.extend(true, {}, attrs), current, path;
            if (changedAttrs) {
                for (var i = 0; i < changedAttrs.length; i++) {
                    current = newAttrs;
                    path = changedAttrs[i].split('.');
                    while (path.length > 1) {
                        current = current && current[path.shift()];
                    }
                    if (current) {
                        delete current[path.shift()];
                    }
                }
            }
            return newAttrs;
        }, queueRequests = function (success, error, method, callback) {
            this._changedAttrs = this._changedAttrs || [];
            var def = new can.Deferred(), self = this, attrs = this.serialize(), queue = this._requestQueue, changedAttrs = this._changedAttrs, reqFn, index;
            reqFn = function (self, type, success, error) {
                return function () {
                    return self.constructor._makeRequest([
                        self,
                        attrs
                    ], type || (self.isNew() ? 'create' : 'update'), success, error, callback);
                };
            }(this, method, function () {
                def.resolveWith(self, arguments);
                queue.splice(0, 1);
                if (queue.length > 0) {
                    queue[0] = queue[0]();
                } else {
                    changedAttrs.splice(0);
                }
            }, function () {
                def.rejectWith(self, arguments);
                queue.splice(0);
                changedAttrs.splice(0);
            });
            index = queue.push(reqFn) - 1;
            if (queue.length === 1) {
                queue[0] = queue[0]();
            }
            def.abort = function () {
                var abort;
                abort = queue[index].abort && queue[index].abort();
                queue.splice(index);
                if (queue.length === 0) {
                    changedAttrs.splice(0);
                }
                return abort;
            };
            def.then(success, error);
            return def;
        }, _triggerChange = can.Model.prototype._triggerChange, destroyFn = can.Model.prototype.destroy, setupFn = can.Model.prototype.setup;
    can.each([
        'created',
        'updated',
        'destroyed'
    ], function (fn) {
        var prototypeFn = can.Model.prototype[fn];
        can.Model.prototype[fn] = function (attrs) {
            if (attrs && typeof attrs === 'object') {
                attrs = attrs.attr ? attrs.attr() : attrs;
                this._backupStore(attrs);
                attrs = cleanAttrs(this._changedAttrs || [], attrs);
            }
            prototypeFn.call(this, attrs);
        };
    });
    can.extend(can.Model.prototype, {
        setup: function () {
            setupFn.apply(this, arguments);
            this._requestQueue = new can.List();
        },
        _triggerChange: function (attr, how, newVal, oldVal) {
            if (this._changedAttrs) {
                this._changedAttrs.push(attr);
            }
            _triggerChange.apply(this, arguments);
        },
        hasQueuedRequests: function () {
            return this._requestQueue.attr('length') > 1;
        },
        save: function () {
            return queueRequests.apply(this, arguments);
        },
        destroy: function (success, error) {
            if (this.isNew()) {
                return destroyFn.call(this, success, error);
            }
            return queueRequests.call(this, success, error, 'destroy', 'destroyed');
        }
    });
    return can;
});
