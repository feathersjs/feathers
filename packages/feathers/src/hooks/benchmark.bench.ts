import { describe, expect, test } from 'vitest'
import { HookContext, hooks, middleware, NextFunction } from './index.js'

// A hooked function must not be more than this many times slower than the plain function
const MAX_OVERHEAD = 10
// The iterations of compared benchmarks are interleaved so system load affects them equally
const RUN_OPTIONS = { time: 500, warmupTime: 100 }

const hello = async (name: string, _params: any = {}) => {
  return `Hello ${name}`
}

const benchmarks = [
  ['empty hook', hooks(hello, middleware([]))],
  [
    'single simple hook',
    hooks(
      hello,
      middleware([
        async (_ctx: HookContext, next: NextFunction) => {
          await next()
        }
      ])
    )
  ],
  [
    'single hook, withParams and props',
    hooks(
      hello,
      middleware([
        async (_ctx: HookContext, next: NextFunction) => {
          await next()
        }
      ])
        .params('name')
        .props({ dave: true })
    )
  ]
] as const

describe('feathers/hooks benchmark', () => {
  for (const [name, hookHello] of benchmarks) {
    test(name, async ({ bench }) => {
      const results = await bench.compare(
        bench('baseline', () => hello('Dave')),
        bench(name, () => hookHello('Dave')),
        RUN_OPTIONS
      )
      // Compare the medians since single garbage collection pauses skew the mean
      const overhead = results.get(name).latency.p50 / results.get('baseline').latency.p50

      expect(overhead).toBeLessThan(MAX_OVERHEAD)
    })
  }
})
