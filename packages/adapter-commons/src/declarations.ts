import { Query, Params, Paginated, Id, NullableId } from '@feathersjs/feathers'

export type FilterQueryOptions = {
  filters?: FilterSettings
  operators?: string[]
  paginate?: PaginationParams
}

export type QueryFilter = (value: any, options: FilterQueryOptions) => any

export type FilterSettings = {
  [key: string]: QueryFilter | true
}

export interface PaginationOptions {
  default?: number
  max?: number
}

export type PaginationParams = false | PaginationOptions

export interface AdapterServiceOptions {
  /**
   * Whether to allow multiple updates for everything (`true`) or specific methods (e.g. `['create', 'remove']`)
   */
  multi?: boolean | string[]
  /**
   * The name of the id property
   */
  id?: string
  /**
   * Pagination settings for this service
   */
  paginate?: PaginationParams
  /**
   * A list of additional property query operators to allow in a query
   */
  operators?: string[]
  /**
   * An object of additional top level query filters, e.g. `{ $populate: true }`
   * Can also be a converter function like `{ $ignoreCase: (value) => value === 'true' ? true : false }`
   */
  filters?: FilterSettings
  /**
   * @deprecated Use service `events` option when registering the service with `app.use`.
   */
  events?: string[]
  /**
   * @deprecated renamed to `operators`.
   */
  whitelist?: string[]
}

export interface AdapterQuery extends Query {
  $limit?: number
  $skip?: number
  $select?: string[]
  $sort?: { [key: string]: 1 | -1 }
}
/**
 * Additional `params` that can be passed to an adapter service method call.
 */
export interface AdapterParams<
  Q = AdapterQuery,
  A extends Partial<AdapterServiceOptions> = Partial<AdapterServiceOptions>
> extends Params<Q> {
  adapter?: A
  paginate?: PaginationParams
}

/**
 * Hook-less (internal) service methods. Directly call database adapter service methods
 * without running any service-level hooks or sanitization. This can be useful if you need the raw data
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
   * Retrieve all resources from this service.
   * Does not sanitize the query and should only be used on the server.
   *
   * @param _params - Service call parameters {@link Params}
   */
  $find(_params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>
  $find(_params?: P & { paginate: false }): Promise<T[]>
  $find(params?: P): Promise<T[] | Paginated<T>>

  /**
   * Retrieve a single resource matching the given ID, skipping any service-level hooks.
   * Does not sanitize the query and should only be used on the server.
   *
   * @param id - ID of the resource to locate
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#get-id-params|Feathers API Documentation: .get(id, params)}
   */
  $get(id: Id, params?: P): Promise<T>

  /**
   * Create a new resource for this service, skipping any service-level hooks.
   * Does not sanitize data or checks if multiple updates are allowed and should only be used on the server.
   *
   * @param data - Data to insert into this service.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#create-data-params|Feathers API Documentation: .create(data, params)}
   */
  $create(data: Partial<D>, params?: P): Promise<T>
  $create(data: Partial<D>[], params?: P): Promise<T[]>
  $create(data: Partial<D> | Partial<D>[], params?: P): Promise<T | T[]>

  /**
   * Completely replace the resource identified by id, skipping any service-level hooks.
   * Does not sanitize data or query and should only be used on the server.
   *
   * @param id - ID of the resource to be updated
   * @param data - Data to be put in place of the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#update-id-data-params|Feathers API Documentation: .update(id, data, params)}
   */
  $update(id: Id, data: D, params?: P): Promise<T>

  /**
   * Merge any resources matching the given ID with the given data, skipping any service-level hooks.
   * Does not sanitize the data or query and should only be used on the server.
   *
   * @param id - ID of the resource to be patched
   * @param data - Data to merge with the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#patch-id-data-params|Feathers API Documentation: .patch(id, data, params)}
   */
  $patch(id: null, data: Partial<D>, params?: P): Promise<T[]>
  $patch(id: Id, data: Partial<D>, params?: P): Promise<T>
  $patch(id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]>

  /**
   * Remove resources matching the given ID from the this service, skipping any service-level hooks.
   * Does not sanitize query and should only be used on the server.
   *
   * @param id - ID of the resource to be removed
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#remove-id-params|Feathers API Documentation: .remove(id, params)}
   */
  $remove(id: null, params?: P): Promise<T[]>
  $remove(id: Id, params?: P): Promise<T>
  $remove(id: NullableId, params?: P): Promise<T | T[]>
}
