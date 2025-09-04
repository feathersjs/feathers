import addFormats, { FormatName, FormatOptions, FormatsPluginOptions } from 'ajv-formats'
import { ResolverStatus } from './resolver.js'
import { HookContext } from '@feathersjs/hooks'

export type { FromSchema } from 'json-schema-to-ts'
export { addFormats, FormatName, FormatOptions, FormatsPluginOptions }

export * from './schema.js'
export * from './resolver.js'
export * from './hooks/index.js'
export * from './json-schema.js'
export * from './default-schemas.js'

export * as hooks from './hooks/index.js'
export * as jsonSchema from './json-schema.js'

export type Infer<S extends { _type: any }> = S['_type']

export type Combine<S extends { _type: any }, U> = Pick<Infer<S>, Exclude<keyof Infer<S>, keyof U>> & U

declare module '@feathersjs/feathers' {
  interface Params {
    resolve?: ResolverStatus<any, HookContext>
  }
}
