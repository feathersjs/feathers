import { AsyncMiddleware, compose } from './compose.js'
import {
  convertOptions,
  HookContext,
  HookContextData,
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

export const hookDecorator = (managerOrMiddleware?: HookOptions) => {
  return (target: any, context: DecoratorContext) => {
    const manager = convertOptions(managerOrMiddleware)

    if (context.kind === 'class') {
      setManager(target.prototype, manager)
      return target
    } else if (context.kind === 'method') {
      const method = String(context.name)
      return functionHooks(target, manager.props({ method }))
    }

    throw new Error('Can not apply hooks.')
  }
}
