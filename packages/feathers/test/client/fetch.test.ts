import { beforeAll, describe, it } from 'vitest'
import { strict as assert } from 'assert'
import { feathers } from '../../src/index.js'
import { clientTests } from '@feathersjs/tests'
import { NotAcceptable } from '../../src/errors.js'
import { Server } from 'http'

import rest from '../../src/client/fetch.js'
import createServer from './server.js'
import { createTestServer, TestServiceTypes } from '../fixture.js'
import { fetchClient } from '../../src/client/index.js'

describe('fetch REST connector', function () {
  const port = 8888
  const url = `http://localhost:${port}`
  const connection = fetchClient(fetch, url)
  const app = feathers<TestServiceTypes>().configure(connection)

  beforeAll(async () => {
    await createTestServer(port)
  })

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
  clientTests(app, 'todos')
})
