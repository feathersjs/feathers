import { beforeAll, describe, it, expect } from 'vitest'
import { restTests, verify, createTestServer } from '../fixtures/index.js'
import { CORS_HEADERS } from '../../src/http/index.js'

const TEST_PORT = 4444

describe('http test', () => {
  beforeAll(async () => {
    await createTestServer(TEST_PORT)
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

  restTests('http', 'todos', TEST_PORT)
})
