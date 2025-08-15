// Adapted from koa-compose (https://github.com/koajs/compose)
import { describe, expect, it } from 'vitest'
import assert from 'assert'
import { compose, NextFunction } from './index.js'

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms || 1))
}

function isPromise(x: any) {
  return x && typeof x.then === 'function'
}

describe('feathers/hooks compose', () => {
  it('compose: should work', async () => {
    const arr: number[] = []
    const stack = []

    stack.push(async (_context: any, next: NextFunction) => {
      arr.push(1)
      await wait(1)
      await next()
      await wait(1)
      arr.push(6)
    })

    stack.push(async (_context: any, next: NextFunction) => {
      arr.push(2)
      await wait(1)
      await next()
      await wait(1)
      arr.push(5)
    })

    stack.push(async (_context: any, next: NextFunction) => {
      arr.push(3)
      await wait(1)
      await next()
      await wait(1)
      arr.push(4)
    })

    await compose(stack)({})

    assert.deepEqual(arr, [1, 2, 3, 4, 5, 6])
  })

  it('compose: should be able to be called twice', () => {
    const stack = []

    stack.push(async (context: any, next: NextFunction) => {
      context.arr.push(1)
      await wait(1)
      await next()
      await wait(1)
      context.arr.push(6)
    })

    stack.push(async (context: any, next: NextFunction) => {
      context.arr.push(2)
      await wait(1)
      await next()
      await wait(1)
      context.arr.push(5)
    })

    stack.push(async (context: any, next: NextFunction) => {
      context.arr.push(3)
      await wait(1)
      await next()
      await wait(1)
      context.arr.push(4)
    })

    const fn = compose(stack)
    const ctx1: any = { arr: [] }
    const ctx2: any = { arr: [] }
    const out = [1, 2, 3, 4, 5, 6]

    return fn(ctx1)
      .then(() => {
        assert.deepEqual(out, ctx1.arr)
        return fn(ctx2)
      })
      .then(() => {
        assert.deepEqual(out, ctx2.arr)
      })
  })

  it('compose: should only accept an array', async () => {
    // @ts-expect-error test without args
    await expect(() => compose()).toThrow('Middleware stack must be an array!')
  })

  it('compose: should create next functions that return a Promise', function () {
    const stack = []
    const arr: any = []
    for (let i = 0; i < 5; i++) {
      stack.push(async (_context: any, next: NextFunction) => {
        arr.push(next())
      })
    }

    compose(stack)({})

    for (const next of arr) {
      assert(isPromise(next), 'one of the functions next is not a Promise')
    }
  })

  it('compose: should work with 0 middleware', function () {
    return compose([])({})
  })

  it('compose: should only accept middleware as functions', () => {
    expect(() => compose([{}] as any)).toThrow('Middleware must be composed of functions!')
  })

  it('compose: should work when yielding at the end of the stack', async () => {
    const stack = []
    let called = false

    stack.push(async (_ctx: any, next: NextFunction) => {
      await next()
      called = true
    })

    await compose(stack)({})
    assert(called)
  })

  it('compose: should reject on errors in middleware', () => {
    const stack = []

    stack.push(() => {
      throw new Error()
    })

    return compose(stack)({})
      .then(function () {
        throw new Error('promise was not rejected')
      })
      .catch(function (e) {
        assert(e instanceof Error)
      })
  })

  it('compose: should keep the context', () => {
    const ctx = {}

    const stack = []

    stack.push(async (ctx2: any, next: NextFunction) => {
      await next()
      assert.equal(ctx2, ctx)
    })

    stack.push(async (ctx2: any, next: NextFunction) => {
      await next()
      assert.equal(ctx2, ctx)
    })

    stack.push(async (ctx2: any, next: NextFunction) => {
      await next()
      assert.equal(ctx2, ctx)
    })

    return compose(stack)(ctx)
  })

  it('compose: should catch downstream errors', async () => {
    const arr: number[] = []
    const stack = []

    stack.push(async (_ctx: any, next: NextFunction) => {
      arr.push(1)
      try {
        arr.push(6)
        await next()
        arr.push(7)
      } catch (_err) {
        arr.push(2)
      }
      arr.push(3)
    })

    stack.push(async (_ctx: any, _next: NextFunction) => {
      arr.push(4)
      throw new Error()
    })

    await compose(stack)({})
    assert.deepEqual(arr, [1, 6, 4, 2, 3])
  })

  it('compose: should compose w/ next', () => {
    let called = false

    return compose([])({}, async () => {
      called = true
    }).then(function () {
      assert(called)
    })
  })

  it('compose: should handle errors in wrapped non-async functions', () => {
    const stack = []

    stack.push(function () {
      throw new Error()
    })

    return compose(stack)({})
      .then(function () {
        throw new Error('promise was not rejected')
      })
      .catch(function (e) {
        assert(e instanceof Error)
      })
  })

  // https://github.com/koajs/compose/pull/27#issuecomment-143109739
  it('compose: should compose w/ other compositions', () => {
    const called: number[] = []

    return compose([
      compose([
        (_ctx, next) => {
          called.push(1)
          return next()
        },
        (_ctx, next) => {
          called.push(2)
          return next()
        }
      ]),
      (_ctx, next) => {
        called.push(3)
        return next()
      }
    ])({}).then(() => assert.deepEqual(called, [1, 2, 3]))
  })

  it('compose: should throw if next() is called multiple times', () => {
    return compose([
      async (_ctx, next) => {
        await next()
        await next()
      }
    ])({}).then(
      () => {
        throw new Error('boom')
      },
      (err) => {
        assert(/multiple times/.test(err.message))
      }
    )
  })

  it('compose: should return a valid middleware', () => {
    let val = 0
    return compose([
      compose([
        (_ctx, next) => {
          val++
          return next()
        },
        (_ctx, next) => {
          val++
          return next()
        }
      ]),
      (_ctx, next) => {
        val++
        return next()
      }
    ])({}).then(function () {
      assert.strictEqual(val, 3)
    })
  })

  it('compose: should return last return value', () => {
    const stack = []

    stack.push(async (_context: any, next: NextFunction) => {
      const val = await next()
      assert.equal(val, 2)
      return 1
    })

    stack.push(async (_context: any, next: NextFunction) => {
      const val = await next()
      assert.equal(val, 0)
      return 2
    })

    const next = async () => 0

    return compose(stack)({}, next).then(function (val) {
      assert.equal(val, 1)
    })
  })

  it('compose: should not affect the original middleware array', () => {
    const middleware = []
    const fn1 = (_ctx: any, next: NextFunction) => {
      return next()
    }
    middleware.push(fn1)

    for (const fn of middleware) {
      assert.strictEqual(fn, fn1)
    }

    compose(middleware)

    for (const fn of middleware) {
      assert.strictEqual(fn, fn1)
    }
  })

  it('compose: should not get stuck on the passed in next', () => {
    const middleware = [
      (_ctx: any, next: NextFunction) => {
        ctx.middleware++
        return next()
      }
    ]
    const ctx = {
      middleware: 0,
      next: 0
    }

    return compose(middleware)(ctx, async (ctx: any, next: NextFunction) => {
      ctx.next++
      return next()
    }).then(() => {
      assert.deepEqual(ctx, { middleware: 1, next: 1 })
    })
  })
})
