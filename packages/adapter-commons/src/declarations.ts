import { Query, Params, Paginated, Id, NullableId } from '@feathersjs/feathers';

export type FilterSettings = string[]|{
  [key: string]: (value: any, options: any) => any
}

export interface PaginationOptions {
  default?: number;
  max?: number;
}

export type PaginationParams = false|PaginationOptions;

export type FilterQueryOptions = {
  filters?: FilterSettings;
  operators?: string[];
  paginate?: PaginationParams;
}

export interface AdapterServiceOptions {
  events?: string[];
  multi?: boolean|string[];
  id?: string;
  paginate?: PaginationOptions
  /**
   * @deprecated renamed to `allow`.
   */
  whitelist?: string[];
  allow?: string[];
  filters?: string[];
}

export interface AdapterOptions<M = any> extends Pick<AdapterServiceOptions, 'multi'|'allow'|'paginate'> {
  Model?: M;
}

export interface AdapterParams<Q = Query, M = any> extends Params<Q> {
  adapter?: Partial<AdapterOptions<M>>;
  paginate?: PaginationParams;
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
 export interface InternalServiceMethods<T = any, D = Partial<T>, P extends AdapterParams = AdapterParams> {
  /**
   * Retrieve all resources from this service, skipping any service-level hooks.
   *
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#find-params|Feathers API Documentation: .find(params)}
   */
  _find (_params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  _find (_params?: P & { paginate: false }): Promise<T[]>;
  _find (params?: P): Promise<T | T[] | Paginated<T>>;

  /**
   * Retrieve a single resource matching the given ID, skipping any service-level hooks.
   *
   * @param id - ID of the resource to locate
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#get-id-params|Feathers API Documentation: .get(id, params)}
   */
  _get (id: Id, params?: P): Promise<T>;

  /**
   * Create a new resource for this service, skipping any service-level hooks.
   *
   * @param data - Data to insert into this service.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#create-data-params|Feathers API Documentation: .create(data, params)}
   */
   _create (data: Partial<D>, params?: P): Promise<T>;
   _create (data: Partial<D>[], params?: P): Promise<T[]>;
   _create (data: Partial<D>|Partial<D>[], params?: P): Promise<T|T[]>;

  /**
   * Replace any resources matching the given ID with the given data, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be updated
   * @param data - Data to be put in place of the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#update-id-data-params|Feathers API Documentation: .update(id, data, params)}
   */
  _update (id: Id, data: D, params?: P): Promise<T>;

  /**
   * Merge any resources matching the given ID with the given data, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be patched
   * @param data - Data to merge with the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#patch-id-data-params|Feathers API Documentation: .patch(id, data, params)}
   */
  _patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  _patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  _patch (id: NullableId, data: Partial<D>, params?: P): Promise<T|T[]>;

  /**
   * Remove resources matching the given ID from the this service, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be removed
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#remove-id-params|Feathers API Documentation: .remove(id, params)}
   */
  _remove (id: null, params?: P): Promise<T[]>;
  _remove (id: Id, params?: P): Promise<T>;
  _remove (id: NullableId, params?: P): Promise<T|T[]>;
}