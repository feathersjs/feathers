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

    before(() =>
      getApp()
        .service('users')
        .create({
          email,
          password
        })
        .then((result: any) => {
          user = result
        })
    )

    beforeEach(() => {
      client = getClient()
    })

    it('authenticates with local strategy', () => {
      return client
        .authenticate({
          strategy: 'local',
          email,
          password
        })
        .then((result) => {
          assert.ok(result.accessToken)
          assert.strictEqual(result.authentication.strategy, 'local')
          assert.strictEqual(result.user.email, email)
        })
    })

    it('authentication with wrong credentials fails, does not maintain state', () => {
      return client
        .authenticate({
          strategy: 'local',
          email,
          password: 'blabla'
        })
        .then(() => assert.fail('Should never get here'))
        .catch((error) => {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.strictEqual(error.message, 'Invalid login')
          assert.ok(!client.get('authentication'), 'Reset client state')
        })
    })

    it('errors when not authenticated', () => {
      return client
        .service('dummy')
        .find()
        .then(() => assert.fail('Should never get here'))
        .catch((error: any) => {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.strictEqual(error.code, 401)
          assert.strictEqual(error.message, 'Not authenticated')
        })
    })

    it('authenticates and allows access', () => {
      return client
        .authenticate({
          strategy: 'local',
          email,
          password
        })
        .then(() => client.service('dummy').find())
        .then((result) => {
          assert.strictEqual(result.provider, provider)
          assert.ok(result.authentication)
          assert.ok(result.authentication.payload)
          assert.strictEqual(result.user.email, user.email)
          assert.strictEqual(result.user.id, user.id)
        })
    })

    it('re-authenticates', () => {
      return client
        .authenticate({
          strategy: 'local',
          email,
          password
        })
        .then(() => client.authentication.reset())
        .then(() => client.authenticate())
        .then(() => client.service('dummy').find())
        .then((result) => {
          assert.strictEqual(result.provider, provider)
          assert.ok(result.authentication)
          assert.ok(result.authentication.payload)
          assert.strictEqual(result.user.email, user.email)
          assert.strictEqual(result.user.id, user.id)
        })
    })

    it('after logout does not allow subsequent access', () => {
      return client
        .authenticate({
          strategy: 'local',
          email,
          password
        })
        .then(() => client.logout())
        .then((result) => {
          assert.ok(result.accessToken)
          assert.ok(result.user)

          return client.service('dummy').find()
        })
        .then(() => assert.fail('Should never get here'))
        .catch((error) => {
          assert.strictEqual(error.name, 'NotAuthenticated')
          assert.strictEqual(error.code, 401)
          assert.strictEqual(error.message, 'Not authenticated')
        })
    })
  })
}
