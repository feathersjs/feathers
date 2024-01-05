import { HookContext, NextFunction } from '@feathersjs/feathers'
import { compose } from '@feathersjs/hooks'
import { Resolver, ResolverStatus } from '../resolver'

const getResult = <H extends HookContext>(context: H) => {
  const isPaginated = context.method === 'find' && context.result.data
  const data = isPaginated ? context.result.data : context.result

  return { isPaginated, data }
}

const runResolvers = async <T, H extends HookContext>(
  resolvers: Resolver<T, H>[],
  data: any,
  ctx: H,
  status?: Partial<ResolverStatus<T, H>>
) => {
  let current: any = data

  for (const resolver of resolvers) {
    if (resolver && typeof resolver.resolve === 'function') {
      current = await resolver.resolve(current, ctx, status)
    }
  }

  return current as T
}

export type ResolverSetting<H extends HookContext> = Resolver<any, H> | Resolver<any, H>[]

export const resolveQuery =
  <H extends HookContext>(...resolvers: Resolver<any, H>[]) =>
  async (context: H, next?: NextFunction) => {
    const data = context?.params?.query || {}
    const query = await runResolvers(resolvers, data, context)

    context.params = {
      ...context.params,
      query
    }

    if (typeof next === 'function') {
      return next()
    }
  }

export const resolveData =
  <H extends HookContext>(...resolvers: Resolver<any, H>[]) =>
  async (context: H, next?: NextFunction) => {
    if (context.data !== undefined) {
      const data = context.data

      const status = {
        originalContext: context
      }

      if (Array.isArray(data)) {
        context.data = await Promise.all(
          data.map((current) => runResolvers(resolvers, current, context, status))
        )
      } else {
        context.data = await runResolvers(resolvers, data, context, status)
      }
    }

    if (typeof next === 'function') {
      return next()
    }
  }

export const resolveResult = <H extends HookContext>(...resolvers: Resolver<any, H>[]) => {
  const virtualProperties = new Set(resolvers.reduce((acc, current) => acc.concat(current.virtualNames), []))

  return async (context: H, next: NextFunction) => {
    if (typeof next !== 'function') {
      throw new Error('The resolveResult hook must be used as an around hook')
    }

    const { $resolve, $select, ...query } = context.params?.query || {}
    const hasVirtualSelects = Array.isArray($select) && $select.some((name) => virtualProperties.has(name))

    const resolve = {
      originalContext: context,
      ...context.params.resolve,
      properties: $resolve || $select
    }

    context.params = {
      ...context.params,
      resolve,
      query: {
        ...query,
        ...(!!$select && !hasVirtualSelects ? { $select } : {})
      }
    }

    await next()

    const status = context.params.resolve
    const { isPaginated, data } = getResult(context)

    const result = Array.isArray(data)
      ? await Promise.all(data.map(async (current) => runResolvers(resolvers, current, context, status)))
      : await runResolvers(resolvers, data, context, status)

    if (isPaginated) {
      context.result.data = result
    } else {
      context.result = result
    }
  }
}

export const DISPATCH = Symbol.for('@feathersjs/schema/dispatch')

export const getDispatchValue = (value: any): any => {
  if (typeof value === 'object' && value !== null) {
    if (value[DISPATCH] !== undefined) {
      return value[DISPATCH]
    }

    if (Array.isArray(value)) {
      return value.map((item) => getDispatchValue(item))
    }
  }

  return value
}

export const getDispatch = (value: any): any =>
  typeof value === 'object' && value !== null && value[DISPATCH] ? value[DISPATCH] : null

export const setDispatch = (current: any, dispatch: any) => {
  Object.defineProperty(current, DISPATCH, {
    value: dispatch,
    enumerable: false,
    configurable: false
  })

  return dispatch
}

export const resolveExternal =
  <H extends HookContext>(...resolvers: Resolver<any, H>[]) =>
  async (context: H, next: NextFunction) => {
    if (typeof next !== 'function') {
      throw new Error('The resolveExternal hook must be used as an around hook')
    }

    await next()

    const existingDispatch = getDispatch(context.result)

    if (existingDispatch !== null) {
      context.dispatch = existingDispatch
    } else {
      const status = context.params.resolve
      const { isPaginated, data } = getResult(context)
      const resolveAndGetDispatch = async (current: any) => {
        const currentExistingDispatch = getDispatch(current)

        if (currentExistingDispatch !== null) {
          return currentExistingDispatch
        }

        const resolved = await runResolvers(resolvers, current, context, status)
        const currentDispatch = Object.keys(resolved).reduce(
          (res, key) => {
            res[key] = getDispatchValue(resolved[key])

            return res
          },
          {} as Record<string, any>
        )

        return setDispatch(current, currentDispatch)
      }

      const result = await (Array.isArray(data)
        ? Promise.all(data.map(resolveAndGetDispatch))
        : resolveAndGetDispatch(data))
      const dispatch = isPaginated
        ? {
            ...context.result,
            data: result
          }
        : result

      context.dispatch = setDispatch(context.result, dispatch)
    }
  }

export const resolveDispatch = resolveExternal

type ResolveAllSettings<H extends HookContext> = {
  data?: {
    create: Resolver<any, H>
    patch: Resolver<any, H>
    update: Resolver<any, H>
  }
  query?: Resolver<any, H>
  result?: Resolver<any, H>
  dispatch?: Resolver<any, H>
}

const dataMethods = ['create', 'update', 'patch'] as const

/**
 * Resolve all resolvers at once.
 *
 * @param map The individual resolvers
 * @returns A combined resolver middleware
 * @deprecated Use individual data, query and external resolvers and hooks instead.
 * @see https://dove.feathersjs.com/guides/cli/service.schemas.html
 */
export const resolveAll = <H extends HookContext>(map: ResolveAllSettings<H>) => {
  const middleware = []

  middleware.push(resolveDispatch(map.dispatch))

  if (map.result) {
    middleware.push(resolveResult(map.result))
  }

  if (map.query) {
    middleware.push(resolveQuery(map.query))
  }

  if (map.data) {
    dataMethods.forEach((name) => {
      if (map.data[name]) {
        const resolver = resolveData(map.data[name])

        middleware.push(async (context: H, next: NextFunction) =>
          context.method === name ? resolver(context, next) : next()
        )
      }
    })
  }

  return compose(middleware)
}
