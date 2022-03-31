import assert from 'assert'
import { app } from '../../src/app'

describe('testing service', () => {
  it('registered the service', () => {
    const service = app.service('testing')

    assert.ok(service, 'Registered the service')
  })
})
