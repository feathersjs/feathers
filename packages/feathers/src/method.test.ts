import { describe, expect, it } from 'vitest'
import {
  method,
  getMethodOptions,
  getAllMethodOptions,
  getClientMethodConfig,
  buildMethodConfig,
  METHOD_OPTIONS
} from './method.js'
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
      async status(id: string, params: any) {
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
      async status(id: string, params: any) {
        return { status: 'active' }
      }

      @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
      async archive(id: string, params: any) {
        return { archived: true }
      }

      @method({ args: ['params'], http: 'GET', path: 'stats' })
      async stats(params: any) {
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
      async internalProcess(data: any, params: any) {
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
      async process(data: any, params: any) {
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
      async getMessageForUser(userId: string, messageId: string, params: any) {
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
      async customMethod(data: any, params: any) {
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
      async status(id: string, params: any) {
        return { status: 'active' }
      }

      async noDecorator(data: any, params: any) {
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

      async status(id: string, params: any) {
        return { status: 'active' }
      }

      async archive(id: string, params: any) {
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
      async status(id: string, params: any) {
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
      async status(id: string, params: any) {
        return { status: 'active' }
      }

      @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
      async archive(id: string, params: any) {
        return { archived: true }
      }

      async noDecorator(data: any, params: any) {
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

      async status(id: string, params: any) {
        return { status: 'active' }
      }

      async archive(id: string, params: any) {
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
      async status(id: string, params: any) {
        return { status: 'active' }
      }

      async archive(id: string, params: any) {
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

describe('getClientMethodConfig', () => {
  it('extracts client config from decorated methods with paths', () => {
    class MessageService {
      @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
      async status(id: string, params: any) {
        return { status: 'active' }
      }

      @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
      async archive(id: string, params: any) {
        return { archived: true }
      }

      @method({ args: ['params'], http: 'GET', path: 'stats' })
      async stats(params: any) {
        return { total: 100 }
      }

      // This method has no path, so it should NOT be included
      @method({ args: ['data', 'params'], external: false })
      async internalProcess(data: any, params: any) {
        return data
      }

      // Standard method - no decorator
      async find(params: any) {
        return []
      }
    }

    const config = getClientMethodConfig(MessageService)

    expect(config).toEqual({
      status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
      archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' },
      stats: { args: ['params'], http: 'GET', path: 'stats' }
    })

    // Should not include internalProcess (no path) or find (no decorator)
    expect(config.internalProcess).toBeUndefined()
    expect(config.find).toBeUndefined()
  })

  it('extracts client config from static methods property', () => {
    class MessageService {
      static methods = {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' } as MethodOptions,
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' } as MethodOptions,
        internal: { args: ['data', 'params'], external: false } as MethodOptions // no path
      }

      async status(id: string, params: any) {
        return { status: 'active' }
      }

      async archive(id: string, params: any) {
        return { archived: true }
      }

      async internal(data: any, params: any) {
        return data
      }
    }

    const config = getClientMethodConfig(MessageService)

    expect(config).toEqual({
      status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
      archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
    })

    // Should not include internal (no path)
    expect(config.internal).toBeUndefined()
  })

  it('returns empty object for services without custom paths', () => {
    class SimpleService {
      async find(params: any) {
        return []
      }

      async get(id: string, params: any) {
        return { id }
      }

      @method({ args: ['data', 'params'], external: false })
      async internalOnly(data: any, params: any) {
        return data
      }
    }

    const config = getClientMethodConfig(SimpleService)

    expect(config).toEqual({})
  })

  it('only includes args, http, and path in client config', () => {
    class MessageService {
      @method({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true,
        event: 'statusChecked'
      })
      async status(id: string, params: any) {
        return { status: 'active' }
      }
    }

    const config = getClientMethodConfig(MessageService)

    // Should only have args, http, path - not external or event
    expect(config.status).toEqual({
      args: ['id', 'params'],
      http: 'GET',
      path: ':id/status'
    })
    expect((config.status as any).external).toBeUndefined()
    expect((config.status as any).event).toBeUndefined()
  })
})

describe('buildMethodConfig', () => {
  it('builds config from multiple service classes', () => {
    class MessageService {
      @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
      async status(id: string, params: any) {
        return { status: 'active' }
      }

      @method({ args: ['id', 'params'], http: 'POST', path: ':id/archive' })
      async archive(id: string, params: any) {
        return { archived: true }
      }
    }

    class UserService {
      @method({ args: ['params'], http: 'GET', path: 'me' })
      async me(params: any) {
        return { id: 1, name: 'Current User' }
      }
    }

    class SimpleService {
      // No custom paths
      async find(params: any) {
        return []
      }
    }

    const services = {
      messages: MessageService,
      users: UserService,
      simple: SimpleService
    }

    const config = buildMethodConfig(services)

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' },
        archive: { args: ['id', 'params'], http: 'POST', path: ':id/archive' }
      },
      users: {
        me: { args: ['params'], http: 'GET', path: 'me' }
      }
    })

    // SimpleService should not be included (no custom paths)
    expect(config.simple).toBeUndefined()
  })

  it('returns empty object when no services have custom paths', () => {
    class ServiceA {
      async find(params: any) {
        return []
      }
    }

    class ServiceB {
      async get(id: string, params: any) {
        return { id }
      }
    }

    const services = {
      a: ServiceA,
      b: ServiceB
    }

    const config = buildMethodConfig(services)

    expect(config).toEqual({})
  })

  it('works with static methods property', () => {
    class MessageService {
      static methods = {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' } as MethodOptions
      }

      async status(id: string, params: any) {
        return { status: 'active' }
      }
    }

    const services = { messages: MessageService }
    const config = buildMethodConfig(services)

    expect(config).toEqual({
      messages: {
        status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      }
    })
  })
})
