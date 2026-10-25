import { strict as assert } from 'assert'
import axios from 'axios'
import { CookieJar } from 'tough-cookie'
import { expressFixture } from './utils/fixture'

describe('@feathersjs/authentication-oauth account linking', () => {
  const port = 9786
  const host = `http://localhost:${port}`
  const message = 'Account linking must be started from an allowed origin.'
  const req = axios.create({
    maxRedirects: 0,
    validateStatus: () => true
  })
  let app: Awaited<ReturnType<typeof expressFixture>>

  const createUser = async (email: string) => {
    const user = await app.service('users').create({ email })
    const token = await app.service('authentication').createAccessToken({}, { subject: `${user.id}` })

    return { user, token }
  }

  const linkFlow = async (token: string | undefined, headers: Record<string, string> = {}) => {
    const query = token ? `?feathers_token=${token}` : ''
    const response = await req.get(`${host}/oauth/gitlab${query}`, { headers })

    if (response.status !== 303) {
      return response
    }

    const cookie = new CookieJar()
    response.headers['set-cookie']?.forEach((value) => cookie.setCookie(value, host))

    const provider = await req.get(response.data.location)

    return req.get(provider.headers.location, { headers: { cookie: await cookie.getCookieString(host) } })
  }

  before(async () => {
    app = await expressFixture(port, 5124)
  })

  after(async () => {
    await app.teardown()
  })

  afterEach(async () => {
    const users = (await app.service('users').find({ paginate: false })) as any[]

    for (const user of users) {
      await app.service('users').remove(user.id)
    }
  })

  it('rejects a feathers_token link without a referer', async () => {
    const { user: attacker, token } = await createUser('attacker@example.com')
    const response = await linkFlow(token)

    assert.equal(response.status, 401)
    assert.equal(response.data.message, message)
    assert.equal((await app.service('users').get(attacker.id)).gitlabId, undefined)
  })

  it('rejects a feathers_token link from another origin', async () => {
    const { user: attacker, token } = await createUser('attacker@example.com')
    const response = await linkFlow(token, { referer: 'https://evil.example/page' })

    assert.equal(response.status, 401)
    assert.equal(response.data.message, message)
    assert.equal((await app.service('users').get(attacker.id)).gitlabId, undefined)
  })

  it('links the account when started from the API host', async () => {
    const { user, token } = await createUser('user@example.com')
    const { data } = await linkFlow(token, { referer: `${host}/settings` })

    assert.ok(data.accessToken)
    assert.equal(data.user.id, user.id)
    assert.equal(data.user.gitlabId, 'test')
  })

  it('links the account behind a proxy that rewrites the Host header', async () => {
    const { user, token } = await createUser('user@example.com')
    const { data } = await linkFlow(token, {
      host: 'internal.example:3030',
      referer: `http://127.0.0.1:${port}/settings`
    })

    assert.ok(data.accessToken)
    assert.equal(data.user.id, user.id)
    assert.equal(data.user.gitlabId, 'test')
  })

  it('uses the configured origins', async () => {
    const oauth = app.get('authentication').oauth
    const { token } = await createUser('user@example.com')

    oauth.origins = ['http://localhost:3000']

    try {
      const allowed = await req.get(`${host}/oauth/gitlab?feathers_token=${token}`, {
        headers: { referer: 'http://localhost:3000/settings' }
      })
      const denied = await req.get(`${host}/oauth/gitlab?feathers_token=${token}`, {
        headers: { referer: 'https://evil.example/' }
      })

      assert.equal(allowed.status, 303)
      assert.equal(denied.status, 401)
    } finally {
      delete oauth.origins
    }
  })

  it('sign in without feathers_token still works without a referer', async () => {
    const { data } = await linkFlow(undefined)

    assert.ok(data.accessToken)
  })

  it('validateLink can be overridden to allow clients without a referer', async () => {
    const strategy = app.service('authentication').getStrategy('gitlab') as any
    const original = strategy.validateLink
    const { user, token } = await createUser('user@example.com')

    strategy.validateLink = async () => {}

    try {
      const { data } = await linkFlow(token)

      assert.equal(data.user.id, user.id)
      assert.equal(data.user.gitlabId, 'test')
    } finally {
      strategy.validateLink = original
    }
  })
})
