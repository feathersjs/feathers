var Proto = require('uberproto');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var error = require('../errors');
var _ = require('underscore');

// TODO (EK): Should we allow the ability to specify ascending
// or descending order for sort and/or order functions? Should
// you be able to sort by multiple attributes?
//
// ie. { sort: ['name', 'birthday'], order: 'ascending'}
var mutators = {
  sort: function (values, param) {
    return _.sortBy(values, function (item) {
      return item[param];
    });
  },
  order: function (values) {
    return values.reverse();
  },
  skip: function (values, param) {
    return values.slice(param);
  },
  limit: function (values, param) {
    return values.slice(0, param);
  }
};

var MemoryService = Proto.extend({
  init: function (options) {
    options = options || {};

    this._id = options.idField || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
  },

  find: function (params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    var values = _.values(this.store);

    _.each(mutators, function(handler, name) {
      values = params[name] ? handler(values, params[name]) : values;
    });

    cb(null, values);
  },

  // TODO: This should support more than id
  get: function (id, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    if (id in this.store) {
      return cb(null, this.store[id]);
    }
    cb(new error.NotFound('Could not find record', { id: id }));
  },

  create: function (data, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    var id = data[this._id] || this._uId++;
    data[this._id] = id;

    if (this.store[id]){
      if (cb) cb(new Error('A record with id: ' + id + ' already exists'));
      return;
    }

    this.store[id] = data;

    this.emit('created', data);
    if (cb) cb(null, data);
  },

  update: function (id, data, cb) {
    var self = this;
    if (id in this.store) {
      _.each(_.omit(data, this._id), function(value, key){
        self.store[id][key] = value;
      });

      this.emit('updated', this.store[id]);

      if (cb) cb(null, this.store[id]);
      return;
    }

    this.emit('error', 'Could not find record with ' + id);
    if (cb) cb('Could not find record with ' + id);
  },

  destroy: function (id, params, cb) {
    if (_.isFunction(params)){
      cb = params;
    }

    if (id in this.store) {
      var deleted = this.store[id];
      delete this.store[id];

      this.emit('destroyed', deleted);

      if (cb) cb(null, deleted);
      return;
    }

    this.emit('error', 'Could not find record with ' + id);
    if (cb) cb('Could not find record with ' + id);
  }
}, EventEmitter.prototype);

module.exports = MemoryService;
