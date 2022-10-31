import { Knex } from 'knex'
import { AdapterServiceOptions, AdapterParams, AdapterQuery } from '@feathersjs/adapter-commons'

export interface KnexAdapterOptions extends AdapterServiceOptions {
  Model: Knex
  name: string
  schema?: string
}

export interface KnexAdapterTransaction {
  starting: boolean
  parent?: KnexAdapterTransaction
  committed?: any
  resolve?: any
  trx?: Knex.Transaction
  id?: number
  promise?: Promise<any>
}

export interface KnexAdapterParams<Q = AdapterQuery> extends AdapterParams<Q, Partial<KnexAdapterOptions>> {
  knex?: Knex.QueryBuilder
  transaction?: KnexAdapterTransaction
}
