import { AsyncMiddleware } from './compose.js'
import { HookContext, HookContextConstructor, HookContextData, HookManager, HookOptions } from './base.js'
import { functionHooks, hookDecorator, HookMap, objectHooks } from './hooks.js'

export * from './hooks.js'
export * from './compose.js'
export * from './base.js'
export * from './regular.js'

export interface WrapperAddon<F> {
  original: F
  Context: HookContextConstructor
  createContext: (data?: HookContextData) => HookContext
}

export type WrappedFunction<F, T> = F &
  ((...rest: any[]) => Promise<T> | Promise<HookContext>) &
  WrapperAddon<F>

export type MiddlewareOptions = {
  params?: any
  defaults?: any
  props?: any
}

/**
 * Initializes a hook settings object with the given middleware.
 * @param mw The list of middleware
 * @param options Middleware options (params, default, props)
 */
export function middleware(mw?: AsyncMiddleware[], options?: MiddlewareOptions) {
  const manager = new HookManager().middleware(mw)

  if (options) {
    if (options.params) {
      manager.params(...options.params)
    }

    if (options.defaults) {
      manager.defaults(options.defaults)
    }

    if (options.props) {
      manager.props(options.props)
    }
  }

  return manager
}

/**
 * Returns a new function that wraps an existing async function
 * with hooks.
 *
 * @param fn The async function to add hooks to.
 * @param manager An array of middleware or hook settings
 * (`middleware([]).params()` etc.)
 */
export function hooks<F, T = any>(fn: F & (() => void), manager?: HookManager): WrappedFunction<F, T>

/**
 * Add hooks to one or more methods on an object or class.
 * @param obj The object to add hooks to
 * @param hookMap A map of middleware settings where the
 * key is the method name.
 */
export function hooks<O>(obj: O | (new (...args: any[]) => O), hookMap: HookMap<O> | AsyncMiddleware[]): O

/**
 * Decorate a class method with hooks.
 * @param manager The hooks settings
 */
export function hooks<_T = any>(manager?: HookOptions): any

// Fallthrough to actual implementation
export function hooks(...args: any[]) {
  const [target, _hooks] = args

  if (
    typeof target === 'function' &&
    (_hooks instanceof HookManager || Array.isArray(_hooks) || args.length === 1)
  ) {
    return functionHooks(target, _hooks)
  }

  if (args.length === 2) {
    return objectHooks(target, _hooks)
  }

  return hookDecorator(target)
}
