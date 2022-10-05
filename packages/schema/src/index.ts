import addFormats, { FormatName, FormatOptions, FormatsPluginOptions } from 'ajv-formats'
import { ResolverStatus } from './resolver'

export type { FromSchema } from 'json-schema-to-ts'
export { addFormats, FormatName, FormatOptions, FormatsPluginOptions }

export * from './schema'
export * from './resolver'
export * from './hooks'
export * from './json-schema'
export * from './default-schemas'

export * as hooks from './hooks'
export * as jsonSchema from './json-schema'

export type Infer<S extends { _type: any }> = S['_type']

export type Combine<S extends { _type: any }, U> = Pick<Infer<S>, Exclude<keyof Infer<S>, keyof U>> & U

declare module '@feathersjs/feathers/lib/declarations' {
  interface Params {
    resolve?: ResolverStatus<any, HookContext>
  }
}
