import {
  getManager,
  HookContextData,
  HookManager,
  HookMap as BaseHookMap,
  hooks,
  Middleware,
  collect
} from '@feathersjs/hooks'
import {
  Service,
  ServiceOptions,
  HookContext,
  FeathersService,
  HookMap,
  AroundHookFunction,
  HookFunction
} from './declarations'
import { defaultServiceArguments, defaultServiceMethods, getHookMethods } from './service'

export function collectHooks(target: any, method: string) {
  return target.__hooks.hooks[method] || []
}

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

type HookTypes = 'before' | 'after' | 'error' | 'around'

type ConvertedMap = { [type in HookTypes]: ReturnType<typeof convertHookData> }

type HookStore = {
  around: { [method: string]: AroundHookFunction[] }
  before: { [method: string]: HookFunction[] }
  after: { [method: string]: HookFunction[] }
  error: { [method: string]: HookFunction[] }
  hooks: { [method: string]: AroundHookFunction[] }
}

const types: HookTypes[] = ['before', 'after', 'error', 'around']

const isType = (value: any): value is HookTypes => types.includes(value)

const createMap = (input: HookMap<any, any>, methods: string[]) => {
  const map = {} as ConvertedMap

  Object.keys(input).forEach((type) => {
    if (!isType(type)) {
      throw new Error(`'${type}' is not a valid hook type`)
    }

    const data = convertHookData(input[type])

    Object.keys(data).forEach((method) => {
      if (method !== 'all' && !methods.includes(method) && !defaultServiceMethods.includes(method)) {
        throw new Error(`'${method}' is not a valid hook method`)
      }
    })

    map[type] = data
  })

  return map
}

const updateStore = (store: HookStore, map: ConvertedMap) =>
  Object.keys(store.hooks).forEach((method) => {
    Object.keys(map).forEach((key) => {
      const type = key as HookTypes
      const allHooks = map[type].all || []
      const methodHooks = map[type][method] || []

      if (allHooks.length || methodHooks.length) {
        const list = [...allHooks, ...methodHooks] as any
        const hooks = (store[type][method] ||= [])

        hooks.push(...list)
      }
    })

    const collected = collect({
      before: store.before[method] || [],
      after: store.after[method] || [],
      error: store.error[method] || []
    })

    store.hooks[method] = [...(store.around[method] || []), collected]
  })

// Add `.hooks` functionality to an object
export function enableHooks(object: any, methods: string[] = defaultServiceMethods) {
  const store: HookStore = {
    around: {},
    before: {},
    after: {},
    error: {},
    hooks: {}
  }

  for (const method of methods) {
    store.hooks[method] = []
  }

  Object.defineProperty(object, '__hooks', {
    configurable: true,
    value: store,
    writable: true
  })

  return function registerHooks(this: any, input: HookMap<any, any>) {
    const store = this.__hooks
    const map = createMap(input, methods)

    updateStore(store, map)

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
  constructor(public app: A, public method: string) {
    super()
    this._middleware = []
  }

  collectMiddleware(self: any, args: any[]): Middleware[] {
    const appHooks = collectHooks(this.app, this.method)
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

  const serviceMethodHooks = hookMethods.reduce((res, method) => {
    const params = (defaultServiceArguments as any)[method] || ['data', 'params']

    res[method] = new FeathersHookManager<A>(this, method).params(...params).props({
      app: this,
      path,
      method,
      service,
      event: null,
      type: null,
      get statusCode() {
        return this.http?.status
      },
      set statusCode(value: number) {
        this.http = this.http || {}
        this.http.status = value
      }
    })

    return res
  }, {} as BaseHookMap)

  const registerHooks = enableHooks(service, hookMethods)

  hooks(service, serviceMethodHooks)

  service.hooks = function (this: any, hookOptions: any) {
    if (hookOptions.before || hookOptions.after || hookOptions.error || hookOptions.around) {
      return registerHooks.call(this, hookOptions)
    }

    if (Array.isArray(hookOptions)) {
      return hooks(this, hookOptions)
    }

    Object.keys(hookOptions).forEach((method) => {
      const manager = getManager(this[method])

      if (!(manager instanceof FeathersHookManager)) {
        throw new Error(`Method ${method} is not a Feathers hooks enabled service method`)
      }

      manager.middleware(hookOptions[method])
    })

    return this
  }

  return service
}
