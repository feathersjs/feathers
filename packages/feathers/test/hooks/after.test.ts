import assert from 'assert'
import { feathers, Id } from '../../src'

describe('`after` hooks', () => {
  it('.after hooks can return a promise', async () => {
    const app = feathers().use('/dummy', {
      async get(id: Id) {
        return {
          id,
          description: `You have to do ${id}`
        }
      },

      async find() {
        return []
      }
    })
    const service = app.service('dummy')

    service.hooks({
      after: {
        async get(hook) {
          hook.result.ran = true
          return hook
        },

        async find() {
          throw new Error('You can not see this')
        }
      }
    })

    const data = await service.get('laundry', {})

    assert.deepStrictEqual(data, {
      id: 'laundry',
      description: 'You have to do laundry',
      ran: true
    })

    await assert.rejects(() => service.find({}), {
      message: 'You can not see this'
    })
  })

  it('.after hooks do not need to return anything', async () => {
    const app = feathers().use('/dummy', {
      async get(id: Id) {
        return {
          id,
          description: `You have to do ${id}`
        }
      },

      async find() {
        return []
      }
    })
    const service = app.service('dummy')

    service.hooks({
      after: {
        get(context) {
          context.result.ran = true
        },

        find() {
          throw new Error('You can not see this')
        }
      }
    })

    const data = await service.get('laundry')

    assert.deepStrictEqual(data, {
      id: 'laundry',
      description: 'You have to do laundry',
      ran: true
    })

    await assert.rejects(() => service.find(), {
      message: 'You can not see this'
    })
  })

  it('gets mixed into a service and modifies data', async () => {
    const dummyService = {
      async create(data: any) {
        return data
      }
    }

    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      after: {
        create(context) {
          assert.strictEqual(context.type, 'after')

          context.result.some = 'thing'

          return context
        }
      }
    })

    const data = await service.create({ my: 'data' })

    assert.deepStrictEqual({ my: 'data', some: 'thing' }, data, 'Got modified data')
  })

  it('also makes the app available at hook.app', async () => {
    const dummyService = {
      async create(data: any) {
        return data
      }
    }

    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      after: {
        create(context) {
          context.result.appPresent = typeof context.app !== 'undefined'
          assert.strictEqual(context.result.appPresent, true)

          return context
        }
      }
    })

    const data = await service.create({ my: 'data' })

    assert.deepStrictEqual({ my: 'data', appPresent: true }, data, 'The app was present in the hook.')
  })

  it('returns errors', async () => {
    const dummyService = {
      async update(_id: any, data: any) {
        return data
      }
    }

    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      after: {
        update() {
          throw new Error('This did not work')
        }
      }
    })

    await assert.rejects(() => service.update(1, { my: 'data' }), {
      message: 'This did not work'
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
      after: {
        remove() {
          assert.ok(false, 'This should never get called')
        }
      }
    })

    await assert.rejects(() => service.remove(1, {}), {
      message: 'Error removing item'
    })
  })

  it('adds .after() and chains multiple hooks for the same method', async () => {
    const dummyService = {
      async create(data: any) {
        return data
      }
    }

    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      after: {
        create(context) {
          context.result.some = 'thing'

          return context
        }
      }
    })

    service.hooks({
      after: {
        create(context) {
          context.result.other = 'stuff'
        }
      }
    })

    const data = await service.create({ my: 'data' })

    assert.deepStrictEqual(
      {
        my: 'data',
        some: 'thing',
        other: 'stuff'
      },
      data,
      'Got modified data'
    )
  })

  it('chains multiple after hooks using array syntax', async () => {
    const dummyService = {
      async create(data: any) {
        return data
      }
    }

    const app = feathers().use('/dummy', dummyService)
    const service = app.service('dummy')

    service.hooks({
      after: {
        create: [
          function (context) {
            context.result.some = 'thing'

            return context
          },
          function (context) {
            context.result.other = 'stuff'

            return context
          }
        ]
      }
    })

    const data = await service.create({ my: 'data' })

    assert.deepStrictEqual(
      {
        my: 'data',
        some: 'thing',
        other: 'stuff'
      },
      data,
      'Got modified data'
    )
  })

  it('.after hooks run in the correct order (#13)', async () => {
    const app = feathers().use('/dummy', {
      async get(id: any) {
        return { id }
      }
    })
    const service = app.service('dummy')

    service.hooks({
      after: {
        get(context) {
          context.result.items = ['first']

          return context
        }
      }
    })

    service.hooks({
      after: {
        get: [
          function (context) {
            context.result.items.push('second')

            return context
          },
          function (context) {
            context.result.items.push('third')

            return context
          }
        ]
      }
    })

    const data = await service.get(10)

    assert.deepStrictEqual(data.items, ['first', 'second', 'third'])
  })

  it('after all hooks (#11)', async () => {
    const app = feathers().use('/dummy', {
      async get(id: any) {
        const items: any[] = []

        return { id, items }
      },

      async find() {
        return []
      }
    })

    const service = app.service('dummy')

    service.hooks({
      after: {
        all(context) {
          context.result.afterAllObject = true

          return context
        }
      }
    })

    service.hooks({
      after: [
        function (context) {
          context.result.afterAllMethodArray = true

          return context
        }
      ]
    })

    let data = await service.find({})

    assert.ok(data.afterAllObject)
    assert.ok(data.afterAllMethodArray)

    data = await service.get(1, {})

    assert.ok(data.afterAllObject)
    assert.ok(data.afterAllMethodArray)
  })

  it('after hooks have service as context and keep it in service method (#17)', async () => {
    class Dummy {
      number = 42
      async get(id: any) {
        return {
          id,
          number: this.number
        }
      }
    }
    const app = feathers().use('/dummy', new Dummy())

    const service = app.service('dummy')

    service.hooks({
      after: {
        get(this: any, hook) {
          hook.result.test = this.number + 1

          return hook
        }
      }
    })

    const data = await service.get(10)

    assert.deepStrictEqual(data, {
      id: 10,
      number: 42,
      test: 43
    })
  })

  it('.after all and method specific hooks run in the correct order (#3002)', async () => {
    const app = feathers().use('/dummy', {
      async get(id: any) {
        return { id, items: [] as any }
      }
    })
    const service = app.service('dummy')

    service.hooks({
      after: {
        all(context) {
          context.result.items.push('first')

          return context
        },
        get: [
          function (context) {
            context.result.items.push('second')

            return context
          },
          function (context) {
            context.result.items.push('third')

            return context
          }
        ]
      }
    })

    const data = await service.get(10)

    assert.deepStrictEqual(data.items, ['first', 'second', 'third'])
  })
})
