import { describe, it } from 'vitest'
import assert from 'assert'

import { verify } from './fixture'

export function restTests(description: string, name: string, port: number) {
  describe(description, () => {
    it('GET .find', async () => {
      const response = await fetch(`http://localhost:${port}/${name}`)
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.find(data)
    })

    it('GET .get', async () => {
      const response = await fetch(`http://localhost:${port}/${name}/dishes`)
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.get('dishes', data)
    })

    it('POST .create', async () => {
      const original = {
        description: 'POST .create'
      }

      const response = await fetch(`http://localhost:${port}/${name}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(original)
      })
      const data = await response.json()

      assert.ok(response.status === 201, 'Got CREATED status code')
      verify.create(original, data)
    })

    it('PUT .update', async () => {
      const original = {
        description: 'PUT .update'
      }

      const response = await fetch(`http://localhost:${port}/${name}/544`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(original)
      })
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.update('544', original, data)
    })

    it('PUT .update many', async () => {
      const original = {
        description: 'PUT .update',
        many: true
      }

      const response = await fetch(`http://localhost:${port}/${name}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(original)
      })
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.update(null, original, data)
    })

    it('PATCH .patch', async () => {
      const original = {
        description: 'PATCH .patch'
      }

      const response = await fetch(`http://localhost:${port}/${name}/544`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(original)
      })
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.patch('544', original, data)
    })

    it('PATCH .patch many', async () => {
      const original = {
        description: 'PATCH .patch',
        many: true
      }

      const response = await fetch(`http://localhost:${port}/${name}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(original)
      })
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.patch(null, original, data)
    })

    it('DELETE .remove', async () => {
      const response = await fetch(`http://localhost:${port}/${name}/233`, {
        method: 'DELETE'
      })
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.remove('233', data)
    })

    it('DELETE .remove many', async () => {
      const response = await fetch(`http://localhost:${port}/${name}`, {
        method: 'DELETE'
      })
      const data = await response.json()

      assert.ok(response.status === 200, 'Got OK status code')
      verify.remove(null, data)
    })
  })
}
