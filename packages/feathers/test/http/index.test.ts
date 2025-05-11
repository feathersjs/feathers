import { strict as assert } from 'node:assert'
import { createServer } from 'node:http'
import { beforeAll, describe, it } from 'vitest'
import { restTests, Service, verify } from '@feathersjs/tests'
import { createServerAdapter } from '@whatwg-node/server'

import { feathers } from '../../src/index.js'
import { CORS_HEADERS, createHandler } from '../../src/http/index.js'

class ResponseTestService {
  async find() {
    return new Response('Plain text', {
      headers: {
        'Content-Type': 'text/plain',
        'X-Custom-Header': 'test'
      }
    })
  }

  async *get(id: string) {
    for (let i = 1; i <= 5; i++) {
      yield { message: `Hello ${id} ${i}` }
    }
  }

  async options(_params: Params) {
    return new Response(null, {
      status: 200,
      headers: {
        'X-Feathers': 'true',
        'Access-Control-Allow-Origin': 'https://example.com',
        'Access-Control-Allow-Headers': 'Authorization, X-Service-Method'
      }
    })
  }
}

describe('http test', () => {
  const app = feathers<{ todos: Service; test: ResponseTestService }>()
  const handler = createHandler(app)

  app.use('todos', new Service())
  app.use('test', new ResponseTestService())

  // You can create your Node server instance by using our adapter
  const nodeServer = createServer(createServerAdapter(handler))

  beforeAll(
    async () =>
      new Promise((resolve) => {
        // Then start listening on some port
        nodeServer.listen(4000, () => resolve())
      })
  )

  it('throws 404 for not found pages', async () => {
    const res = await fetch('http://localhost:4000/fdshjkl')

    assert.equal(res.status, 404, 'Got NOT FOUND status code')

    const error = await res.json()

    assert.ok(res.headers.get('Access-Control-Allow-Origin'))
    assert.equal(error.message, 'Path /fdshjkl not found')
    assert.equal(error.name, 'NotFound')
  })

  it('works with form encoded body', async () => {
    const res = await fetch('http://localhost:4000/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({ description: 'Form encoded' }).toString()
    })

    assert.equal(res.status, 201, 'Got CREATED status code')
    verify.create({ description: 'Form encoded' }, await res.json())
  })

  it('handles CORS', async () => {
    let res = await fetch('http://localhost:4000/todos', {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        Origin: 'http://localhost:3000'
      }
    })

    assert.equal(res.status, 204, 'Got NO CONTENT status code')
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000')

    res = await fetch('http://localhost:4000/fdshjkl')
    assert.ok(res.headers.get('access-control-allow-origin'))

    res = await fetch('http://localhost:4000/todos')
    assert.ok(res.headers.get('access-control-allow-origin'))
  })

  it('throws error on invalid request body', async () => {
    const res = await fetch('http://localhost:4000/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: 'invalid'
    })

    assert.equal(res.status, 400, 'Got BAD REQUEST status code')

    const error = await res.json()
    assert.strictEqual(error.message, 'Invalid request body')
    assert.strictEqual(error.name, 'BadRequest')
  })

  it('errors when method is not allowed', async () => {
    const res = await fetch('http://localhost:4000/todos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Method': 'notAllowed'
      },
      body: JSON.stringify({ description: 'Not allowed' })
    })

    assert.equal(res.status, 405, 'Got METHOD NOT ALLOWED status code')
    assert.equal(res.headers.get('content-type'), 'application/json')

    const error = await res.json()
    assert.strictEqual(error.message, 'Method `notAllowed` is not supported by this endpoint.')
    assert.strictEqual(error.name, 'MethodNotAllowed')
  })

  describe('CORS and returning reponses', () => {
    it('returns a custom response', async () => {
      const res = await fetch('http://localhost:4000/test')
      const body = await res.text()

      assert.equal(body, 'Plain text')
      assert.equal(res.status, 200, 'Got OK status code')
      assert.equal(res.headers.get('content-type'), 'text/plain')
      assert.equal(res.headers.get('x-custom-header'), 'test')
    })

    it('supports OPTIONS method', async () => {
      const res = await fetch('http://localhost:4000/test', {
        method: 'OPTIONS',
        headers: {
          'Access-Control-Request-Method': 'POST',
          Origin: 'https://example.com'
        }
      })

      assert.equal(res.status, 204, 'Got 204 status code')
      assert.equal(res.headers.get('access-control-allow-origin'), 'https://example.com')
      assert.equal(res.headers.get('access-control-allow-headers'), CORS_HEADERS.join(', '))
      assert.equal(res.headers.get('access-control-allow-methods'), 'GET, OPTIONS')
    })
  })

  describe('streams async iterables', () => {
    it('returns a stream', async () => {
      const res = await fetch('http://localhost:4000/test/world')

      assert.equal(res.status, 200, 'Got OK status code')
      assert.equal(res.headers.get('content-type'), 'text/event-stream')

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
              const jsonData = JSON.parse(dataLine.substring(6))
              messages.push(jsonData)
            }
          }
        }
      }

      assert.equal(messages.length, 5, 'Should receive 5 messages')

      for (let i = 1; i <= 5; i++) {
        assert.deepEqual(messages[i - 1], { message: `Hello world ${i}` })
      }
    })
  })

  restTests('http', 'todos', 4000)
})
