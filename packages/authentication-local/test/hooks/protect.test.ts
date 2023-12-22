import assert from 'assert'
import { HookContext } from '@feathersjs/feathers'
import { hooks } from '../../src/index'

const { protect } = hooks

function testOmit(title: string, property: string) {
  describe(title, () => {
    const fn = protect('password')

    it('omits from object', async () => {
      const data = {
        email: 'test@user.com',
        password: 'supersecret'
      }
      const context = {
        [property]: data
      } as unknown as HookContext

      await fn(context)

      assert.deepStrictEqual(context, {
        [property]: data,
        dispatch: { email: 'test@user.com' }
      })
    })

    it('omits from nested object', async () => {
      const hook = protect('user.password')
      const data = {
        user: {
          email: 'test@user.com',
          password: 'supersecret'
        }
      }
      const context = {
        [property]: data
      } as unknown as HookContext

      await hook(context)

      assert.deepStrictEqual(context, {
        [property]: data,
        dispatch: { user: { email: 'test@user.com' } }
      })
    })

    it('handles `data` property only for find', async () => {
      const data = {
        email: 'test@user.com',
        password: 'supersecret',
        data: 'yes'
      }
      const context = {
        [property]: data
      } as unknown as HookContext

      await fn(context)

      assert.deepStrictEqual(context, {
        [property]: data,
        dispatch: { email: 'test@user.com', data: 'yes' }
      })
    })

    it('uses .toJSON (#48)', async () => {
      class MyUser {
        toJSON() {
          return {
            email: 'test@user.com',
            password: 'supersecret'
          }
        }
      }

      const data = new MyUser()
      const context = {
        [property]: data
      } as unknown as HookContext

      await fn(context)

      assert.deepStrictEqual(context, {
        [property]: data,
        dispatch: { email: 'test@user.com' }
      })
    })

    it('omits from array but only objects (#2053)', async () => {
      const data = [
        {
          email: 'test1@user.com',
          password: 'supersecret'
        },
        {
          email: 'test2@user.com',
          password: 'othersecret'
        },
        ['one', 'two', 'three'],
        'test'
      ]
      const context = {
        [property]: data
      } as unknown as HookContext

      await fn(context)

      assert.deepStrictEqual(context, {
        [property]: data,
        dispatch: [{ email: 'test1@user.com' }, { email: 'test2@user.com' }, ['one', 'two', 'three'], 'test']
      })
    })

    it('omits from pagination object', async () => {
      const data = {
        total: 2,
        data: [
          {
            email: 'test1@user.com',
            password: 'supersecret'
          },
          {
            email: 'test2@user.com',
            password: 'othersecret'
          }
        ]
      }
      const context = {
        method: 'find',
        [property]: data
      } as unknown as HookContext

      await fn(context)

      assert.deepStrictEqual(context, {
        method: 'find',
        [property]: data,
        dispatch: {
          total: 2,
          data: [{ email: 'test1@user.com' }, { email: 'test2@user.com' }]
        }
      })
    })

    it('updates result if params.provider is set', async () => {
      const data = [
        {
          email: 'test1@user.com',
          password: 'supersecret'
        },
        {
          email: 'test2@user.com',
          password: 'othersecret'
        }
      ]
      const params = { provider: 'test' }
      const context = {
        [property]: data,
        params
      } as unknown as HookContext

      await fn(context)

      assert.deepStrictEqual(context, {
        [property]: data,
        params,
        result: [{ email: 'test1@user.com' }, { email: 'test2@user.com' }],
        dispatch: [{ email: 'test1@user.com' }, { email: 'test2@user.com' }]
      })
    })
  })
}

describe('@feathersjs/authentication-local/hooks/protect', () => {
  it('does nothing when called with no result', async () => {
    const fn = protect()

    assert.deepStrictEqual(await fn({} as any), undefined)
  })

  testOmit('with hook.result', 'result')
  testOmit('with hook.dispatch already set', 'dispatch')
})
