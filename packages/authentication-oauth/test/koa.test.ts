import { strict as assert } from 'assert'
import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { koaFixture } from './utils/fixture'

describe('@feathersjs/authentication-oauth with Koa', () => {
  const port = 9785
  const host = `http://localhost:${port}`
  const req = axios.create({
    maxRedirects: 0,
    validateStatus: () => true
  })
  let app: Awaited<ReturnType<typeof koaFixture>>

  // Start the oAuth flow and return the grant session cookie and the provider location
  const startFlow = async () => {
    const cookie = new CookieJar()
    const response = await req.get(`${host}/oauth/github`)

    assert.equal(response.status, 303)
    response.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

    return { cookie: await cookie.getCookieString(host), location: response.data.location }
  }

  before(async () => {
    app = await koaFixture(port, 5123)
    await app.service('users').create({ email: 'admin@example.com' })
  })

  after(async () => {
    await app.teardown()
  })

  it('runs through the oAuth flow', async () => {
    const { cookie, location } = await startFlow()
    const provider = await req.get(location)
    const { data } = await req.get(provider.headers.location, { headers: { cookie } })

    assert.ok(data.accessToken)
    assert.equal(data.user.githubId, 'test')
  })

  it('rejects a GET callback without an authorization code', async () => {
    const { cookie } = await startFlow()
    const response = await req.get(`${host}/oauth/github/callback?code=&state=`, { headers: { cookie } })

    assert.equal(response.status, 401)
    assert.equal(response.data.message, 'Missing oAuth authorization code.')
    assert.ok(!response.data.accessToken)
  })

  it('accepts a POST callback with the code in the body and rejects one without', async () => {
    const valid = await req.post(
      `${host}/oauth/github/callback`,
      { code: 'code' },
      { headers: { cookie: (await startFlow()).cookie } }
    )
    const empty = await req.post(
      `${host}/oauth/github/callback`,
      { user: { id: 'victim' } },
      { headers: { cookie: (await startFlow()).cookie } }
    )

    assert.ok(valid.data.accessToken)
    assert.equal(empty.status, 401)
    assert.equal(empty.data.message, 'Missing oAuth authorization code.')
  })
})
