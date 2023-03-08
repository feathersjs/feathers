import { Id, Paginated, Query } from '@feathersjs/feathers'
import {
  AdapterParams,
  AdapterServiceOptions,
  InternalServiceMethods,
  PaginationOptions
} from './declarations'
import { filterQuery } from './query'

export const VALIDATED = Symbol.for('@feathersjs/adapter/sanitized')

const alwaysMulti: { [key: string]: boolean } = {
  find: true,
  get: false,
  update: false
}

/**
 * An abstract base class that a database adapter can extend from to implement the
 * `__find`, `__get`, `__update`, `__patch` and `__remove` methods.
 */
export abstract class AdapterBase<
  Result = any,
  Data = Result,
  PatchData = Partial<Data>,
  ServiceParams extends AdapterParams = AdapterParams,
  Options extends AdapterServiceOptions = AdapterServiceOptions,
  IdType = Id
> implements InternalServiceMethods<Result, Data, PatchData, ServiceParams, IdType>
{
  options: Options

  constructor(options: Options) {
    this.options = {
      id: 'id',
      events: [],
      paginate: false,
      multi: false,
      filters: {},
      operators: [],
      ...options
    }
  }

  get id() {
    return this.options.id
  }

  get events() {
    return this.options.events
  }

  /**
   * Check if this adapter allows multiple updates for a method.
   * @param method The method name to check.
   * @param params The service call params.
   * @returns Wether or not multiple updates are allowed.
   */
  allowsMulti(method: string, params: ServiceParams = {} as ServiceParams) {
    const always = alwaysMulti[method]

    if (typeof always !== 'undefined') {
      return always
    }

    const { multi } = this.getOptions(params)

    if (multi === true || !multi) {
      return multi
    }

    return multi.includes(method)
  }

  /**
   * Returns the combined options for a service call. Options will be merged
   * with `this.options` and `params.adapter` for dynamic overrides.
   *
   * @param params The parameters for the service method call
   * @returns The actual options for this call
   */
  getOptions(params: ServiceParams): Options {
    const paginate = params.paginate !== undefined ? params.paginate : this.options.paginate

    return {
      ...this.options,
      paginate,
      ...params.adapter
    }
  }

  /**
   * Returns a sanitized version of `params.query`, converting filter values
   * (like $limit and $skip) into the expected type. Will throw an error if
   * a `$` prefixed filter or operator value that is not allowed in `filters`
   * or `operators` is encountered.
   *
   * @param params The service call parameter.
   * @returns A new object containing the sanitized query.
   */
  async sanitizeQuery(params: ServiceParams = {} as ServiceParams): Promise<Query> {
    // We don't need legacy query sanitisation if the query has been validated by a schema already
    if (params.query && (params.query as any)[VALIDATED]) {
      return params.query || {}
    }

    const options = this.getOptions(params)
    const { query, filters } = filterQuery(params.query, options)

    return {
      ...filters,
      ...query
    }
  }

  /**
   * Retrieve all resources from this service.
   * Does not sanitize the query and should only be used on the server.
   *
   * @param _params - Service call parameters {@link ServiceParams}
   */
  abstract _find(_params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>
  abstract _find(_params?: ServiceParams & { paginate: false }): Promise<Result[]>
  abstract _find(params?: ServiceParams): Promise<Result[] | Paginated<Result>>

  /**
   * Retrieve a single resource matching the given ID, skipping any service-level hooks.
   * Does not sanitize the query and should only be used on the server.
   *
   * @param id - ID of the resource to locate
   * @param params - Service call parameters {@link ServiceParams}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#get-id-params|Feathers API Documentation: .get(id, params)}
   */
  abstract _get(id: IdType, params?: ServiceParams): Promise<Result>

  /**
   * Create a new resource for this service, skipping any service-level hooks.
   * Does not check if multiple updates are allowed and should only be used on the server.
   *
   * @param data - Data to insert into this service.
   * @param params - Service call parameters {@link ServiceParams}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#create-data-params|Feathers API Documentation: .create(data, params)}
   */
  abstract _create(data: Data, params?: ServiceParams): Promise<Result>
  abstract _create(data: Data[], params?: ServiceParams): Promise<Result[]>
  abstract _create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]>

  /**
   * Completely replace the resource identified by id, skipping any service-level hooks.
   * Does not sanitize the query and should only be used on the server.
   *
   * @param id - ID of the resource to be updated
   * @param data - Data to be put in place of the current resource.
   * @param params - Service call parameters {@link ServiceParams}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#update-id-data-params|Feathers API Documentation: .update(id, data, params)}
   */
  abstract _update(id: IdType, data: Data, params?: ServiceParams): Promise<Result>

  /**
   * Merge any resources matching the given ID with the given data, skipping any service-level hooks.
   * Does not sanitize the query and should only be used on the server.
   *
   * @param id - ID of the resource to be patched
   * @param data - Data to merge with the current resource.
   * @param params - Service call parameters {@link ServiceParams}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#patch-id-data-params|Feathers API Documentation: .patch(id, data, params)}
   */
  abstract _patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>
  abstract _patch(id: IdType, data: PatchData, params?: ServiceParams): Promise<Result>
  abstract _patch(id: IdType | null, data: PatchData, params?: ServiceParams): Promise<Result | Result[]>

  /**
   * Remove resources matching the given ID from the this service, skipping any service-level hooks.
   * Does not sanitize query and should only be used on the server.
   *
   * @param id - ID of the resource to be removed
   * @param params - Service call parameters {@link ServiceParams}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#remove-id-params|Feathers API Documentation: .remove(id, params)}
   */
  abstract _remove(id: null, params?: ServiceParams): Promise<Result[]>
  abstract _remove(id: IdType, params?: ServiceParams): Promise<Result>
  abstract _remove(id: IdType | null, params?: ServiceParams): Promise<Result | Result[]>
}
