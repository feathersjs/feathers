import qs  from 'qs';
import { Unavailable }  from '@feathersjs/errors';
import { _ }  from '@feathersjs/commons';
import { stripSlashes }  from '@feathersjs/commons';
import { convert }  from '@feathersjs/errors';
import { Params, Id, Query, NullableId } from '@feathersjs/feathers';

function toError (error: Error & { code: string }) {
  if (error.code === 'ECONNREFUSED') {
    throw new Unavailable(error.message, _.pick(error, 'address', 'port', 'config'));
  }

  throw convert(error);
}

interface RestClientSettings {
  name: string;
  base: string;
  connection: any;
  options: any;
}

export abstract class Base {
  name: string;
  base: string;
  connection: any;
  options: any;

  constructor (settings: RestClientSettings) {
    this.name = stripSlashes(settings.name);
    this.options = settings.options;
    this.connection = settings.connection;
    this.base = `${settings.base}/${this.name}`;
  }

  makeUrl (query: Query, id?: string|number|null) {
    query = query || {};
    let url = this.base;

    if (typeof id !== 'undefined' && id !== null) {
      url += `/${encodeURIComponent(id)}`;
    }

    return url + this.getQuery(query);
  }

  getQuery (query: Query) {
    if (Object.keys(query).length !== 0) {
      const queryString = qs.stringify(query);

      return `?${queryString}`;
    }

    return '';
  }

  abstract request (options: any, params: Params): any;

  find (params: Params = {}) {
    return this.request({
      url: this.makeUrl(params.query),
      method: 'GET',
      headers: Object.assign({}, params.headers)
    }, params).catch(toError);
  }

  get (id: Id, params: Params = {}) {
    if (typeof id === 'undefined') {
      return Promise.reject(new Error(`id for 'get' can not be undefined`));
    }

    return this.request({
      url: this.makeUrl(params.query, id),
      method: 'GET',
      headers: Object.assign({}, params.headers)
    }, params).catch(toError);
  }

  create (body: any, params: Params = {}) {
    return this.request({
      url: this.makeUrl(params.query),
      body,
      method: 'POST',
      headers: Object.assign({ 'Content-Type': 'application/json' }, params.headers)
    }, params).catch(toError);
  }

  update (id: NullableId, body: any, params: Params = {}) {
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

  patch (id: NullableId, body: any, params: Params = {}) {
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

  remove (id: NullableId, params: Params = {}) {
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
