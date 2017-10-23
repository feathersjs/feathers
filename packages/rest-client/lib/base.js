const query = require('qs');
const { stripSlashes } = require('@feathersjs/commons');
const { convert } = require('@feathersjs/errors');

function toError (error) {
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
      url += `/${id}`;
    }

    if (Object.keys(params).length !== 0) {
      const queryString = query.stringify(params);

      url += `?${queryString}`;
    }

    return url;
  }

  find (params = {}) {
    return this.request({
      url: this.makeUrl(params.query),
      method: 'GET',
      headers: Object.assign({}, params.headers)
    }).catch(toError);
  }

  get (id, params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'get' can not be undefined`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      method: 'GET',
      headers: Object.assign({}, params.headers)
    }).catch(toError);
  }

  create (body, params = {}) {
    return this.request({
      url: this.makeUrl(params.query),
      body,
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
    }).catch(toError);
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
    }).catch(toError);
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
    }).catch(toError);
  }

  remove (id, params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'remove' can not be undefined, only 'null' when removing multiple entries`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      method: 'DELETE',
      headers: Object.assign({}, params.headers)
    }).catch(toError);
  }
}

module.exports = Base;
