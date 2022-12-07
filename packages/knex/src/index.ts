import { PaginationOptions } from '@feathersjs/adapter-commons'
import { MethodNotAllowed } from '@feathersjs/errors/lib'
import { Paginated, ServiceMethods, Id, NullableId, Params } from '@feathersjs/feathers'
import { KnexAdapter } from './adapter'
import { KnexAdapterParams } from './declarations'

export * from './declarations'
export * from './adapter'
export * from './error-handler'
export * as transaction from './hooks'

export class KnexService<T = any, D = Partial<T>, P extends Params<any> = KnexAdapterParams>
  extends KnexAdapter<T, D, P>
  implements ServiceMethods<T | Paginated<T>, D, P>
{
  async find(params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>
  async find(params?: P & { paginate: false }): Promise<T[]>
  async find(params?: P): Promise<Paginated<T> | T[]>
  async find(params?: P): Promise<Paginated<T> | T[]> {
    return this._find({
      ...params,
      query: await this.sanitizeQuery(params)
    })
  }

  async get(id: Id, params?: P): Promise<T> {
    return this._get(id, {
      ...params,
      query: await this.sanitizeQuery(params)
    })
  }

  async create(data: D, params?: P): Promise<T>
  async create(data: D[], params?: P): Promise<T[]>
  async create(data: D | D[], params?: P): Promise<T | T[]> {
    if (Array.isArray(data) && !this.allowsMulti('create', params)) {
      throw new MethodNotAllowed('Can not create multiple entries')
    }

    return this._create(data, params)
  }

  async update(id: Id, data: D, params?: P): Promise<T> {
    return this._update(id, data, {
      ...params,
      query: await this.sanitizeQuery(params)
    })
  }

  async patch(id: Id, data: Partial<D>, params?: P): Promise<T>
  async patch(id: null, data: Partial<D>, params?: P): Promise<T[]>
  async patch(id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]> {
    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this._patch(id, data, {
      ...params,
      query
    })
  }

  async remove(id: Id, params?: P): Promise<T>
  async remove(id: null, params?: P): Promise<T[]>
  async remove(id: NullableId, params?: P): Promise<T | T[]> {
    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this._remove(id, {
      ...params,
      query
    })
  }
}
