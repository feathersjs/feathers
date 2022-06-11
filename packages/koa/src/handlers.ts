import { NotFound } from '@feathersjs/errors'
import { FeathersKoaContext } from './declarations'

export const errorHandler = () => async (ctx: FeathersKoaContext, next: () => Promise<any>) => {
  try {
    await next()

    if (ctx.body === undefined) {
      throw new NotFound('Not Found')
    }
  } catch (error: any) {
    ctx.response.status = error.code || 500
    ctx.body =
      typeof error.toJSON === 'function'
        ? error.toJSON()
        : {
            message: error.message
          }
  }
}
