import { describe, expect, it } from 'vitest'
import assert from 'assert'
import { HookContext, hooks, middleware, NextFunction } from './index.js'
import { feathers } from '../index.js'

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
      async status(id: string, _params: any) {
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

describe('hookMixin respects @hooks().params()', () => {
  it('uses custom params from @hooks().params() instead of defaults', async () => {
    let capturedCtx: HookContext | null = null

    class MessageService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ]).params('message', 'options'))
      async create(message: string, options?: any) {
        return { message, options }
      }
    }

    const app = feathers().use('messages', new MessageService(), {
      methods: ['create']
    })

    const result = await app.service('messages').create('Hello world', { notify: true })

    expect(result).toEqual({ message: 'Hello world', options: { notify: true } })
    expect(capturedCtx).not.toBeNull()
    // The context should have message and options, NOT the default data/params
    expect(capturedCtx!.message).toBe('Hello world')
    expect(capturedCtx!.options).toEqual({ notify: true })
    // These should be undefined since we're using custom params
    expect(capturedCtx!.data).toBeUndefined()
  })

  it('falls back to default params when @hooks().params() is not used', async () => {
    let capturedCtx: HookContext | null = null

    class MessageService {
      @hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ])
      async create(data: any, _params?: any) {
        return data
      }
    }

    const app = feathers().use('messages', new MessageService(), {
      methods: ['create']
    })

    const result = await app.service('messages').create({ text: 'Hello' }, { user: 'test' })

    expect(result).toEqual({ text: 'Hello' })
    expect(capturedCtx).not.toBeNull()
    // Should use default create params: data, params
    expect(capturedCtx!.data).toEqual({ text: 'Hello' })
    expect(capturedCtx!.params).toEqual({ user: 'test' })
  })

  it('respects custom params for custom methods', async () => {
    let capturedCtx: HookContext | null = null

    class NotificationService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ]).params('userId', 'message', 'priority'))
      async notify(userId: string, message: string, priority: number) {
        return { userId, message, priority, sent: true }
      }
    }

    const app = feathers().use('notifications', new NotificationService(), {
      methods: ['notify']
    })

    const result = await app.service('notifications').notify('user123', 'You have mail', 1)

    expect(result).toEqual({ userId: 'user123', message: 'You have mail', priority: 1, sent: true })
    expect(capturedCtx).not.toBeNull()
    expect(capturedCtx!.userId).toBe('user123')
    expect(capturedCtx!.message).toBe('You have mail')
    expect(capturedCtx!.priority).toBe(1)
  })

  it('allows hooks to modify custom params before method execution', async () => {
    class GreetingService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          // Modify the name before method runs
          ctx.name = ctx.name.toUpperCase()
          await next()
        }
      ]).params('name'))
      async greet(name: string) {
        return `Hello, ${name}!`
      }
    }

    const app = feathers().use('greetings', new GreetingService(), {
      methods: ['greet']
    })

    const result = await app.service('greetings').greet('david')

    expect(result).toBe('Hello, DAVID!')
  })

  it('works with chained params, props, and defaults on registered service', async () => {
    let capturedCtx: HookContext | null = null

    class StatusService {
      @(hooks([
        async (ctx: HookContext, next: NextFunction) => {
          capturedCtx = ctx
          await next()
        }
      ])
        .params('id', 'options')
        .props({ serviceName: 'status' })
        .defaults(() => ({ timestamp: 99999 })))
      async check(id: string, _options?: any) {
        return { id, status: 'ok' }
      }
    }

    const app = feathers().use('status', new StatusService(), {
      methods: ['check']
    })

    const result = await app.service('status').check('server-1', { verbose: true })

    expect(result).toEqual({ id: 'server-1', status: 'ok' })
    expect(capturedCtx).not.toBeNull()
    // Custom params
    expect(capturedCtx!.id).toBe('server-1')
    expect(capturedCtx!.options).toEqual({ verbose: true })
    // Props from .props()
    expect(capturedCtx!.serviceName).toBe('status')
    // Defaults from .defaults()
    expect(capturedCtx!.timestamp).toBe(99999)
    // Service-level props added by hookMixin
    expect(capturedCtx!.app).toBe(app)
    expect(capturedCtx!.path).toBe('status')
    expect(capturedCtx!.method).toBe('check')
  })
})
