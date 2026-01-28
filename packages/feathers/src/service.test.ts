import { describe, expect, it } from 'vitest'
import {
  normalizeServiceOptions,
  normalizeMethodConfig,
  normalizeAllMethodOptions,
  defaultMethodOptions,
  defaultCustomMethodOptions,
  getServiceOptions
} from './service.js'
import { method } from './method.js'
import { feathers } from './index.js'
import type { MethodOptions } from './declarations.js'

describe('Service method options normalization', () => {
  describe('defaultMethodOptions', () => {
    it('has correct defaults for standard methods', () => {
      expect(defaultMethodOptions.find).toEqual({
        args: ['params'],
        http: 'GET',
        external: true
      })
      expect(defaultMethodOptions.get).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        external: true
      })
      expect(defaultMethodOptions.create).toEqual({
        args: ['data', 'params'],
        http: 'POST',
        external: true,
        event: 'created'
      })
      expect(defaultMethodOptions.update).toEqual({
        args: ['id', 'data', 'params'],
        http: 'PUT',
        external: true,
        event: 'updated'
      })
      expect(defaultMethodOptions.patch).toEqual({
        args: ['id', 'data', 'params'],
        http: 'PATCH',
        external: true,
        event: 'patched'
      })
      expect(defaultMethodOptions.remove).toEqual({
        args: ['id', 'params'],
        http: 'DELETE',
        external: true,
        event: 'removed'
      })
    })
  })

  describe('defaultCustomMethodOptions', () => {
    it('has correct defaults for custom methods', () => {
      expect(defaultCustomMethodOptions).toEqual({
        args: ['data', 'params'],
        http: 'POST',
        external: true
      })
    })
  })

  describe('normalizeMethodConfig', () => {
    it('returns defaults for standard method without options', () => {
      const service = { find() {} }
      const config = normalizeMethodConfig(service, 'find', undefined)

      expect(config).toEqual(defaultMethodOptions.find)
    })

    it('returns custom defaults for non-standard method without options', () => {
      const service = { customMethod() {} }
      const config = normalizeMethodConfig(service, 'customMethod', undefined)

      expect(config).toEqual(defaultCustomMethodOptions)
    })

    it('merges decorator options with defaults', () => {
      class TestService {
        @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
        async status(id: string, params: any) {
          return { status: 'active' }
        }
      }

      const service = new TestService()
      const config = normalizeMethodConfig(service, 'status', undefined)

      expect(config).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true // from default
      })
    })

    it('app.use() options override decorator options', () => {
      class TestService {
        @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
        async status(id: string, params: any) {
          return { status: 'active' }
        }
      }

      const service = new TestService()
      const useOptions: MethodOptions = { args: ['data', 'params'], http: 'POST' }
      const config = normalizeMethodConfig(service, 'status', useOptions)

      expect(config).toEqual({
        args: ['data', 'params'], // from app.use()
        http: 'POST', // from app.use()
        path: ':id/status', // from decorator
        external: true // from default
      })
    })

    it('handles external: false from decorator', () => {
      class TestService {
        @method({ external: false })
        async internalMethod(data: any, params: any) {
          return data
        }
      }

      const service = new TestService()
      const config = normalizeMethodConfig(service, 'internalMethod', undefined)

      expect(config.external).toBe(false)
    })
  })

  describe('normalizeAllMethodOptions', () => {
    it('normalizes methods from array (backwards compatible)', () => {
      const service = {
        find() {},
        get() {},
        customMethod() {}
      }

      const options = normalizeAllMethodOptions(service, ['find', 'get', 'customMethod'])

      expect(Object.keys(options)).toEqual(['find', 'get', 'customMethod'])
      expect(options.find).toEqual(defaultMethodOptions.find)
      expect(options.get).toEqual(defaultMethodOptions.get)
      expect(options.customMethod).toEqual(defaultCustomMethodOptions)
    })

    it('normalizes methods from object config', () => {
      const service = {
        find() {},
        customMethod() {}
      }

      const options = normalizeAllMethodOptions(service, {
        find: true,
        customMethod: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
      })

      expect(Object.keys(options)).toEqual(['find', 'customMethod'])
      expect(options.find).toEqual(defaultMethodOptions.find)
      expect(options.customMethod).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true
      })
    })

    it('excludes methods with false config', () => {
      const service = {
        find() {},
        get() {},
        create() {}
      }

      const options = normalizeAllMethodOptions(service, {
        find: true,
        get: false,
        create: true
      })

      expect(Object.keys(options)).toEqual(['find', 'create'])
    })

    it('auto-detects decorated custom methods when no option provided', () => {
      class TestService {
        async find(params: any) {
          return []
        }

        @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
        async status(id: string, params: any) {
          return { status: 'active' }
        }
      }

      const service = new TestService()
      const options = normalizeAllMethodOptions(service, undefined)

      expect(Object.keys(options)).toContain('find')
      expect(Object.keys(options)).toContain('status')
      expect(options.status).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true
      })
    })
  })

  describe('normalizeServiceOptions', () => {
    it('normalizes with array methods (backwards compatible)', () => {
      const service = {
        find() {},
        get() {},
        customMethod() {}
      }

      const options = normalizeServiceOptions(service, {
        methods: ['find', 'get', 'customMethod']
      })

      expect(options.methods).toEqual(['find', 'get', 'customMethod'])
      expect(options.methodOptions).toBeDefined()
      expect(options.methodOptions.find).toEqual(defaultMethodOptions.find)
      expect(options.methodOptions.customMethod).toEqual(defaultCustomMethodOptions)
    })

    it('normalizes with object methods config', () => {
      const service = {
        find() {},
        status() {}
      }

      const options = normalizeServiceOptions(service, {
        methods: {
          find: true,
          status: { args: ['id', 'params'], http: 'GET', path: ':id/status' }
        }
      })

      expect(options.methods).toEqual(['find', 'status'])
      expect(options.methodOptions.status).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true
      })
    })

    it('auto-detects methods when no methods option provided', () => {
      const service = {
        find() {},
        get() {},
        create() {}
      }

      const options = normalizeServiceOptions(service, {})

      expect(options.methods).toEqual(['find', 'get', 'create'])
    })

    it('preserves other service options', () => {
      const service = { find() {} }

      const options = normalizeServiceOptions(service, {
        events: ['myEvent'],
        routeParams: { tenantId: '123' }
      })

      expect(options.events).toEqual(['myEvent'])
      expect(options.routeParams).toEqual({ tenantId: '123' })
    })
  })

  describe('Integration with app.use()', () => {
    it('stores normalized method options on registered service', () => {
      const app = feathers()

      class MessageService {
        @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
        async status(id: string, params: any) {
          return { status: 'active' }
        }

        async find(params: any) {
          return []
        }
      }

      app.use('messages', new MessageService())

      const options = getServiceOptions(app.service('messages'))

      expect(options.methods).toContain('find')
      expect(options.methods).toContain('status')
      expect(options.methodOptions).toBeDefined()
      expect(options.methodOptions.status).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true
      })
    })

    it('app.use() options override decorator options', () => {
      const app = feathers()

      class MessageService {
        @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
        async status(id: string, params: any) {
          return { status: 'active' }
        }

        async find(params: any) {
          return []
        }
      }

      app.use('messages', new MessageService(), {
        methods: {
          find: true,
          status: { args: ['data', 'params'], http: 'POST' }
        }
      })

      const options = getServiceOptions(app.service('messages'))

      expect(options.methodOptions.status).toEqual({
        args: ['data', 'params'], // overridden by app.use()
        http: 'POST', // overridden by app.use()
        path: ':id/status', // from decorator
        external: true
      })
    })

    it('works with static methods property', () => {
      const app = feathers()

      class MessageService {
        static methods = {
          status: { args: ['id', 'params'], http: 'GET', path: ':id/status' } as MethodOptions
        }

        async status(id: string, params: any) {
          return { status: 'active' }
        }

        async find(params: any) {
          return []
        }
      }

      app.use('messages', new MessageService(), {
        methods: ['find', 'status']
      })

      const options = getServiceOptions(app.service('messages'))

      expect(options.methodOptions.status).toEqual({
        args: ['id', 'params'],
        http: 'GET',
        path: ':id/status',
        external: true
      })
    })
  })

  describe('Hooks with custom method args', () => {
    it('hooks receive correct arguments based on method config', async () => {
      const app = feathers()
      const receivedArgs: any[] = []

      class MessageService {
        @method({ args: ['id', 'params'], http: 'GET', path: ':id/status' })
        async status(id: string, params: any) {
          return { id, status: 'active' }
        }
      }

      app.use('messages', new MessageService())

      const service = app.service('messages')
      service.hooks({
        status: [
          async (context: any, next: any) => {
            receivedArgs.push({
              id: context.id,
              params: context.params,
              data: context.data
            })
            await next()
          }
        ]
      })

      await service.status('123', { query: { foo: 'bar' } })

      expect(receivedArgs).toHaveLength(1)
      expect(receivedArgs[0].id).toBe('123')
      expect(receivedArgs[0].params.query).toEqual({ foo: 'bar' })
      expect(receivedArgs[0].data).toBeUndefined()
    })

    it('hooks receive data argument when method has data in args', async () => {
      const app = feathers()
      const receivedArgs: any[] = []

      class MessageService {
        @method({ args: ['data', 'params'], http: 'POST' })
        async process(data: any, params: any) {
          return { processed: data }
        }
      }

      app.use('messages', new MessageService())

      const service = app.service('messages')
      service.hooks({
        process: [
          async (context: any, next: any) => {
            receivedArgs.push({
              id: context.id,
              params: context.params,
              data: context.data
            })
            await next()
          }
        ]
      })

      await service.process({ message: 'hello' }, { query: {} })

      expect(receivedArgs).toHaveLength(1)
      expect(receivedArgs[0].data).toEqual({ message: 'hello' })
      expect(receivedArgs[0].id).toBeUndefined()
    })

    it('hooks receive id, data, params when all are in args', async () => {
      const app = feathers()
      const receivedArgs: any[] = []

      class MessageService {
        @method({ args: ['id', 'data', 'params'], http: 'POST', path: ':id/update' })
        async customUpdate(id: string, data: any, params: any) {
          return { id, ...data }
        }
      }

      app.use('messages', new MessageService())

      const service = app.service('messages')
      service.hooks({
        customUpdate: [
          async (context: any, next: any) => {
            receivedArgs.push({
              id: context.id,
              params: context.params,
              data: context.data
            })
            await next()
          }
        ]
      })

      await service.customUpdate('456', { title: 'Updated' }, { query: {} })

      expect(receivedArgs).toHaveLength(1)
      expect(receivedArgs[0].id).toBe('456')
      expect(receivedArgs[0].data).toEqual({ title: 'Updated' })
    })
  })

  describe('external: false methods', () => {
    it('internal methods can be called directly', async () => {
      const app = feathers()

      class MessageService {
        @method({ args: ['data', 'params'], external: false })
        async internalProcess(data: any, params: any) {
          return { processed: data, internal: true }
        }
      }

      app.use('messages', new MessageService())

      const result = await app.service('messages').internalProcess({ test: 'data' }, {})

      expect(result).toEqual({ processed: { test: 'data' }, internal: true })
    })

    it('hooks run on internal methods', async () => {
      const app = feathers()
      let hookRan = false

      class MessageService {
        @method({ args: ['data', 'params'], external: false })
        async internalProcess(data: any, params: any) {
          return { processed: data }
        }
      }

      app.use('messages', new MessageService())

      app.service('messages').hooks({
        internalProcess: [
          async (context: any, next: any) => {
            hookRan = true
            await next()
          }
        ]
      })

      await app.service('messages').internalProcess({ test: 'data' }, {})

      expect(hookRan).toBe(true)
    })
  })
})
