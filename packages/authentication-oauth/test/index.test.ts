import { strict as assert } from 'assert'
import { feathers } from '@feathersjs/feathers'
import { setup, express, OauthSetupSettings } from '../src'
import { AuthenticationService } from '@feathersjs/authentication'

describe('@feathersjs/authentication-oauth', () => {
  describe('setup', () => {
    it('errors when service does not exist', () => {
      const app = feathers()

      try {
        app.configure(setup({ authService: 'something' } as OauthSetupSettings))
        assert.fail('Should never get here')
      } catch (error: any) {
        assert.equal(
          error.message,
          'An authentication service must exist before registering @feathersjs/authentication-oauth'
        )
      }
    })

    it('errors when service does not exist', () => {
      const app = feathers()

      app.use('/authentication', new AuthenticationService(app))

      app.configure(express())
    })
  })
})
