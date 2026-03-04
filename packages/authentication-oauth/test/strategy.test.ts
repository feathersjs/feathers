import { strict as assert } from 'assert'
import { expressFixture, TestOAuthStrategy } from './utils/fixture'
import { AuthenticationService } from '@feathersjs/authentication'

describe('@feathersjs/authentication-oauth/strategy security', () => {
  let app: Awaited<ReturnType<typeof expressFixture>>
  let authService: AuthenticationService
  let strategy: TestOAuthStrategy

  before(async () => {
    app = await expressFixture(9779, 5116)
    authService = app.service('authentication')
    strategy = authService.getStrategy('github') as TestOAuthStrategy
  })

  after(async () => {
    await app.teardown()
  })

  describe('open redirect via URL authority injection', () => {
    beforeEach(() => {
      app.get('authentication').oauth.origins = ['https://target.com']
    })

    afterEach(() => {
      delete app.get('authentication').oauth.origins
    })

    it('should reject redirect parameter containing @ character', async () => {
      // Attack: ?redirect=@attacker.com would result in https://target.com@attacker.com
      // which browsers parse as username "target.com" and host "attacker.com"
      await assert.rejects(
        () =>
          strategy.getRedirect(
            { accessToken: 'testing' },
            {
              redirect: '@attacker.com',
              headers: {
                referer: 'https://target.com/login'
              }
            }
          ),
        {
          name: 'NotAuthenticated'
        }
      )
    })

    it('should reject redirect parameter containing // for protocol-relative URLs', async () => {
      // Attack: ?redirect=//attacker.com would result in https://target.com//attacker.com
      // which some parsers might interpret as protocol-relative URL
      await assert.rejects(
        () =>
          strategy.getRedirect(
            { accessToken: 'testing' },
            {
              redirect: '//attacker.com',
              headers: {
                referer: 'https://target.com/login'
              }
            }
          ),
        {
          name: 'NotAuthenticated'
        }
      )
    })

    it('should reject redirect with backslash characters', async () => {
      // Some browsers treat backslash as forward slash
      await assert.rejects(
        () =>
          strategy.getRedirect(
            { accessToken: 'testing' },
            {
              redirect: '\\\\attacker.com',
              headers: {
                referer: 'https://target.com/login'
              }
            }
          ),
        {
          name: 'NotAuthenticated'
        }
      )
    })
  })

  describe('origin validation bypass via startsWith', () => {
    beforeEach(() => {
      app.get('authentication').oauth.origins = ['https://target.com']
    })

    afterEach(() => {
      delete app.get('authentication').oauth.origins
    })

    it('should reject referer from domain that shares prefix with allowed origin', async () => {
      // Attack: attacker registers target.com.attacker.com
      // startsWith('https://target.com') would incorrectly return true
      await assert.rejects(
        () =>
          strategy.getRedirect(
            { accessToken: 'testing' },
            {
              headers: {
                referer: 'https://target.com.attacker.com/login'
              }
            }
          ),
        {
          message: 'Referer "https://target.com.attacker.com/login" is not allowed.'
        }
      )
    })

    it('should reject referer with extra subdomain-like prefix', async () => {
      // Another variant: target.com-evil.attacker.com
      await assert.rejects(
        () =>
          strategy.getRedirect(
            { accessToken: 'testing' },
            {
              headers: {
                referer: 'https://target.com-evil.attacker.com/login'
              }
            }
          ),
        {
          message: 'Referer "https://target.com-evil.attacker.com/login" is not allowed.'
        }
      )
    })

    it('should accept exact origin match with path', async () => {
      // Legitimate use case should still work
      const redirect = await strategy.getRedirect(
        { accessToken: 'testing' },
        {
          headers: {
            referer: 'https://target.com/some/path'
          }
        }
      )
      assert.equal(redirect, 'https://target.com#access_token=testing')
    })
  })
})

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

    redirect = await strategy.getRedirect(
      { accessToken: 'testing' },
      {
        redirect: '/hi-there?'
      }
    )
    assert.equal(redirect, '/home/hi-there?access_token=testing')

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
