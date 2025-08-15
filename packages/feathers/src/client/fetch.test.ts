import { beforeAll, describe, it, expect } from 'vitest'
import { feathers } from '../index.js'
import { clientTests } from '../../fixtures/client.js'
import { NotAcceptable, NotFound, MethodNotAllowed } from '../errors.js'

import { createTestServer, TestServiceTypes, verify } from '../../fixtures/index.js'
import { fetchClient } from './index.js'

describe('fetch REST connector', function () {
  const port = 8888
  const url = `http://localhost:${port}`
  const connection = fetchClient(fetch, url)
  const app = feathers<TestServiceTypes>().configure(connection)
  const service = app.service('todos')

  beforeAll(async () => createTestServer(port))

  it('supports custom headers', async () => {
    const headers = {
      Authorization: 'let-me-in'
    }
    const todo = await service.get('taxes', {
      headers,
      query: { returnheaders: true }
    })

    expect(todo.headers?.authorization).toBe('let-me-in')
  })

  it('supports params.connection', async () => {
    const connection = {
      headers: {
        Authorization: 'let-me-in'
      }
    }
    const todo = await service.get('taxes', {
      connection,
      query: { returnheaders: true }
    })

    expect(todo.headers?.authorization).toBe('let-me-in')
  })

  it('handles errors properly', async () => {
    await expect(() => service.get('notfound', {})).rejects.toMatchObject({
      code: 404,
      name: 'NotFound',
      message: 'Not found'
    })

    await expect(() => service.get('notfound', {})).rejects.toBeInstanceOf(NotFound)
  })

  it('supports nested arrays in queries', async () => {
    const query = { test: { $in: ['0', '1', '2'] }, returnquery: 'true' }
    const data = await service.get('dishes', { query })

    expect(data.query).toEqual(query)
  })

  it('can initialize a client instance', async () => {
    const init = fetchClient(fetch, url)
    const todoService = init.service('todos')

    expect(todoService).toBeInstanceOf(init.Service)

    const todos = await todoService.find({})

    verify.find(todos)
  })

  it('remove many', async () => {
    const todo = await service.remove(null)

    expect(todo).toEqual({ id: null })
  })

  it('converts feathers errors (#50)', async () => {
    await expect(() => service.get('notacceptable', {})).rejects.toMatchObject({
      code: 406,
      name: 'NotAcceptable',
      message: 'This is a Feathers error',
      data: {
        testData: true
      }
    })

    await expect(() => service.get('notacceptable', {})).rejects.toBeInstanceOf(NotAcceptable)
  })

  it('returns null for 204 responses', async () => {
    const response = await service.get('nocontent', {})
    expect(response).toBeNull()
  })

  it('works with custom method .customMethod', async () => {
    const result = await service.customMethod({ message: 'hi' }, {})

    expect(result).toEqual({
      data: { message: 'hi' },
      provider: 'rest',
      method: 'customMethod'
    })
  })

  it('errors for non existing custom and existing internal method', async () => {
    //@ts-expect-error Testing non existent method
    await expect(() => service.wrongCustomMethod({})).rejects.toThrow(MethodNotAllowed)
    //@ts-expect-error Testing method with parameters
    await expect(() => service.internalMethod({})).rejects.toThrow(MethodNotAllowed)
  })

  it('supports event streams', async () => {
    const messages: any[] = []

    // TODO investigate need for additional await
    for await (const data of await app.service('test').get('test')) {
      messages.push(data)
    }

    expect(messages).toHaveLength(5)
    expect(messages[0]).toEqual({ message: 'Hello test 1' })
    expect(messages[1]).toEqual({ message: 'Hello test 2' })
    expect(messages[2]).toEqual({ message: 'Hello test 3' })
    expect(messages[3]).toEqual({ message: 'Hello test 4' })
    expect(messages[4]).toEqual({ message: 'Hello test 5' })
  })

  clientTests(app, 'todos')
})
