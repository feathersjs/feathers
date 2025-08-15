import { describe, it } from 'vitest'
import { strict as assert } from 'assert'
import { verify } from './fixture'

export interface Todo {
  text: string
  complete?: boolean
  id?: number
}

export function clientTests(app: any, name: string) {
  const getService = () => (name && typeof app.service === 'function' ? app.service(name) : app)

  describe('Service base tests', () => {
    it('.find', async () => {
      const todos = await getService().find()

      verify.find(todos)
    })

    it('.get and params passing', async () => {
      const query = {
        returnquery: 'true',
        some: 'thing',
        other: ['one', 'two'],
        nested: { a: { b: 'object' } }
      }

      const todo = await getService().get('0', { query })

      verify.get('0', todo)
      assert.deepStrictEqual(todo.query, query)
    })

    it('.create', async () => {
      const data = {
        text: 'created todo',
        complete: true
      }
      const todo = await getService().create(data)

      verify.create(data, todo)
    })

    it('.create and created event', async () => {
      const data = { text: 'created todo', complete: true }
      const createPromise = new Promise((resolve) => {
        getService().once('created', (current: Todo) => {
          verify.create(data, current)
          resolve(data)
        })
      })

      await getService().create(data)
      await createPromise
    })

    it('.update and updated event', async () => {
      const updateData = {
        text: 'updated todo',
        complete: true
      }
      const updatePromise = new Promise((resolve) => {
        getService().once('updated', (current: Todo) => {
          verify.update('42', updateData, current)
          resolve(updateData)
        })
      })

      const todo = await getService().create({ text: 'todo to update', complete: false })
      await getService().update(todo.id, updateData)
      await updatePromise
    })

    it('.patch and patched event', async () => {
      const patchData = { complete: true, text: 'patched to do' }
      const patchPromise = new Promise((resolve) => {
        getService().once('patched', (current: Todo) => {
          verify.patch('42', patchData, current)
          resolve(current)
        })
      })

      const todo = await getService().create({ text: 'todo to patch', complete: false })
      await getService().patch(todo.id, patchData)
      await patchPromise
    })

    it('.remove and removed event', async () => {
      const todo = await getService().create({ text: 'todo to remove', complete: false })
      const removePromise = new Promise((resolve) => {
        getService().once('removed', (current: Todo) => {
          verify.remove('42', current)
          resolve(current)
        })
      })

      await getService().remove(todo.id)
      await removePromise
    })

    it('.get with error', async () => {
      const query = { error: true }

      await assert.rejects(() => getService().get(0, { query }), {
        message: 'Something for 0 went wrong'
      })
    })
  })
}
