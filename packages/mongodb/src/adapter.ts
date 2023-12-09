import {
  ObjectId,
  Collection,
  FindOptions,
  BulkWriteOptions,
  InsertOneOptions,
  DeleteOptions,
  CountDocumentsOptions,
  ReplaceOptions,
  FindOneAndReplaceOptions,
  FindOneAndUpdateOptions,
  Document,
  FindOneAndDeleteOptions
} from 'mongodb'
import { BadRequest, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { _ } from '@feathersjs/commons'
import {
  AdapterBase,
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
    | FindOneAndReplaceOptions
    | FindOneAndDeleteOptions
}

export type AdapterId = Id | ObjectId

export type NullableAdapterId = AdapterId | null

type Page = {
  total: number
  data: any
}

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
    const q = model.find(query, params.mongodb)

    if (filters.$sort !== undefined) {
      q.sort(filters.$sort)
    }

    if (filters.$select !== undefined) {
      q.project(this.getProjection(filters.$select))
    }

    if (filters.$skip !== undefined) {
      q.skip(filters.$skip)
    }

    if (filters.$limit !== undefined) {
      q.limit(filters.$limit)
    }

    return q
  }

  /* TODO: Remove $out and $merge stages, else it returns an empty cursor. I think its same to assume this is primarily for querying. */
  async aggregateRaw(params: ServiceParams) {
    const model = await this.getModel(params)
    const pipeline = params.pipeline || []
    const index = pipeline.findIndex((stage: Document) => stage.$feathers)
    const before = index >= 0 ? pipeline.slice(0, index) : []
    const feathersPipeline = this.makeFeathersPipeline(params)
    const after = index >= 0 ? pipeline.slice(index + 1) : pipeline

    return model.aggregate([...before, ...feathersPipeline, ...after], params.mongodb)
  }

  makeFeathersPipeline(params: ServiceParams) {
    const { filters, query } = this.filterQuery(null, params)
    const pipeline: Document[] = [{ $match: query }]

    if (filters.$sort !== undefined) {
      pipeline.push({ $sort: filters.$sort })
    }

    if (filters.$select !== undefined) {
      pipeline.push({ $project: this.getProjection(filters.$select) })
    }

    if (filters.$skip !== undefined) {
      pipeline.push({ $skip: filters.$skip })
    }

    if (filters.$limit !== undefined) {
      pipeline.push({ $limit: filters.$limit })
    }

    return pipeline
  }

  getProjection(select?: string[] | { [key: string]: number }) {
    if (!select) {
      return undefined
    }
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

  async countDocuments(params: ServiceParams) {
    const { useEstimatedDocumentCount } = this.getOptions(params)
    const { query } = this.filterQuery(null, params)

    if (params.pipeline) {
      const aggregateParams = {
        ...params,
        query: {
          ...params.query,
          $select: [this.id],
          $sort: undefined,
          $skip: undefined,
          $limit: undefined
        }
      }
      const result = await this.aggregateRaw(aggregateParams).then((result) => result.toArray())
      return result.length
    }

    const model = await this.getModel(params)

    if (useEstimatedDocumentCount && typeof model.estimatedDocumentCount === 'function') {
      return model.estimatedDocumentCount()
    }

    return model.countDocuments(query, params.mongodb)
  }

  async _get(id: AdapterId, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    const {
      query,
      filters: { $select }
    } = this.filterQuery(id, params)

    if (params.pipeline) {
      /* We wouldn't need this aggregateParams if aggregateRaw took signature aggregateRaw(id, params) instead of just aggregateRaw(params). Because aggregateRaw ultimately calls makeFeathersPipeline(params) without id. That also makes aggregateRaw more flexible and consistent with other methods like _findOrGet. But, its a breaking change. */
      const aggregateParams = {
        ...params,
        query: {
          ...params.query,
          $limit: 1,
          $and: (params.query.$and || []).concat({
            [this.id]: this.getObjectId(id)
          })
        }
      }
      return this.aggregateRaw(aggregateParams)
        .then((result) => result.toArray())
        .then(([result]) => {
          if (result === undefined) {
            throw new NotFound(`No record found for id '${id}'`)
          }

          return result
        })
        .catch(errorHandler)
    }

    const findOptions: FindOptions = {
      ...params.mongodb,
      projection: this.getProjection($select)
    }

    return this.getModel(params)
      .then((model) => model.findOne(query, findOptions))
      .then((result) => {
        if (result == null) {
          throw new NotFound(`No record found for id '${id}'`)
        }

        return result
      })
      .catch(errorHandler)
  }

  async _find(params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>
  async _find(params?: ServiceParams & { paginate: false }): Promise<Result[]>
  async _find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>
  async _find(params: ServiceParams = {} as ServiceParams): Promise<Paginated<Result> | Result[]> {
    const { paginate } = this.getOptions(params)
    const { filters } = this.filterQuery(null, params)

    const page = ({ total, data }: Page) => {
      if (paginate && paginate.default) {
        return {
          limit: filters.$limit,
          skip: filters.$skip || 0,
          total,
          data
        }
      }
      return data
    }

    if (filters.$limit === 0) {
      return page({
        total: await this.countDocuments(params),
        data: [] as Result[]
      })
    }

    const result = params.pipeline ? this.aggregateRaw(params) : this.findRaw(params)

    if (params.paginate === false) {
      const data = await result.then((result) => result.toArray())
      return page({
        total: data.length,
        data: data as Result[]
      })
    }

    const [data, total] = await Promise.all([
      result.then((result) => result.toArray()),
      this.countDocuments(params)
    ])

    return page({
      total,
      data: data as Result[]
    })
  }

  async _create(data: Data, params?: ServiceParams): Promise<Result>
  async _create(data: Data[], params?: ServiceParams): Promise<Result[]>
  async _create(data: Data | Data[], _params?: ServiceParams): Promise<Result | Result[]>
  async _create(
    data: Data | Data[],
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
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
    const findOptions: FindOptions = {
      ...params.mongodb,
      projection: this.getProjection(params.query?.$select)
    }

    const promise = Array.isArray(data)
      ? model
          .insertMany(data.map(setId), params.mongodb)
          .then((result) =>
            model.find({ _id: { $in: Object.values(result.insertedIds) } }, findOptions).toArray()
          )
      : model
          .insertOne(setId(data), params.mongodb)
          .then((result) => model.findOne({ _id: result.insertedId }, findOptions))

    return promise.catch(errorHandler)
  }

  async _patch(id: null, data: PatchData, params?: ServiceParams): Promise<Result[]>
  async _patch(id: AdapterId, data: PatchData, params?: ServiceParams): Promise<Result>
  async _patch(id: NullableAdapterId, data: PatchData, _params?: ServiceParams): Promise<Result | Result[]>
  async _patch(
    id: NullableAdapterId,
    _data: PatchData,
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('patch', params)) {
      throw new MethodNotAllowed('Can not patch multiple entries')
    }

    const data = this.normalizeId(id, _data)
    const model = await this.getModel(params)
    const {
      query,
      filters: { $sort, $select }
    } = this.filterQuery(id, params)

    const replacement = Object.keys(data).reduce((current, key) => {
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

    if (id === null) {
      const findParams = {
        ...params,
        paginate: false,
        query: {
          ...params.query,
          $select: [this.id]
        }
      }

      return this._find(findParams)
        .then(async (result) => {
          const idList = (result as Result[]).map((item: any) => item[this.id])
          await model.updateMany({ [this.id]: { $in: idList } }, replacement, params.mongodb)
          return this._find({
            ...findParams,
            query: {
              [this.id]: { $in: idList },
              $sort,
              $select
            }
          })
        })
        .catch(errorHandler)
    }

    if (params.pipeline) {
      const { query: findQuery } = this.filterQuery(null, params)

      if (Object.keys(findQuery).length === 0) {
        await model.updateOne({ [this.id]: id }, replacement, params.mongodb)
        return this._get(id, params)
      }

      return this._get(id, params)
        .then(async () => {
          await model.updateOne({ [this.id]: id }, replacement, params.mongodb)
          return this._get(id, {
            ...params,
            query: { $select }
          })
        })
        .catch(errorHandler)
    }

    const updateOptions: FindOneAndUpdateOptions = {
      ...(params.mongodb as FindOneAndUpdateOptions),
      returnDocument: 'after',
      projection: this.getProjection($select)
    }

    return model
      .findOneAndUpdate(query, replacement, updateOptions)
      .then((result) => {
        if (result.value === null) {
          throw new NotFound(`No record found for id '${id}'`)
        }
        return result.value as Result
      })
      .catch(errorHandler)
  }

  async _update(id: AdapterId, data: Data, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    if (id === null || Array.isArray(data)) {
      throw new BadRequest("You can not replace multiple instances. Did you mean 'patch'?")
    }

    const {
      query,
      filters: { $select }
    } = this.filterQuery(id, params)
    const model = await this.getModel(params)
    const replacement = this.normalizeId(id, data)

    if (params.pipeline) {
      const { query: findQuery } = this.filterQuery(null, params)

      if (Object.keys(findQuery).length === 0) {
        await model.replaceOne({ [this.id]: id }, replacement, params.mongodb)
        return this._get(id, params)
      }

      return this._get(id, params)
        .then(async () => {
          await model.replaceOne({ [this.id]: id }, replacement, params.mongodb)
          return this._get(id, {
            ...params,
            query: { $select }
          })
        })
        .catch(errorHandler)
    }

    const replaceOptions: FindOneAndReplaceOptions = {
      ...(params.mongodb as FindOneAndReplaceOptions),
      returnDocument: 'after',
      projection: this.getProjection($select)
    }

    return model
      .findOneAndReplace(query, replacement, replaceOptions)
      .then((result) => {
        if (result.value === null) {
          throw new NotFound(`No record found for id '${id}'`)
        }
        return result.value as Result
      })
      .catch(errorHandler)
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
    const { query } = this.filterQuery(id, params)
    const findParams = {
      ...params,
      paginate: false
    }

    if (id === null) {
      return this._find(findParams)
        .then(async (result) => {
          const idList = (result as Result[]).map((item: any) => item[this.id])
          await model.deleteMany({ [this.id]: { $in: idList } }, params.mongodb)
          return result
        })
        .catch(errorHandler)
    }

    if (params.pipeline) {
      return this._get(id, params)
        .then(async (result) => {
          await model.deleteOne({ [this.id]: id }, params.mongodb)
          return result
        })
        .catch(errorHandler)
    }

    const deleteOptions: FindOneAndDeleteOptions = {
      ...(params.mongodb as FindOneAndDeleteOptions),
      projection: this.getProjection(params.query?.$select)
    }

    return model
      .findOneAndDelete(query, deleteOptions)
      .then((result) => {
        if (result.value === null) {
          throw new NotFound(`No record found for id '${id}'`)
        }
        return result.value as Result
      })
      .catch(errorHandler)
  }
}

// function hasAggregation(params: AdapterParams) {
//   if (!params.query || Object.keys(params.query).length === 0) {
//     return false
//   }
//   return true
// }
