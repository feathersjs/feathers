import assert from 'assert'
import { Application } from '@feathersjs/feathers'
import '../../src'

export default (
  getApp: () => Application,
  getClient: () => Application,
  { provider, email, password }: { provider: string; email: string; password: string }
) => {
  describe('common tests', () => {
    let client: Application
    let user: any

    beforeAll(
      async () =>
        (user = await getApp().service('users').create({
          email,
          password
        }))
    )

    beforeEach(() => {
      client = getClient()
    })

    afterAll(async () => {
      await getApp().service('users').remove(user.id)
    })

    it('authenticates with local strategy', async () => {
      const result = await client.authenticate({
        strategy: 'local',
        email,
        password
      })

      assert.ok(result.accessToken)
      assert.strictEqual(result.authentication.strategy, 'local')
      assert.strictEqual(result.user.email, email)
    })

    it('authentication with wrong credentials fails, does not maintain state', async () => {
      await assert.rejects(
        () =>
          client.authenticate({
            strategy: 'local',
            email,
            password: 'blabla'
          }),
        {
          name: 'NotAuthenticated',
          message: 'Invalid login'
        }
      )
      assert.ok(!client.get('authentication'), 'Reset client state')
    })

    it('errors when not authenticated', async () => {
      await assert.rejects(() => client.service('dummy').find(), {
        name: 'NotAuthenticated',
        code: 401,
        message: 'Not authenticated'
      })
    })

    it('authenticates and allows access', async () => {
      await client.authenticate({
        strategy: 'local',
        email,
        password
      })
      const result = await client.service('dummy').find()

      assert.strictEqual(result.provider, provider)
      assert.ok(result.authentication)
      assert.ok(result.authentication.payload)
      assert.strictEqual(result.user.email, user.email)
      assert.strictEqual(result.user.id, user.id)
    })

    it('re-authenticates', async () => {
      await client.authenticate({
        strategy: 'local',
        email,
        password
      })

      await client.authentication.reset()
      await client.authenticate()
      const result = await client.service('dummy').find()

      assert.strictEqual(result.provider, provider)
      assert.ok(result.authentication)
      assert.ok(result.authentication.payload)
      assert.strictEqual(result.user.email, user.email)
      assert.strictEqual(result.user.id, user.id)
    })

    it('after logout does not allow subsequent access', async () => {
      await client.authenticate({
        strategy: 'local',
        email,
        password
      })

      const result = await client.logout()

      assert.ok(result!.accessToken)
      assert.ok(result!.user)

      await assert.rejects(() => client.service('dummy').find(), {
        name: 'NotAuthenticated',
        code: 401,
        message: 'Not authenticated'
      })
    })
  })
}
