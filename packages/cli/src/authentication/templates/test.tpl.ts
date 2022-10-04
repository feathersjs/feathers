import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'

const template = ({
  authStrategies,
  path,
  lib
}: AuthenticationGeneratorContext) => /* ts */ `import assert from 'assert';
import { app } from '../${lib}/app';

describe('authentication', () => {
  ${
    authStrategies.includes('local')
      ? `
  const userInfo = {
    email: 'someone@example.com',
    password: 'supersecret'
  }

  before(async () => {
    try {
      await app.service('${path}').create(userInfo)
    } catch (error) {
      // Do nothing, it just means the user already exists and can be tested
    }
  });

  it('authenticates user and creates accessToken', async () => {
    const { user, accessToken } = await app.service('authentication').create({
      strategy: 'local',
      ...userInfo
    }, {})
    
    assert.ok(accessToken, 'Created access token for user')
    assert.ok(user, 'Includes user in authentication data')
  })`
      : ''
  }

  it('registered the authentication service', () => {
    assert.ok(app.service('authentication'))
  })
})
`

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile<AuthenticationGeneratorContext>(({ test }) => test, 'authentication.test')
    )
  )
