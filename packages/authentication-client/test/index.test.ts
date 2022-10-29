import assert from 'assert'
import { feathers, Application } from '@feathersjs/feathers'

import client from '../src'
import { AuthenticationClient } from '../src'
import { NotAuthenticated } from '@feathersjs/errors'

describe('@feathersjs/authentication-client', () => {
  const accessToken = 'testing'
  const user = {
    name: 'Test User'
  }
  let app: Application

  beforeEach(() => {
    app = feathers()

    app.configure(client())
    app.use('/authentication', {
      create(data: any) {
        if (data.error) {
          return Promise.reject(new Error('Did not work'))
        }

        return Promise.resolve({
          accessToken,
          data,
          user
        })
      },

      remove(id) {
        if (!app.get('authentication')) {
          throw new NotAuthenticated('Not logged in')
        }

        return Promise.resolve({ id })
      }
    })
    app.use('dummy', {
      find(params) {
        return Promise.resolve(params)
      }
    })
  })

  it('initializes', () => {
    assert.ok(app.authentication instanceof AuthenticationClient)
    assert.strictEqual(app.get('storage'), app.authentication.storage)
    assert.strictEqual(typeof app.authenticate, 'function')
    assert.strictEqual(typeof app.logout, 'function')
  })

  it('setAccessToken, getAccessToken, removeAccessToken', async () => {
    const auth = app.authentication
    const token = 'hi'

    await auth.setAccessToken(token)

    const res = await auth.getAccessToken()

    assert.strictEqual(res, token)

    await auth.removeAccessToken()
    assert.strictEqual(await auth.getAccessToken(), null)
  })

  it('getFromLocation', async () => {
    const auth = app.authentication
    let dummyLocation = { hash: 'access_token=testing' } as Location

    let token = await auth.getFromLocation(dummyLocation)

    assert.strictEqual(token, 'testing')
    assert.strictEqual(dummyLocation.hash, '')

    dummyLocation.hash = 'a=b&access_token=otherTest&c=d'
    token = await auth.getFromLocation(dummyLocation)

    assert.strictEqual(token, 'otherTest')
    assert.strictEqual(dummyLocation.hash, 'a=b&c=d')

    dummyLocation = { search: 'access_token=testing' } as Location
    token = await auth.getFromLocation(dummyLocation)

    assert.strictEqual(await auth.getFromLocation({} as Location), null)

    try {
      await auth.getFromLocation({
        hash: 'error=Error Happened&x=y'
      } as Location)
      assert.fail('Should never get here')
    } catch (error: any) {
      assert.strictEqual(error.name, 'OauthError')
      assert.strictEqual(error.message, 'Error Happened')
    }
  })

  it('authenticate, authentication hook, login event', async () => {
    const data = {
      strategy: 'testing'
    }

    const promise = new Promise((resolve) => {
      app.once('login', resolve)
    })

    app.authenticate(data)

    const result = await promise

    assert.deepStrictEqual(result, {
      accessToken,
      data,
      user
    })

    let at = await app.authentication.getAccessToken()

    assert.strictEqual(at, accessToken, 'Set accessToken in storage')

    at = await Promise.resolve(app.get('storage').getItem('feathers-jwt'))

    assert.strictEqual(at, accessToken, 'Set accessToken in storage')

    const found = await app.service('dummy').find()
    assert.deepStrictEqual(found.accessToken, accessToken)
    assert.deepStrictEqual(found.user, user)
  })

  it('logout event', async () => {
    const promise = new Promise((resolve) => app.once('logout', resolve))

    app.authenticate({ strategy: 'testing' }).then(() => app.logout())

    const result = await promise

    assert.deepStrictEqual(result, { id: null })
  })

  it('does not remove AccessToken on other errors', async () => {
    await app.authenticate({ strategy: 'testing' })
    await app.authenticate({ strategy: 'testing' })

    const at = await app.authentication.getAccessToken()

    assert.strictEqual(at, accessToken)
  })

  it('logout when not logged in without error', async () => {
    const result = await app.logout()

    assert.strictEqual(result, null)
  })

  describe('reauthenticate', () => {
    it('fails when no token in storage and resets authentication state', async () => {
      await assert.rejects(() => app.authentication.reAuthenticate(), {
        message: 'No accessToken found in storage'
      })
      assert.ok(!app.get('authentication'), 'Reset authentication')
    })

    it('reauthenticates when token is in storage', async () => {
      const data = {
        strategy: 'testing'
      }

      const result = await app.authenticate(data)

      assert.deepStrictEqual(result, {
        accessToken,
        data,
        user
      })
      await app.authentication.reAuthenticate()
      await app.authentication.reset()

      let at = await Promise.resolve(app.get('storage').getItem('feathers-jwt'))

      assert.strictEqual(at, accessToken, 'Set accessToken in storage')

      at = await app.authentication.reAuthenticate()

      assert.deepStrictEqual(at, {
        accessToken,
        data: { strategy: 'jwt', accessToken: 'testing' },
        user
      })

      await app.logout()

      at = await Promise.resolve(app.get('storage').getItem('feathers-jwt'))
      assert.ok(!at)
      assert.ok(!app.get('authentication'))
    })

    it('reAuthenticate works with parallel requests', async () => {
      const data = {
        strategy: 'testing'
      }

      await app.authenticate(data)
      await app.reAuthenticate()
      await app.authentication.reset()

      app.reAuthenticate()

      const found = await app.service('dummy').find()

      assert.deepStrictEqual(found.accessToken, accessToken)
      assert.deepStrictEqual(found.user, user)
    })

    it('reauthenticates using different strategy', async () => {
      app.configure(client({ jwtStrategy: 'any' }))

      const data = {
        strategy: 'testing'
      }

      let result = await app.authenticate(data)
      assert.deepStrictEqual(result, {
        accessToken,
        data,
        user
      })

      result = await app.authentication.reAuthenticate(false, 'jwt')
      assert.deepStrictEqual(result, {
        accessToken,
        data,
        user
      })
    })
  })
})
