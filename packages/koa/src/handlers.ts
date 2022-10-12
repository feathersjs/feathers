import { FeathersError, NotFound } from '@feathersjs/errors'
import { FeathersKoaContext } from './declarations'

export const errorHandler = () => async (ctx: FeathersKoaContext, next: () => Promise<any>) => {
  try {
    await next()

    if (ctx.body === undefined) {
      throw new NotFound(`Path ${ctx.path} not found`)
    }
  } catch (error: any) {
    ctx.response.status = error instanceof FeathersError ? error.code : 500
    ctx.body =
      typeof error.toJSON === 'function'
        ? error.toJSON()
        : {
            message: error.message
          }
  }
}
