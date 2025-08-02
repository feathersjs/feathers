import { AsyncMiddleware } from './compose.js'
import { copyProperties } from './utils.js'

export const HOOKS: string = Symbol.for('@feathersjs/hooks') as any

export type HookContextData = { [key: string]: any }

/**
 * The base hook context.
 */
export class BaseHookContext<C = any> {
  self?: C;
  [key: string]: any

  constructor(data: HookContextData = {}) {
    Object.assign(this, data)
  }

  toJSON() {
    const keys = Object.keys(this)
    let proto = Object.getPrototypeOf(this)

    while (proto) {
      keys.push(...Object.keys(proto))
      proto = Object.getPrototypeOf(proto)
    }

    return keys.reduce(
      (result, key) => {
        result[key] = this[key]

        return result
      },
      {} as Record<string, unknown>
    )
  }
}

export interface HookContext<T = any, C = any> extends BaseHookContext<C> {
  result?: T
  method?: string
  arguments: any[]
}

export type HookContextConstructor = new (data?: { [key: string]: any }) => BaseHookContext

export type HookDefaultsInitializer = (self?: any, args?: any[], context?: HookContext) => HookContextData

export class HookManager {
  _parent?: this | null = null
  _params: string[] | null = null
  _middleware: AsyncMiddleware[] | null = null
  _props: HookContextData | null = null
  _defaults?: HookDefaultsInitializer

  parent(parent: this | null) {
    this._parent = parent

    return this
  }

  middleware(middleware?: AsyncMiddleware[]) {
    this._middleware = middleware?.length ? middleware : null

    return this
  }

  getMiddleware(): AsyncMiddleware[] | null {
    const previous = this._parent?.getMiddleware()

    if (previous && this._middleware) {
      return previous.concat(this._middleware)
    }

    return previous || this._middleware
  }

  collectMiddleware(self: any, _args: any[]): AsyncMiddleware[] {
    const otherMiddleware = getMiddleware(self)
    const middleware = this.getMiddleware()

    if (otherMiddleware && middleware) {
      return otherMiddleware.concat(middleware)
    }

    return otherMiddleware || middleware || []
  }

  props(props: HookContextData) {
    if (!this._props) {
      this._props = {}
    }

    copyProperties(this._props, props)

    return this
  }

  getProps(): HookContextData | null {
    const previous = this._parent?.getProps()

    if (previous && this._props) {
      return copyProperties({}, previous, this._props)
    }

    return previous || this._props || null
  }

  params(...params: string[]) {
    this._params = params

    return this
  }

  getParams(): string[] | null {
    const previous = this._parent?.getParams()

    if (previous && this._params) {
      return previous.concat(this._params)
    }

    return previous || this._params
  }

  defaults(defaults: HookDefaultsInitializer) {
    this._defaults = defaults

    return this
  }

  getDefaults(self: any, args: any[], context: HookContext): HookContextData | null {
    const defaults = typeof this._defaults === 'function' ? this._defaults(self, args, context) : null
    const previous = this._parent?.getDefaults(self, args, context)

    if (previous && defaults) {
      return Object.assign({}, previous, defaults)
    }

    return previous || defaults
  }

  getContextClass(Base: HookContextConstructor = BaseHookContext): HookContextConstructor {
    const ContextClass = class ContextClass extends Base {
      constructor(data: any) {
        super(data)
      }
    }
    const params = this.getParams()
    const props = this.getProps()

    if (params) {
      params.forEach((name, index) => {
        if (props?.[name] !== undefined) {
          throw new Error(`Hooks can not have a property and param named '${name}'. Use .defaults instead.`)
        }

        Object.defineProperty(ContextClass.prototype, name, {
          enumerable: true,
          get() {
            return this?.arguments[index]
          },
          set(value: any) {
            this.arguments[index] = value
          }
        })
      })
    }

    if (props) {
      copyProperties(ContextClass.prototype, props)
    }

    return ContextClass
  }

  initializeContext(self: any, args: any[], context: HookContext): HookContext {
    const ctx = this._parent ? this._parent.initializeContext(self, args, context) : context
    const defaults = this.getDefaults(self, args, ctx)

    if (self) {
      ctx.self = self
    }

    ctx.arguments = args

    if (defaults) {
      for (const name of Object.keys(defaults)) {
        if (ctx[name] === undefined) {
          ctx[name] = defaults[name]
        }
      }
    }

    return ctx
  }
}

export type HookOptions = HookManager | AsyncMiddleware[] | null

export function convertOptions(options: HookOptions = null) {
  if (!options) {
    return new HookManager()
  }

  return Array.isArray(options) ? new HookManager().middleware(options) : options
}

export function getManager(target: any): HookManager | null {
  return (target && target[HOOKS]) || null
}

export function setManager<T>(target: T, manager: HookManager) {
  const parent = getManager(target)

  ;(target as any)[HOOKS] = manager.parent(parent)

  return target
}

export function getMiddleware(target: any): AsyncMiddleware[] | null {
  const manager = getManager(target)

  return manager ? manager.getMiddleware() : null
}

export function setMiddleware<T>(target: T, middleware: AsyncMiddleware[]) {
  const manager = new HookManager().middleware(middleware)

  return setManager(target, manager)
}
