import { AuthenticationService } from '@feathersjs/authentication'
import { feathers } from '@feathersjs/feathers/lib'
import { strict as assert } from 'assert'
import { getGrantConfig } from '../src/utils'

describe('@feathersjs/authentication-oauth/utils', () => {
  it('getGrantConfig initialises Grant defaults', () => {
    const app = feathers<{ authentication: AuthenticationService }>()
    const auth = new AuthenticationService(app)

    app.set('host', '127.0.0.1')
    app.set('port', '8877')
    app.set('authentication', {
      secret: 'supersecret',
      entity: 'user',
      service: 'users',
      authStrategies: ['jwt'],
      oauth: {
        github: {
          key: 'some-key',
          secret: 'a secret secret',
          authorize_url: '/github/authorize_url',
          access_url: '/github/access_url',
          dynamic: true
        }
      }
    })
    const { defaults } = getGrantConfig(auth)

    assert.deepStrictEqual(defaults, {
      prefix: '/oauth',
      origin: 'http://127.0.0.1:8877',
      transport: 'state',
      response: ['tokens', 'raw', 'profile']
    })
  })

  it('getGrantConfig uses Grant defaults when set', () => {
    const app = feathers<{ authentication: AuthenticationService }>()
    const auth = new AuthenticationService(app)

    app.set('host', '127.0.0.1')
    app.set('port', '8877')
    app.set('authentication', {
      secret: 'supersecret',
      entity: 'user',
      service: 'users',
      authStrategies: ['jwt'],
      oauth: {
        defaults: {
          prefix: '/auth',
          origin: 'https://localhost:3344'
        },
        github: {
          key: 'some-key',
          secret: 'a secret secret',
          authorize_url: '/github/authorize_url',
          access_url: '/github/access_url',
          dynamic: true
        }
      }
    })
    const { defaults, github } = getGrantConfig(auth)

    assert.deepStrictEqual(defaults, {
      prefix: '/auth',
      origin: 'https://localhost:3344',
      transport: 'state',
      response: ['tokens', 'raw', 'profile']
    })
    assert.strictEqual(github?.redirect_uri, 'https://localhost:3344/auth/github/callback')
  })
})
