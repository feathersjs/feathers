import { createContext, feathers, HookContext } from '@feathersjs/feathers'
import assert from 'assert'
import { VALIDATED } from '@feathersjs/adapter-commons'
import { MemoryService } from '@feathersjs/memory'
import { getDispatch, resolve, resolveExternal, validateQuery } from '../src'
import { app, Message, User } from './fixture'

describe('@feathersjs/schema/hooks', () => {
  const text = 'Hi there'
  let message: Message
  let messageOnPaginatedService: Message
  let user: User

  const userProps = (user: User) => ({
    user,
    userList: [user],
    userPage: {
      limit: 2,
      skip: 0,
      total: 1,
      data: [user]
    }
  })

  before(async () => {
    user = (
      await app.service('users').create([
        {
          email: 'hello@feathersjs.com',
          password: 'supersecret'
        }
      ])
    )[0]
    message = await app.service('messages').create({
      text,
      userId: user.id
    })
    messageOnPaginatedService = await app.service('paginatedMessages').create({
      text,
      userId: user.id
    })
  })

  it('ran resolvers in sequence', async () => {
    assert.strictEqual(user.name, 'hello (hello@feathersjs.com)')
  })

  it('validates data', async () => {
    assert.rejects(() => app.service('users').create({ password: 'failing' } as any), {
      name: 'BadRequest'
    })
  })

  it('resolves results and handles resolver errors (#2534)', async () => {
    const payload = {
      userId: user.id,
      text
    }

    assert.ok(user)
    assert.strictEqual(user.password, 'hashed', 'Resolved data')
    assert.deepStrictEqual(message, {
      id: 0,
      ...userProps(user),
      ...payload
    })

    const messages = await app.service('messages').find({
      provider: 'external'
    })

    assert.deepStrictEqual(messages, [
      {
        id: 0,
        ...userProps(user),
        ...payload
      }
    ])

    await assert.rejects(
      () =>
        app.service('messages').find({
          provider: 'external',
          error: true
        }),
      {
        name: 'BadRequest',
        message: 'Error resolving data',
        code: 400,
        className: 'bad-request',
        data: {
          user: {
            name: 'GeneralError',
            message: 'This is an error',
            code: 500,
            className: 'general-error'
          }
        }
      }
    )
  })

  it('resolves get result with the object on result', async () => {
    const payload = {
      userId: user.id,
      text
    }

    assert.ok(user)
    assert.strictEqual(user.password, 'hashed', 'Resolved data')
    assert.deepStrictEqual(message, {
      id: 0,
      ...userProps(user),
      ...payload
    })

    const result = await app.service('messages').get(0, {
      provider: 'external'
    })

    assert.deepStrictEqual(result, {
      id: 0,
      ...userProps(user),
      ...payload
    })
  })

  it('resolves with $select and virtual properties', async () => {
    const messages = await app.service('messages').find({
      paginate: false,
      query: {
        $select: ['user', 'text']
      }
    })
    assert.deepStrictEqual(Object.keys(messages[0]), ['text', 'user'])
  })

  it('resolves find results with paginated result object', async () => {
    const payload = {
      userId: user.id,
      text
    }

    assert.ok(user)
    assert.strictEqual(user.password, 'hashed', 'Resolved data')
    assert.deepStrictEqual(messageOnPaginatedService, {
      id: 0,
      ...userProps(user),
      ...payload
    })

    const messages = await app.service('paginatedMessages').find({
      provider: 'external',
      query: {
        $limit: 1,
        $skip: 0
      }
    })

    assert.deepStrictEqual(messages, {
      limit: 1,
      skip: 0,
      total: 1,
      data: [
        {
          id: 0,
          ...userProps(user),
          ...payload
        }
      ]
    })
  })

  it('resolves safe dispatch data recursively and with arrays and pages', async () => {
    const service = app.service('messages')
    const context = await service.get(0, {}, createContext(service as any, 'get'))
    const user = {
      id: 0,
      email: '[redacted]',
      name: 'hello (hello@feathersjs.com)'
    }

    assert.strictEqual(context.result.user.password, 'hashed')

    assert.deepStrictEqual(context.dispatch, {
      text: 'Hi there',
      userId: 0,
      id: 0,
      ...userProps(user)
    })
  })

  it('resolves safe dispatch with static data', async () => {
    const service = app.service('custom')

    await service.find()
    assert.deepStrictEqual(await service.find(), [{ message: 'Hello' }])
  })

  for (const paginated of [false, true]) {
    it(`resolves repeated result objects with paginated=${paginated} (#3476)`, async () => {
      const record = { message: 'Hello', password: 'secret' }
      const records = [record, record]
      const result = paginated ? { total: 2, limit: 10, skip: 0, data: records } : records
      const localApp = feathers().use('shared', {
        async find() {
          return result
        }
      })
      const service = localApp.service('shared')

      service.hooks({
        around: {
          all: [resolveExternal(resolve<typeof record, HookContext>({ password: async () => undefined }))]
        }
      })

      const context = await service.find({}, createContext(service, 'find'))
      const dispatch = [{ message: 'Hello' }, { message: 'Hello' }]

      assert.strictEqual(context.result, result)
      assert.deepStrictEqual(
        context.dispatch,
        paginated ? { total: 2, limit: 10, skip: 0, data: dispatch } : dispatch
      )
      const dispatchedRecords = Array.isArray(context.dispatch) ? context.dispatch : context.dispatch.data
      assert.strictEqual(dispatchedRecords[0], dispatchedRecords[1])
      assert.strictEqual(dispatchedRecords[0], getDispatch(record))
      assert.strictEqual(record.password, 'secret')
    })

    it(`resolves concurrent calls sharing paginated=${paginated} results (#3476)`, async () => {
      const record = { message: 'Hello', password: 'secret' }
      const records = [record]
      const result = paginated ? { total: 1, limit: 10, skip: 0, data: records } : records
      const localApp = feathers().use('shared', {
        async find() {
          return result
        }
      })
      const service = localApp.service('shared')

      service.hooks({
        around: {
          all: [resolveExternal(resolve<typeof record, HookContext>({ password: async () => undefined }))]
        }
      })

      const [first, second] = await Promise.all([
        service.find({}, createContext(service, 'find')),
        service.find({}, createContext(service, 'find'))
      ])
      const dispatch = [{ message: 'Hello' }]

      assert.deepStrictEqual(
        first.dispatch,
        paginated ? { total: 1, limit: 10, skip: 0, data: dispatch } : dispatch
      )
      assert.strictEqual(first.dispatch, second.dispatch)
      assert.strictEqual(first.result, result)
      assert.strictEqual(second.result, result)
      assert.strictEqual(record.password, 'secret')
    })
  }

  it('keeps dispatch set by a resolver service call (#3476)', async () => {
    const record = { message: 'Hello', password: 'secret' }
    const localApp = feathers()

    for (const name of ['inner', 'outer']) {
      localApp.use(name, {
        async get() {
          return record
        }
      })
    }

    localApp.service('inner').hooks({
      around: {
        all: [resolveExternal(resolve<typeof record, HookContext>({ password: async () => undefined }))]
      }
    })
    const service = localApp.service('outer')
    service.hooks({
      around: {
        all: [
          resolveExternal(
            resolve<typeof record, HookContext>(
              {},
              {
                converter: async (data, context) => {
                  await context.app.service('inner').get(0)
                  return data
                }
              }
            )
          )
        ]
      }
    })

    const context = await service.get(0, {}, createContext(service, 'get'))

    assert.strictEqual(context.result, record)
    assert.deepStrictEqual(context.dispatch, { message: 'Hello' })
    assert.strictEqual(context.dispatch, getDispatch(record))
    assert.strictEqual(record.password, 'secret')
  })

  it('resolves data for custom methods', async () => {
    const result = await app.service('messages').customMethod({ message: 'Hello' })
    const user = {
      email: 'hello@feathersjs.com',
      password: 'hashed',
      id: 0,
      name: 'hello (hello@feathersjs.com)'
    }

    assert.deepStrictEqual(result, {
      message: 'Hello',
      userId: 0,
      additionalData: 'additional data',
      ...userProps(user)
    })
  })

  it('validates and converts the query', async () => {
    const otherUser = await app.service('users').create({
      email: 'helloagain@feathersjs.com',
      password: 'supersecret'
    })

    await app.service('messages').create({
      text,
      userId: otherUser.id
    })

    const messages = await app.service('messages').find({
      paginate: false,
      query: {
        userId: `${user.id}`
      }
    })

    assert.strictEqual(messages.length, 1)

    const userMessages = await app.service('messages').find({
      paginate: false,
      user
    })

    assert.strictEqual(userMessages.length, 1)
    assert.strictEqual(userMessages[0].userId, user.id)

    const msg = await app.service('messages').get(userMessages[0].id, {
      query: {
        $resolve: ['user']
      }
    })

    assert.deepStrictEqual(msg, {
      user
    })

    assert.rejects(
      () =>
        app.service('messages').find({
          query: {
            thing: 'me'
          }
        }),
      {
        name: 'BadRequest',
        message: 'validation failed',
        code: 400,
        className: 'bad-request',
        data: [
          {
            instancePath: '',
            schemaPath: '#/additionalProperties',
            keyword: 'additionalProperties',
            params: { additionalProperty: 'thing' },
            message: 'must NOT have additional properties'
          }
        ]
      }
    )
  })

  it('validateQuery marks the query as validated by default', async () => {
    const hook = validateQuery(async (query) => query)
    const context: any = {
      params: {
        query: { name: 'Dave' }
      }
    }

    await hook(context)

    assert.strictEqual((context.params.query as any)[VALIDATED], true)
  })

  it('validateQuery can keep adapter sanitization with skipSanitize: false', async () => {
    const hook = validateQuery(async (query) => query, { skipSanitize: false })
    const context: any = {
      params: {
        query: { name: 'Dave' }
      }
    }

    await hook(context)

    assert.strictEqual((context.params.query as any)[VALIDATED], undefined)
  })

  it('skipSanitize: false still rejects operators outside the adapter allowlist', async () => {
    const serviceApp = feathers()
    // Pass-through schema accepts any query; only skipSanitize controls VALIDATED stamping
    const acceptAnyQuery = async (query: any) => query

    serviceApp.use('/items', new MemoryService())
    serviceApp.service('items').hooks({
      before: {
        find: [validateQuery(acceptAnyQuery, { skipSanitize: false })]
      }
    })

    await serviceApp.service('items').create({ name: 'Dave' })

    await assert.rejects(
      () =>
        serviceApp.service('items').find({
          query: {
            name: {
              $regex: 'Da.*'
            }
          }
        }),
      {
        name: 'BadRequest',
        message: 'Invalid query parameter $regex'
      }
    )
  })

  it('default validateQuery skips adapter allowlist so non-standard operators can reach the adapter', async () => {
    const serviceApp = feathers()
    const acceptAnyQuery = async (query: any) => query

    serviceApp.use('/items', new MemoryService())
    serviceApp.service('items').hooks({
      before: {
        find: [validateQuery(acceptAnyQuery)]
      }
    })

    await serviceApp.service('items').create({ name: 'Dave' })

    // $regex is not in the built-in allowlist; with skipSanitize true (default) sanitizeQuery
    // is skipped so the adapter does not throw Invalid query parameter.
    const result = await serviceApp.service('items').find({
      query: {
        name: {
          $regex: 'Da.*'
        }
      }
    })

    assert.strictEqual(result.length, 1)
    assert.strictEqual(result[0].name, 'Dave')
  })
})
