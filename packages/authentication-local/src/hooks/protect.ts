import omit from 'lodash/omit'
import { HookContext, NextFunction } from '@feathersjs/feathers'

/**
 * @deprecated For reliable safe data representations use Feathers schema dispatch resolvers.
 * @see https://dove.feathersjs.comapi/authentication/local.html#protecting-fields
 */
export default (...fields: string[]) => {
  const o = (current: any) => {
    if (typeof current === 'object' && !Array.isArray(current)) {
      const data = typeof current.toJSON === 'function' ? current.toJSON() : current

      return omit(data, fields)
    }

    return current
  }

  return async (context: HookContext, next?: NextFunction) => {
    if (typeof next === 'function') {
      await next()
    }

    const result = context.dispatch || context.result

    if (result) {
      if (Array.isArray(result)) {
        context.dispatch = result.map(o)
      } else if (result.data && context.method === 'find') {
        context.dispatch = Object.assign({}, result, {
          data: result.data.map(o)
        })
      } else {
        context.dispatch = o(result)
      }

      if (context.params && context.params.provider) {
        context.result = context.dispatch
      }
    }
  }
}
