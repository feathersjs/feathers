import { _ } from '@feathersjs/commons'
import type { Params } from '@feathersjs/feathers'
export * from './declarations.js'
export * from './service.js'
export * from './query.js'
export * from './sort.js'

// Return a function that filters a result object or array
// and picks only the fields passed as `params.query.$select`
// and additional `otherFields`
export function select(params: Params, ...otherFields: string[]) {
  const queryFields: string[] | undefined = params?.query?.$select

  if (!queryFields) {
    return (result: any) => result
  }

  const resultFields = queryFields.concat(otherFields)
  const convert = (result: any) => _.pick(result, ...resultFields)

  return (result: any) => {
    if (Array.isArray(result)) {
      return result.map(convert)
    }

    return convert(result)
  }
}
