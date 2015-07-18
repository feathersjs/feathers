var query = require('querystring');
var Proto = require('uberproto');
var eventMixin = require('./events');
var utils = require('../utils');

module.exports = Proto.extend({
  events: utils.events,

  _create: Proto.create,

  init: function(name, options) {
    this.name = utils.stripSlashes(name);
    this.options = utils.extend({}, options);
    this.connection = options.connection;
    this.base = options.base + '/' + name;
    delete this.options.base;
  },

  makeUrl: function (params, id) {
    var url = this.base;

    if (typeof id !== 'undefined') {
      url += '/' + id;
    }

    if(Object.keys(params).length !== 0) {
      url += '?' + query.stringify(params);
    }

    return url;
  },

  find: function (params, callback) {
    this.request({
      url: this.makeUrl(params),
      method: 'GET'
    }, callback);
  },

  get: function(id, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      method: 'GET'
    }, callback);
  },

  create: function (data, params, callback) {
    this.request({
      url: this.makeUrl(params),
      body: data,
      method: 'POST'
    }, callback);
  },

  update: function (id, data, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      body: data,
      method: 'PUT'
    }, callback);
  },

  patch: function (id, data, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      body: data,
      method: 'PATCH'
    }, callback);
  },

  remove: function (id, params, callback) {
    this.request({
      url: this.makeUrl(params, id),
      method: 'DELETE'
    }, callback);
  }
}).mixin(eventMixin);
