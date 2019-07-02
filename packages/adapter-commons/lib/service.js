const { NotImplemented, BadRequest, MethodNotAllowed } = require('@feathersjs/errors');
const filterQuery = require('./filter-query');

const callMethod = (self, name, ...args) => {
  if (typeof self[name] !== 'function') {
    return Promise.reject(new NotImplemented(`Method ${name} not available`));
  }

  return self[name](...args);
};

const alwaysMulti = {
  find: true,
  get: false,
  update: false
};

module.exports = class AdapterService {
  constructor (options) {
    this.options = Object.assign({
      events: [],
      paginate: {},
      multi: false
    }, options);
  }

  get id () {
    return this.options.id;
  }

  get events () {
    return this.options.events;
  }

  filterQuery (params = {}, opts = {}) {
    const paginate = typeof params.paginate !== 'undefined'
      ? params.paginate : this.options.paginate;
    const { query = {} } = params;
    const options = Object.assign({
      operators: this.options.whitelist || [],
      filters: this.options.filters,
      paginate
    }, opts);
    const result = filterQuery(query, options);

    return Object.assign(result, { paginate });
  }

  allowsMulti (method) {
    const always = alwaysMulti[method];

    if (typeof always !== 'undefined') {
      return always;
    }

    const option = this.options.multi;

    if (option === true || option === false) {
      return option;
    } else {
      return option.includes(method);
    }
  }

  find (params) {
    return callMethod(this, '_find', params);
  }

  get (id, params) {
    return callMethod(this, '_get', id, params);
  }

  create (data, params) {
    if (Array.isArray(data) && !this.allowsMulti('create')) {
      return Promise.reject(new MethodNotAllowed(`Can not create multiple entries`));
    }

    return callMethod(this, '_create', data, params);
  }

  update (id, data, params) {
    if (id === null || Array.isArray(data)) {
      return Promise.reject(new BadRequest(
        `You can not replace multiple instances. Did you mean 'patch'?`
      ));
    }

    return callMethod(this, '_update', id, data, params);
  }

  patch (id, data, params) {
    if (id === null && !this.allowsMulti('patch')) {
      return Promise.reject(new MethodNotAllowed(`Can not patch multiple entries`));
    }

    return callMethod(this, '_patch', id, data, params);
  }

  remove (id, params) {
    if (id === null && !this.allowsMulti('remove')) {
      return Promise.reject(new MethodNotAllowed(`Can not remove multiple entries`));
    }

    return callMethod(this, '_remove', id, params);
  }
};
