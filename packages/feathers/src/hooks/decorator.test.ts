import { describe, expect, it } from 'vitest'
import assert from 'assert'
import { HookContext, hooks, middleware, NextFunction } from './index.js'

describe('feathers/hooks chainable decorator', () => {
  it('supports @hooks([]).params() chainable syntax', async () => {
    const calls: string[] = []

    class TestService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          calls.push(`before: id=${ctx.id}, data=${JSON.stringify(ctx.data)}`)
          await next()
          calls.push(`after: result=${JSON.stringify(ctx.result)}`)
        }
      ]).params('id', 'data'))
      async myMethod(id: string, data: any) {
        return { id, data }
      }
    }

    const svc = new TestService()
    const result = await svc.myMethod('123', { foo: 'bar' })

    expect(result).toEqual({ id: '123', data: { foo: 'bar' } })
    expect(calls).toEqual([
      'before: id=123, data={"foo":"bar"}',
      'after: result={"id":"123","data":{"foo":"bar"}}'
    ])
  })

  it('supports @hooks([]).props() chainable syntax', async () => {
    let capturedCtx: HookContext | null = null

    class TestService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ]).props({ customProp: 'customValue' }))
      async myMethod() {
        return 'done'
      }
    }

    const svc = new TestService()
    await svc.myMethod()

    expect(capturedCtx).not.toBeNull()
    expect(capturedCtx!.customProp).toBe('customValue')
  })

  it('supports @hooks([]).defaults() chainable syntax', async () => {
    let capturedCtx: HookContext | null = null

    class TestService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ]).defaults(() => ({ timestamp: 12345 })))
      async myMethod() {
        return 'done'
      }
    }

    const svc = new TestService()
    await svc.myMethod()

    expect(capturedCtx).not.toBeNull()
    expect(capturedCtx!.timestamp).toBe(12345)
  })

  it('supports chaining multiple methods', async () => {
    let capturedCtx: HookContext | null = null

    class TestService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ])
        .params('id', 'params')
        .props({ service: 'messages' })
        .defaults(() => ({ timestamp: 99999 })))
      async status(id: string, params: any) {
        return { id, status: 'active' }
      }
    }

    const svc = new TestService()
    const result = await svc.status('456', { user: 'test' })

    expect(result).toEqual({ id: '456', status: 'active' })
    expect(capturedCtx).not.toBeNull()
    expect(capturedCtx!.id).toBe('456')
    expect(capturedCtx!.params).toEqual({ user: 'test' })
    expect(capturedCtx!.service).toBe('messages')
    expect(capturedCtx!.timestamp).toBe(99999)
  })

  it('works with empty middleware array', async () => {
    class TestService {
      @(hooks([]).params('message'))
      async process(message: string) {
        return { processed: message }
      }
    }

    const svc = new TestService()
    const result = await svc.process('hello')

    expect(result).toEqual({ processed: 'hello' })
  })

  it('chainable decorator still works as regular decorator', async () => {
    const calls: string[] = []

    class TestService {
      @hooks([
        async (ctx: HookContext, next: NextFunction) => {
          calls.push('hook ran')
          await next()
        }
      ])
      async regularMethod() {
        return 'done'
      }
    }

    const svc = new TestService()
    await svc.regularMethod()

    expect(calls).toEqual(['hook ran'])
  })
})

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
