import { BadRequest, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { _ } from '@feathersjs/commons'
import {
  sorter,
  select,
  AdapterBase,
  AdapterServiceOptions,
  PaginationOptions,
  AdapterParams
} from '@feathersjs/adapter-commons'
import sift from 'sift'
import { NullableId, Id, Params, Paginated } from '@feathersjs/feathers'

export interface MemoryServiceStore<T> {
  [key: string]: T
}

export interface MemoryServiceOptions<T = any> extends AdapterServiceOptions {
  store?: MemoryServiceStore<T>
  startId?: number
  matcher?: (query: any) => any
  sorter?: (sort: any) => any
}

const _select = (data: any, params: any, ...args: string[]) => {
  const base = select(params, ...args)

  return base(JSON.parse(JSON.stringify(data)))
}

export class MemoryAdapter<
  Result = any,
  Data = Partial<Result>,
  ServiceParams extends Params = Params,
  PatchData = Partial<Data>
> extends AdapterBase<Result, Data, PatchData, ServiceParams, MemoryServiceOptions<Result>> {
  store: MemoryServiceStore<Result>
  _uId: number

  constructor(options: MemoryServiceOptions<Result> = {}) {
    super({
      id: 'id',
      matcher: sift,
      sorter,
      store: {},
      startId: 0,
      ...options
    })
    this._uId = this.options.startId
    this.store = { ...this.options.store }
  }

  async getEntries(_params?: ServiceParams) {
    const params = _params || ({} as ServiceParams)

    return this._find({
      ...params,
      paginate: false
    })
  }

  getQuery(params: ServiceParams) {
    const { $skip, $sort, $limit, $select, ...query } = params.query || {}

    return {
      query,
      filters: { $skip, $sort, $limit, $select }
    }
  }

  async _find(_params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>
  async _find(_params?: ServiceParams & { paginate: false }): Promise<Result[]>
  async _find(_params?: ServiceParams): Promise<Paginated<Result> | Result[]>
  async _find(params: ServiceParams = {} as ServiceParams): Promise<Paginated<Result> | Result[]> {
    const { paginate } = this.getOptions(params)
    const { query, filters } = this.getQuery(params)

    let values = _.values(this.store)
    const total = values.length
    const hasSkip = filters.$skip !== undefined
    const hasSort = filters.$sort !== undefined
    const hasLimit = filters.$limit !== undefined
    const hasQuery = _.keys(query).length > 0

    if (hasSort) {
      values.sort(this.options.sorter(filters.$sort))
    }

    if (hasQuery || hasLimit || hasSkip) {
      let skipped = 0
      const matcher = this.options.matcher(query)
      const matched = []

      for (let index = 0, length = values.length; index < length; index++) {
        const value = values[index]

        if (hasQuery && !matcher(value, index, values)) {
          continue
        }

        if (hasSkip && filters.$skip > skipped) {
          skipped++
          continue
        }

        matched.push(_select(value, params, this.id))

        if (hasLimit && filters.$limit === matched.length) {
          break
        }
      }

      values = matched
    } else {
      values = values.map((value) => _select(value, params, this.id))
    }

    const result: Paginated<Result> = {
      total: hasQuery ? values.length : total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: filters.$limit === 0 ? [] : values
    }

    if (!paginate) {
      return result.data
    }

    return result
  }

  async _get(id: Id, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    const { query } = this.getQuery(params)

    if (id in this.store) {
      const value = this.store[id]

      if (this.options.matcher(query)(value)) {
        return _select(value, params, this.id)
      }
    }

    throw new NotFound(`No record found for id '${id}'`)
  }

  async _create(data: Partial<Data>, params?: ServiceParams): Promise<Result>
  async _create(data: Partial<Data>[], params?: ServiceParams): Promise<Result[]>
  async _create(data: Partial<Data> | Partial<Data>[], _params?: ServiceParams): Promise<Result | Result[]>
  async _create(
    data: Partial<Data> | Partial<Data>[],
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this._create(current, params)))
    }

    const id = (data as any)[this.id] || this._uId++
    const current = _.extend({}, data, { [this.id]: id })
    const result = (this.store[id] = current)

    return _select(result, params, this.id) as Result
  }

  async _update(id: Id, data: Data, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    if (id === null || Array.isArray(data)) {
      throw new BadRequest("You can not replace multiple instances. Did you mean 'patch'?")
    }

    const oldEntry = await this._get(id)
    // We don't want our id to change type if it can be coerced
    const oldId = (oldEntry as any)[this.id]

    // eslint-disable-next-line eqeqeq
    id = oldId == id ? oldId : id

    this.store[id] = _.extend({}, data, { [this.id]: id })

    return this._get(id, params)
  }

  async _patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>
  async _patch(id: Id, data: PatchData, params?: ServiceParams): Promise<Result>
  async _patch(id: NullableId, data: PatchData, _params?: ServiceParams): Promise<Result | Result[]>
  async _patch(
    id: NullableId,
    data: PatchData,
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('patch', params)) {
      throw new MethodNotAllowed('Can not patch multiple entries')
    }

    const { query } = this.getQuery(params)
    const patchEntry = (entry: Result) => {
      const currentId = (entry as any)[this.id]

      this.store[currentId] = _.extend(this.store[currentId], _.omit(data, this.id))

      return _select(this.store[currentId], params, this.id)
    }

    if (id === null) {
      const entries = await this.getEntries({
        ...params,
        query
      })

      return entries.map(patchEntry)
    }

    return patchEntry(await this._get(id, params)) // Will throw an error if not found
  }

  async _remove(id: null, params?: ServiceParams): Promise<Result[]>
  async _remove(id: Id, params?: ServiceParams): Promise<Result>
  async _remove(id: NullableId, _params?: ServiceParams): Promise<Result | Result[]>
  async _remove(id: NullableId, params: ServiceParams = {} as ServiceParams): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('remove', params)) {
      throw new MethodNotAllowed('Can not remove multiple entries')
    }

    const { query } = this.getQuery(params)

    if (id === null) {
      const entries = await this.getEntries({
        ...params,
        query
      })

      return Promise.all(entries.map((current: any) => this._remove(current[this.id] as Id, params)))
    }

    const entry = await this._get(id, params)

    delete this.store[id]

    return entry
  }
}

export class MemoryService<
  Result = any,
  Data = Partial<Result>,
  ServiceParams extends AdapterParams = AdapterParams,
  PatchData = Partial<Data>
> extends MemoryAdapter<Result, Data, ServiceParams, PatchData> {
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
  async patch(id: NullableId, data: PatchData, params?: ServiceParams): Promise<Result | Result[]> {
    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this._patch(id, data, {
      ...params,
      query
    })
  }

  async remove(id: Id, params?: ServiceParams): Promise<Result>
  async remove(id: null, params?: ServiceParams): Promise<Result[]>
  async remove(id: NullableId, params?: ServiceParams): Promise<Result | Result[]> {
    const { $limit, ...query } = await this.sanitizeQuery(params)

    return this._remove(id, {
      ...params,
      query
    })
  }
}

export function memory<T = any, D = Partial<T>, P extends Params = Params>(
  options: Partial<MemoryServiceOptions<T>> = {}
) {
  return new MemoryService<T, D, P>(options)
}
