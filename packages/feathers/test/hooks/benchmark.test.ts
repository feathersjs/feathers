import { describe, it } from 'vitest'
import assert from 'assert'
import { HookContext, hooks, middleware, NextFunction } from '../../src/hooks/index.js'

const CYCLES = 100000
const getRuntime = async (callback: () => Promise<any>) => {
  const start = Date.now()

  for (let i = 0; i < CYCLES; i++) {
    await callback()
  }

  return Date.now() - start
}

const hello = async (name: string, _params: any = {}) => {
  return `Hello ${name}`
}
let baseline: number
let threshold: number
;(async () => {
  baseline = await getRuntime(() => hello('Dave'))
  threshold = baseline * 15
})()

describe('feathers/hooks benchmark', () => {
  it('empty hook', async () => {
    const hookHello1 = hooks(hello, middleware([]))
    const runtime = await getRuntime(() => hookHello1('Dave'))

    assert(runtime < threshold, `Runtime is ${runtime}ms, threshold is ${threshold}ms`)
  })

  it('single simple hook', async () => {
    const hookHello = hooks(
      hello,
      middleware([
        async (_ctx: HookContext, next: NextFunction) => {
          await next()
        }
      ])
    )
    const runtime = await getRuntime(() => hookHello('Dave'))

    assert(runtime < threshold, `Runtime is ${runtime}ms, threshold is ${threshold}ms`)
  })

  it('single hook, withParams and props', async () => {
    const hookHello = hooks(
      hello,
      middleware([
        async (_ctx: HookContext, next: NextFunction) => {
          await next()
        }
      ])
        .params('name')
        .props({ dave: true })
    )

    const runtime = await getRuntime(() => hookHello('Dave'))

    assert(runtime < threshold, `Runtime is ${runtime}ms, threshold is ${threshold}ms`)
  })
})
