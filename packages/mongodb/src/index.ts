import { PaginationOptions } from '@feathersjs/adapter-commons'
import { Paginated, ServiceMethods, Id, NullableId } from '@feathersjs/feathers'
import { MongoDbAdapter, MongoDBAdapterParams } from './adapter'

export * from './adapter'
export * from './error-handler'

export class MongoDBService<T = any, D = Partial<T>, P extends MongoDBAdapterParams = MongoDBAdapterParams>
  extends MongoDbAdapter<T, D, P> implements ServiceMethods<T|Paginated<T>, D, P> {
  async find (params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  async find (params?: P & { paginate: false }): Promise<T[]>;
  async find (params?: P): Promise<Paginated<T>|T[]>;
  async find (params?: P): Promise<Paginated<T>|T[]> {
    return await this._find(params)
  }

  async get (id: Id, params?: P): Promise<T> {
    return await this._get(id, params)
  }

  async create (data: Partial<D>, params?: P): Promise<T>;
  async create (data: Partial<D>[], params?: P): Promise<T[]>;
  async create (data: Partial<D>|Partial<D>[], params?: P): Promise<T|T[]> {
    return await this._create(data, params)
  }

  async update (id: Id, data: D, params?: P): Promise<T> {
    return await this._update(id, data, params)
  }

  async patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  async patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  async patch (id: NullableId, data: Partial<D>, params?: P): Promise<T | T[]> {
    return await this._patch(id, data, params)
  }

  async remove (id: Id, params?: P): Promise<T>;
  async remove (id: null, params?: P): Promise<T[]>;
  async remove (id: NullableId, params?: P): Promise<T | T[]> {
    return await this._remove(id, params)
  }
}
