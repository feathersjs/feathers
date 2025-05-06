import { describe, it } from 'vitest'
import { strict as assert } from 'assert'

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

      assert.deepEqual(todos, [
        {
          // eslint-disable-line
          text: 'some todo',
          complete: false,
          id: 0
        }
      ])
    })

    it('.get and params passing', async () => {
      const query = {
        some: 'thing',
        other: ['one', 'two'],
        nested: { a: { b: 'object' } }
      }

      const todo = await getService().get(0, { query })

      assert.deepEqual(todo, {
        // eslint-disable-line
        id: 0,
        text: 'some todo',
        complete: false,
        query
      })
    })

    it('.create', async () => {
      const todo = await getService().create({
        text: 'created todo',
        complete: true
      })

      assert.deepEqual(todo, {
        // eslint-disable-line
        id: 1,
        text: 'created todo',
        complete: true
      })
    })

    it('.create and created event', async () => {
      const createPromise = new Promise((resolve) => {
        getService().once('created', (data: Todo) => {
          assert.strictEqual(data.text, 'created todo')
          assert.ok(data.complete)
          resolve(data)
        })
      })

      await getService().create({ text: 'created todo', complete: true })
      await createPromise
    })

    it('.update and updated event', async () => {
      const updatePromise = new Promise((resolve) => {
        getService().once('updated', (data: Todo) => {
          assert.strictEqual(data.text, 'updated todo')
          assert.ok(data.complete)
          resolve(data)
        })
      })

      const todo = await getService().create({ text: 'todo to update', complete: false })
      await getService().update(todo.id, {
        text: 'updated todo',
        complete: true
      })
      await updatePromise
    })

    it('.patch and patched event', async () => {
      const patchPromise = new Promise((resolve) => {
        getService().once('patched', (data: Todo) => {
          assert.strictEqual(data.text, 'todo to patch')
          assert.ok(data.complete)
          resolve(data)
        })
      })

      const todo = await getService().create({ text: 'todo to patch', complete: false })
      await getService().patch(todo.id, { complete: true })
      await patchPromise
    })

    it('.remove and removed event', async () => {
      const removePromise = new Promise((resolve) => {
        getService().once('removed', (data: Todo) => {
          assert.strictEqual(data.text, 'todo to remove')
          assert.strictEqual(data.complete, false)
          resolve(data)
        })
      })

      const todo = await getService().create({ text: 'todo to remove', complete: false })
      await getService().remove(todo.id)
      await removePromise
    })

    it('.get with error', async () => {
      const query = { error: true }

      try {
        await getService().get(0, { query })
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.strictEqual(error.message, 'Something went wrong')
      }
    })
  })
}
