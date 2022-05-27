import { strict as assert } from 'assert'
import { getDefaultSettings } from '../src/utils'
import { app } from './fixture'

describe('@feathersjs/authentication-oauth/utils', () => {
  it('getDefaultSettings', () => {
    const settings = getDefaultSettings(app)

    assert.equal(settings.authService, undefined)
    assert.equal(settings.linkStrategy, 'jwt')
  })
})
