const query = require('qs');
const { Unavailable } = require('@feathersjs/errors');
const { _ } = require('@feathersjs/commons');
const { stripSlashes } = require('@feathersjs/commons');
const { convert } = require('@feathersjs/errors');

function toError (error) {
  if (error.code === 'ECONNREFUSED') {
    throw new Unavailable(error.message, _.pick(error, 'address', 'port', 'config'));
  }

  throw convert(error);
}

class Base {
  constructor (settings) {
    this.name = stripSlashes(settings.name);
    this.options = settings.options;
    this.connection = settings.connection;
    this.base = `${settings.base}/${this.name}`;
  }

  makeUrl (params, id) {
    params = params || {};
    let url = this.base;

    if (typeof id !== 'undefined' && id !== null) {
      url += `/${encodeURIComponent(id)}`;
    }

    if (Object.keys(params).length !== 0) {
      const queryString = query.stringify(params, this.options.qs);

      url += `?${queryString}`;
    }

    return url;
  }

  find (params = {}) {
    return this.request({
      url: this.makeUrl(params.query),
      method: 'GET',
      headers: Object.assign({}, params.headers)
    }, params).catch(toError);
  }

  get (id, params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'get' can not be undefined`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      method: 'GET',
      headers: Object.assign({}, params.headers)
    }, params).catch(toError);
  }

  create (body, params = {}) {
    return this.request({
      url: this.makeUrl(params.query),
      body,
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
    }, params).catch(toError);
  }

  update (id, body, params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'update' can not be undefined, only 'null' when updating multiple entries`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      body,
      method: 'PUT',
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
    }, params).catch(toError);
  }

  patch (id, body, params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'patch' can not be undefined, only 'null' when updating multiple entries`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      body,
      method: 'PATCH',
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
    }, params).catch(toError);
  }

  remove (id, params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'remove' can not be undefined, only 'null' when removing multiple entries`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      method: 'DELETE',
      headers: Object.assign({}, params.headers)
    }, params).catch(toError);
  }
}

module.exports = Base;
