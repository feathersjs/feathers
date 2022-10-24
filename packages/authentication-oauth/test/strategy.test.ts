import { strict as assert } from 'assert'
import { expressFixture, TestOAuthStrategy } from './utils/fixture'
import { AuthenticationService } from '@feathersjs/authentication'

describe('@feathersjs/authentication-oauth/strategy', () => {
  let app: Awaited<ReturnType<typeof expressFixture>>
  let authService: AuthenticationService
  let strategy: TestOAuthStrategy

  before(async () => {
    app = await expressFixture(9778, 5115)
    authService = app.service('authentication')
    strategy = authService.getStrategy('github') as TestOAuthStrategy
  })

  after(async () => {
    await app.teardown()
  })

  it('initializes, has .entityId and configuration', () => {
    assert.ok(strategy)
    assert.strictEqual(strategy.entityId, 'id')
    assert.ok(strategy.configuration.entity)
  })

  it('reads configuration from the oauth key', () => {
    const testConfigValue = Math.random()
    app.get('authentication').oauth.github.hello = testConfigValue
    assert.strictEqual(strategy.configuration.hello, testConfigValue)
  })

  it('getRedirect', async () => {
    app.get('authentication').oauth.redirect = '/home'

    let redirect = await strategy.getRedirect({ accessToken: 'testing' })
    assert.equal(redirect, '/home#access_token=testing')

    redirect = await strategy.getRedirect(
      { accessToken: 'testing' },
      {
        redirect: '/hi-there'
      }
    )
    assert.strictEqual('/home/hi-there#access_token=testing', redirect)

    redirect = await strategy.getRedirect(new Error('something went wrong'))
    assert.equal(redirect, '/home#error=something%20went%20wrong')

    redirect = await strategy.getRedirect(new Error())
    assert.equal(redirect, '/home#error=OAuth%20Authentication%20not%20successful')

    app.get('authentication').oauth.redirect = '/home?'

    redirect = await strategy.getRedirect({ accessToken: 'testing' })
    assert.equal(redirect, '/home?access_token=testing')

    delete app.get('authentication').oauth.redirect

    redirect = await strategy.getRedirect({ accessToken: 'testing' })
    assert.equal(redirect, null)

    app.get('authentication').oauth.redirect = '/#dashboard'

    redirect = await strategy.getRedirect({ accessToken: 'testing' })
    assert.equal(redirect, '/#dashboard?access_token=testing')
  })

  it('getRedirect with referrer and allowed origins (#2430)', async () => {
    app.get('authentication').oauth.origins = ['https://feathersjs.com', 'https://feathers.cloud']

    let redirect = await strategy.getRedirect(
      { accessToken: 'testing' },
      {
        headers: {
          referer: 'https://feathersjs.com/somewhere'
        }
      }
    )
    assert.equal(redirect, 'https://feathersjs.com#access_token=testing')

    redirect = await strategy.getRedirect({ accessToken: 'testing' }, {})
    assert.equal(redirect, 'https://feathersjs.com#access_token=testing')

    redirect = await strategy.getRedirect(
      { accessToken: 'testing' },
      {
        headers: {
          referer: 'HTTPS://feathers.CLOUD'
        }
      }
    )
    assert.equal(redirect, 'https://feathers.cloud#access_token=testing')

    redirect = await strategy.getRedirect(
      { accessToken: 'testing' },
      {
        redirect: '/home',
        headers: {
          referer: 'https://feathersjs.com/somewhere'
        }
      }
    )
    assert.equal(redirect, 'https://feathersjs.com/home#access_token=testing')

    await assert.rejects(
      () =>
        strategy.getRedirect(
          { accessToken: 'testing' },
          {
            headers: {
              referer: 'https://example.com'
            }
          }
        ),
      {
        message: 'Referer "https://example.com" is not allowed.'
      }
    )
  })

  describe('authenticate', () => {
    it('with new user', async () => {
      const authResult = await strategy.authenticate(
        {
          strategy: 'test',
          profile: {
            id: 'newEntity'
          }
        },
        {}
      )

      assert.deepEqual(authResult, {
        authentication: { strategy: 'github' },
        user: { githubId: 'newEntity', id: authResult.user.id }
      })
    })

    it('with existing user and already linked strategy', async () => {
      const existingUser = await app.service('users').create({
        githubId: 'existingEntity',
        name: 'David'
      })
      const authResult = await strategy.authenticate(
        {
          strategy: 'test',
          profile: {
            id: 'existingEntity'
          }
        },
        {}
      )

      assert.deepEqual(authResult, {
        authentication: { strategy: 'github' },
        user: existingUser
      })
    })

    it('links user with existing authentication', async () => {
      const user = await app.service('users').create({
        name: 'David'
      })
      const jwt = await authService.createAccessToken(
        {},
        {
          subject: `${user.id}`
        }
      )

      const authResult = await strategy.authenticate(
        {
          strategy: 'test',
          profile: {
            id: 'linkedEntity'
          }
        },
        {
          authentication: {
            strategy: 'jwt',
            accessToken: jwt
          }
        }
      )

      assert.deepEqual(authResult, {
        authentication: { strategy: 'github' },
        user: { id: user.id, name: user.name, githubId: 'linkedEntity' }
      })
    })
  })
})
