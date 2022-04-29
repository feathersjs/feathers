import {
  ObjectId, Collection, FindOptions, BulkWriteOptions,
  InsertOneOptions, DeleteOptions, CountDocumentsOptions, ReplaceOptions
} from 'mongodb'
import { NotFound } from '@feathersjs/errors'
import { _ } from '@feathersjs/commons'
import { AdapterBase, select, AdapterParams, AdapterServiceOptions, PaginationOptions, AdapterQuery } from '@feathersjs/adapter-commons'
import { NullableId, Query, Id, Paginated } from '@feathersjs/feathers'
import { errorHandler } from './error-handler'

export interface MongoDBAdapterOptions extends AdapterServiceOptions {
  Model: Collection|Promise<Collection>,
  disableObjectify?: boolean,
  useEstimatedDocumentCount?: boolean
}

export interface MongoDBAdapterParams<Q = Query> extends AdapterParams<Q, MongoDBAdapterOptions> {
  mongodb?: BulkWriteOptions|FindOptions|InsertOneOptions|DeleteOptions|CountDocumentsOptions|ReplaceOptions
}

// Create the service.
export class MongoDbAdapter<T, D = Partial<T>, P extends MongoDBAdapterParams = MongoDBAdapterParams>
    extends AdapterBase<T, D, P, MongoDBAdapterOptions> {
  constructor (options: MongoDBAdapterOptions) {
    if (!options) {
      throw new Error('MongoDB options have to be provided')
    }

    super({
      id: '_id',
      ...options
    })
  }

  get Model () {
    return this.options.Model
  }

  set Model (value) {
    this.options.Model = value
  }

  getObjectId (id: Id|ObjectId) {
    if (this.options.disableObjectify) {
      return id
    }

    if (this.id === '_id' && ObjectId.isValid(id)) {
      id = new ObjectId(id.toString())
    }

    return id
  }

  filterQuery (id: NullableId, params: P) {
    const { $select, $sort, $limit, $skip, ...query } = (params.query || {}) as AdapterQuery;

    if (id !== null) {
      query.$and = (query.$and || []).concat({ [this.id]: this.getObjectId(id) })
    }

    if (query[this.id]) {
      query[this.id] = this.getObjectId(query[this.id])
    }

    return {
      filters: { $select, $sort, $limit, $skip },
      query
    }
  }

  getSelect (select: string[]|{ [key: string]: number }) {
    if (Array.isArray(select)) {
      return select.reduce<{ [key: string]: number }>((value, name) => ({
        ...value,
        [name]: 1
      }), {})
    }

    return select
  }

  async _findOrGet (id: NullableId, params: P) {
    return id === null ? await this.$find(params) : await this.$get(id, params)
  }

  _normalizeId (id: NullableId, data: Partial<D>): Partial<D> {
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

  // Map stray records into $set
  _remapModifiers (data: { [key: string]: any }) {
    let set: { [key: string]: any } = {}
    // Step through the rooot
    for (const key of Object.keys(data)) {
      // Check for keys that aren't modifiers
      if (key.charAt(0) !== '$') {
        // Move them to set, and remove their record
        set[key] = data[key]
        delete data[key]
      }
      // If the '$set' modifier is used, add that to the temp variable
      if (key === '$set') {
        set = Object.assign(set, data[key])
        delete data[key]
      }
    }
    // If we have a $set, then attach to the data object
    if (Object.keys(set).length > 0) {
      (data as any).$set = set
    }
    return data
  }

  async $get (id: Id, params: P = {} as P): Promise<T> {
    const { Model } = this.getOptions(params);
    const { query, filters: { $select } } = this.filterQuery(id, params);
    const projection = $select ? {
      projection: {
        ...this.getSelect($select),
        [this.id]: 1
      }
    } : {}
    const findOptions: FindOptions = {
      ...params.mongodb,
      ...projection
    }

    return Promise.resolve(Model).then(model => model.findOne(query, findOptions))
      .then(data => {
        if (data == null) {
          throw new NotFound(`No record found for id '${id}'`)
        }

        return data
      })
      .catch(errorHandler)
  }

  async $find (params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  async $find (params?: P & { paginate: false }): Promise<T[]>;
  async $find (params?: P): Promise<Paginated<T>|T[]>;
  async $find (params: P = {} as P): Promise<Paginated<T>|T[]> {
    const { filters, query } = this.filterQuery(null, params)
    const { paginate, Model, useEstimatedDocumentCount } = this.getOptions(params)
    const findOptions = { ...params.mongodb }
    const model = await Promise.resolve(Model)
    const q = model.find(query, findOptions)

    if (filters.$select !== undefined) {
      q.project(this.getSelect(filters.$select))
    }

    if (filters.$sort !== undefined) {
      q.sort(filters.$sort)
    }

    if (filters.$limit !== undefined) {
      q.limit(filters.$limit)
    }

    if (filters.$skip !== undefined) {
      q.skip(filters.$skip)
    }

    const runQuery = async (total: number) => ({
      total,
      limit: filters.$limit,
      skip: filters.$skip || 0,
      data: filters.$limit === 0 ? [] : (await q.toArray()) as any as T[]
    })

    if (paginate && paginate.default) {
      if (useEstimatedDocumentCount && (typeof model.estimatedDocumentCount === 'function')) {
        return model.estimatedDocumentCount().then(runQuery)
      }

      return model.countDocuments(query, findOptions).then(runQuery)
    }

    return runQuery(0).then(page => page.data)
  }

  async $create (data: Partial<D>, params?: P): Promise<T>;
  async $create (data: Partial<D>[], params?: P): Promise<T[]>;
  async $create (data: Partial<D>|Partial<D>[], _params?: P): Promise<T|T[]>;
  async $create (data: Partial<D>|Partial<D>[], params: P = {} as P): Promise<T|T[]> {
    const writeOptions = params.mongodb
    const { Model } = this.getOptions(params)
    const model = await Promise.resolve(Model)
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
      ? model.insertMany(data.map(setId), writeOptions).then(async result =>
        Promise.all(Object.values(result.insertedIds).map(async _id => await model.findOne({ _id })))
      )
      : model.insertOne(setId(data), writeOptions).then(async result =>
        await model.findOne({ _id: result.insertedId })
      )

    return promise.then(select(params, this.id)).catch(errorHandler)
  }

  async $patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  async $patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  async $patch (id: NullableId, data: Partial<D>, _params?: P): Promise<T|T[]>;
  async $patch (id: NullableId, data: Partial<D>, params: P = {} as P): Promise<T|T[]> {
    const { Model } = this.getOptions(params)
    const model = await Promise.resolve(Model)
    const { query } = this.filterQuery(id, params)
    const updateOptions = { ...params.mongodb }
    const remapModifier = this._remapModifiers(this._normalizeId(id, data))
    const idParams = {
      ...params,
      query,
      paginate: false
    }
    const originalItems = await this._findOrGet(id, idParams)
    const items = Array.isArray(originalItems) ? originalItems : [originalItems]
    const idList = items.map((item: any) => item[this.id])
    const findParams = {
      ...params,
      paginate: false,
      query: { [this.id]: { $in: idList } }
    }

    await model.updateMany(query, remapModifier, updateOptions)

    return this._findOrGet(id, findParams)
      .then(select(params, this.id))
      .catch(errorHandler)
  }

  async $update (id: Id, data: D, params: P = {} as P): Promise<T> {
    const { Model } = this.getOptions(params)
    const model = await Promise.resolve(Model)
    const { query } = this.filterQuery(id, params)
    const replaceOptions = { ...params.mongodb }

    await model.replaceOne(query, this._normalizeId(id, data), replaceOptions)

    return this._findOrGet(id, params)
      .then(select(params, this.id))
      .catch(errorHandler)
  }

  async $remove (id: null, params?: P): Promise<T[]>;
  async $remove (id: Id, params?: P): Promise<T>;
  async $remove (id: NullableId, _params?: P): Promise<T|T[]>;
  async $remove (id: NullableId, params: P = {} as P): Promise<T|T[]> {
    const { Model } = this.getOptions(params)
    const model = await Promise.resolve(Model)
    const { query } = this.filterQuery(id, params)
    const deleteOptions = { ...params.mongodb }
    const findParams = {
      ...params,
      paginate: false,
      query
    }

    return this._findOrGet(id, findParams)
      .then(async items => {
        await model.deleteMany(query, deleteOptions)
        return items
      })
      .then(select(params, this.id))
      .catch(errorHandler)
  }
}
