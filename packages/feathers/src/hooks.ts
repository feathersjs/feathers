import {
  getManager,
  setManager,
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

export function collectHooks(target: HookEnabled, method: string) {
  const { collected, collectedAll, around } = target.__hooks

  return [
    ...(around.all || []),
    ...(around[method] || []),
    ...(collectedAll.before || []),
    ...(collected[method] || []),
    ...(collectedAll.after || [])
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

/**
 * Creates property descriptors for Feathers-specific context properties.
 * Used to add app, path, service, method, etc. to hook contexts.
 */
function createFeathersContextProps<A>(
  app: A,
  path: string,
  method: string,
  service: FeathersService<A>
): PropertyDescriptorMap {
  return {
    app: { value: app, enumerable: true, writable: true },
    path: { value: path, enumerable: true, writable: true },
    method: { value: method, enumerable: true, writable: true },
    service: { value: service, enumerable: true, writable: true },
    event: { value: null, enumerable: true, writable: true },
    type: { value: 'around', enumerable: true, writable: true },
    statusCode: {
      enumerable: true,
      get(this: HookContext) {
        return this.http?.status
      },
      set(this: HookContext, value: number) {
        this.http = this.http || {}
        this.http.status = value
      }
    }
  }
}

/**
 * Converts PropertyDescriptorMap to HookContextData for use with HookManager.props()
 */
function propsFromDescriptors(descriptors: PropertyDescriptorMap): HookContextData {
  const props: HookContextData = {}
  for (const [key, descriptor] of Object.entries(descriptors)) {
    if ('value' in descriptor) {
      props[key] = descriptor.value
    } else {
      Object.defineProperty(props, key, descriptor)
    }
  }
  return props
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

  const serviceMethodHooks = hookMethods.reduce((res, method) => {
    const feathersContextProps = createFeathersContextProps(this, path, method, service)

    // Check if the method already has params configured via @hooks().params()
    const existingManager = getManager((service as any)[method])
    const existingParams = existingManager?.getParams()

    // If the method already has custom params from a decorator, we need to
    // enhance the existing wrapper with Feathers context. We do this by:
    // 1. Creating a FeathersHookManager as a parent (for collectMiddleware)
    // 2. Adding Feathers props to the existing Context prototype
    if (existingParams && existingManager) {
      const wrapper = (service as any)[method]
      const feathersManager = new FeathersHookManager<A>(this, method)
      setManager(wrapper, feathersManager)

      const contextProto = wrapper.Context?.prototype
      if (contextProto) {
        Object.defineProperties(contextProto, feathersContextProps)
      }
      return res
    }

    // Use default params for this method
    const params = (defaultServiceArguments as any)[method] || ['data', 'params']

    res[method] = new FeathersHookManager<A>(this, method)
      .params(...params)
      .props(propsFromDescriptors(feathersContextProps))

    return res
  }, {} as BaseHookMap)

  const registerHooks = enableHooks(service)

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
