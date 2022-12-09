import assert from 'assert'
import { feathers, Params, ServiceInterface } from '../../src'

describe('`around` hooks', () => {
  it('around hooks can set hook.result which will skip service method', async () => {
    const app = feathers().use('/dummy', {
      async get() {
        assert.ok(false, 'This should never run')
      }
    })
    const service = app.service('dummy')

    service.hooks({
      get: [
        async (hook, next) => {
          hook.result = {
            id: hook.id,
            message: 'Set from hook'
          }

          await next()
        }
      ]
    })

    const data = await service.get(10, {})

    assert.deepStrictEqual(data, {
      id: 10,
      message: 'Set from hook'
    })
  })

  it('works with traditional registration format, all syntax and app hooks', async () => {
    const app = feathers().use('/dummy', {
      async get() {
        assert.ok(false, 'This should never run')
      }
    })
    const service = app.service('dummy')

    app.hooks([
      async function (this: any, hook, next) {
        hook.result = {
          id: hook.id,
          app: 'Set from app around all'
        }

        await next()
      }
    ])

    service.hooks({
      around: {
        all: [
          async (hook, next) => {
            hook.result = {
              ...hook.result,
              all: 'Set from around all'
            }

            await next()
          }
        ],
        get: [
          async (hook, next) => {
            hook.result = {
              ...hook.result,
              get: 'Set from around get'
            }

            await next()
          }
        ]
      }
    })

    const data = await service.get(10, {})

    assert.deepStrictEqual(data, {
      id: 10,
      app: 'Set from app around all',
      all: 'Set from around all',
      get: 'Set from around get'
    })
  })

  it('gets mixed into a service and modifies data', async () => {
    const dummyService = {
      async create(data: any, params: any) {
        assert.deepStrictEqual(
          data,
          {
            some: 'thing',
            modified: 'data'
          },
          'Data modified'
        )

        assert.deepStrictEqual(
          params,
          {
            modified: 'params'
          },
          'Params modified'
        )

        return data
      }
    }
    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      create: [
        async (hook, next) => {
          assert.strictEqual(hook.type, 'around')

          hook.data.modified = 'data'

          Object.assign(hook.params, {
            modified: 'params'
          })

          await next()
        }
      ]
    })

    const data = await service.create({ some: 'thing' })

    assert.deepStrictEqual(
      data,
      {
        some: 'thing',
        modified: 'data'
      },
      'Data got modified'
    )
  })

  it('contains the app object at hook.app', async () => {
    const someServiceConfig = {
      async create(data: any) {
        return data
      }
    }
    const app = feathers().use('/some-service', someServiceConfig)
    const someService = app.service('some-service')

    someService.hooks({
      create: [
        async (hook, next) => {
          hook.data.appPresent = typeof hook.app !== 'undefined'
          assert.strictEqual(hook.data.appPresent, true)
          return next()
        }
      ]
    })

    const data = await someService.create({ some: 'thing' })

    assert.deepStrictEqual(
      data,
      {
        some: 'thing',
        appPresent: true
      },
      'App object was present'
    )
  })

  it('passes errors', async () => {
    const dummyService = {
      update() {
        assert.ok(false, 'Never should be called')
      }
    }
    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      update: [
        async () => {
          throw new Error('You are not allowed to update')
        }
      ]
    })

    await assert.rejects(() => service.update(1, {}), {
      message: 'You are not allowed to update'
    })
  })

  it('does not run after hook when there is an error', async () => {
    const dummyService = {
      async remove() {
        throw new Error('Error removing item')
      }
    }
    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      remove: [
        async (_context, next) => {
          await next()

          assert.ok(false, 'This should never get called')
        }
      ]
    })

    await assert.rejects(() => service.remove(1, {}), {
      message: 'Error removing item'
    })
  })

  it('adds .hooks() and chains multiple hooks for the same method', async () => {
    interface DummyParams extends Params {
      modified: string
    }

    class DummyService implements ServiceInterface<any, any, DummyParams> {
      create(data: any, params?: any) {
        assert.deepStrictEqual(
          data,
          {
            some: 'thing',
            modified: 'second data'
          },
          'Data modified'
        )

        assert.deepStrictEqual(
          params,
          {
            modified: 'params'
          },
          'Params modified'
        )

        return Promise.resolve(data)
      }
    }

    const app = feathers<{ dummy: DummyService }>().use('dummy', new DummyService())
    const service = app.service('dummy')

    service.hooks({
      create: [
        async (hook, next) => {
          hook.params.modified = 'params'

          await next()
        },
        async (hook, next) => {
          hook.data.modified = 'second data'

          next()
        }
      ]
    })

    await service.create({ some: 'thing' })
  })

  it('around hooks run in the correct order', async () => {
    interface DummyParams extends Params<{ name: string }> {
      items: string[]
    }

    class DummyService implements ServiceInterface<any, any, DummyParams> {
      async get(id: any, params?: DummyParams) {
        assert.deepStrictEqual(params.items, ['first', 'second', 'third'])

        return {
          id,
          items: [] as string[]
        }
      }
    }

    const app = feathers<{ dummy: DummyService }>().use('dummy', new DummyService())
    const service = app.service('dummy')

    service.hooks({
      get: [
        async (hook, next) => {
          hook.params.items = ['first']
          await next()
        }
      ]
    })

    service.hooks({
      get: [
        async function (hook, next) {
          hook.params.items.push('second')
          next()
        },
        async function (hook, next) {
          hook.params.items.push('third')
          next()
        }
      ]
    })

    await service.get(10)
  })

  it('around all hooks (#11)', async () => {
    interface DummyParams extends Params {
      asyncAllObject: boolean
      asyncAllMethodArray: boolean
    }

    type DummyService = ServiceInterface<any, any, DummyParams>

    const app = feathers<{ dummy: DummyService }>().use('dummy', {
      async get(id: any, params: any) {
        assert.ok(params.asyncAllObject)
        assert.ok(params.asyncAllMethodArray)

        return {
          id,
          items: []
        }
      },

      async find(params: any) {
        assert.ok(params.asyncAllObject)
        assert.ok(params.asyncAllMethodArray)

        return []
      }
    })

    const service = app.service('dummy')

    service.hooks([
      async (hook, next) => {
        hook.params.asyncAllObject = true
        next()
      }
    ])

    service.hooks([
      async function (hook, next) {
        hook.params.asyncAllMethodArray = true
        next()
      }
    ])

    await service.find()
  })

  it('around hooks have service as context and keep it in service method (#17)', async () => {
    interface DummyParams extends Params {
      test: number
    }

    class Dummy implements ServiceInterface<any, any, DummyParams> {
      number = 42

      async get(id: any, params?: DummyParams) {
        return {
          id,
          number: (this as any).number,
          test: params.test
        }
      }
    }

    const app = feathers<{ dummy: Dummy }>().use('dummy', new Dummy())

    const service = app.service('dummy')

    service.hooks({
      get: [
        async function (this: any, hook, next) {
          hook.params.test = this.number + 2

          await next()
        }
      ]
    })

    const data = await service.get(10)

    assert.deepStrictEqual(data, {
      id: 10,
      number: 42,
      test: 44
    })
  })
})
