import { BadRequest, MethodNotAllowed } from '@feathersjs/errors'
import { Id, NullableId, Paginated, Query } from '@feathersjs/feathers'
import {
  AdapterParams,
  AdapterServiceOptions,
  InternalServiceMethods,
  PaginationOptions
} from './declarations'
import { filterQuery } from './query'

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
  T = any,
  D = Partial<T>,
  P extends AdapterParams = AdapterParams,
  O extends AdapterServiceOptions = AdapterServiceOptions
> implements InternalServiceMethods<T, D, P>
{
  options: O

  constructor(options: O) {
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
  allowsMulti(method: string, params: P = {} as P) {
    const always = alwaysMulti[method]

    if (typeof always !== 'undefined') {
      return always
    }

    const { multi } = this.getOptions(params)

    if (multi === true || multi === false) {
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
  getOptions(params: P): O {
    const paginate = params.paginate !== undefined ? params.paginate : this.options.paginate

    return {
      ...this.options,
      paginate,
      ...params.adapter
    }
  }

  /**
   * Sanitize the incoming data, e.g. removing invalid keywords etc.
   *
   * @param data The data to sanitize
   * @param _params Service call parameters
   * @returns The sanitized data
   */
  async sanitizeData<X = Partial<D>>(data: X, _params: P) {
    return data
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
  async sanitizeQuery(params: P = {} as P): Promise<Query> {
    const options = this.getOptions(params)
    const { query, filters } = filterQuery(params.query, options)

    return {
      ...filters,
      ...query
    }
  }

  abstract $find(_params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>
  abstract $find(_params?: P & { paginate: false }): Promise<T[]>
  abstract $find(params?: P): Promise<T[] | Paginated<T>>

  /**
   * Retrieve all resources from this service, skipping any service-level hooks but sanitize the query
   * with allowed filters and properties by calling `sanitizeQuery`.
   *
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#find-params|Feathers API Documentation: .find(params)}
   */
  async _find(_params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>
  async _find(_params?: P & { paginate: false }): Promise<T[]>
  async _find(params?: P): Promise<T | T[] | Paginated<T>>
  async _find(params?: P): Promise<T | T[] | Paginated<T>> {
    const query = await this.sanitizeQuery(params)

    return this.$find({
      ...params,
      query
    })
  }

  abstract $get(id: Id, params?: P): Promise<T>

  /**
   * Retrieve a single resource matching the given ID, skipping any service-level hooks but sanitize the query
   * with allowed filters and properties by calling `sanitizeQuery`.
   *
   * @param id - ID of the resource to locate
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#get-id-params|Feathers API Documentation: .get(id, params)}
   */
  async _get(id: Id, params?: P): Promise<T> {
    const query = await this.sanitizeQuery(params)

    return this.$get(id, {
      ...params,
      query
    })
  }

  abstract $create(data: Partial<D>, params?: P): Promise<T>
  abstract $create(data: Partial<D>[], params?: P): Promise<T[]>
  abstract $create(data: Partial<D> | Partial<D>[], params?: P): Promise<T | T[]>

  /**
   * Create a new resource for this service, skipping any service-level hooks, sanitize the data
   * and check if multiple updates are allowed.
   *
   * @param data - Data to insert into this service.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#create-data-params|Feathers API Documentation: .create(data, params)}
   */
  async _create(data: Partial<D>, params?: P): Promise<T>
  async _create(data: Partial<D>[], params?: P): Promise<T[]>
  async _create(data: Partial<D> | Partial<D>[], params?: P): Promise<T | T[]>
  async _create(data: Partial<D> | Partial<D>[], params?: P): Promise<T | T[]> {
    if (Array.isArray(data) && !this.allowsMulti('create', params)) {
      throw new MethodNotAllowed('Can not create multiple entries')
    }

    const payload = Array.isArray(data)
      ? await Promise.all(data.map((current) => this.sanitizeData(current, params)))
      : await this.sanitizeData(data, params)

    return this.$create(payload, params)
  }

  abstract $update(id: Id, data: D, params?: P): Promise<T>

  /**
   * Replace any resources matching the given ID with the given data, skipping any service-level hooks.
   *
   * @param id - ID of the resource to be updated
   * @param data - Data to be put in place of the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#update-id-data-params|Feathers API Documentation: .update(id, data, params)}
   */
  async _update(id: Id, data: D, params?: P): Promise<T> {
    if (id === null || Array.isArray(data)) {
      throw new BadRequest("You can not replace multiple instances. Did you mean 'patch'?")
    }

    const payload = await this.sanitizeData(data, params)
    const query = await this.sanitizeQuery(params)

    return this.$update(id, payload, {
      ...params,
      query
    })
  }

  abstract $patch(id: null, data: Partial<D>, params?: P): Promise<T[]>
  abstract $patch(id: Id, data: Partial<D>, params?: P): Promise<T>
  abstract $patch(id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]>

  /**
   * Merge any resources matching the given ID with the given data, skipping any service-level hooks.
   * Sanitizes the query and data and checks it multiple updates are allowed.
   *
   * @param id - ID of the resource to be patched
   * @param data - Data to merge with the current resource.
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#patch-id-data-params|Feathers API Documentation: .patch(id, data, params)}
   */
  async _patch(id: null, data: Partial<D>, params?: P): Promise<T[]>
  async _patch(id: Id, data: Partial<D>, params?: P): Promise<T>
  async _patch(id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]>
  async _patch(id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]> {
    if (id === null && !this.allowsMulti('patch', params)) {
      throw new MethodNotAllowed('Can not patch multiple entries')
    }

    const { $limit, ...query } = await this.sanitizeQuery(params)
    const payload = await this.sanitizeData(data, params)

    return this.$patch(id, payload, {
      ...params,
      query
    })
  }

  abstract $remove(id: null, params?: P): Promise<T[]>
  abstract $remove(id: Id, params?: P): Promise<T>
  abstract $remove(id: NullableId, params?: P): Promise<T | T[]>

  /**
   * Remove resources matching the given ID from the this service, skipping any service-level hooks.
   * Sanitized the query and verifies that multiple updates are allowed.
   *
   * @param id - ID of the resource to be removed
   * @param params - Service call parameters {@link Params}
   * @see {@link HookLessServiceMethods}
   * @see {@link https://docs.feathersjs.com/api/services.html#remove-id-params|Feathers API Documentation: .remove(id, params)}
   */
  async _remove(id: null, params?: P): Promise<T[]>
  async _remove(id: Id, params?: P): Promise<T>
  async _remove(id: NullableId, params?: P): Promise<T | T[]>
  async _remove(id: NullableId, params?: P): Promise<T | T[]> {
    if (id === null && !this.allowsMulti('remove', params)) {
      throw new MethodNotAllowed('Can not remove multiple entries')
    }

    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this.$remove(id, {
      ...params,
      query
    })
  }
}
