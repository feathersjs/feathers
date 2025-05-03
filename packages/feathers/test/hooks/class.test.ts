import { describe, it } from 'vitest'
import assert from 'assert'
import { HookContext, hooks, middleware, NextFunction } from '../../src/hooks/index.js'

interface Dummy {
  sayHi(name: string): Promise<string>
  addOne(number: number): Promise<number>
}

const createDummyClass = () => {
  return class DummyClass implements Dummy {
    sayHi(name: string) {
      return Promise.resolve(`Hi ${name}`)
    }

    addOne(number: number) {
      return Promise.resolve(number + 1)
    }
  }
}

describe('feathers/hooks classes', () => {
  it('hooking object on class adds to the prototype', async () => {
    const DummyClass = createDummyClass()

    hooks(DummyClass, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          assert.deepEqual(
            {
              arguments: ['David'],
              method: 'sayHi',
              name: 'David',
              self: instance
            },
            ctx.toJSON()
          )

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

    const instance = new DummyClass()

    assert.equal(await instance.sayHi('David'), 'Hi David?')
    assert.equal(await instance.addOne(1), 3)
  })

  it('hooking object works on function that has property', async () => {
    const app = function () {}

    app.sayHi = (name: string) => `Hello ${name}`

    hooks(app as any, {
      sayHi: middleware([
        async (ctx: HookContext, next: NextFunction) => {
          await next()

          ctx.result += '?'
        }
      ]).params('name')
    })

    assert.equal(await app.sayHi('David'), 'Hello David?')
  })

  it('works with inheritance', async () => {
    const DummyClass = createDummyClass()

    const first = async (ctx: HookContext, next: NextFunction) => {
      assert.deepEqual(ctx.arguments, ['David'])
      assert.equal(ctx.method, 'sayHi')
      assert.equal(ctx.self, instance)

      await next()

      ctx.result += '?'
    }
    const second = async (ctx: HookContext, next: NextFunction) => {
      await next()

      ctx.result += '!'
    }

    hooks(DummyClass, {
      sayHi: middleware([first])
    })

    class OtherDummy extends DummyClass {}

    hooks(OtherDummy, {
      sayHi: middleware([second])
    })

    const instance = new OtherDummy()

    assert.strictEqual(await instance.sayHi('David'), 'Hi David!?')
  })

  it('works with multiple context updaters', async () => {
    const DummyClass = createDummyClass()

    hooks(DummyClass, {
      sayHi: middleware([
        async (ctx, next) => {
          assert.equal(ctx.name, 'Dave')

          ctx.name = 'Changed'

          await next()
        }
      ]).params('name')
    })

    class OtherDummy extends DummyClass {}

    hooks(OtherDummy, {
      sayHi: middleware([
        async (ctx, next) => {
          assert.equal(ctx.name, 'Changed')
          assert.equal(ctx.gna, 42)

          await next()
        }
      ]).props({ gna: 42 })
    })

    const instance = new OtherDummy()

    hooks(instance, {
      sayHi: middleware([
        async (ctx, next) => {
          assert.equal(ctx.name, 'Changed')
          assert.equal(ctx.gna, 42)
          assert.equal(ctx.app, 'ok')

          await next()
        }
      ]).props({ app: 'ok' })
    })

    assert.equal(await instance.sayHi('Dave'), 'Hi Changed')
  })
})
