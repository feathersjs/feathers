import type { Params, Service, Query } from '../index.js'
import type { HookContext, NextFunction } from '../hooks/index.js'
import { BadRequest, FeathersError } from '../errors.js'
import qs from 'qs'

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

function formDataToObject(formData: FormData): Record<string, File | string | (File | string)[]> {
  const result: Record<string, File | string | (File | string)[]> = {}

  for (const key of new Set(formData.keys())) {
    const values = formData.getAll(key) as (File | string)[]
    result[key] = values.length === 1 ? values[0] : values
  }

  return result
}

export function bodyParser() {
  return async (context: HandlerContext, next: NextFunction) => {
    const contentType = context.request.headers.get('content-type')

    if (BODY_METHODS.includes(context.request.method)) {
      try {
        if (contentType?.includes('application/json')) {
          const request = context.request.clone()
          context.data = await request.json()
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const request = context.request.clone()
          context.data = Object.fromEntries(new URLSearchParams(await request.text()))
        } else if (contentType?.includes('multipart/form-data')) {
          context.data = formDataToObject(await request.formData())
        } else {
          // Stream all other content types directly to the service
          context.data = context.request.body as any
        }
      } catch (error) {
        throw new BadRequest('Invalid request body')
      }
    }

    return next()
  }
}

export function queryParser(parser: (query: string) => Query = qs.parse) {
  return async (context: HandlerContext, next: NextFunction) => {
    const { request } = context
    const url = new URL(request.url)

    context.params = {
      ...context.params,
      query: parser(url.search.substring(1))
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
