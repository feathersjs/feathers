import { NotImplemented, BadRequest, MethodNotAllowed } from '@feathersjs/errors';
import { ServiceMethods, Params, Paginated, Id, NullableId } from '@feathersjs/feathers';
import filterQuery from './filter-query';

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

export interface ServiceOptions {
  events: string[];
  multi: boolean|string[];
  id: string;
  paginate: any;
  whitelist: string[];
  filters: string[];
}

export interface InternalServiceMethods<T = any> {
    _find (params?: Params): Promise<T | T[] | Paginated<T>>;
    _get (id: Id, params?: Params): Promise<T>;
    _create (data: Partial<T> | Partial<T>[], params?: Params): Promise<T | T[]>;
    _update (id: Id, data: T, params?: Params): Promise<T>;
    _patch (id: NullableId, data: Partial<T>, params?: Params): Promise<T | T[]>;
    _remove (id: NullableId, params?: Params): Promise<T | T[]>;
}

export class AdapterService<T = any> implements ServiceMethods<T> {
  options: ServiceOptions;

  constructor (options: Partial<ServiceOptions>) {
    this.options = Object.assign({
      id: 'id',
      events: [],
      paginate: {},
      multi: false,
      filters: [],
      whitelist: []
    }, options);
  }

  get id () {
    return this.options.id;
  }

  get events () {
    return this.options.events;
  }

  filterQuery (params: Params = {}, opts: any = {}) {
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

  allowsMulti (method: string) {
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

  find (params?: Params): Promise<T[] | Paginated<T>> {
    return callMethod(this, '_find', params);
  }

  get (id: Id, params?: Params): Promise<T> {
    return callMethod(this, '_get', id, params);
  }

  create (data: Partial<T> | Partial<T>[], params?: Params): Promise<T | T[]> {
    if (Array.isArray(data) && !this.allowsMulti('create')) {
      return Promise.reject(new MethodNotAllowed(`Can not create multiple entries`));
    }

    return callMethod(this, '_create', data, params);
  }

  update (id: Id, data: T, params?: Params): Promise<T> {
    if (id === null || Array.isArray(data)) {
      return Promise.reject(new BadRequest(
        `You can not replace multiple instances. Did you mean 'patch'?`
      ));
    }

    return callMethod(this, '_update', id, data, params);
  }

  patch (id: NullableId, data: Partial<T>, params?: Params): Promise<T | T[]> {
    if (id === null && !this.allowsMulti('patch')) {
      return Promise.reject(new MethodNotAllowed(`Can not patch multiple entries`));
    }

    return callMethod(this, '_patch', id, data, params);
  }

  remove (id: NullableId, params?: Params): Promise<T | T[]> {
    if (id === null && !this.allowsMulti('remove')) {
      return Promise.reject(new MethodNotAllowed(`Can not remove multiple entries`));
    }

    return callMethod(this, '_remove', id, params);
  }
}