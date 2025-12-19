import { beforeAll, describe, it, expect } from 'vitest'
import { restTests, verify, getApp, createTestServer } from '../../fixtures/index.js'
import { CORS_HEADERS } from './index.js'

const TEST_PORT = 4444

describe('http test', () => {
  beforeAll(async () => {
    const app = getApp()
    await createTestServer(TEST_PORT, app)
  })

  it('throws 404 for not found pages', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/fdshjkl`)

    expect(res.status).toBe(404)

    const error = await res.json()

    expect(res.headers.get('Access-Control-Allow-Origin')).toBeTruthy()
    expect(error.message).toBe('Path /fdshjkl not found')
    expect(error.name).toBe('NotFound')
  })

  it('works with form encoded body', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ description: 'Form encoded' }).toString()
    })

    expect(res.status).toBe(201)
    verify.create({ description: 'Form encoded' }, await res.json())
  })

  it('works with multipart/form-data body', async () => {
    const formData = new FormData()
    formData.append('description', 'Multipart form data')
    formData.append('name', 'test-upload')

    const res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'POST',
      body: formData
    })

    expect(res.status).toBe(201)

    const result = await res.json()
    // Single FormData fields are unwrapped
    expect(result.description).toBe('Multipart form data')
    expect(result.name).toBe('test-upload')
    expect(result.id).toBe(42)
    expect(result.status).toBe('created')
  })

  it('handles multiple values for same field in multipart/form-data', async () => {
    const formData = new FormData()
    formData.append('tags', 'one')
    formData.append('tags', 'two')
    formData.append('tags', 'three')
    formData.append('description', 'Multiple tags')

    const res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'POST',
      body: formData
    })

    expect(res.status).toBe(201)

    const result = await res.json()
    // Multiple values become an array, single values are unwrapped
    expect(result.tags).toEqual(['one', 'two', 'three'])
    expect(result.description).toBe('Multiple tags')
  })

  it('handles file uploads in multipart/form-data', async () => {
    const formData = new FormData()
    const fileContent = 'Hello, this is a test file!'
    const file = new File([fileContent], 'test.txt', { type: 'text/plain' })
    formData.append('file', file)
    formData.append('description', 'File upload test')

    const res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'POST',
      body: formData
    })

    expect(res.status).toBe(201)

    const result = await res.json()
    expect(result.description).toBe('File upload test')
    // File objects are serialized when sent through JSON response
    expect(result.file).toBeDefined()
  })

  it('handles CORS', async () => {
    let res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        Origin: 'http://localhost:3000'
      }
    })

    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000')

    res = await fetch(`http://localhost:${TEST_PORT}/fdshjkl`)
    expect(res.headers.get('access-control-allow-origin')).toBeTruthy()

    res = await fetch(`http://localhost:${TEST_PORT}/todos`)
    expect(res.headers.get('access-control-allow-origin')).toBeTruthy()
  })

  it('throws error on invalid request body', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid'
    })

    expect(res.status).toBe(400)

    const error = await res.json()
    expect(error.message).toBe('Invalid request body')
    expect(error.name).toBe('BadRequest')
  })

  it('errors when method is not allowed', async () => {
    const res = await fetch(`http://localhost:${TEST_PORT}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Method': 'notAllowed'
      },
      body: JSON.stringify({ description: 'Not allowed' })
    })

    expect(res.status).toBe(405)
    expect(res.headers.get('content-type')).toBe('application/json')

    const error = await res.json()
    expect(error.message).toBe('Method `notAllowed` is not supported by this endpoint.')
    expect(error.name).toBe('MethodNotAllowed')
  })

  describe('CORS and returning reponses', () => {
    it('returns a custom response', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/test`)
      const body = await res.text()

      expect(body).toBe('Plain text')
      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/plain')
      expect(res.headers.get('x-custom-header')).toBe('test')
    })

    it('supports OPTIONS method', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/test`, {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          Origin: 'https://example.com'
        }
      })

      expect(res.status).toBe(204)
      expect(res.headers.get('access-control-allow-origin')).toBe('https://example.com')
      expect(res.headers.get('access-control-allow-headers')).toBe(CORS_HEADERS.join(', '))
      expect(res.headers.get('access-control-allow-methods')).toBe('GET, OPTIONS')
    })

    it('returns 204 for no content', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/todos/nocontent`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      expect(res.status).toBe(204)
    })
  })

  describe('streams async iterables', () => {
    it('returns a stream', async () => {
      const res = await fetch(`http://localhost:${TEST_PORT}/test/world`)

      expect(res.status).toBe(200)
      expect(res.headers.get('content-type')).toBe('text/event-stream')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      const messages = []

      let done = false
      while (!done) {
        const { value, done: readerDone } = await reader.read()
        done = readerDone

        if (value) {
          const text = decoder.decode(value)
          const eventChunks = text.split('\n\n').filter(Boolean)

          for (const chunk of eventChunks) {
            const lines = chunk.split('\n')
            const dataLine = lines.find((line) => line.startsWith('data: '))

            if (dataLine) {
              const jsonData = JSON.parse(dataLine.substring('data: '.length))
              messages.push(jsonData)
            }
          }
        }
      }

      expect(messages.length).toBe(5)

      for (let i = 1; i <= 5; i++) {
        expect(messages[i - 1]).toEqual({ message: `Hello world ${i}` })
      }
    })
  })

  describe('streaming request body', () => {
    it('streams text data to a service', async () => {
      const data = 'Hello, this is streamed text data!'
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(data))
          controller.close()
        }
      })

      const res = await fetch(`http://localhost:${TEST_PORT}/streaming`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: stream,
        // @ts-expect-error duplex required for streaming
        duplex: 'half'
      })

      expect(res.status).toBe(201)

      const result = await res.json()
      expect(result.received).toBe(data)
      expect(result.size).toBe(data.length)
      expect(result.contentType).toBe('text/plain')
    })

    it('streams binary data to a service', async () => {
      const bytes = new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]) // "Hello"
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(bytes)
          controller.close()
        }
      })

      const res = await fetch(`http://localhost:${TEST_PORT}/streaming`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/octet-stream'
        },
        body: stream,
        // @ts-expect-error duplex required for streaming
        duplex: 'half'
      })

      expect(res.status).toBe(201)

      const result = await res.json()
      expect(result.received).toBe('Hello')
      expect(result.size).toBe(5)
    })

    it('streams chunked data to a service', async () => {
      const chunks = ['chunk1', 'chunk2', 'chunk3']
      let chunkIndex = 0

      const stream = new ReadableStream({
        pull(controller) {
          if (chunkIndex < chunks.length) {
            controller.enqueue(new TextEncoder().encode(chunks[chunkIndex]))
            chunkIndex++
          } else {
            controller.close()
          }
        }
      })

      const res = await fetch(`http://localhost:${TEST_PORT}/streaming`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: stream,
        // @ts-expect-error duplex required for streaming
        duplex: 'half'
      })

      expect(res.status).toBe(201)

      const result = await res.json()
      expect(result.received).toBe('chunk1chunk2chunk3')
      expect(result.size).toBe(18)
    })
  })

  restTests('http', 'todos', TEST_PORT)
})
