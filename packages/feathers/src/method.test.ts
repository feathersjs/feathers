import { describe, expect, it } from 'vitest'
import { method, getMethodOptions, getAllMethodOptions, clientMethods, METHOD_OPTIONS } from './method.js'
import type { MethodOptions } from './declarations.js'

describe('@method decorator', () => {
  it('applies method options to a method via decorator', () => {
    const options: MethodOptions = {
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status'
    }

    class TestService {
      @method(options)
      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }
    }

    const instance = new TestService()

    // Check that the options are stored on the method
    expect((instance.status as any)[METHOD_OPTIONS]).toEqual(options)
  })

  it('works with multiple decorated methods', () => {
    class TestService {
      @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }

      @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
      async archive(_id: string, _params: unknown) {
        return { archived: true }
      }

      @method({ args: ['params'], http: 'GET', path: 'stats' })
      async stats(_params: unknown) {
        return { total: 100 }
      }
    }

    const instance = new TestService()

    expect((instance.status as any)[METHOD_OPTIONS]).toEqual({
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status'
    })

    expect((instance.archive as any)[METHOD_OPTIONS]).toEqual({
      args: ['id', 'params'],
      http: 'POST',
      path: ':id/archive'
    })

    expect((instance.stats as any)[METHOD_OPTIONS]).toEqual({
      args: ['params'],
      http: 'GET',
      path: 'stats'
    })
  })

  it('supports external: false option', () => {
    class TestService {
      @method({ args: ['data', 'params'], external: false })
      async internalProcess(data: unknown, _params: unknown) {
        return data
      }
    }

    const instance = new TestService()

    expect((instance.internalProcess as any)[METHOD_OPTIONS]).toEqual({
      args: ['data', 'params'],
      external: false
    })
  })

  it('supports event option', () => {
    class TestService {
      @method({ args: ['data', 'params'], event: 'processed' })
      async process(data: unknown, _params: unknown) {
        return data
      }
    }

    const instance = new TestService()

    expect((instance.process as any)[METHOD_OPTIONS]).toEqual({
      args: ['data', 'params'],
      event: 'processed'
    })
  })

  it('supports custom route params in args', () => {
    class TestService {
      @method({ args: ['userId', 'messageId', 'params'], http: 'GET', path: ':userId/:messageId' })
      async getMessageForUser(userId: string, messageId: string, _params: unknown) {
        return { userId, messageId }
      }
    }

    const instance = new TestService()

    expect((instance.getMessageForUser as any)[METHOD_OPTIONS]).toEqual({
      args: ['userId', 'messageId', 'params'],
      http: 'GET',
      path: ':userId/:messageId'
    })
  })

  it('accepts empty options (defaults)', () => {
    class TestService {
      @method()
      async customMethod(data: unknown, _params: unknown) {
        return data
      }
    }

    const instance = new TestService()

    expect((instance.customMethod as any)[METHOD_OPTIONS]).toEqual({})
  })
})

describe('getMethodOptions', () => {
  it('retrieves options from decorated methods on instance', () => {
    const options: MethodOptions = {
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status'
    }

    class TestService {
      @method(options)
      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }

      async noDecorator(data: unknown, _params: unknown) {
        return data
      }
    }

    const instance = new TestService()

    expect(getMethodOptions(instance, 'status')).toEqual(options)
    expect(getMethodOptions(instance, 'noDecorator')).toBeUndefined()
    expect(getMethodOptions(instance, 'nonExistent')).toBeUndefined()
  })

  it('retrieves options from static methods property', () => {
    class TestService {
      static methods = {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' } as MethodOptions,
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' } as MethodOptions
      }

      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }

      async archive(_id: string, _params: unknown) {
        return { archived: true }
      }
    }

    const instance = new TestService()

    expect(getMethodOptions(instance, 'status')).toEqual({
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status'
    })

    expect(getMethodOptions(instance, 'archive')).toEqual({
      args: ['id', 'params'],
      http: 'POST',
      path: ':id/archive'
    })
  })

  it('decorator takes precedence over static property', () => {
    const decoratorOptions: MethodOptions = {
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status-decorated'
    }

    class TestService {
      static methods = {
        status: { args: ['data', 'params'], http: 'POST', path: 'status-static' } as MethodOptions
      }

      @method(decoratorOptions)
      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }
    }

    const instance = new TestService()

    // Decorator should win
    expect(getMethodOptions(instance, 'status')).toEqual(decoratorOptions)
  })
})

describe('getAllMethodOptions', () => {
  it('collects all method options from decorated methods', () => {
    class TestService {
      @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }

      @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
      async archive(_id: string, _params: unknown) {
        return { archived: true }
      }

      async noDecorator(data: unknown, _params: unknown) {
        return data
      }
    }

    const instance = new TestService()
    const allOptions = getAllMethodOptions(instance)

    expect(allOptions).toEqual({
      status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
      archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
    })
  })

  it('collects options from static methods property', () => {
    class TestService {
      static methods = {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' } as MethodOptions,
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' } as MethodOptions
      }

      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }

      async archive(_id: string, _params: unknown) {
        return { archived: true }
      }
    }

    const instance = new TestService()
    const allOptions = getAllMethodOptions(instance)

    expect(allOptions).toEqual({
      status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
      archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
    })
  })

  it('merges decorator and static options', () => {
    class TestService {
      static methods = {
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' } as MethodOptions
      }

      @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
      async status(_id: string, _params: unknown) {
        return { status: 'active' }
      }

      async archive(_id: string, _params: unknown) {
        return { archived: true }
      }
    }

    const instance = new TestService()
    const allOptions = getAllMethodOptions(instance)

    expect(allOptions).toEqual({
      status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
      archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
    })
  })
})

describe('clientMethods', () => {
  it('filters and prepares method configs for client use', () => {
    const config = clientMethods({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' },
        stats: { args: ['params'], http: 'GET', path: 'stats' },
        internalProcess: { args: ['data', 'params'], external: false }, // should be filtered
        noPath: { args: ['data', 'params'] } // should be filtered (no path)
      },
      users: {
        me: { args: ['params'], http: 'GET', path: 'me' }
      }
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' },
        stats: { args: ['params'], http: 'GET', path: 'stats' }
      },
      users: {
        me: { args: ['params'], http: 'GET', path: 'me' }
      }
    })
  })

  it('filters out internal methods (external: false)', () => {
    const config = clientMethods({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
        internal: { args: ['data', 'params'], external: false, path: ':id/internal' }
      }
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })
    expect(config.messages.internal).toBeUndefined()
  })

  it('filters out methods without paths', () => {
    const config = clientMethods({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
        noPath: { args: ['data', 'params'] } // no path
      }
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })
  })

  it('skips boolean configs', () => {
    const config = clientMethods({
      messages: {
        find: true, // boolean - skip
        get: true, // boolean - skip
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })
  })

  it('excludes services with no valid methods', () => {
    const config = clientMethods({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      },
      simple: {
        find: true,
        get: true
      }
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })
    expect(config.simple).toBeUndefined()
  })

  it('returns empty object when no services have custom paths', () => {
    const config = clientMethods({
      a: { find: true },
      b: { get: true, internal: { args: ['data', 'params'], external: false } }
    })

    expect(config).toEqual({})
  })

  it('strips server-only properties (external, event)', () => {
    const config = clientMethods({
      messages: {
        status: {
          args: ['id', 'params'],
          http: 'GET',
          path: ':id/status',
          external: true,
          event: 'statusChecked'
        }
      }
    })

    expect(config.messages.status).toEqual({
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status'
    })
    expect((config.messages.status as any).external).toBeUndefined()
    expect((config.messages.status as any).event).toBeUndefined()
  })

  it('handles undefined service methods gracefully', () => {
    const config = clientMethods({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      },
      users: undefined
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })
  })

  it('works with static methods from service classes', () => {
    class MessageService {
      static methods = {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' } as MethodOptions,
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' } as MethodOptions
      }
    }

    class UserService {
      static methods = {
        me: { args: ['params'], http: 'GET', path: 'me' } as MethodOptions
      }
    }

    const config = clientMethods({
      messages: MessageService.methods,
      users: UserService.methods
    })

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
      },
      users: {
        me: { args: ['params'], http: 'GET', path: 'me' }
      }
    })
  })
})
