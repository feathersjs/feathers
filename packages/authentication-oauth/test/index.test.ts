import { strict as assert } from 'assert'
import { feathers } from '@feathersjs/feathers'
import { oauth, OauthSetupSettings } from '../src'
import { AuthenticationService } from '@feathersjs/authentication'

describe('@feathersjs/authentication-oauth', () => {
  describe('setup', () => {
    it('errors when service does not exist', () => {
      const app = feathers()

      assert.throws(
        () => {
          app.configure(oauth({ authService: 'something' } as OauthSetupSettings))
        },
        {
          message: 'An authentication service must exist before registering @feathersjs/authentication-oauth'
        }
      )
    })

    it('does not error when service is configured', () => {
      const app = feathers()

      app.use('/authentication', new AuthenticationService(app))

      app.configure(oauth())
    })
  })
})
