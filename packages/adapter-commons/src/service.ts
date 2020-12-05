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
  paginate: {
    default?: number;
    max?: number;
  }
  whitelist: string[];
  filters: string[];
}

/**
 * Hook-less (internal) service methods. Directly call database adapter service methods
 * without running any service-level hooks. This can be useful if you need the raw data
 * from the service and don't want to trigger any of its hooks.
 *
 * Important: These methods are only available internally on the server, not on the client
 * side and only for the Feathers database adapters.
 *
 * These methods do not trigger events.
 *
 * @see {@link https://docs.feathersjs.com/guides/migrating.html#hook-less-service-methods}
 */
export interface InternalServiceMethods<T = any> {

  /**
   * Retrieve all resources from this service, skipping any service-level hooks.
   *
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#find-params|Feathers API Documentation: .find(params)}
   */
  _find (params?: Params): Promise<T | T[] | Paginated<T>>;

  /**
   * Retrieve a single resource matching the given ID, skipping any service-level hooks.
   *
   * @param id - ID of the resource to locate
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#get-id-params|Feathers API Documentation: .get(id, params)}
   */
  _get (id: Id, params?: Params): Promise<T>;

  /**
   * Create a new resource for this service, skipping any service-level hooks.
   *
   * @param data - Data to insert into this service.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#create-data-params|Feathers API Documentation: .create(data, params)}
   */
  _create (data: Partial<T> | Partial<T>[], params?: Params): Promise<T | T[]>;

  /**
   * Replace any resources matching the given ID with the given data, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be updated
   * @param data - Data to be put in place of the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#update-id-data-params|Feathers API Documentation: .update(id, data, params)}
   */
  _update (id: Id, data: T, params?: Params): Promise<T>;

  /**
   * Merge any resources matching the given ID with the given data, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be patched
   * @param data - Data to merge with the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#patch-id-data-params|Feathers API Documentation: .patch(id, data, params)}
   */
  _patch (id: NullableId, data: Partial<T>, params?: Params): Promise<T | T[]>;

  /**
   * Remove resources matching the given ID from the this service, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be removed
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#remove-id-params|Feathers API Documentation: .remove(id, params)}
   */
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
