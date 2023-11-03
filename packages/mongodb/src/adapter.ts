import {
  ObjectId,
  Collection,
  FindOptions,
  BulkWriteOptions,
  InsertOneOptions,
  DeleteOptions,
  CountDocumentsOptions,
  ReplaceOptions,
  Document
} from 'mongodb'
import { BadRequest, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { _ } from '@feathersjs/commons'
import {
  AdapterBase,
  select,
  AdapterParams,
  AdapterServiceOptions,
  PaginationOptions,
  AdapterQuery,
  getLimit
} from '@feathersjs/adapter-commons'
import { Id, Paginated } from '@feathersjs/feathers'
import { errorHandler } from './error-handler'

export interface MongoDBAdapterOptions extends AdapterServiceOptions {
  Model: Collection | Promise<Collection>
  disableObjectify?: boolean
  useEstimatedDocumentCount?: boolean
}

export interface MongoDBAdapterParams<Q = AdapterQuery>
  extends AdapterParams<Q, Partial<MongoDBAdapterOptions>> {
  pipeline?: Document[]
  mongodb?:
    | BulkWriteOptions
    | FindOptions
    | InsertOneOptions
    | DeleteOptions
    | CountDocumentsOptions
    | ReplaceOptions
}

export type AdapterId = Id | ObjectId

export type NullableAdapterId = AdapterId | null

// Create the service.
export class MongoDbAdapter<
  Result,
  Data = Partial<Result>,
  ServiceParams extends MongoDBAdapterParams<any> = MongoDBAdapterParams,
  PatchData = Partial<Data>
> extends AdapterBase<Result, Data, PatchData, ServiceParams, MongoDBAdapterOptions, AdapterId> {
  constructor(options: MongoDBAdapterOptions) {
    if (!options) {
      throw new Error('MongoDB options have to be provided')
    }

    super({
      id: '_id',
      ...options
    })
  }

  getObjectId(id: AdapterId) {
    if (this.options.disableObjectify) {
      return id
    }

    if (this.id === '_id' && ObjectId.isValid(id)) {
      id = new ObjectId(id.toString())
    }

    return id
  }

  filterQuery(id: NullableAdapterId, params: ServiceParams) {
    const options = this.getOptions(params)
    const { $select, $sort, $limit: _limit, $skip = 0, ...query } = (params.query || {}) as AdapterQuery
    const $limit = getLimit(_limit, options.paginate)
    if (id !== null) {
      query.$and = (query.$and || []).concat({
        [this.id]: this.getObjectId(id)
      })
    }

    if (query[this.id]) {
      query[this.id] = this.getObjectId(query[this.id])
    }

    return {
      filters: { $select, $sort, $limit, $skip },
      query
    }
  }

  getModel(params: ServiceParams = {} as ServiceParams) {
    const { Model } = this.getOptions(params)
    return Promise.resolve(Model)
  }

  async findRaw(params: ServiceParams) {
    const { filters, query } = this.filterQuery(null, params)
    const model = await this.getModel(params)
    const q = model.find(query, { ...params.mongodb })

    if (filters.$select !== undefined) {
      q.project(this.getSelect(filters.$select))
    }

    if (filters.$sort !== undefined) {
      q.sort(filters.$sort)
    }

    if (filters.$skip !== undefined) {
      q.skip(filters.$skip)
    }

    if (filters.$limit !== undefined) {
      q.limit(filters.$limit)
    }

    return q
  }

  async aggregateRaw(params: ServiceParams) {
    const model = await this.getModel(params)
    const pipeline = params.pipeline || []
    const index = pipeline.findIndex((stage: Document) => stage.$feathers)
    const before = index >= 0 ? pipeline.slice(0, index) : []
    const feathersPipeline = this.makeFeathersPipeline(params)
    const after = index >= 0 ? pipeline.slice(index + 1) : pipeline

    return model.aggregate([...before, ...feathersPipeline, ...after])
  }

  makeFeathersPipeline(params: ServiceParams) {
    const { filters, query } = this.filterQuery(null, params)
    const pipeline: Document[] = [{ $match: query }]

    if (filters.$select !== undefined) {
      pipeline.push({ $project: this.getSelect(filters.$select) })
    }

    if (filters.$sort !== undefined) {
      pipeline.push({ $sort: filters.$sort })
    }

    if (filters.$skip !== undefined) {
      pipeline.push({ $skip: filters.$skip })
    }

    if (filters.$limit !== undefined) {
      pipeline.push({ $limit: filters.$limit })
    }
    return pipeline
  }

  getSelect(select: string[] | { [key: string]: number }) {
    if (Array.isArray(select)) {
      if (!select.includes(this.id)) {
        select = [this.id, ...select]
      }
      return select.reduce<{ [key: string]: number }>(
        (value, name) => ({
          ...value,
          [name]: 1
        }),
        {}
      )
    }

    if (!select[this.id]) {
      return {
        ...select,
        [this.id]: 1
      }
    }

    return select
  }

  async _findOrGet(id: NullableAdapterId, params: ServiceParams) {
    return id === null ? await this._find(params) : await this._get(id, params)
  }

  normalizeId<D>(id: NullableAdapterId, data: D): D {
    if (this.id === '_id') {
      // Default Mongo IDs cannot be updated. The Mongo library handles
      // this automatically.
      return _.omit(data, this.id)
    } else if (id !== null) {
      // If not using the default Mongo _id field set the ID to its
      // previous value. This prevents orphaned documents.
      return {
        ...data,
        [this.id]: id
      }
    }
    return data
  }

  async _get(id: AdapterId, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    const {
      query,
      filters: { $select }
    } = this.filterQuery(id, params)
    const projection = $select
      ? {
          projection: {
            ...this.getSelect($select),
            [this.id]: 1
          }
        }
      : {}
    const findOptions: FindOptions = {
      ...params.mongodb,
      ...projection
    }

    return this.getModel(params)
      .then((model) => model.findOne(query, findOptions))
      .then((data) => {
        if (data == null) {
          throw new NotFound(`No record found for id '${id}'`)
        }

        return data
      })
      .catch(errorHandler)
  }

  async _find(params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>
  async _find(params?: ServiceParams & { paginate: false }): Promise<Result[]>
  async _find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>
  async _find(params: ServiceParams = {} as ServiceParams): Promise<Paginated<Result> | Result[]> {
    const { paginate, useEstimatedDocumentCount } = this.getOptions(params)
    const { filters, query } = this.filterQuery(null, params)
    const useAggregation = !params.mongodb && filters.$limit !== 0
    const countDocuments = async () => {
      if (paginate && paginate.default) {
        const model = await this.getModel(params)
        if (useEstimatedDocumentCount && typeof model.estimatedDocumentCount === 'function') {
          return model.estimatedDocumentCount()
        } else {
          return model.countDocuments(query, { ...params.mongodb })
        }
      }
      return Promise.resolve(0)
    }

    const [request, total] = await Promise.all([
      useAggregation ? this.aggregateRaw(params) : this.findRaw(params),
      countDocuments()
    ])

    const page = {
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: filters.$limit === 0 ? [] : ((await request.toArray()) as any as Result[])
    }

    return paginate && paginate.default ? page : page.data
  }

  async _create(data: Data, params?: ServiceParams): Promise<Result>
  async _create(data: Data[], params?: ServiceParams): Promise<Result[]>
  async _create(data: Data | Data[], _params?: ServiceParams): Promise<Result | Result[]>
  async _create(
    data: Data | Data[],
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    const writeOptions = params.mongodb
    const model = await this.getModel(params)
    const setId = (item: any) => {
      const entry = Object.assign({}, item)

      // Generate a MongoId if we use a custom id
      if (this.id !== '_id' && typeof entry[this.id] === 'undefined') {
        return {
          [this.id]: new ObjectId().toHexString(),
          ...entry
        }
      }

      return entry
    }

    const promise = Array.isArray(data)
      ? model
          .insertMany(data.map(setId), writeOptions)
          .then(async (result) =>
            model.find({ _id: { $in: Object.values(result.insertedIds) } }, params.mongodb).toArray()
          )
      : model
          .insertOne(setId(data), writeOptions)
          .then(async (result) => model.findOne({ _id: result.insertedId }, params.mongodb))

    return promise.then(select(params, this.id)).catch(errorHandler)
  }

  async _patch(id: null, data: PatchData | Partial<Result>, params?: ServiceParams): Promise<Result[]>
  async _patch(id: AdapterId, data: PatchData | Partial<Result>, params?: ServiceParams): Promise<Result>
  async _patch(id: NullableAdapterId, data: PatchData | Partial<Result>, _params?: ServiceParams): Promise<Result | Result[]>
  async _patch(
    id: NullableAdapterId,
    _data: PatchData | Partial<Result>,
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('patch', params)) {
      throw new MethodNotAllowed('Can not patch multiple entries')
    }

    const data = this.normalizeId(id, _data)
    const model = await this.getModel(params)
    const {
      query,
      filters: { $select }
    } = this.filterQuery(id, params)
    const updateOptions = { ...params.mongodb }
    const modifier = Object.keys(data).reduce((current, key) => {
      const value = (data as any)[key]

      if (key.charAt(0) !== '$') {
        current.$set = {
          ...current.$set,
          [key]: value
        }
      } else {
        current[key] = value
      }

      return current
    }, {} as any)
    const originalIds = await this._findOrGet(id, {
      ...params,
      query: {
        ...query,
        $select: [this.id]
      },
      paginate: false
    })
    const items = Array.isArray(originalIds) ? originalIds : [originalIds]
    const idList = items.map((item: any) => item[this.id])
    const findParams = {
      ...params,
      paginate: false,
      query: {
        [this.id]: { $in: idList },
        $select
      }
    }

    await model.updateMany(query, modifier, updateOptions)

    return this._findOrGet(id, findParams).catch(errorHandler)
  }

  async _update(id: AdapterId, data: Data, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    if (id === null || Array.isArray(data)) {
      throw new BadRequest("You can not replace multiple instances. Did you mean 'patch'?")
    }

    const model = await this.getModel(params)
    const { query } = this.filterQuery(id, params)
    const replaceOptions = { ...params.mongodb }

    await model.replaceOne(query, this.normalizeId(id, data), replaceOptions)

    return this._findOrGet(id, params).catch(errorHandler)
  }

  async _remove(id: null, params?: ServiceParams): Promise<Result[]>
  async _remove(id: AdapterId, params?: ServiceParams): Promise<Result>
  async _remove(id: NullableAdapterId, _params?: ServiceParams): Promise<Result | Result[]>
  async _remove(
    id: NullableAdapterId | ObjectId,
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('remove', params)) {
      throw new MethodNotAllowed('Can not remove multiple entries')
    }

    const model = await this.getModel(params)
    const {
      query,
      filters: { $select }
    } = this.filterQuery(id, params)
    const deleteOptions = { ...params.mongodb }
    const findParams = {
      ...params,
      paginate: false,
      query: {
        ...query,
        $select
      }
    }

    return this._findOrGet(id, findParams)
      .then(async (items) => {
        await model.deleteMany(query, deleteOptions)
        return items
      })
      .catch(errorHandler)
  }
}
