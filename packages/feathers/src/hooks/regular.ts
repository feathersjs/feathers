import { HookFunction, RegularHookFunction, RegularHookMap } from '../declarations'
import { defaultServiceMethods } from '../service'

const runHook = <A, S>(hook: RegularHookFunction<A, S>, context: any, type?: string) => {
  if (type) context.type = type
  return Promise.resolve(hook.call(context.self, context)).then((res: any) => {
    if (type) context.type = null
    if (res && res !== context) {
      Object.assign(context, res)
    }
  })
}

export function fromBeforeHook<A, S>(hook: RegularHookFunction<A, S>): HookFunction<A, S> {
  return (context, next) => {
    return runHook(hook, context, 'before').then(next)
  }
}

export function fromAfterHook<A, S>(hook: RegularHookFunction<A, S>): HookFunction<A, S> {
  return (context, next) => {
    return next().then(() => runHook(hook, context, 'after'))
  }
}

export function fromErrorHook<A, S>(hook: RegularHookFunction<A, S>): HookFunction<A, S> {
  return (context, next) => {
    return next().catch((error: any) => {
      if (context.error !== error || context.result !== undefined) {
        context.original = { ...context }
        context.error = error
        delete context.result
      }

      return runHook(hook, context, 'error').then(() => {
        if (context.result === undefined && context.error !== undefined) {
          throw context.error
        }
      })
    })
  }
}

const RunHooks =
  <A, S>(hooks: RegularHookFunction<A, S>[]) =>
  (context: any) => {
    return hooks.reduce((promise, hook) => {
      return promise.then(() => runHook(hook, context))
    }, Promise.resolve(undefined))
  }

export function fromBeforeHooks<A, S>(hooks: RegularHookFunction<A, S>[]) {
  return fromBeforeHook(RunHooks(hooks))
}

export function fromAfterHooks<A, S>(hooks: RegularHookFunction<A, S>[]) {
  return fromAfterHook(RunHooks(hooks))
}

export function fromErrorHooks<A, S>(hooks: RegularHookFunction<A, S>[]) {
  return fromErrorHook(RunHooks(hooks))
}

export function collectRegularHooks(target: any, method: string) {
  return target.__hooks.hooks[method] || []
}

// Converts different hook registration formats into the
// same internal format
export function convertHookData(input: any) {
  const result: { [method: string]: RegularHookFunction[] } = {}

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

type RegularType = 'before' | 'after' | 'error'

type RegularMap = { [type in RegularType]: ReturnType<typeof convertHookData> }

type RegularAdapter = HookFunction & { hooks: RegularHookFunction[] }

type RegularStore = {
  before: { [method: string]: RegularAdapter }
  after: { [method: string]: RegularAdapter }
  error: { [method: string]: RegularAdapter }
  hooks: { [method: string]: HookFunction[] }
}

const types: RegularType[] = ['before', 'after', 'error']

const isType = (value: any): value is RegularType => types.includes(value)

const wrappers = {
  before: fromBeforeHooks,
  after: fromAfterHooks,
  error: fromErrorHooks
}

const createStore = (methods: string[]) => {
  const store: RegularStore = {
    before: {},
    after: {},
    error: {},
    hooks: {}
  }

  for (const method of methods) {
    store.hooks[method] = []
  }

  return store
}

const setStore = (object: any, store: RegularStore) => {
  Object.defineProperty(object, '__hooks', {
    configurable: true,
    value: store,
    writable: true
  })
}

const getStore = (object: any): RegularStore => object.__hooks

const createMap = (input: RegularHookMap<any, any>, methods: string[]) => {
  const map = {} as RegularMap

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

const createAdapter = (type: RegularType) => {
  const hooks: RegularHookFunction[] = []
  const hook = wrappers[type](hooks)
  const adapter = Object.assign(hook, { hooks })

  return adapter
}

const updateStore = (store: RegularStore, map: RegularMap) => {
  Object.keys(store.hooks).forEach((method) => {
    let adapted = false

    Object.keys(map).forEach((key) => {
      const type = key as RegularType
      const allHooks = map[type].all || []
      const methodHooks = map[type][method] || []

      if (allHooks.length || methodHooks.length) {
        const adapter = (store[type][method] ||= ((adapted = true), createAdapter(type)))

        adapter.hooks.push(...allHooks, ...methodHooks)
      }
    })

    if (adapted) {
      store.hooks[method] = [store.error[method], store.before[method], store.after[method]].filter((hook) => hook)
    }
  })
}

// Add `.hooks` functionality to an object
export function enableRegularHooks(object: any, methods: string[] = defaultServiceMethods) {
  const store = createStore(methods)

  setStore(object, store)

  return function regularHooks(this: any, input: RegularHookMap<any, any>) {
    const store = getStore(this)
    const map = createMap(input, methods)

    updateStore(store, map)

    return this
  }
}
