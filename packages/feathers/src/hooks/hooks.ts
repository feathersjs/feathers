import { AsyncMiddleware, compose } from './compose.js'
import {
  convertOptions,
  HookContext,
  HookContextData,
  HookDefaultsInitializer,
  HookManager,
  HookOptions,
  setManager,
  setMiddleware
} from './base.js'
import { copyFnProperties, copyProperties } from './utils.js'

export function getOriginal(fn: any): any {
  return typeof fn.original === 'function' ? getOriginal(fn.original) : fn
}

export function functionHooks<F>(fn: F, managerOrMiddleware: HookOptions) {
  if (typeof fn !== 'function') {
    throw new Error('Can not apply hooks to non-function')
  }

  const manager = convertOptions(managerOrMiddleware)
  const wrapper: any = function (this: any, ...args: any[]) {
    const { Context, original } = wrapper
    // If we got passed an existing HookContext instance, we want to return it as well
    const returnContext = args[args.length - 1] instanceof Context
    // Use existing context or default
    const base = returnContext ? (args.pop() as HookContext) : new Context()
    // Initialize the context
    const context = manager.initializeContext(this, args, base)
    // Assemble the hook chain
    const hookChain: AsyncMiddleware[] = [
      // Return `ctx.result` or the context
      (ctx, next) => next().then(() => (returnContext ? ctx : ctx.result))
    ]

    // Create the hook chain by calling the `collectMiddleware function
    const mw = manager.collectMiddleware(this, args)

    if (mw) {
      Array.prototype.push.apply(hookChain, mw)
    }

    // Runs the actual original method if `ctx.result` is not already set
    hookChain.push((ctx, next) => {
      if (!Object.prototype.hasOwnProperty.call(context, 'result')) {
        const returnValue = original.apply(this, ctx.arguments)

        if (returnValue[Symbol.asyncIterator]) {
          throw new Error(
            'Function must return a Promise that resolves to an async iterable, not the iterable directly'
          )
        }

        return Promise.resolve(returnValue).then((result) => {
          ctx.result = result

          return next()
        })
      }

      return next()
    })

    return compose(hookChain).call(this, context)
  }

  copyFnProperties(wrapper, fn)
  copyProperties(wrapper, fn)
  setManager(wrapper, manager)

  return Object.assign(wrapper, {
    original: getOriginal(fn),
    Context: manager.getContextClass(),
    createContext: (data: HookContextData = {}) => {
      return new wrapper.Context(data)
    }
  })
}

export type HookMap<O = any> = {
  [L in keyof O]?: HookOptions
}

export function objectHooks(obj: any, hooks: HookMap | AsyncMiddleware[]) {
  if (Array.isArray(hooks)) {
    return setMiddleware(obj, hooks)
  }

  for (const method of Object.keys(hooks)) {
    const target = typeof obj[method] === 'function' ? obj : obj.prototype
    const fn = target && target[method]

    if (typeof fn !== 'function') {
      throw new Error(`Can not apply hooks. '${method}' is not a function`)
    }

    const manager = convertOptions(hooks[method])

    target[method] = functionHooks(fn, manager.props({ method }))
  }

  return obj
}

/**
 * A chainable decorator that can be used with or without chaining.
 *
 * @example
 * // Without chaining
 * @hooks([middleware])
 * async myMethod() {}
 *
 * @example
 * // With chaining
 * @hooks([]).params('id', 'data')
 * async myMethod(id: string, data: any) {}
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyFunction = (...args: any[]) => any

export interface ChainableHookDecorator {
  // Callable as a class or method decorator
  <T extends AnyFunction>(target: T, context: ClassDecoratorContext): T
  <T extends AnyFunction>(target: T, context: ClassMethodDecoratorContext): T

  // Chainable methods that return a new decorator
  params(...params: string[]): ChainableHookDecorator
  props(props: HookContextData): ChainableHookDecorator
  defaults(defaults: HookDefaultsInitializer): ChainableHookDecorator
}

function createChainableDecorator(manager: HookManager): ChainableHookDecorator {
  const decorator = <T extends AnyFunction>(
    target: T,
    context: ClassDecoratorContext | ClassMethodDecoratorContext
  ): T => {
    if (context.kind === 'class') {
      setManager((target as any).prototype, manager)
      return target
    } else if (context.kind === 'method') {
      const method = String(context.name)
      return functionHooks(target, manager.props({ method })) as T
    }

    throw new Error('Can not apply hooks.')
  }

  decorator.params = (...params: string[]): ChainableHookDecorator => {
    const clone = manager.clone()
    clone._params = params
    return createChainableDecorator(clone)
  }

  decorator.props = (props: HookContextData): ChainableHookDecorator => {
    const clone = manager.clone()
    clone._props = clone._props ? { ...clone._props, ...props } : { ...props }
    return createChainableDecorator(clone)
  }

  decorator.defaults = (defaults: HookDefaultsInitializer): ChainableHookDecorator => {
    const clone = manager.clone()
    clone._defaults = defaults
    return createChainableDecorator(clone)
  }

  return decorator as ChainableHookDecorator
}

export const hookDecorator = (managerOrMiddleware?: HookOptions): ChainableHookDecorator => {
  const manager = convertOptions(managerOrMiddleware)
  return createChainableDecorator(manager)
}
