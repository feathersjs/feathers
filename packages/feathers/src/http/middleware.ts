import type { Params, Service } from '../index.js'
import type { HookContext, NextFunction } from '../hooks/index.js'
import { BadRequest, FeathersError } from '../errors.js'

interface RouteLookup {
  service: Service
  params: {
    [key: string]: any
  }
}

export const BODY_METHODS = ['POST', 'PUT', 'PATCH']

export interface HandlerContext extends HookContext {
  request: Request
  data: Record<string, unknown> | null
  params: Params & { http: Record<string, unknown> }
  lookup: RouteLookup | null
}

export type Middleware = (context: HandlerContext, next: NextFunction) => Promise<void>

export function bodyParser() {
  return async (context: HandlerContext, next: NextFunction) => {
    const contentType = context.request.headers.get('content-type')

    if (BODY_METHODS.includes(context.request.method)) {
      const request = context.request.clone()

      try {
        if (contentType?.includes('application/json')) {
          context.data = await request.json()
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          context.data = Object.fromEntries(new URLSearchParams(await request.text()))
        } else {
          throw new Error('Invalid content type')
        }
      } catch (error) {
        throw new BadRequest('Invalid request body')
      }
    }

    return next()
  }
}

export function queryParser() {
  return async (context: HandlerContext, next: NextFunction) => {
    const { request } = context
    const url = new URL(request.url)

    context.params = {
      ...context.params,
      query: Object.fromEntries(url.searchParams)
    }

    return next()
  }
}

export function errorHandler() {
  return async (context: HandlerContext, next: NextFunction) => {
    try {
      await next()
    } catch (error: any) {
      const errorData = error.toJSON ? error.toJSON() : { message: error.message }
      const status = error instanceof FeathersError ? error.code || 500 : 500
      const origin = context.request.headers.get('origin') || '*'

      context.result = Response.json(errorData, {
        status,
        headers: {
          'access-control-allow-origin': origin
        }
      })
    }
  }
}
