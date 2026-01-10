import {
  getManager,
  HookContextData,
  HookManager,
  HookMap as BaseHookMap,
  hooks,
  Middleware,
  collect
} from './hooks/index.js'
import {
  Service,
  ServiceOptions,
  HookContext,
  FeathersService,
  HookMap,
  AroundHookFunction,
  HookFunction,
  HookType
} from './declarations.js'
import { defaultServiceArguments, getHookMethods } from './service.js'

type ConvertedMap = { [type in HookType]: ReturnType<typeof convertHookData> }

type HookStore = {
  around: { [method: string]: AroundHookFunction[] }
  before: { [method: string]: HookFunction[] }
  after: { [method: string]: HookFunction[] }
  error: { [method: string]: HookFunction[] }
  collected: { [method: string]: AroundHookFunction[] }
  collectedAll: { before?: AroundHookFunction[]; after?: AroundHookFunction[] }
  /**
   * Methods that should receive "all" hooks. Methods not in this set
   * will only receive their specific hooks, not "all" hooks.
   */
  allMethods?: Set<string>
}

type HookEnabled = { __hooks: HookStore }

const types: HookType[] = ['before', 'after', 'error', 'around']

const isType = (value: any): value is HookType => types.includes(value)

// Converts different hook registration formats into the
// same internal format
export function convertHookData(input: any) {
  const result: { [method: string]: HookFunction[] | AroundHookFunction[] } = {}

  if (Array.isArray(input)) {
    result.all = input
  } else if (typeof input !== 'object') {
    result.all = [input]
  } else {
    for (const key of Object.keys(input)) {
      const value = input[key]
      result[key] = Array.isArray(value) ? value : [value]
    }
  }

  return result
}

export function collectHooks(target: HookEnabled, method: string, includeAll: boolean = true) {
  const { collected, collectedAll, around, allMethods } = target.__hooks

  // Only include "all" hooks if includeAll is true AND
  // (allMethods is not defined OR method is in allMethods)
  const shouldIncludeAll = includeAll && (!allMethods || allMethods.has(method))

  return [
    ...(shouldIncludeAll ? around.all || [] : []),
    ...(around[method] || []),
    ...(shouldIncludeAll ? collectedAll.before || [] : []),
    ...(collected[method] || []),
    ...(shouldIncludeAll ? collectedAll.after || [] : [])
  ] as AroundHookFunction[]
}

// Add `.hooks` functionality to an object
export function enableHooks(object: any) {
  const store: HookStore = {
    around: {},
    before: {},
    after: {},
    error: {},
    collected: {},
    collectedAll: {}
  }

  Object.defineProperty(object, '__hooks', {
    configurable: true,
    value: store,
    writable: true
  })

  return function registerHooks(this: HookEnabled, input: HookMap<any, any>) {
    const store = this.__hooks
    const map = Object.keys(input).reduce((map, type) => {
      if (!isType(type)) {
        throw new Error(`'${type}' is not a valid hook type`)
      }

      map[type] = convertHookData(input[type])

      return map
    }, {} as ConvertedMap)
    const types = Object.keys(map) as HookType[]

    types.forEach((type) =>
      Object.keys(map[type]).forEach((method) => {
        const mapHooks = map[type][method]
        const storeHooks: any[] = (store[type][method] ||= [])

        storeHooks.push(...mapHooks)

        if (method === 'all') {
          if (store.before[method] || store.error[method]) {
            const beforeAll = collect({
              before: store.before[method] || [],
              error: store.error[method] || []
            })
            store.collectedAll.before = [beforeAll]
          }

          if (store.after[method]) {
            const afterAll = collect({
              after: store.after[method] || []
            })
            store.collectedAll.after = [afterAll]
          }
        } else {
          if (store.before[method] || store.after[method] || store.error[method]) {
            const collected = collect({
              before: store.before[method] || [],
              after: store.after[method] || [],
              error: store.error[method] || []
            })

            store.collected[method] = [collected]
          }
        }
      })
    )

    return this
  }
}

export function createContext(service: Service, method: string, data: HookContextData = {}) {
  const createContext = (service as any)[method].createContext

  if (typeof createContext !== 'function') {
    throw new Error(`Can not create context for method ${method}`)
  }

  return createContext(data) as HookContext
}

export class FeathersHookManager<A> extends HookManager {
  constructor(
    public app: A,
    public method: string
  ) {
    super()
    this._middleware = []
  }

  collectMiddleware(self: any, args: any[]): Middleware[] {
    const appHooks = collectHooks(this.app as any as HookEnabled, this.method)
    const middleware = super.collectMiddleware(self, args)
    const methodHooks = collectHooks(self, this.method)

    return [...appHooks, ...middleware, ...methodHooks]
  }

  initializeContext(self: any, args: any[], context: HookContext) {
    const ctx = super.initializeContext(self, args, context)

    ctx.params = ctx.params || {}

    return ctx
  }

  middleware(mw: Middleware[]) {
    this._middleware.push(...mw)
    return this
  }
}

export function hookMixin<A>(this: A, service: FeathersService<A>, path: string, options: ServiceOptions) {
  if (typeof service.hooks === 'function') {
    return service
  }

  const hookMethods = getHookMethods(service, options)

  const createMethodHookManager = (app: A, method: string) => {
    const params = (defaultServiceArguments as any)[method] || ['data', 'params']

    return new FeathersHookManager<A>(app, method).params(...params).props({
      app,
      path,
      method,
      service,
      event: null,
      type: 'around',
      get statusCode() {
        return this.http?.status
      },
      set statusCode(value: number) {
        this.http = this.http || {}
        this.http.status = value
      }
    })
  }

  const serviceMethodHooks = hookMethods.reduce((res, method) => {
    res[method] = createMethodHookManager(this, method)
    return res
  }, {} as BaseHookMap)

  const registerHooks = enableHooks(service)

  // Set which methods should receive "all" hooks (from the methods option)
  ;(service as any).__hooks.allMethods = new Set(hookMethods)

  hooks(service, serviceMethodHooks)

  service.hooks = createServiceHooksMethod(this, service, registerHooks, createMethodHookManager)

  return service
}

function createServiceHooksMethod<A>(
  app: A,
  service: FeathersService<A>,
  registerHooks: ReturnType<typeof enableHooks>,
  createMethodHookManager: (app: A, method: string) => FeathersHookManager<A>
) {
  return function (this: any, hookOptions: any) {
    if (hookOptions.before || hookOptions.after || hookOptions.error || hookOptions.around) {
      return registerHooks.call(this, hookOptions)
    }

    if (Array.isArray(hookOptions)) {
      return hooks(this, hookOptions)
    }

    Object.keys(hookOptions).forEach((method) => {
      // Skip 'all' since it's not an actual method
      if (method === 'all') {
        return
      }

      let manager = getManager(this[method])

      // Lazily create hook manager for methods not initially configured
      if (!(manager instanceof FeathersHookManager)) {
        if (typeof this[method] !== 'function') {
          throw new Error(`Method ${method} does not exist on this service`)
        }

        const methodManager = createMethodHookManager(app, method)
        hooks(this, { [method]: methodManager })
        manager = methodManager
      }

      manager.middleware(hookOptions[method])
    })

    return this
  }
}
