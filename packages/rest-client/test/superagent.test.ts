import { strict as assert } from 'assert'

import superagent from 'superagent'
import { Server } from 'http'
import { feathers } from '@feathersjs/feathers'
import { clientTests } from '@feathersjs/tests-vitest'
import { NotAcceptable } from '@feathersjs/errors'

import rest from '../src'
import createServer from './server'
import { ServiceTypes } from './declarations'
import getPort from 'get-port'

describe('Superagent REST connector', async function () {
  let server: Server

  const port = getPort()
  const url = `http://localhost:${port}`
  const setup = rest(url).superagent(superagent)
  const app = feathers<ServiceTypes>().configure(setup)
  const service = app.service('todos')

  service.methods('customMethod')

  beforeAll(async () => {
    server = await createServer().listen(port)
  })

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())))

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

  it('supports params.connection', async () => {
    const connection = {
      Authorization: 'let-me-in'
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
    const init = rest(url).superagent(superagent)
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
      assert.ok(error.response)
      assert.ok(error instanceof NotAcceptable)
      assert.strictEqual(error.message, 'This is a Feathers error')
      assert.strictEqual(error.code, 406)
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
