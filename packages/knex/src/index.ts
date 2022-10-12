import { PaginationOptions } from '@feathersjs/adapter-commons'
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
    return this._find(params) as any
  }

  async get(id: Id, params?: P): Promise<T> {
    return this._get(id, params)
  }

  async create(data: D, params?: P): Promise<T>
  async create(data: D[], params?: P): Promise<T[]>
  async create(data: D | D[], params?: P): Promise<T | T[]> {
    return this._create(data, params)
  }

  async update(id: Id, data: D, params?: P): Promise<T> {
    return this._update(id, data, params)
  }

  async patch(id: Id, data: Partial<D>, params?: P): Promise<T>
  async patch(id: null, data: Partial<D>, params?: P): Promise<T[]>
  async patch(id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]> {
    return this._patch(id, data, params)
  }

  async remove(id: Id, params?: P): Promise<T>
  async remove(id: null, params?: P): Promise<T[]>
  async remove(id: NullableId, params?: P): Promise<T | T[]> {
    return this._remove(id, params)
  }
}
