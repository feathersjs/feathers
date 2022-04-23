import { NotImplemented, BadRequest, MethodNotAllowed } from '@feathersjs/errors';
import { ServiceMethods, Params, Id, NullableId, Paginated, Query } from '@feathersjs/feathers';
import { AdapterParams, AdapterServiceOptions, FilterQueryOptions, PaginationOptions } from './declarations';
import { filterQuery } from './filter-query';

const callMethod = (self: any, name: any, ...args: any[]) => {
  if (typeof self[name] !== 'function') {
    return Promise.reject(new NotImplemented(`Method ${name} not available`));
  }

  return self[name](...args);
};

const alwaysMulti: { [key: string]: boolean } = {
  find: true,
  get: false,
  update: false
};

/**
 * The base class that a database adapter can extend from.
 */
export class AdapterBase<O extends Partial<AdapterServiceOptions> = Partial<AdapterServiceOptions>> {
  options: AdapterServiceOptions & O;

  constructor (options: O) {
    this.options = Object.assign({
      id: 'id',
      events: [],
      paginate: false,
      multi: false,
      filters: [],
      allow: []
    }, options);
  }

  get id () {
    return this.options.id;
  }

  get events () {
    return this.options.events;
  }

  filterQuery (params: AdapterParams = {}, opts: FilterQueryOptions = {}) {
    const paginate = typeof params.paginate !== 'undefined'
      ? params.paginate
      : this.getOptions(params).paginate;
    const query: Query = { ...params.query };
    const options = {
      operators:  this.options.whitelist || this.options.allow || [],
      filters: this.options.filters,
      paginate,
      ...opts
    };
    const result = filterQuery(query, options);

    return {
      paginate,
      ...result
    }
  }

  allowsMulti (method: string, params: AdapterParams = {}) {
    const always = alwaysMulti[method];

    if (typeof always !== 'undefined') {
      return always;
    }

    const { multi: option } = this.getOptions(params);

    if (option === true || option === false) {
      return option;
    }

    return option.includes(method);
  }

  getOptions (params: AdapterParams): AdapterServiceOptions & { model?: any } {
    return {
      ...this.options,
      ...params.adapter
    }
  }
}

export class AdapterService<
  T = any,
  D = Partial<T>,
  O extends Partial<AdapterServiceOptions> = Partial<AdapterServiceOptions>,
  P extends Params = AdapterParams
> extends AdapterBase<O> implements ServiceMethods<T|Paginated<T>, D> {
  find (params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  find (params?: P & { paginate: false }): Promise<T[]>;
  find (params?: P): Promise<T | T[] | Paginated<T>>;
  find (params?: P): Promise<T[] | Paginated<T>> {
    return callMethod(this, '_find', params);
  }

  get (id: Id, params?: P): Promise<T> {
    return callMethod(this, '_get', id, params);
  }

  create (data: Partial<D>, params?: P): Promise<T>;
  create (data: Partial<D>[], params?: P): Promise<T[]>;
  create (data: Partial<D> | Partial<D>[], params?: P): Promise<T | T[]> {
    if (Array.isArray(data) && !this.allowsMulti('create', params)) {
      return Promise.reject(new MethodNotAllowed('Can not create multiple entries'));
    }

    return callMethod(this, '_create', data, params);
  }

  update (id: Id, data: D, params?: P): Promise<T> {
    if (id === null || Array.isArray(data)) {
      return Promise.reject(new BadRequest(
        'You can not replace multiple instances. Did you mean \'patch\'?'
      ));
    }

    return callMethod(this, '_update', id, data, params);
  }

  patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  patch (id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]> {
    if (id === null && !this.allowsMulti('patch', params)) {
      return Promise.reject(new MethodNotAllowed('Can not patch multiple entries'));
    }

    return callMethod(this, '_patch', id, data, params);
  }

  remove (id: Id, params?: P): Promise<T>;
  remove (id: null, params?: P): Promise<T[]>;
  remove (id: NullableId, params?: P): Promise<T | T[]> {
    if (id === null && !this.allowsMulti('remove', params)) {
      return Promise.reject(new MethodNotAllowed('Can not remove multiple entries'));
    }

    return callMethod(this, '_remove', id, params);
  }

  async setup () {}

  async teardown () {}
}
