/* eslint-disable @typescript-eslint/ban-ts-comment */
import { describe, it } from 'vitest'
import assert from 'assert'
import { feathers, Feathers, getServiceOptions, Id, version } from '../src/index.js'

describe('Feathers application', () => {
  it('initializes', () => {
    const app = feathers()

    assert.ok(app instanceof Feathers)
  })

  it('sets the version on main and app instance', () => {
    const app = feathers()

    assert.ok(version > '5.0.0')
    assert.ok(app.version > '5.0.0')
  })

  it('is an event emitter', async () => {
    const app = feathers()
    const original = { hello: 'world' }

    const promise = new Promise<void>((resolve) => {
      app.on('test', (data: any) => {
        assert.deepStrictEqual(original, data)
        resolve()
      })
    })

    app.emit('test', original)
    await promise
  })

  it('uses .defaultService if available', async () => {
    const app = feathers()

    assert.throws(() => app.service('/todos/'), {
      message: "Can not find service 'todos'"
    })

    app.defaultService = function (location: string) {
      assert.strictEqual(location, 'todos')
      return {
        async get(id: string) {
          return {
            id,
            description: `You have to do ${id}!`
          }
        }
      }
    }

    const data = await app.service('/todos/').get('dishes')

    assert.deepStrictEqual(data, {
      id: 'dishes',
      description: 'You have to do dishes!'
    })
  })

  it('additionally passes `app` as .configure parameter (#558)', async () => {
    await new Promise<void>((resolve) => {
      feathers().configure(function (app) {
        assert.strictEqual(this, app)
        resolve()
      })
    })
  })

  describe('Services', () => {
    it('calling .use with invalid path throws', () => {
      const app = feathers()

      //@ts-ignore
      assert.throws(() => app.use(null, {}), {
        message: "'null' is not a valid service path."
      })

      // @ts-ignore
      assert.throws(() => app.use({}, {}), {
        message: "'[object Object]' is not a valid service path."
      })
    })

    it('calling .use with a non service object throws', () => {
      const app = feathers()

      // @ts-ignore
      assert.throws(() => app.use('/bla', function () {}), {
        message: 'Invalid service object passed for path `bla`'
      })
    })

    it('registers and wraps a new service and can unregister (#2035)', async () => {
      const dummyService = {
        async setup(this: any, _app: any, path: string) {
          this.path = path
        },

        async teardown(this: any, _app: any, path: string) {
          this.path = path
        },

        async create(data: any) {
          return data
        }
      }

      const app = feathers<{ dummy: typeof dummyService }>().use('dummy', dummyService)
      const wrappedService = app.service('dummy')

      assert.strictEqual(
        Object.getPrototypeOf(wrappedService),
        dummyService,
        'Object points to original service prototype'
      )

      const data = await wrappedService.create({
        message: 'Test message'
      })

      assert.strictEqual(data.message, 'Test message')

      await app.unuse('dummy')

      assert.strictEqual(Object.keys(app.services).length, 0)
      assert.throws(() => app.service('dummy'), {
        message: "Can not find service 'dummy'"
      })
    })

    it('can not register custom methods on a protected methods', async () => {
      const dummyService = {
        async create(data: any) {
          return data
        },
        async removeListener(data: any) {
          return data
        },
        async setup() {},

        async teardown() {}
      }

      assert.throws(
        () =>
          feathers().use('/dummy', dummyService, {
            methods: ['create', 'removeListener']
          }),
        {
          message: "'removeListener' on service 'dummy' is not allowed as a custom method name"
        }
      )
      assert.throws(
        () =>
          feathers().use('/dummy', dummyService, {
            methods: ['create', 'setup']
          }),
        {
          message: "'setup' on service 'dummy' is not allowed as a custom method name"
        }
      )
      assert.throws(
        () =>
          feathers().use('/dummy', dummyService, {
            methods: ['create', 'teardown']
          }),
        {
          message: "'teardown' on service 'dummy' is not allowed as a custom method name"
        }
      )
    })

    it('can register service with no external methods', async () => {
      const dummyService = {
        async create(data: any) {
          return data
        }
      }

      feathers().use('dummy', dummyService, {
        methods: []
      })
    })

    it('can use a root level service', async () => {
      const app = feathers().use('/', {
        async get(id: string) {
          return { id }
        }
      })

      const result = await app.service('/').get('test')

      assert.deepStrictEqual(result, { id: 'test' })
    })

    it('services can be re-used (#566)', async () => {
      const service = {
        async create(data: any) {
          return data
        }
      }
      const app1 = feathers<{ dummy: typeof service; testing: any }>()
      const app2 = feathers<{ dummy: typeof service; testing: any }>()

      app1.use('dummy', service)
      app2.use('dummy', service)

      const dummy = app2.service('dummy')

      dummy.hooks({
        before: {
          create: [
            async (context: any) => {
              context.data.fromHook = true
              return context
            }
          ]
        }
      })

      const result = await dummy.create({ message: 'Hello' })

      assert.deepStrictEqual(result, {
        message: 'Hello',
        fromHook: true
      })
    })

    it('async hooks run before regular hooks', async () => {
      const service = {
        async create(data: any) {
          return data
        }
      }
      const app = feathers<{ dummy: typeof service }>()

      app.use('dummy', service)

      const dummy = app.service('dummy')

      dummy.hooks({
        before: {
          create(ctx) {
            ctx.data.order.push('before')
          }
        }
      })

      dummy.hooks([
        async (ctx: any, next: any) => {
          ctx.data.order = ['async']
          await next()
        }
      ])

      const result = await dummy.create({
        message: 'hi'
      })

      assert.deepStrictEqual(result, {
        message: 'hi',
        order: ['async', 'before']
      })
    })

    it('services conserve Symbols', () => {
      const TEST = Symbol('test')
      const dummyService = {
        [TEST]: true,

        async setup(this: any, _app: any, path: string) {
          this.path = path
        },

        async create(data: any) {
          return data
        }
      }

      const app = feathers().use('/dummy', dummyService)
      const wrappedService = app.service('dummy')

      assert.ok((wrappedService as any)[TEST])
    })

    it('methods conserve Symbols', () => {
      const TEST = Symbol('test')
      const dummyService = {
        async setup(this: any, _app: any, path: string) {
          this.path = path
        },

        async create(data: any) {
          return data
        }
      }

      ;(dummyService.create as any)[TEST] = true

      const app = feathers().use('/dummy', dummyService)
      const wrappedService = app.service('dummy')

      assert.ok((wrappedService.create as any)[TEST])
    })

    it('.service does does not access object properties', async () => {
      const app = feathers()

      assert.throws(() => app.service('something'), {
        message: "Can not find service 'something'"
      })
      assert.throws(() => app.service('__proto__'), {
        message: "Can not find service '__proto__'"
      })
      assert.throws(() => app.service('toString'), {
        message: "Can not find service 'toString'"
      })
    })
  })

  describe('Express app options compatibility', function () {
    describe('.set()', () => {
      it('should set a value', () => {
        const app = feathers()
        app.set('foo', 'bar')
        assert.strictEqual(app.get('foo'), 'bar')
      })

      it('should return the app', () => {
        const app = feathers()
        assert.strictEqual(app.set('foo', 'bar'), app)
      })

      it('should return the app when undefined', () => {
        const app = feathers()
        assert.strictEqual(app.set('foo', undefined), app)
      })
    })

    describe('.get()', () => {
      it('should return undefined when unset', () => {
        const app = feathers()
        assert.strictEqual(app.get('foo'), undefined)
      })

      it('should otherwise return the value', () => {
        const app = feathers()
        app.set('foo', 'bar')
        assert.strictEqual(app.get('foo'), 'bar')
      })
    })
  })

  describe('.setup and .teardown', () => {
    it('app.setup and app.teardown calls .setup and .teardown on all services', async () => {
      const app = feathers()
      let setupCount = 0
      let teardownCount = 0

      app.use('/dummy', {
        async setup(appRef: any, path: any) {
          setupCount++
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy')
        },

        async teardown(appRef: any, path: any) {
          teardownCount++
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy')
        }
      })

      app.use('/simple', {
        get(id: string) {
          return Promise.resolve({ id })
        }
      })

      app.use('/dummy2', {
        async setup(appRef: any, path: any) {
          setupCount++
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy2')
        },

        async teardown(appRef: any, path: any) {
          teardownCount++
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy2')
        }
      })

      await app.setup()

      assert.ok((app as any)._isSetup)
      assert.strictEqual(setupCount, 2)

      await app.teardown()

      assert.ok(!(app as any)._isSetup)
      assert.strictEqual(teardownCount, 2)
    })

    it('registering app.setup but while still pending will be set up', async () => {
      const app = feathers()

      app.setup()

      app.use('/dummy', {
        async setup(appRef: any, path: any) {
          assert.ok((app as any)._isSetup)
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy')
        }
      })
    })
  })

  describe('.teardown', () => {
    it('app.teardown calls .teardown on all services', async () => {
      const app = feathers()
      let teardownCount = 0

      app.use('/dummy', {
        async setup() {},
        async teardown(appRef: any, path: any) {
          teardownCount++
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy')
        }
      })

      app.use('/simple', {
        get(id: string) {
          return Promise.resolve({ id })
        }
      })

      app.use('/dummy2', {
        async setup() {},
        async teardown(appRef: any, path: any) {
          teardownCount++
          assert.strictEqual(appRef, app)
          assert.strictEqual(path, 'dummy2')
        }
      })

      await app.setup()
      await app.teardown()

      assert.equal((app as any)._isSetup, false)
      assert.strictEqual(teardownCount, 2)
    })
  })

  describe('mixins', () => {
    class Dummy {
      dummy = true
      async get(id: Id) {
        return { id }
      }
    }

    it('are getting called with a service and default options', () => {
      const app = feathers()
      let mixinRan = false

      app.mixins.push(function (service: any, location: any, options: any) {
        assert.ok(service.dummy)
        assert.strictEqual(location, 'dummy')
        assert.deepStrictEqual(options, getServiceOptions(service))
        mixinRan = true
      })

      app.use('/dummy', new Dummy())

      assert.ok(mixinRan)

      app.setup()
    })

    it('are getting called with a service and service options', () => {
      const app = feathers()
      const opts = { events: ['bla'] }

      let mixinRan = false

      app.mixins.push(function (service: any, location: any, options: any) {
        assert.ok(service.dummy)
        assert.strictEqual(location, 'dummy')
        assert.deepStrictEqual(options, getServiceOptions(service))
        mixinRan = true
      })

      app.use('/dummy', new Dummy(), opts)

      assert.ok(mixinRan)

      app.setup()
    })
  })

  describe('sub apps', () => {
    it('re-registers sub-app services with prefix', async () => {
      const app = feathers()
      const subApp = feathers()

      subApp
        .use('/service1', {
          async get(id: string) {
            return {
              id,
              name: 'service1'
            }
          }
        })
        .use('/service2', {
          async get(id: string) {
            return {
              id,
              name: 'service2'
            }
          },

          async create(data: any) {
            return data
          }
        })

      app.use('/api/', subApp)

      const result1 = await app.service('/api/service1').get(10)
      assert.strictEqual(result1.name, 'service1')

      const result2 = await app.service('/api/service2').get(1)
      assert.strictEqual(result2.name, 'service2')

      const result3 = await subApp.service('service2').create({
        message: 'This is a test'
      })
      assert.deepStrictEqual(result3, {
        message: 'This is a test'
      })

      const result4 = await app.service('/api/service2').create({
        message: 'This is another test'
      })
      assert.deepStrictEqual(result4, {
        message: 'This is another test'
      })
    })
  })
})
