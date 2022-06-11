import { createContext } from '@feathersjs/feathers'
import assert from 'assert'
import { app, MessageResult, UserResult } from './fixture'

describe('@feathersjs/schema/hooks', () => {
  const text = 'Hi there'

  let message: MessageResult
  let messageOnPaginatedService: MessageResult
  let user: UserResult

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
    assert.rejects(() => app.service('users').create({ password: 'failing' }), {
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
      user,
      ...payload
    })

    const messages = await app.service('messages').find({
      provider: 'external'
    })

    assert.deepStrictEqual(messages, [
      {
        id: 0,
        user,
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
      user,
      ...payload
    })

    const result = await app.service('messages').get(0, {
      provider: 'external'
    })

    assert.deepStrictEqual(result, {
      id: 0,
      user,
      ...payload
    })
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
      user,
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
          user,
          ...payload
        }
      ]
    })
  })

  it('resolves safe dispatch data recursively', async () => {
    const service = app.service('messages')
    const context = await service.get(0, {}, createContext(service as any, 'get'))

    assert.strictEqual(context.result.user.password, 'hashed')

    assert.deepStrictEqual(context.dispatch, {
      text: 'Hi there',
      userId: 0,
      id: 0,
      user: {
        id: 0,
        email: '[redacted]',
        name: 'hello (hello@feathersjs.com)'
      }
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
})
