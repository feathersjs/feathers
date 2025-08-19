import { Knex } from 'knex'
import { AdapterServiceOptions, AdapterParams, AdapterQuery } from '@feathersjs/adapter-commons'

export interface KnexAdapterOptions extends AdapterServiceOptions {
  Model: Knex
  name: string
  schema?: string
  tableOptions?: {
    only?: boolean
  }
  extendedOperators?: {
    [key: string]: string
  }
}

export interface KnexAdapterTransaction {
  starting: boolean
  parent?: KnexAdapterTransaction
  committed?: Promise<boolean>
  resolve?: any
  trx?: Knex.Transaction
  id?: number
  promise?: Promise<any>
}

export interface KnexAdapterParams<Q = AdapterQuery> extends AdapterParams<Q, Partial<KnexAdapterOptions>> {
  knex?: Knex.QueryBuilder
  transaction?: KnexAdapterTransaction
}
