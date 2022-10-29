import { Id, NullableId, Paginated, Query } from '@feathersjs/feathers'
import { _ } from '@feathersjs/commons'
import { AdapterBase, PaginationOptions, filterQuery } from '@feathersjs/adapter-commons'
import { NotFound } from '@feathersjs/errors'
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

const RETURNING_CLIENTS = ['postgresql', 'pg', 'oracledb', 'mssql']

export class KnexAdapter<
  T,
  D = Partial<T>,
  P extends KnexAdapterParams<any> = KnexAdapterParams
> extends AdapterBase<T, D, P, KnexAdapterOptions> {
  table: string
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
      operators: [...(options.operators || []), '$like', '$notlike', '$ilike', '$and', '$or']
    })

    this.table = options.name
    this.schema = options.schema
  }

  get Model() {
    return this.options.Model
  }

  get fullName() {
    return this.schema ? `${this.schema}.${this.table}` : this.table
  }

  db(params?: P) {
    const { Model, table, schema } = this

    if (params && params.transaction && params.transaction.trx) {
      const { trx } = params.transaction
      // debug('ran %s with transaction %s', fullName, id)
      return schema ? (trx.withSchema(schema).table(table) as Knex.QueryBuilder) : trx(table)
    }
    return schema ? (Model.withSchema(schema).table(table) as Knex.QueryBuilder) : Model(table)
  }

  knexify(knexQuery: Knex.QueryBuilder, query: Query = {}, parentKey?: string): Knex.QueryBuilder {
    const knexify = this.knexify.bind(this)

    return Object.keys(query || {}).reduce((currentQuery, key) => {
      const value = query[key]

      if (_.isObject(value)) {
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

  createQuery(params: P) {
    const { table, id } = this
    const { filters, query } = this.filterQuery(params)
    const builder = this.db(params)

    // $select uses a specific find syntax, so it has to come first.
    if (filters.$select) {
      // always select the id field, but make sure we only select it once
      builder.select(...new Set([...filters.$select, `${table}.${id}`]))
    } else {
      builder.select(`${table}.*`)
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

  filterQuery(params: P) {
    const options = this.getOptions(params)
    const { filters, query } = filterQuery(params?.query || {}, options)

    return { filters, query, paginate: options.paginate }
  }

  async $find(params?: P & { paginate?: PaginationOptions }): Promise<Paginated<T>>
  async $find(params?: P & { paginate: false }): Promise<T[]>
  async $find(params?: P): Promise<Paginated<T> | T[]>
  async $find(params: P = {} as P): Promise<Paginated<T> | T[]> {
    const { filters, paginate } = this.filterQuery(params)
    const builder = params.knex ? params.knex.clone() : this.createQuery(params)
    const countBuilder = builder.clone().clearSelect().clearOrder().count(`${this.table}.${this.id} as total`)

    // Handle $limit
    if (filters.$limit) {
      builder.limit(filters.$limit)
    }

    // Handle $skip
    if (filters.$skip) {
      builder.offset(filters.$skip)
    }

    // provide default sorting if its not set
    if (!filters.$sort) {
      builder.orderBy(`${this.table}.${this.id}`, 'asc')
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

  async _findOrGet(id: NullableId, params?: P) {
    const findParams = {
      ...params,
      paginate: false,
      query: {
        ...params?.query,
        ...(id !== null ? { [`${this.table}.${this.id}`]: id } : {})
      }
    }

    return this.$find(findParams as any) as any as Promise<T[]>
  }

  async $get(id: Id, params: P = {} as P): Promise<T> {
    const data = await this._findOrGet(id, params)

    if (data.length !== 1) {
      throw new NotFound(`No record found for id '${id}'`)
    }

    return data[0]
  }

  async $create(data: D, params?: P): Promise<T>
  async $create(data: D[], params?: P): Promise<T[]>
  async $create(data: D | D[], _params?: P): Promise<T | T[]>
  async $create(_data: D | D[], params: P = {} as P): Promise<T | T[]> {
    const data = _data as any

    if (Array.isArray(data)) {
      return Promise.all(data.map((current) => this.$create(current, params)))
    }

    const client = this.db(params).client.config.client
    const returning = RETURNING_CLIENTS.includes(client as string) ? [this.id] : []
    const rows: any = await this.db(params).insert(data, returning).catch(errorHandler)
    const id = data[this.id] || rows[0][this.id] || rows[0]

    if (!id) {
      return rows as T[]
    }

    return this.$get(id, params)
  }

  async $patch(id: null, data: Partial<D>, params?: P): Promise<T[]>
  async $patch(id: Id, data: Partial<D>, params?: P): Promise<T>
  async $patch(id: NullableId, data: Partial<D>, _params?: P): Promise<T | T[]>
  async $patch(id: NullableId, raw: Partial<D>, params: P = {} as P): Promise<T | T[]> {
    const data = _.omit(raw, this.id)
    const results = await this._findOrGet(id, {
      ...params,
      query: {
        ...params?.query,
        $select: [`${this.table}.${this.id}`]
      }
    })
    const idList = results.map((current: any) => current[this.id])
    const updateParams = {
      ...params,
      query: {
        [`${this.table}.${this.id}`]: { $in: idList },
        ...(params?.query?.$select ? { $select: params?.query?.$select } : {})
      }
    }
    const builder = this.createQuery(updateParams)

    await builder.update(data)

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

  async $update(id: Id, _data: D, params: P = {} as P): Promise<T> {
    const data = _.omit(_data, this.id)
    const oldData = await this.$get(id, params)
    const newObject = Object.keys(oldData).reduce((result: any, key) => {
      if (key !== this.id) {
        // We don't want the id field to be changed
        result[key] = data[key] === undefined ? null : data[key]
      }

      return result
    }, {})

    await this.db(params).update(newObject, '*').where(this.id, id)

    return this.$get(id, params)
  }

  async $remove(id: null, params?: P): Promise<T[]>
  async $remove(id: Id, params?: P): Promise<T>
  async $remove(id: NullableId, _params?: P): Promise<T | T[]>
  async $remove(id: NullableId, params: P = {} as P): Promise<T | T[]> {
    const items = await this._findOrGet(id, params)
    const { query } = this.filterQuery(params)
    const q = this.db(params)
    const idList = items.map((current: any) => current[this.id])

    query[this.id] = { $in: idList }

    // build up the knex query out of the query params
    this.knexify(q, query)

    await q.del().catch(errorHandler)

    if (id !== null) {
      if (items.length === 1) {
        return items[0]
      }

      throw new NotFound(`No record found for id '${id}'`)
    }

    return items
  }
}
