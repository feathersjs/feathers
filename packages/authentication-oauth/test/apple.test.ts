import { strict as assert } from 'assert'
import crypto from 'crypto'
import http from 'http'
import { AddressInfo } from 'net'
import jsonwebtoken from 'jsonwebtoken'
import { appleKeys, getAppleProfile } from '../src/apple'

describe('@feathersjs/authentication-oauth/apple', () => {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 })
  const otherKey = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 }).privateKey
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'apple-key' }
  let server: http.Server
  let fetched = 0
  let respond = (res: http.ServerResponse) => {
    res.writeHead(200, { 'content-type': 'application/json' })
    res.end(JSON.stringify({ keys: [jwk] }))
  }

  const idToken = (claims: any, { key = privateKey, keyid = 'apple-key' } = {}) =>
    jsonwebtoken.sign(
      {
        iss: 'https://appleid.apple.com',
        aud: 'some-key',
        exp: Math.floor(Date.now() / 1000) + 600,
        ...claims
      },
      key,
      {
        algorithm: 'RS256',
        keyid
      }
    )

  before(async () => {
    server = http.createServer((_req, res) => {
      fetched++
      respond(res)
    })
    await new Promise<void>((resolve) => server.listen(0, resolve))
    appleKeys.url = `http://localhost:${(server.address() as AddressInfo).port}/auth/keys`
  })

  beforeEach(() => {
    appleKeys.keys = []
    appleKeys.fetchedAt = 0
    appleKeys.failedAt = 0
    fetched = 0
  })

  after(() => {
    appleKeys.url = 'https://appleid.apple.com/auth/keys'
    server.close()
  })

  it('takes sub and email from the id_token and keeps other profile fields', async () => {
    const profile = await getAppleProfile(
      {
        id_token: idToken({ sub: 'real', email: 'real@example.com' }),
        profile: { id: 'victim', sub: 'victim', email: 'victim@example.com', name: 'Jon' }
      },
      'some-key'
    )

    assert.deepEqual(profile, { name: 'Jon', sub: 'real', email: 'real@example.com' })
  })

  it('keeps only the name from the callback body, which Apple sends as a JSON string', async () => {
    const user = JSON.stringify({ name: { firstName: 'Jon', lastName: 'Doe' }, email: 'victim@example.com' })
    const fromString = await getAppleProfile(
      { id_token: idToken({ sub: 'real' }), profile: user },
      'some-key'
    )
    const fromObject = await getAppleProfile(
      { id_token: idToken({ sub: 'real' }), profile: { name: 'Jon', role: 'admin', email_verified: true } },
      'some-key'
    )
    const returning = await getAppleProfile(
      { id_token: idToken({ sub: 'real' }), profile: { error: 'Grant: No profile URL found!' } },
      'some-key'
    )

    assert.deepEqual(fromString, { sub: 'real', name: { firstName: 'Jon', lastName: 'Doe' } })
    assert.deepEqual(fromObject, { sub: 'real', name: 'Jon' })
    assert.deepEqual(returning, { sub: 'real' })
  })

  it('rejects id_tokens that do not verify', async () => {
    const unsigned = jsonwebtoken.sign(
      { sub: 'victim', iss: 'https://appleid.apple.com', aud: 'some-key' },
      '',
      {
        algorithm: 'none'
      }
    )
    const tokens = {
      missing: undefined as any,
      'signed with another key': idToken({ sub: 'victim' }, { key: otherKey }),
      'unknown key id': idToken({ sub: 'victim' }, { keyid: 'unknown' }),
      'unsigned (alg none)': unsigned,
      'wrong issuer': idToken({ sub: 'victim', iss: 'https://evil.example.com' }),
      'wrong audience': idToken({ sub: 'victim', aud: 'another-client' }),
      expired: idToken({ sub: 'victim', exp: Math.floor(Date.now() / 1000) - 3600 }),
      'missing subject': idToken({})
    }

    for (const [description, token] of Object.entries(tokens)) {
      await assert.rejects(
        () => getAppleProfile({ id_token: token, profile: {} }, 'some-key'),
        { message: 'Could not get oAuth profile' },
        description
      )
    }
  })

  it('rejects when no client id is configured', async () => {
    await assert.rejects(
      () => getAppleProfile({ id_token: idToken({ sub: 'x' }), profile: {} }, undefined as any),
      {
        message: 'Could not get oAuth profile'
      }
    )
  })

  it('caches the keys and refreshes them for an unknown key id at most every few minutes', async () => {
    await getAppleProfile({ id_token: idToken({ sub: 'x' }), profile: {} }, 'some-key')
    await getAppleProfile({ id_token: idToken({ sub: 'x' }), profile: {} }, 'some-key')
    assert.equal(fetched, 1)

    const unknown = { id_token: idToken({ sub: 'x' }, { keyid: 'unknown' }), profile: {} }

    await assert.rejects(() => getAppleProfile(unknown, 'some-key'))
    assert.equal(fetched, 1)

    appleKeys.fetchedAt -= 10 * 60 * 1000
    await assert.rejects(() => getAppleProfile(unknown, 'some-key'))
    assert.equal(fetched, 2)
  })

  it('keeps the previous keys when a refresh fails or returns no keys', async () => {
    const original = respond
    const token = { id_token: idToken({ sub: 'x' }), profile: {} }

    try {
      await getAppleProfile(token, 'some-key')
      appleKeys.fetchedAt -= 2 * 60 * 60 * 1000

      respond = (res) => {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end('{}')
      }
      assert.equal((await getAppleProfile(token, 'some-key')).sub, 'x')

      appleKeys.failedAt -= 60 * 1000
      respond = (res) => {
        res.writeHead(500)
        res.end('error')
      }
      assert.equal((await getAppleProfile(token, 'some-key')).sub, 'x')
      assert.equal(fetched, 3)
    } finally {
      respond = original
    }
  })

  it('fetches the keys once for concurrent sign-ins', async () => {
    await Promise.all(
      [1, 2, 3].map(() => getAppleProfile({ id_token: idToken({ sub: 'x' }), profile: {} }, 'some-key'))
    )

    assert.equal(fetched, 1)
  })

  it('does not retry a failed refresh for every sign-in', async () => {
    const original = respond
    const token = { id_token: idToken({ sub: 'x' }), profile: {} }

    try {
      respond = (res) => {
        res.writeHead(500)
        res.end('error')
      }
      await assert.rejects(() => getAppleProfile(token, 'some-key'))
      await assert.rejects(() => getAppleProfile(token, 'some-key'))
      assert.equal(fetched, 1)

      respond = original
      appleKeys.failedAt -= 60 * 1000
      assert.equal((await getAppleProfile(token, 'some-key')).sub, 'x')
      assert.equal(fetched, 2)
    } finally {
      respond = original
    }
  })
})
