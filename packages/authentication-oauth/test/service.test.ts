import { strict as assert } from 'assert'
import crypto from 'crypto'
import http from 'http'
import jsonwebtoken from 'jsonwebtoken'
import axios, { AxiosResponse } from 'axios'
import { CookieJar } from 'tough-cookie'
import { OAuthStrategy } from '../src'
import { OAuthService } from '../src/service'
import { appleKeys } from '../src/apple'
import { expressFixture } from './utils/fixture'

describe('@feathersjs/authentication-oauth service security', () => {
  const port = 9780
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0
  })
  let app: Awaited<ReturnType<typeof expressFixture>>

  const fetchErrorResponse = async (
    url: string,
    headers?: Record<string, string>
  ): Promise<AxiosResponse> => {
    try {
      await req.get(url, { headers })
    } catch (error: any) {
      return error.response
    }
    assert.fail('Should never get here')
  }

  before(async () => {
    app = await expressFixture(port, 5117)
  })

  after(async () => {
    await app.teardown()
  })

  describe('internal headers exposure via session cookie', () => {
    it('should not store sensitive internal headers in session cookie', async () => {
      const host = `http://localhost:${port}`
      const location = `${host}/oauth/github`

      // Make request with internal/sensitive headers that might be added by proxies
      const oauthResponse = await fetchErrorResponse(location, {
        'x-forwarded-for': '10.0.0.1',
        'x-internal-api-key': 'sk_live_secret123',
        'x-real-ip': '192.168.1.1'
      })

      assert.equal(oauthResponse.status, 303)

      // Get the session cookie
      const cookies = oauthResponse.headers['set-cookie']
      assert.ok(cookies, 'Should have set-cookie header')

      // Find the oauth session cookie (express cookie-session uses 'feathers.oauth')
      const oauthCookie = cookies.find((c: string) => c.startsWith('feathers.oauth='))
      assert.ok(oauthCookie, 'Should have feathers.oauth session cookie')

      // Extract the cookie value and decode it
      const match = oauthCookie.match(/feathers\.oauth=([^;]+)/)
      assert.ok(match, 'Should be able to extract cookie value')

      const cookieValue = decodeURIComponent(match[1])
      // Cookie session uses base64 encoding
      const decoded = Buffer.from(cookieValue, 'base64').toString('utf-8')
      const sessionData = JSON.parse(decoded)

      // The vulnerability: all headers are stored in session.headers
      // This test should FAIL if headers object contains sensitive internal headers
      assert.ok(sessionData.headers, 'Session should have headers stored')

      // These assertions verify the FIX is in place - they should FAIL currently
      // because the vulnerable code stores ALL headers
      const storedHeaderKeys = Object.keys(sessionData.headers).map((k) => k.toLowerCase())

      // Only 'referer' should be stored (if needed for origin validation)
      // Any other headers being stored is a security issue
      const sensitiveHeaders = [
        'x-forwarded-for',
        'x-internal-api-key',
        'x-real-ip',
        'authorization',
        'cookie'
      ]
      const exposedSensitiveHeaders = sensitiveHeaders.filter((h) => storedHeaderKeys.includes(h))

      assert.deepEqual(
        exposedSensitiveHeaders,
        [],
        `Sensitive headers should not be stored in session cookie, but found: ${exposedSensitiveHeaders.join(', ')}`
      )
    })
  })
})

describe('Account Takeover via OAuth Callback Query Parameter Forgery', () => {
  const port = 9781
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0
  })
  let app: Awaited<ReturnType<typeof expressFixture>>

  const fetchResponse = async (url: string, headers?: Record<string, string>): Promise<AxiosResponse> => {
    try {
      return await req.get(url, { headers })
    } catch (error: any) {
      return error.response
    }
  }

  before(async () => {
    app = await expressFixture(port, 5118)
    // Create an existing user to demonstrate account takeover
    await app.service('users').create({ email: 'admin@example.com' })
  })

  after(async () => {
    await app.teardown()
  })

  it('should not authenticate when calling callback directly with forged query parameters', async () => {
    const host = `http://localhost:${port}`
    // Attack: directly hit the callback endpoint with a forged profile in query params
    // Without a valid OAuth session, Grant returns no response, so the payload
    // falls back to params.query which the attacker controls
    const attackUrl = `${host}/oauth/github/callback?profile[foo]=bar&code=fake&state=fake`

    const response = await fetchResponse(attackUrl)

    // The forged request must NOT return a valid access token.
    // Currently the vulnerable code falls back to params.query as the auth payload,
    // allowing the attacker to forge authentication and receive a JWT.
    const hasAccessToken =
      response.data?.accessToken ||
      (response.headers.location && response.headers.location.includes('access_token'))

    assert.ok(!hasAccessToken, `Forged callback request should not return an access token but got one`)
  })

  it('should not authenticate when callback is called with a targeted profile id', async () => {
    const host = `http://localhost:${port}`
    // Attack: forge a specific profile ID to target a known user
    const attackUrl = `${host}/oauth/github/callback?profile[id]=12345&code=fake&state=fake`

    const response = await fetchResponse(attackUrl)

    const hasAccessToken =
      response.data?.accessToken ||
      (response.headers.location && response.headers.location.includes('access_token'))

    assert.ok(
      !hasAccessToken,
      `Forged callback request with targeted profile ID should not return an access token`
    )
  })
})

describe('@feathersjs/authentication-oauth service', () => {
  const port = 9778
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0
  })
  const cookie = new CookieJar()
  let app: Awaited<ReturnType<typeof expressFixture>>

  const fetchErrorResponse = async (url: string): Promise<AxiosResponse> => {
    try {
      await req.get(url)
    } catch (error: any) {
      return error.response
    }
    assert.fail('Should never get here')
  }

  before(async () => {
    app = await expressFixture(port, 5115)
  })

  after(async () => {
    await app.teardown()
  })

  it('runs through the oAuth flow', async () => {
    const host = `http://localhost:${port}`
    let location = `${host}/oauth/github`

    const oauthResponse = await fetchErrorResponse(location)
    assert.equal(oauthResponse.status, 303)

    oauthResponse.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

    location = oauthResponse.data.location

    const providerResponse = await fetchErrorResponse(location)
    assert.equal(providerResponse.status, 302)

    location = providerResponse.headers.location

    const { data } = await req.get(location, {
      headers: {
        cookie: await cookie.getCookieString(host)
      }
    })

    assert.ok(data.accessToken)
    assert.equal(data.authentication.strategy, 'github')
    assert.equal(data.user.githubId, 'test')
  })
})

describe('OAuth2 callback without an authorization code', () => {
  const port = 9782
  const host = `http://localhost:${port}`
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0,
    validateStatus: () => true
  })
  let app: Awaited<ReturnType<typeof expressFixture>>
  let existingUser: any

  // Start the oAuth flow anonymously and return the grant session cookie
  const startFlow = async () => {
    const cookie = new CookieJar()
    const response = await req.get(`${host}/oauth/github`)

    assert.equal(response.status, 303)
    response.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

    return cookie.getCookieString(host)
  }

  const callback = async (query: string) =>
    req.get(`${host}/oauth/github/callback${query}`, {
      headers: { cookie: await startFlow() }
    })

  const assertNoAccessToken = (response: AxiosResponse) => {
    assert.ok(!response.data?.accessToken, 'Should not return an access token')
    assert.ok(!response.data?.user, 'Should not return a user')
    assert.ok(!response.headers.location?.includes('access_token'), 'Should not redirect with a token')
  }

  before(async () => {
    app = await expressFixture(port, 5119)
    existingUser = await app.service('users').create({ email: 'admin@example.com' })
  })

  after(async () => {
    await app.teardown()
  })

  it('rejects an empty code', async () => {
    const response = await callback('?code=&state=')

    assert.equal(response.status, 401)
    assertNoAccessToken(response)
  })

  it('rejects a missing code with other query parameters', async () => {
    const response = await callback('?state=anything')

    assert.equal(response.status, 401)
    assertNoAccessToken(response)
  })

  it('rejects a non-string code', async () => {
    const response = await callback('?code[]=&state=')

    assert.equal(response.status, 401)
    assertNoAccessToken(response)
  })

  it('does not let the request override protected provider options', async () => {
    const response = await req.get(
      `${host}/oauth/github?authorize_url=https://evil.example.com/authorize&scope=user` +
        '&custom_params[redirect_uri]=https://evil.example.com/cb&custom_params[client_id]=attacker' +
        '&custom_params[prompt]=consent'
    )
    const location = new URL(response.data.location)

    assert.equal(location.origin, 'http://localhost:5119')
    assert.equal(location.searchParams.get('scope'), 'user')
    assert.equal(location.searchParams.get('client_id'), 'some-key')
    assert.equal(location.searchParams.get('redirect_uri'), 'http://127.0.0.1:9782/oauth/github/callback')
    assert.equal(location.searchParams.get('prompt'), 'consent')
  })

  it('still passes through the provider error', async () => {
    const response = await callback('?error=access_denied')

    assert.equal(response.status, 401)
    assert.equal(response.data.message, 'access_denied')
    assertNoAccessToken(response)
  })

  it('redirects to the frontend with the error', async () => {
    app.get('authentication').oauth.redirect = 'http://localhost:3000/'

    try {
      const rejected = await callback('?code=&state=')
      const providerError = await callback('?error=access_denied')

      assert.equal(
        rejected.headers.location,
        'http://localhost:3000/#error=Missing%20oAuth%20authorization%20code.'
      )
      assert.equal(providerError.headers.location, 'http://localhost:3000/#error=access_denied')
    } finally {
      delete app.get('authentication').oauth.redirect
    }
  })

  it('rejects a callback for a different provider than the flow was started with', async () => {
    const response = await req.get(`${host}/oauth/gitlab/callback?code=code`, {
      headers: { cookie: await startFlow() }
    })

    assert.equal(response.status, 401)
    assert.equal(response.data.message, 'Invalid oAuth callback provider.')
    assertNoAccessToken(response)
  })

  it('accepts a POST callback with the code in the body and rejects one without', async () => {
    const valid = await req.post(
      `${host}/oauth/github/callback`,
      { code: 'code' },
      { headers: { cookie: await startFlow() } }
    )
    const empty = await req.post(
      `${host}/oauth/github/callback`,
      { code: '' },
      { headers: { cookie: await startFlow() } }
    )

    assert.ok(valid.data.accessToken)
    assert.equal(empty.status, 401)
    assert.equal(empty.data.message, 'Missing oAuth authorization code.')
    await app.service('users').remove(valid.data.user.id)
  })

  it('does not modify or return existing users', async () => {
    await callback('?code=&state=')

    const users = await app.service('users').find()

    assert.deepEqual(users, [existingUser])
  })

  it('does not send the code or client secret to endpoints set by the request', async () => {
    let evilRequests = 0
    const evil = http.createServer((_req, res) => {
      evilRequests++
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ access_token: 'evil', id: 'victim' }))
    })

    await new Promise<void>((resolve) => evil.listen(5122, resolve))

    try {
      const cookie = new CookieJar()
      const evilUrl = 'http://localhost:5122'
      const start = await req.get(
        `${host}/oauth/github?access_url=${evilUrl}/token&profile_url=${evilUrl}/me&request_url=${evilUrl}/request`
      )

      start.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

      const provider = await req.get(start.data.location)
      const response = await req.get(provider.headers.location, {
        headers: { cookie: await cookie.getCookieString(host) }
      })

      assert.equal(evilRequests, 0)
      assert.equal(response.data.user.githubId, 'test')
    } finally {
      evil.close()
    }
  })
})

describe('OAuth callback with Grant state enabled', () => {
  const port = 9784
  const host = `http://localhost:${port}`
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0,
    validateStatus: () => true
  })
  let app: Awaited<ReturnType<typeof expressFixture>>

  const startFlow = async (query = '') => {
    const cookie = new CookieJar()
    const response = await req.get(`${host}/oauth/github${query}`)

    response.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

    return { cookie: await cookie.getCookieString(host), location: new URL(response.data.location) }
  }

  before(async () => {
    app = await expressFixture(port, 5121, { state: true })
  })

  after(async () => {
    await app.teardown()
  })

  it('rejects a callback whose state does not match the flow (login CSRF)', async () => {
    const { cookie } = await startFlow()
    const response = await req.get(`${host}/oauth/github/callback?code=attacker-code&state=forged`, {
      headers: { cookie }
    })

    assert.equal(response.status, 401)
    assert.equal(response.data.message, 'Grant: OAuth2 state mismatch')
    assert.ok(!response.data?.accessToken)
  })

  it('does not let the request turn the state check off', async () => {
    const { cookie, location } = await startFlow('?state=false')
    const response = await req.get(`${host}/oauth/github/callback?code=attacker-code`, {
      headers: { cookie }
    })

    assert.ok(location.searchParams.get('state'))
    assert.equal(response.status, 401)
    assert.ok(!response.data?.accessToken)
  })
})

describe('OAuth callback validation for other providers', () => {
  let app: Awaited<ReturnType<typeof expressFixture>>
  let oauthService: OAuthService
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })

  const idToken = (claims: any) =>
    jsonwebtoken.sign(
      {
        iss: 'https://appleid.apple.com',
        aud: 'some-key',
        exp: Math.floor(Date.now() / 1000) + 600,
        ...claims
      },
      privateKey,
      {
        algorithm: 'RS256',
        keyid: 'apple-key'
      }
    )

  const callbackParams = (provider: string, query: any = {}, grant: any = {}, body?: any): any => ({
    route: { provider },
    query,
    state: body ? { oauthCallback: body } : {},
    session: { grant: { provider, ...grant } }
  })

  before(async () => {
    app = await expressFixture(9783, 5120)

    const authService = app.service('authentication')

    authService.configuration.oauth.twitter = { key: 'some-key', secret: 'a secret secret' }
    authService.configuration.oauth.apple = { key: 'some-key', secret: 'a secret secret' }
    authService.configuration.oauth.bitbucket = {
      key: 'some-key',
      secret: 'a secret secret',
      overrides: { alt: { dynamic: true } }
    }
    authService.register('apple', new OAuthStrategy())
    oauthService = new OAuthService(authService, { linkStrategy: 'jwt' })
    appleKeys.keys = [{ ...publicKey.export({ format: 'jwk' }), kid: 'apple-key' }]
    appleKeys.fetchedAt = Date.now()
  })

  after(async () => {
    appleKeys.keys = []
    appleKeys.fetchedAt = 0
    appleKeys.failedAt = 0
    await app.teardown()
  })

  it('rejects an OAuth1 callback without an oauth_token', async () => {
    await assert.rejects(
      () =>
        oauthService.authenticate(
          callbackParams(
            'twitter',
            { profile: { id: 'x' } },
            { response: { raw: { profile: { id: 'x' } } } }
          ),
          null as any
        ),
      { message: 'Missing oAuth token.' }
    )
  })

  it('validates callbacks for dynamic providers that are not configured', async () => {
    const authService = app.service('authentication')

    authService.configuration.oauth.defaults = { dynamic: true }

    try {
      const dynamicService = new OAuthService(authService, { linkStrategy: 'jwt' })

      await assert.rejects(
        () =>
          dynamicService.authenticate(
            callbackParams('google', { state: 'x' }, { response: { raw: { state: 'x' } } }),
            null as any
          ),
        { message: 'Missing oAuth authorization code.' }
      )
    } finally {
      delete authService.configuration.oauth.defaults
    }
  })

  it('removes protected options from dynamic overrides', async () => {
    const result = await oauthService.handler(
      'GET',
      {
        route: { provider: 'bitbucket' },
        query: { access_url: 'https://evil.example.com/token', subdomain: 'evil.example.com', scope: 'x' },
        session: {},
        state: {}
      } as any,
      {},
      'alt'
    )

    assert.deepEqual(result.session.dynamic, { scope: 'x' })
  })

  it('validates the code for a POST callback', async () => {
    await assert.rejects(
      () =>
        oauthService.authenticate(
          callbackParams('apple', {}, { response: { raw: { user: { id: 'x' } } } }, { user: { id: 'x' } }),
          null as any
        ),
      { message: 'Missing oAuth authorization code.' }
    )
  })

  it('destroys the session when the redirect is invalid', async () => {
    const authService = app.service('authentication')
    let destroyed = false
    const params = callbackParams('github', { code: 'code' }, { response: { profile: { id: 'redirect' } } })

    params.session.redirect = '/evil.example'
    params.session.destroy = async () => {
      destroyed = true
    }
    authService.configuration.oauth.redirect = '/'

    try {
      await assert.rejects(() => oauthService.authenticate(params, null as any), {
        message: 'Invalid redirect path.'
      })
      assert.ok(destroyed, 'Session should be destroyed')
    } finally {
      delete authService.configuration.oauth.redirect
    }
  })

  it('takes the Apple identity from the verified id_token, not the callback body', async () => {
    const victim = await app.service('users').create({ appleId: 'victim', email: 'victim@example.com' })
    const result: any = await oauthService.authenticate(
      callbackParams(
        'apple',
        {},
        {
          response: {
            id_token: idToken({ sub: 'attacker', email: 'attacker@example.com' }),
            profile: { id: 'victim', sub: 'victim', email: 'victim@example.com', name: 'Forged' }
          }
        },
        { code: 'code' }
      ),
      null as any
    )

    assert.notEqual(result.user.id, victim.id)
    assert.equal(result.user.appleId, 'attacker')
  })

  it('authenticates a returning Apple user without a callback body profile', async () => {
    const result: any = await oauthService.authenticate(
      callbackParams(
        'apple',
        {},
        {
          response: {
            id_token: idToken({ sub: 'returning' }),
            profile: { error: 'Grant: No profile URL found!' }
          }
        },
        { code: 'code' }
      ),
      null as any
    )

    assert.equal(result.user.appleId, 'returning')
  })
})
