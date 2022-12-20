import { PaginationOptions } from '@feathersjs/adapter-commons'
import { MethodNotAllowed } from '@feathersjs/errors/lib'
import { Paginated, ServiceMethods, Id, NullableId, Params } from '@feathersjs/feathers'
import { KnexAdapter } from './adapter'
import { KnexAdapterParams } from './declarations'

export * from './declarations'
export * from './adapter'
export * from './error-handler'
export * as transaction from './hooks'

export class KnexService<
    Result = any,
    Data = Partial<Result>,
    ServiceParams extends Params<any> = KnexAdapterParams,
    PatchData = Partial<Data>
  >
  extends KnexAdapter<Result, Data, ServiceParams, PatchData>
  implements ServiceMethods<Result | Paginated<Result>, Data, ServiceParams, PatchData>
{
  async find(params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>
  async find(params?: ServiceParams & { paginate: false }): Promise<Result[]>
  async find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>
  async find(params?: ServiceParams): Promise<Paginated<Result> | Result[]> {
    return this._find({
      ...params,
      query: await this.sanitizeQuery(params)
    })
  }

  async get(id: Id, params?: ServiceParams): Promise<Result> {
    return this._get(id, {
      ...params,
      query: await this.sanitizeQuery(params)
    })
  }

  async create(data: Data, params?: ServiceParams): Promise<Result>
  async create(data: Data[], params?: ServiceParams): Promise<Result[]>
  async create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]>
  async create(data: Data | Data[], params?: ServiceParams): Promise<Result | Result[]> {
    if (Array.isArray(data) && !this.allowsMulti('create', params)) {
      throw new MethodNotAllowed('Can not create multiple entries')
    }

    return this._create(data, params)
  }

  async update(id: Id, data: Data, params?: ServiceParams): Promise<Result> {
    return this._update(id, data, {
      ...params,
      query: await this.sanitizeQuery(params)
    })
  }

  async patch(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>
  async patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>
  async patch(id: NullableId, data: PatchData, params?: ServiceParams): Promise<Result | Result[]>
  async patch(id: NullableId, data: PatchData, params?: ServiceParams): Promise<Result | Result[]> {
    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this._patch(id, data, {
      ...params,
      query
    })
  }

  async remove(id: Id, params?: ServiceParams): Promise<Result>
  async remove(id: null, params?: ServiceParams): Promise<Result[]>
  async remove(id: NullableId, params?: ServiceParams): Promise<Result | Result[]>
  async remove(id: NullableId, params?: ServiceParams): Promise<Result | Result[]> {
    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this._remove(id, {
      ...params,
      query
    })
  }
}
