import { beforeAll, describe, it, expect } from 'vitest'
import { feathers } from '../index.js'
import { clientTests } from '../../fixtures/client.js'
import { NotAcceptable, NotFound, MethodNotAllowed, BadRequest } from '../errors.js'

import { getApp, createTestServer, TestServiceTypes, verify } from '../../fixtures/index.js'
import { fetchClient } from './index.js'

describe('fetch REST connector', function () {
  const port = 8888
  const baseUrl = `http://localhost:${port}`
  const connection = fetchClient(fetch, { baseUrl })
  const app = feathers<TestServiceTypes>().configure(connection)
  const service = app.service('todos')

  beforeAll(async () => {
    const testApp = getApp()
    await createTestServer(port, testApp)
  })

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
    const init = fetchClient(fetch, {
      baseUrl: baseUrl
    })
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

  it('.get with undefined and null erorrs', async () => {
    await expect(() => service.get(undefined, {})).rejects.toThrow(BadRequest)
    await expect(() => service.get(null, {})).rejects.toThrow(BadRequest)
  })

  it('supports async iterable streams', async () => {
    const messages: any[] = []
    const stream = await app.service('test').get('test')

    for await (const data of stream) {
      messages.push(data)
    }

    expect(messages).toHaveLength(5)
    expect(messages[0]).toEqual({ message: 'Hello test 1' })
    expect(messages[1]).toEqual({ message: 'Hello test 2' })
    expect(messages[2]).toEqual({ message: 'Hello test 3' })
    expect(messages[3]).toEqual({ message: 'Hello test 4' })
    expect(messages[4]).toEqual({ message: 'Hello test 5' })
  })

  it('supports FormData in create', async () => {
    const formData = new FormData()
    formData.append('description', 'FormData test')
    formData.append('name', 'test-file')

    const result = await app.service('uploads').create(formData, {})

    // Single FormData fields are unwrapped on the server
    expect(result.description).toBe('FormData test')
    expect(result.name).toBe('test-file')
    expect(result.id).toBe(1)
    expect(result.status).toBe('uploaded')
  })

  it('supports FormData with multiple values', async () => {
    const formData = new FormData()
    formData.append('tags', 'one')
    formData.append('tags', 'two')
    formData.append('description', 'Multi-value test')

    const result = await app.service('uploads').create(formData, {})

    // Multiple values become array, single values unwrapped
    expect(result.tags).toEqual(['one', 'two'])
    expect(result.description).toBe('Multi-value test')
  })

  it('supports FormData in patch', async () => {
    const formData = new FormData()
    formData.append('description', 'Patched with FormData')

    const result = await app.service('uploads').patch(42, formData, {})

    expect(result.description).toBe('Patched with FormData')
    expect(result.id).toBe('42') // ID comes from URL path, returned as string
    expect(result.status).toBe('patched')
  })

  it('supports streaming request body with ReadableStream', async () => {
    const data = 'Streamed from client!'
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(data))
        controller.close()
      }
    })

    const result = await app.service('streaming').create(stream as any, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })

    expect(result.received).toBe(data)
    expect(result.size).toBe(data.length)
    expect(result.contentType).toBe('text/plain')
  })

  it('defaults to application/octet-stream for streams without Content-Type', async () => {
    const data = 'Binary-ish data'
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(data))
        controller.close()
      }
    })

    const result = await app.service('streaming').create(stream, {})

    expect(result.received).toBe(data)
    expect(result.contentType).toBe('application/octet-stream')
  })

  clientTests(app, 'todos')
})
