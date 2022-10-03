import { ResolverStatus } from './resolver'

export type { FromSchema } from 'json-schema-to-ts'
export * from './schema'
export * from './resolver'
export * from './hooks'
export * from './query'
export * as schemaHooks from './hooks'

export type Infer<S extends { _type: any }> = S['_type']

export type Combine<S extends { _type: any }, U> = Pick<Infer<S>, Exclude<keyof Infer<S>, keyof U>> & U

declare module '@feathersjs/feathers/lib/declarations' {
  interface Params {
    resolve?: ResolverStatus<any, HookContext>
  }
}
