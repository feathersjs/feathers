import { SchemaOptions, Static, TSchema, Type } from '@sinclair/typebox'
import { ResolverStatus } from './resolver'

export * from './schema'
export * from './resolver'
export * from './hooks'
export * from './query'

export type Infer<S, P extends unknown[] = []> = S extends { _type: any }
  ? S['_type']
  : S extends TSchema
  ? Static<S, P>
  : never

export const Nullable = <T extends TSchema>(type: T, options?: SchemaOptions) =>
  Type.Union([type, Type.Null()], options)

export { Type } from '@sinclair/typebox'

declare module '@feathersjs/feathers/lib/declarations' {
  interface Params {
    resolve?: ResolverStatus<any, HookContext>
  }
}
