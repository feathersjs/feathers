import { AuthenticationService } from '@feathersjs/authentication/lib'
import { feathers } from '@feathersjs/feathers/lib'
import { strict as assert } from 'assert'
import { filterDynamic, getGrantConfig } from '../src/utils'

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

  it('filterDynamic removes protected options only for dynamic: true', () => {
    const data = {
      access_url: 'https://evil.example.com/token',
      profile_url: 'https://evil.example.com/me',
      subdomain: 'evil.example.com',
      key: 'attacker-client',
      state: 'false',
      scope: 'user'
    }

    assert.deepEqual(filterDynamic({ dynamic: true }, data), { scope: 'user' })
    assert.deepEqual(filterDynamic({ dynamic: ['subdomain'] }, data), data)
    assert.deepEqual(filterDynamic(null, data), data)
    assert.deepEqual(
      filterDynamic(
        { dynamic: true },
        {
          custom_params: {
            redirect_uri: 'https://evil.example.com/cb',
            client_id: 'attacker',
            response_type: 'token',
            state: 'forged',
            prompt: 'consent',
            login_hint: 'jon@example.com'
          }
        }
      ),
      { custom_params: { prompt: 'consent', login_hint: 'jon@example.com' } }
    )
  })
})
