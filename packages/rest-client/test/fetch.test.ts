import { strict as assert } from 'assert'
import fetch from 'node-fetch'
import { feathers } from '@feathersjs/feathers'
import { clientTests } from '@feathersjs/tests'
import { NotAcceptable } from '@feathersjs/errors'
import { Server } from 'http'

import rest from '../src'
import createServer from './server'
import { ServiceTypes } from './declarations'

describe('fetch REST connector', function () {
  const url = 'http://localhost:8889'
  const connection = rest<ServiceTypes>(url).fetch(fetch)
  const app = feathers<ServiceTypes>()
    .configure(connection)
    .use('todos', connection.service('todos'), {
      methods: ['get', 'find', 'create', 'patch', 'customMethod']
    })

  const service = app.service('todos')
  let server: Server

  service.hooks({
    after: {
      customMethod: [
        (context) => {
          context.result.data.message += '!'
        }
      ]
    }
  })

  before(async () => {
    server = await createServer().listen(8889)
  })

  after((done) => server.close(done))

  it('supports custom headers', async () => {
    const headers = {
      Authorization: 'let-me-in'
    }

    const todo = await service.get(0, { headers })

    assert.deepStrictEqual(todo, {
      id: 0,
      text: 'some todo',
      authorization: 'let-me-in',
      complete: false,
      query: {}
    })
  })

  it('supports params.connection', async () => {
    const connection = {
      headers: {
        Authorization: 'let-me-in'
      }
    }

    const todo = await service.get(0, { connection })

    assert.deepStrictEqual(todo, {
      id: 0,
      text: 'some todo',
      authorization: 'let-me-in',
      complete: false,
      query: {}
    })
  })

  it('handles errors properly', async () => {
    try {
      await service.get(-1, {})
      assert.fail('Should never get here')
    } catch (error: any) {
      assert.strictEqual(error.code, 404)
    }
  })

  it('supports nested arrays in queries', async () => {
    const query = { test: { $in: ['0', '1', '2'] } }

    const data = await service.get(0, { query })

    assert.deepStrictEqual(data.query, query)
  })

  it('can initialize a client instance', async () => {
    const init = rest(url).fetch(fetch)
    const todoService = init.service('todos')

    assert.ok(todoService instanceof init.Service, 'Returned service is a client')

    const todos = await todoService.find({})

    assert.deepStrictEqual(todos, [
      {
        text: 'some todo',
        complete: false,
        id: 0
      }
    ])
  })

  it('remove many', async () => {
    const todo: any = await service.remove(null)

    assert.strictEqual(todo.id, null)
    assert.strictEqual(todo.text, 'deleted many')
  })

  it('converts feathers errors (#50)', async () => {
    try {
      await service.get(0, { query: { feathersError: true } })
      assert.fail('Should never get here')
    } catch (error: any) {
      assert.ok(error.response)
      assert.ok(error instanceof NotAcceptable)
      assert.strictEqual(error.message, 'This is a Feathers error')
      assert.strictEqual(error.code, 406)
      assert.deepStrictEqual(error.data, { data: true })
    }
  })

  it('returns null for 204 responses', async () => {
    const response = await service.remove(0, {
      query: { noContent: true }
    })

    assert.strictEqual(response, null)
  })

  it('works with custom method .customMethod', async () => {
    const result = await service.customMethod({ message: 'hi' })

    assert.deepEqual(result, {
      data: { message: 'hi!' },
      provider: 'rest',
      type: 'customMethod'
    })
  })

  clientTests(service, 'todos')
})
