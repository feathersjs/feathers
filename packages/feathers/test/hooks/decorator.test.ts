import { describe, expect, it } from 'vitest'
import assert from 'assert'
import { HookContext, hooks, middleware, NextFunction } from '../../src/hooks/index.js'

describe('feathers/hooks decorator', () => {
  it('hook decorator on method and classes with inheritance', async () => {
    const expectedName = 'David NameFromTopLevel NameFromDummyClass'

    @hooks([
      async (ctx, next) => {
        ctx.arguments[0] += ' NameFromTopLevel'

        await next()

        ctx.result += ' ResultFromTopLevel'
      }
    ])
    class TopLevel {}

    @hooks([
      async (ctx, next) => {
        ctx.arguments[0] += ' NameFromDummyClass'

        await next()

        ctx.result += ' ResultFromDummyClass'
      }
    ])
    class DummyClass extends TopLevel {
      @hooks(
        middleware([
          async (ctx: HookContext, next: NextFunction) => {
            assert.equal(ctx.method, 'sayHi')
            assert.deepEqual(ctx.arguments, [expectedName])
            assert.equal(ctx.name, expectedName)

            await next()

            ctx.result += ' ResultFromMethodDecorator'
          }
        ]).params('name')
      )
      async sayHi(name: string) {
        return `Hi ${name}`
      }

      @hooks()
      async hookedFn() {
        return 'Hooks with nothing'
      }

      @hooks([async (_ctx: HookContext, next: NextFunction) => next()])
      async sayWorld() {
        return 'World'
      }
    }

    const instance = new DummyClass()

    assert.equal(
      await instance.sayHi('David'),
      `Hi ${expectedName} ResultFromMethodDecorator ResultFromDummyClass ResultFromTopLevel`
    )
  })

  it('error cases', () => {
    expect(() => hooks([])({}, 'test', { value: 'not a function' })).toThrow('Can not apply hooks.')
  })
})
