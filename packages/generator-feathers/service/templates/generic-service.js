if(!global._babelPolyfill) { require('babel-polyfill'); }

import hooks from '../hooks';
// import _ from 'lodash';
import Proto from 'uberproto';
import filter from 'feathers-query-filters';
import errors from 'feathers-errors';
// import { sorter, filterSpecials } from './utils';

export class Service {
  constructor(options = {}) {
    this.paginate = options.paginate || {};
    this._id = options.idField || 'id';
    this._uId = options.startId || 0;
    this.store = options.store || {};
  }

  extend(obj) {
    return Proto.extend(obj, this);
  }

  find(params) {
    const query = params.query || {};
    const filters = filter(query);

    let values = filterSpecials(_.values(this.store), query);

    if(!_.isEmpty(query)) {
      values = _.where(values, query);
    }

    const total = values.length;

    if (filters.$sort) {
      values.sort(sorter(filters.$sort));
    }

    if (filters.$skip){
      values = values.slice(filters.$skip);
    }

    let limit = filters.$limit || this.paginate.default;

    if (limit) {
      limit = Math.min(this.paginate.max || Number.MAX_VALUE, limit);
      values = values.slice(0, limit);
    }

    if(filters.$select) {
      values = values.map(value => _.pick(value, filters.$select));
    }

    if(this.paginate.default) {
      return Promise.resolve({
        total,
        limit,
        skip: filters.$skip || 0,
        data: values
      });
    }

    return Promise.resolve(values);
  }

  get(id) {
    if (id in this.store) {
      return Promise.resolve(this.store[id]);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }

  create(data) {
    if(Array.isArray(data)) {
      return Promise.all(data.map(current => this.create(current)));
    }

    let id = data[this._id] || this._uId++;
    let current = _.extend({}, data, { [this._id]: id });

    if (this.store[id]){
      return Promise.reject(new errors.Conflict(`A record with id: ${id} already exists`));
    }

    return Promise.resolve((this.store[id] = current));
  }

  update(id, data) {
    if(id === null || Array.isArray(data)) {
      return Promise.reject(new errors.BadRequest(
        `You can not replace multiple instances. Did you mean 'patch'?`
      ));
    }

    if (id in this.store) {
      data = _.extend({}, data, { [this._id]: id });
      this.store[id] = data;

      return Promise.resolve(this.store[id]);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }

  patch(id, data, params) {
    if(id === null) {
      return this.find(params).then(instances => {
        return Promise.all(instances.map(
          current => this.patch(current[this._id], data, params))
        );
      });
    }

    if (id in this.store) {
      _.each(data, (value, key) => {
        if(key !== this._id) {
          this.store[id][key] = value;
        }
      });

      return Promise.resolve(this.store[id]);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }

  remove(id, params) {
    if(id === null) {
      return this.find(params).then(data =>
        Promise.all(data.map(current => this.remove(current[this._id]))));
    }

    if (id in this.store) {
      const deleted = this.store[id];
      delete this.store[id];

      return Promise.resolve(deleted);
    }

    return Promise.reject(new errors.NotFound(`No record found for id '${id}'`));
  }
}

export default function(){
  const app = this;

  let options = {
    paginate: {
      default: 5,
      max: 25
    }
  };

  app.use(<% if (version) { %>'/<%= version %>/<%= pluralizedName %>'<% } else { %>'/<%= pluralizedName %>'<% } %>, service(options));
}