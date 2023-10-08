import { strict as assert } from 'assert'

import axios from 'axios'
import { Server } from 'http'
import { feathers } from '@feathersjs/feathers'
import { clientTests } from '@feathersjs/tests'
import { NotAcceptable } from '@feathersjs/errors'

import createServer from './server'
import rest from '../src'
import { ServiceTypes } from './declarations'

describe('Axios REST connector', function () {
  const url = 'http://localhost:8889'
  const connection = rest<ServiceTypes>(url).axios(axios)
  const app = feathers<ServiceTypes>()
    .configure(connection)
    .use('todos', connection.service('todos'), {
      methods: ['get', 'find', 'create', 'patch', 'customMethod']
    })
  const service = app.service('todos')
  let server: Server

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
      authorization: 'let-me-in',
      text: 'some todo',
      complete: false,
      query: {}
    })
  })

  it('uses params.connection for additional options', async () => {
    const connection = {
      headers: {
        Authorization: 'let-me-in'
      }
    }

    const todo = await service.get(0, { connection })

    assert.deepStrictEqual(todo, {
      id: 0,
      authorization: 'let-me-in',
      text: 'some todo',
      complete: false,
      query: {}
    })
  })

  it('can initialize a client instance', async () => {
    const init = rest(url).axios(axios)
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

  it('supports nested arrays in queries', async () => {
    const query = { test: { $in: ['0', '1', '2'] } }

    const data = await service.get(0, { query })

    assert.deepStrictEqual(data.query, query)
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
      assert.ok(error instanceof NotAcceptable)
      assert.strictEqual(error.message, 'This is a Feathers error')
      assert.strictEqual(error.code, 406)
    }
  })

  it('ECONNREFUSED errors are serializable', async () => {
    const url = 'http://localhost:60000'
    const setup = rest(url).axios(axios)
    const app = feathers().configure(setup)

    try {
      await app.service('something').find()
      assert.fail('Should never get here')
    } catch (e: any) {
      const err = JSON.parse(JSON.stringify(e))

      assert.strictEqual(err.name, 'Unavailable')
      assert.ok(e.data.config)
    }
  })

  it('works with custom method .customMethod', async () => {
    const result = await service.customMethod({ message: 'hi' })

    assert.deepEqual(result, {
      data: { message: 'hi' },
      provider: 'rest',
      type: 'customMethod'
    })
  })

  clientTests(service, 'todos')
})
