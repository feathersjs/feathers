import { strict as assert } from 'assert'
import axios, { AxiosResponse } from 'axios'
import { CookieJar } from 'tough-cookie'
import { expressFixture } from './utils/fixture'

describe('@feathersjs/authentication-oauth service security', () => {
  const port = 9780
  const req = axios.create({
    withCredentials: true,
    maxRedirects: 0
  })
  let app: Awaited<ReturnType<typeof expressFixture>>

  const fetchErrorResponse = async (url: string, headers?: Record<string, string>): Promise<AxiosResponse> => {
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
      const sensitiveHeaders = ['x-forwarded-for', 'x-internal-api-key', 'x-real-ip', 'authorization', 'cookie']
      const exposedSensitiveHeaders = sensitiveHeaders.filter((h) => storedHeaderKeys.includes(h))

      assert.deepEqual(
        exposedSensitiveHeaders,
        [],
        `Sensitive headers should not be stored in session cookie, but found: ${exposedSensitiveHeaders.join(', ')}`
      )
    })
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
  })
})
