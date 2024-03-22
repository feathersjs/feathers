import { Id, NullableId, Paginated, Query } from '@feathersjs/feathers'
import { _ } from '@feathersjs/commons'
import { AdapterBase, PaginationOptions, AdapterQuery, getLimit } from '@feathersjs/adapter-commons'
import { BadRequest, MethodNotAllowed, NotFound } from '@feathersjs/errors'
import { Knex } from 'knex'

import { errorHandler } from './error-handler'
import { KnexAdapterOptions, KnexAdapterParams } from './declarations'
const METHODS = {
  $ne: 'whereNot',
  $in: 'whereIn',
  $nin: 'whereNotIn',
  $or: 'orWhere',
  $and: 'andWhere'
}

const OPERATORS = {
  $lt: '<',
  $lte: '<=',
  $gt: '>',
  $gte: '>=',
  $like: 'like',
  $notlike: 'not like',
  $ilike: 'ilike'
}

const RETURNING_CLIENTS = ['postgresql', 'pg', 'oracledb', 'mssql', 'sqlite3']

export class KnexAdapter<
  Result,
  Data = Partial<Result>,
  ServiceParams extends KnexAdapterParams<any> = KnexAdapterParams,
  PatchData = Partial<Data>
> extends AdapterBase<Result, Data, PatchData, ServiceParams, KnexAdapterOptions> {
  schema?: string

  constructor(options: KnexAdapterOptions) {
    if (!options || !options.Model) {
      throw new Error('You must provide a Model (the initialized knex object)')
    }

    if (typeof options.name !== 'string') {
      throw new Error('No table name specified.')
    }

    super({
      id: 'id',
      ...options,
      filters: {
        ...options.filters,
        $and: (value: any) => value
      },
      operators: [...(options.operators || []), '$like', '$notlike', '$ilike']
    })
  }

  get fullName() {
    const { name, schema } = this.getOptions({} as ServiceParams)
    return schema ? `${schema}.${name}` : name
  }

  get Model() {
    return this.getModel()
  }

  getModel(params: ServiceParams = {} as ServiceParams) {
    const { Model } = this.getOptions(params)
    return Model
  }

  db(params?: ServiceParams) {
    const { Model, name, schema } = this.getOptions(params)

    if (params && params.transaction && params.transaction.trx) {
      const { trx } = params.transaction
      // debug('ran %s with transaction %s', fullName, id)
      return schema ? (trx.withSchema(schema).table(name) as Knex.QueryBuilder) : trx(name)
    }

    return schema ? (Model.withSchema(schema).table(name) as Knex.QueryBuilder) : Model(name)
  }

  knexify(knexQuery: Knex.QueryBuilder, query: Query = {}, parentKey?: string): Knex.QueryBuilder {
    const knexify = this.knexify.bind(this)

    return Object.keys(query || {}).reduce((currentQuery, key) => {
      const value = query[key]

      if (_.isObject(value) && !(value instanceof Date)) {
        return knexify(currentQuery, value, key)
      }

      const column = parentKey || key
      const method = METHODS[key as keyof typeof METHODS]

      if (method) {
        if (key === '$or' || key === '$and') {
          // This will create a nested query
          currentQuery.where(function (this: any) {
            for (const condition of value) {
              this[method](function (this: Knex.QueryBuilder) {
                knexify(this, condition)
              })
            }
          })

          return currentQuery
        }

        return (currentQuery as any)[method](column, value)
      }

      const operator = OPERATORS[key as keyof typeof OPERATORS] || '='

      return operator === '='
        ? currentQuery.where(column, value)
        : currentQuery.where(column, operator, value)
    }, knexQuery)
  }

  createQuery(params: ServiceParams = {} as ServiceParams) {
    const { name, id } = this.getOptions(params)
    const { filters, query } = this.filterQuery(params)
    const builder = this.db(params)

    // $select uses a specific find syntax, so it has to come first.
    if (filters.$select) {
      const select = filters.$select.map((column) => (column.includes('.') ? column : `${name}.${column}`))
      // always select the id field, but make sure we only select it once
      builder.select(...new Set([...select, `${name}.${id}`]))
    } else {
      builder.select(`${name}.*`)
    }

    // build up the knex query out of the query params, include $and and $or filters
    this.knexify(builder, {
      ...query,
      ..._.pick(filters, '$and', '$or')
    })

    // Handle $sort
    if (filters.$sort) {
      return Object.keys(filters.$sort).reduce(
        (currentQuery, key) => currentQuery.orderBy(key, filters.$sort[key] === 1 ? 'asc' : 'desc'),
        builder
      )
    }

    return builder
  }

  filterQuery(params: ServiceParams) {
    const options = this.getOptions(params)
    const { $select, $sort, $limit: _limit, $skip = 0, ...query } = (params.query || {}) as AdapterQuery
    const $limit = getLimit(_limit, options.paginate)

    return {
      paginate: options.paginate,
      filters: { $select, $sort, $limit, $skip },
      query
    }
  }

  async _find(params?: ServiceParams & { paginate?: PaginationOptions }): Promise<Paginated<Result>>
  async _find(params?: ServiceParams & { paginate: false }): Promise<Result[]>
  async _find(params?: ServiceParams): Promise<Paginated<Result> | Result[]>
  async _find(params: ServiceParams = {} as ServiceParams): Promise<Paginated<Result> | Result[]> {
    const { filters, paginate } = this.filterQuery(params)
    const { name, id } = this.getOptions(params)
    const builder = params.knex ? params.knex.clone() : this.createQuery(params)
    const countBuilder = builder.clone().clearSelect().clearOrder().count(`${name}.${id} as total`)

    // Handle $limit
    if (filters.$limit) {
      builder.limit(filters.$limit)
    }

    // Handle $skip
    if (filters.$skip) {
      builder.offset(filters.$skip)
    }

    // provide default sorting if its not set
    if (!filters.$sort && builder.client.driverName === 'mssql') {
      builder.orderBy(`${name}.${id}`, 'asc')
    }

    const data = filters.$limit === 0 ? [] : await builder.catch(errorHandler)

    if (paginate && paginate.default) {
      const total = await countBuilder.then((count) => parseInt(count[0] ? count[0].total : 0))

      return {
        total,
        limit: filters.$limit,
        skip: filters.$skip || 0,
        data
      }
    }

    return data
  }

  async _findOrGet(id: NullableId, params?: ServiceParams) {
    if (id !== null) {
      const { name, id: idField } = this.getOptions(params)
      const builder = params.knex ? params.knex.clone() : this.createQuery(params)
      const idQuery = builder.andWhere(`${name}.${idField}`, '=', id).catch(errorHandler)

      return idQuery as Promise<Result[]>
    }

    return this._find({
      ...params,
      paginate: false
    })
  }

  async _get(id: Id, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    const data = await this._findOrGet(id, params)

    if (data.length !== 1) {
      throw new NotFound(`No record found for id '${id}'`)
    }

    return data[0]
  }

  async _create(data: Data, params?: ServiceParams): Promise<Result>
  async _create(data: Data[], params?: ServiceParams): Promise<Result[]>
  async _create(data: Data | Data[], _params?: ServiceParams): Promise<Result | Result[]>
  async _create(
    _data: Data | Data[],
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    const data = _data as any

    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this._create(current, params)))
    }

    const { client } = this.db(params).client.config
    const returning = RETURNING_CLIENTS.includes(client as string) ? [this.id] : []
    const rows: any = await this.db(params)
      .insert(data, returning, { includeTriggerModifications: true })
      .catch(errorHandler)
    const id = data[this.id] || rows[0][this.id] || rows[0]

    if (!id) {
      return rows as Result[]
    }

    return this._get(id, {
      ...params,
      query: _.pick(params?.query || {}, '$select')
    })
  }

  async _patch(id: null, data: PatchData | Partial<Result>, params?: ServiceParams): Promise<Result[]>
  async _patch(id: Id, data: PatchData | Partial<Result>, params?: ServiceParams): Promise<Result>
  async _patch(
    id: NullableId,
    data: PatchData | Partial<Result>,
    _params?: ServiceParams
  ): Promise<Result | Result[]>
  async _patch(
    id: NullableId,
    raw: PatchData | Partial<Result>,
    params: ServiceParams = {} as ServiceParams
  ): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('patch', params)) {
      throw new MethodNotAllowed('Can not patch multiple entries')
    }

    const { name, id: idField } = this.getOptions(params)
    const data = _.omit(raw, this.id)
    const results = await this._findOrGet(id, {
      ...params,
      query: {
        ...params?.query,
        $select: [`${name}.${idField}`]
      }
    })
    const idList = results.map((current: any) => current[idField])
    const updateParams = {
      ...params,
      query: {
        [`${name}.${idField}`]: { $in: idList },
        ...(params?.query?.$select ? { $select: params?.query?.$select } : {})
      }
    }
    const builder = this.createQuery(updateParams)

    await builder.update(data, [], { includeTriggerModifications: true })

    const items = await this._findOrGet(null, updateParams)

    if (id !== null) {
      if (items.length === 1) {
        return items[0]
      } else {
        throw new NotFound(`No record found for id '${id}'`)
      }
    }

    return items
  }

  async _update(id: Id, _data: Data, params: ServiceParams = {} as ServiceParams): Promise<Result> {
    if (id === null || Array.isArray(_data)) {
      throw new BadRequest("You can not replace multiple instances. Did you mean 'patch'?")
    }

    const data = _.omit(_data, this.id)
    const oldData = await this._get(id, params)
    const newObject = Object.keys(oldData).reduce((result: any, key) => {
      if (key !== this.id) {
        // We don't want the id field to be changed
        result[key] = data[key] === undefined ? null : data[key]
      }

      return result
    }, {})

    await this.db(params)
      .update(newObject, '*', { includeTriggerModifications: true })
      .where(this.id, id)
      .catch(errorHandler)

    return this._get(id, params)
  }

  async _remove(id: null, params?: ServiceParams): Promise<Result[]>
  async _remove(id: Id, params?: ServiceParams): Promise<Result>
  async _remove(id: NullableId, _params?: ServiceParams): Promise<Result | Result[]>
  async _remove(id: NullableId, params: ServiceParams = {} as ServiceParams): Promise<Result | Result[]> {
    if (id === null && !this.allowsMulti('remove', params)) {
      throw new MethodNotAllowed('Can not remove multiple entries')
    }

    const items = await this._findOrGet(id, params)
    const { query } = this.filterQuery(params)
    const q = this.db(params)
    const idList = items.map((current: any) => current[this.id])

    query[this.id] = { $in: idList }

    // build up the knex query out of the query params
    this.knexify(q, query)

    await q.delete([], { includeTriggerModifications: true }).catch(errorHandler)

    if (id !== null) {
      if (items.length === 1) {
        return items[0]
      }

      throw new NotFound(`No record found for id '${id}'`)
    }

    return items
  }
}
