// TypeScript port of koa-compose (https://github.com/koajs/compose)
export type NextFunction = () => Promise<any>

export type AsyncMiddleware<T = any> = (context: T, next: NextFunction) => Promise<any>
export type Middleware<T = any> = AsyncMiddleware<T>

export function compose<T = any>(middleware: AsyncMiddleware<T>[]) {
  if (!Array.isArray(middleware)) {
    throw new TypeError('Middleware stack must be an array!')
  }

  for (const fn of middleware) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middleware must be composed of functions!')
    }
  }

  return function (this: any, context: T, next?: AsyncMiddleware<T>) {
    // last called middleware #
    let index = -1

    return dispatch.call(this, 0)

    function dispatch(this: any, i: number): Promise<any> {
      if (i <= index) {
        return Promise.reject(new Error('next() called multiple times'))
      }

      index = i

      let fn: AsyncMiddleware | undefined = middleware[i]

      if (i === middleware.length) {
        fn = next
      }

      if (!fn) {
        return Promise.resolve()
      }

      try {
        return Promise.resolve(fn.call(this, context, dispatch.bind(this, i + 1)))
      } catch (err) {
        return Promise.reject(err)
      }
    }
  }
}
