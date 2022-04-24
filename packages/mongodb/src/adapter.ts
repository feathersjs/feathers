import {
  ObjectId, Collection, CollationOptions, Hint, FindOptions, BulkWriteOptions,
  InsertOneOptions, UpdateOptions, DeleteOptions, CountDocumentsOptions, ReplaceOptions
} from 'mongodb'
import { BadRequest, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { _ } from '@feathersjs/commons'
import { AdapterBase, select, AdapterParams, AdapterServiceOptions, PaginationOptions } from '@feathersjs/adapter-commons'
import { NullableId, Query, Id, Paginated } from '@feathersjs/feathers'
import { errorHandler } from './error-handler'

export type MongoDBAdapterOptions = {
  Model: Collection
  disableObjectify?: boolean
  useEstimatedDocumentCount?: boolean
} & AdapterServiceOptions

export interface MongoDBAdapterParams<Q = Query> extends AdapterParams<Q, MongoDBAdapterOptions> {
  mongodb?: Partial<MongoDBAdapterOptions>
  options?: BulkWriteOptions|FindOptions|InsertOneOptions|DeleteOptions|CountDocumentsOptions|ReplaceOptions
  collation?: CollationOptions
  hint?: Hint
}

// Create the service.
export class MongoDbAdapter<T, D = Partial<T>, P extends MongoDBAdapterParams = MongoDBAdapterParams> extends AdapterBase<MongoDBAdapterOptions> {
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

  _objectifyId (id: Id|ObjectId) {
    if (this.options.disableObjectify) {
      return id
    }

    if (this.id === '_id' && ObjectId.isValid(id)) {
      id = new ObjectId(id.toString())
    }

    return id
  }

  _multiOptions (id: NullableId|ObjectId, params: MongoDBAdapterParams = {}) {
    const { query } = this.filterQuery(params)
    const options = Object.assign({ multi: true }, params.mongodb || params.options)

    if (id !== null) {
      options.multi = false
      query.$and = (query.$and || []).concat({ [this.id]: this._objectifyId(id) })
    }

    if (params.collation != null) {
      query.collation = params.collation
    }

    return { query, options }
  }

  _options (params: MongoDBAdapterParams = {}) {
    const { filters, query, paginate } = this.filterQuery(params)
    const options = Object.assign({}, params.mongodb || params.options)
    return { filters, query, paginate, options }
  }

  _getSelect (select: string[]|{ [key: string]: number }) {
    if (Array.isArray(select)) {
      return select.reduce<{ [key: string]: number }>((value, name) => ({
        ...value,
        [name]: 1
      }), {})
    }

    return select
  }

  async _findOrGet (id: NullableId, params: P) {
    return id === null ? await this._find(params) : await this._get(id, params)
  }

  _normalizeId (id: NullableId, data: Partial<D>) {
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

  async _find (params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>;
  async _find (params?: P & { paginate: false }): Promise<T[]>;
  async _find (params?: P): Promise<Paginated<T>|T[]>;
  async _find (params: P = {} as P): Promise<Paginated<T>|T[]> {
    // Start with finding all, and limit when necessary.
    const { filters, query, paginate, options } = this._options(params)

    if (query[this.id]) {
      query[this.id] = this._objectifyId(query[this.id])
    }

    const q = this.Model.find(query, options as FindOptions)

    if (filters.$select) {
      q.project(this._getSelect(filters.$select))
    }

    if (filters.$sort) {
      q.sort(filters.$sort)
    }

    if (params.collation != null) {
      q.collation(params.collation)
    }

    if (params.hint) {
      q.hint(params.hint)
    }

    if (filters.$limit) {
      q.limit(filters.$limit)
    }

    if (filters.$skip) {
      q.skip(filters.$skip)
    }

    let runQuery = async (total: number) => {
      return await q.toArray().then((data: any) => {
        return {
          total,
          limit: filters.$limit,
          skip: filters.$skip || 0,
          data: data as T[]
        }
      })
    }

    if (filters.$limit === 0) {
      runQuery = async total => {
        return await Promise.resolve({
          total,
          limit: filters.$limit,
          skip: filters.$skip || 0,
          data: []
        })
      }
    }

    if (paginate && paginate.default) {
      if (this.options.useEstimatedDocumentCount && (typeof this.Model.estimatedDocumentCount === 'function')) {
        return this.Model.estimatedDocumentCount().then(runQuery)
      }

      return this.Model.countDocuments(query, options as CountDocumentsOptions).then(runQuery)
    }

    return runQuery(0).then(page => page.data)
  }

  async _get (id: Id, params: P = {} as P): Promise<T> {
    const { query, options } = this._options(params)

    query.$and = (query.$and || []).concat({ [this.id]: this._objectifyId(id) })

    return this.Model.findOne(query, options as FindOptions).then(data => {
      if (data == null) {
        throw new NotFound(`No record found for id '${id}'`)
      }

      return data
    }).then(select(params, this.id)).catch(errorHandler)
  }

  async _create (data: Partial<D>, params?: P): Promise<T>;
  async _create (data: Partial<D>[], params?: P): Promise<T[]>;
  async _create (data: Partial<D>|Partial<D>[], _params?: P): Promise<T|T[]>;
  async _create (data: Partial<D>|Partial<D>[], params: P = {} as P): Promise<T|T[]> {
    const { options } = this._options(params)
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

    if (Array.isArray(data) && !this.allowsMulti('create', params)) {
      throw new MethodNotAllowed('Can not create multiple entries')
    }

    const promise = Array.isArray(data)
      ? this.Model.insertMany(data.map(setId), options as BulkWriteOptions).then(async result =>
        await Promise.all(Object.values(result.insertedIds).map(async _id => await this.Model.findOne({ _id }, options as FindOptions)))
      )
      : this.Model.insertOne(setId(data), options as InsertOneOptions).then(async result =>
        await this.Model.findOne({ _id: result.insertedId }, options as FindOptions)
      )

    return promise.then(select(params, this.id)).catch(errorHandler)
  }

  async _patch (id: null, data: Partial<D>, params?: P): Promise<T[]>;
  async _patch (id: Id, data: Partial<D>, params?: P): Promise<T>;
  async _patch (id: NullableId, data: Partial<D>, _params?: P): Promise<T|T[]>;
  async _patch (id: NullableId, data: Partial<D>, params: P = {} as P): Promise<T|T[]> {
    const { query, options } = this._multiOptions(id, params)

    if (id === null && !this.allowsMulti('patch', params)) {
      throw new MethodNotAllowed('Can not patch multiple entries')
    }

    const remapModifier = this._remapModifiers(this._normalizeId(id, data))
    const idParams = {
      ...params,
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

    await this.Model.updateMany(query, remapModifier, options as UpdateOptions)

    return this._findOrGet(id, findParams)
      .then(select(params, this.id))
      .catch(errorHandler)
  }

  async _update (id: Id, data: D, params: P = {} as P): Promise<T> {
    if (Array.isArray(data) || id === null) {
      return await Promise.reject(
        new BadRequest('Not replacing multiple records. Did you mean `patch`?')
      )
    }

    const { query, options } = this._multiOptions(id, params)

    await this.Model.replaceOne(query, this._normalizeId(id, data), options as ReplaceOptions)

    return this._findOrGet(id, params)
      .then(select(params, this.id))
      .catch(errorHandler)
  }

  async _remove (id: null, params?: P): Promise<T[]>;
  async _remove (id: Id, params?: P): Promise<T>;
  async _remove (id: NullableId, _params?: P): Promise<T|T[]>;
  async _remove (id: NullableId, params: P = {} as P): Promise<T|T[]> {
    const { query, options } = this._multiOptions(id, params)

    if (id === null && !this.allowsMulti('remove', params)) {
      throw new MethodNotAllowed('Can not remove multiple entries')
    }

    const findParams = Object.assign({}, params, {
      paginate: false,
      query: params.query
    })

    return this._findOrGet(id, findParams)
      .then(async items => {
        await this.Model.deleteMany(query, options as DeleteOptions)
        return items
      })
      .then(select(params, this.id))
      .catch(errorHandler)
  }
}
