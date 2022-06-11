import assert from 'assert'
import axios from 'axios'

import { verify } from './fixture'

export function restTests(description: string, name: string, port: number) {
  describe(description, () => {
    it('GET .find', async () => {
      const res = await axios.get<any>(`http://localhost:${port}/${name}`)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.find(res.data)
    })

    it('GET .get', async () => {
      const res = await axios.get<any>(`http://localhost:${port}/${name}/dishes`)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.get('dishes', res.data)
    })

    it('POST .create', async () => {
      const original = {
        description: 'POST .create'
      }

      const res = await axios.post<any>(`http://localhost:${port}/${name}`, original)

      assert.ok(res.status === 201, 'Got CREATED status code')
      verify.create(original, res.data)
    })

    it('PUT .update', async () => {
      const original = {
        description: 'PUT .update'
      }

      const res = await axios.put(`http://localhost:${port}/${name}/544`, original)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.update('544', original, res.data)
    })

    it('PUT .update many', async () => {
      const original = {
        description: 'PUT .update',
        many: true
      }

      const res = await axios.put(`http://localhost:${port}/${name}`, original)
      const { data } = res

      assert.ok(res.status === 200, 'Got OK status code')
      verify.update(null, original, data)
    })

    it('PATCH .patch', async () => {
      const original = {
        description: 'PATCH .patch'
      }

      const res = await axios.patch(`http://localhost:${port}/${name}/544`, original)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.patch('544', original, res.data)
    })

    it('PATCH .patch many', async () => {
      const original = {
        description: 'PATCH .patch',
        many: true
      }

      const res = await axios.patch(`http://localhost:${port}/${name}`, original)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.patch(null, original, res.data)
    })

    it('DELETE .remove', async () => {
      const res = await axios.delete(`http://localhost:${port}/${name}/233`)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.remove('233', res.data)
    })

    it('DELETE .remove many', async () => {
      const res = await axios.delete(`http://localhost:${port}/${name}`)

      assert.ok(res.status === 200, 'Got OK status code')
      verify.remove(null, res.data)
    })
  })
}
