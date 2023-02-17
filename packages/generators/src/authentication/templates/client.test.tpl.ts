import { generator, toFile, when } from '@feathershq/pinion'
import { fileExists, renderSource } from '../../commons'
import { AuthenticationGeneratorContext } from '../index'
import { localTemplate } from '../../commons'

const template = ({
  authStrategies,
  upperName,
  type,
  lib
}: AuthenticationGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/client.test.html
import assert from 'assert'
import axios from 'axios'

import rest from '@feathersjs/rest-client'
${localTemplate(authStrategies, `import authenticationClient from '@feathersjs/authentication-client'`)}
import { app } from '../${lib}/app'
import { createClient } from '../${lib}/client' 
${localTemplate(authStrategies, `import type { ${upperName}Data } from '../${lib}/client'`)}

const port = app.get('port')
const appUrl = \`http://\${app.get('host')}:\${port}\`

describe('application client tests', () => {
  const client = createClient(rest(appUrl).axios(axios))

  before(async () => {
    await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it('initialized the client', () => {
    assert.ok(client)
  })

  ${localTemplate(
    authStrategies,
    `
  it('creates and authenticates a user with email and password', async () => {
    const userData: ${upperName}Data = {
      email: 'someone@example.com',
      password: 'supersecret'
    }

    await client.service('users').create(userData)
    
    const { user, accessToken } = await client.authenticate({
      strategy: 'local',
      ...userData
    })
    
    assert.ok(accessToken, 'Created access token for user')
    assert.ok(user, 'Includes user in authentication data')
    assert.strictEqual(user.password, undefined, 'Password is hidden to clients')

    await client.logout()

    // Remove the test user on the server
    await app.service('users').remove(user.${type === 'mongodb' ? '_id' : 'id'})
  })`
  )}
})
`

export const generate = (ctx: AuthenticationGeneratorContext) =>
  generator(ctx).then(
    when<AuthenticationGeneratorContext>(
      ({ lib, language }) => fileExists(lib, `client.${language}`),
      renderSource(
        template,
        toFile<AuthenticationGeneratorContext>(({ test }) => test, 'client.test'),
        { force: true }
      )
    )
  )
