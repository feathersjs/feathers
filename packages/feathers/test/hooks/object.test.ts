import { it, describe } from 'vitest'
import assert from 'assert'
import { HookContext, hooks, middleware, NextFunction } from '../../src/hooks/index.js'

interface HookableObject {
  test: string
  sayHi(name: string): Promise<string>
  addOne(number: number): Promise<number>
}

const getObject = (): HookableObject => ({
  test: 'me',

  async sayHi(name: string) {
    return `Hi ${name}`
  },

  async addOne(number: number) {
    return number + 1
  }
})

describe('feathers/hooks object', () => {
  it('hooks object with hook methods, sets method name', async () => {
    const obj = getObject()

    const hookedObj = hooks(obj, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          assert.deepEqual(ctx.arguments, ['David'])
          assert.equal(ctx.method, 'sayHi')
          assert.equal(ctx.self, obj)

          await next()

          ctx.result += '?'
        }
      ]),
      addOne: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          ctx.arguments[0] += 1

          await next()
        }
      ])
    })

    assert.strictEqual(obj, hookedObj)
    assert.equal(await hookedObj.sayHi('David'), 'Hi David?')
    assert.equal(await hookedObj.addOne(1), 3)
  })

  it('hooks object and allows to customize context for method', async () => {
    const obj = getObject()
    const hookedObj = hooks(obj, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          assert.deepEqual(ctx.arguments, ['David'])
          assert.equal(ctx.method, 'sayHi')
          assert.equal(ctx.name, 'David')
          assert.equal(ctx.self, obj)

          ctx.name = 'Dave'

          await next()

          ctx.result += '?'
        }
      ]).params('name'),

      addOne: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          ctx.arguments[0] += 1

          await next()
        }
      ])
    })

    assert.strictEqual(obj, hookedObj)
    assert.equal(await hookedObj.sayHi('David'), 'Hi Dave?')
    assert.equal(await hookedObj.addOne(1), 3)
  })

  it('hooking multiple times works properly', async () => {
    const obj = getObject()

    hooks(obj, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          await next()

          ctx.result += '?'
        }
      ])
    })

    hooks(obj, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          await next()

          ctx.result += '!'
        }
      ])
    })

    assert.equal(await obj.sayHi('David'), 'Hi David!?')
  })

  it('throws an error when hooking invalid method', async () => {
    const obj = getObject()

    assert.throws(
      () =>
        hooks(obj, {
          test: middleware([
            async (_ctx, next) => {
              await next()
            }
          ])
        }),
      {
        message: `Can not apply hooks. 'test' is not a function`
      }
    )
  })

  it('works with object level hooks', async () => {
    const obj = getObject()

    hooks(obj, [
      async (ctx: HookContext, next: NextFunction) => {
        await next()

        ctx.result += '!'
      }
    ])

    hooks(obj, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          await next()

          ctx.result += '?'
        }
      ])
    })

    assert.equal(await obj.sayHi('Dave'), 'Hi Dave?!')
  })
})
