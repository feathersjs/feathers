import assert from 'assert'
import axios from 'axios'

import { verify } from './fixture'

export function restTests(description: string, name: string, port: number, testCustom?: boolean) {
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

    if (testCustom) {
      it('Throws POST customMethod (auto :id)', async () => {
        const data = { message: 'Hello' }
        assert.rejects(
          () => axios.post<any>(`http://localhost:${port}/${name}/custom-method`, data),
          (error: any) => {
            assert.deepEqual(error.response.data, {
              name: 'MethodNotAllowed',
              message: `Method \`${name}\` is not supported by this endpoint.`,
              code: 405,
              className: 'method-not-allowed'
            })
            console.error(error.response.data)

            return true
          }
        )
      })
      // { key: 'customData', route: true },
      it('POST customData (auto :id)', async () => {
        const data = { message: 'Hello' }
        const res = await axios.post<any>(`http://localhost:${port}/${name}/custom-data`, data)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          data,
          method: 'customData',
          provider: 'rest'
        })
      })
      // { key: 'customIdData', id: true, route: true },
      it('POST customIdData (auto :id/:action)', async () => {
        const data = { message: 'Hello' }
        const id = '123'
        const res = await axios.post<any>(`http://localhost:${port}/${name}/${id}/custom-id-data`, data)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          id,
          data,
          method: 'customIdData',
          provider: 'rest'
        })
      })
      // { key: 'customIdData', id: true, route: 'custom', routeMethod: 'POST' },
      it('POST customIdData (custom :id/:action)', async () => {
        const data = { message: 'Hello' }
        const id = '123'
        const res = await axios.post<any>(`http://localhost:${port}/${name}/${id}/custom`, data)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          id,
          data,
          method: 'customIdData',
          provider: 'rest'
        })
      })
      // { key: 'customIdData', id: true, data: true, route: 'custom-patch', routeMethod: 'PATCH' },
      it('PATCH customIdData (custom :id/:action)', async () => {
        const data = { message: 'Hello' }
        const id = '123'
        const res = await axios.patch<any>(`http://localhost:${port}/${name}/${id}/custom-patch`, data)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          id,
          data,
          method: 'customIdData',
          provider: 'rest'
        })
      })
      // { key: 'customId', id: true, data: false, route: true },
      it('GET customId (auto :id/:action)', async () => {
        const id = '123'
        const res = await axios.get<any>(`http://localhost:${port}/${name}/${id}/custom-id`)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          id,
          method: 'customId',
          provider: 'rest'
        })
      })
      // { key: 'customParams', id: false, data: false, route: true },
      it('GET customParams (auto :id)', async () => {
        const res = await axios.get<any>(`http://localhost:${port}/${name}/custom-params?foo=bar`)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          method: 'customParams',
          provider: 'rest',
          query: { foo: 'bar' }
        })
      })
      // { key: 'customParams', id: false, data: false, route: 'stats' }
      it('GET customParams (custom :id)', async () => {
        const res = await axios.get<any>(`http://localhost:${port}/${name}/stats`)
        assert.strictEqual(res.status, 200)
        assert.deepStrictEqual(res.data, {
          method: 'customParams',
          provider: 'rest',
          query: {}
        })
      })
    }
  })
}
