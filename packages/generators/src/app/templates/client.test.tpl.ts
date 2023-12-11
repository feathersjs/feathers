import { generator, toFile, when } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const template = ({ lib }: AppGeneratorContext) => /* ts */ `import assert from 'assert'
import axios from 'axios'
import type { Server } from 'http'
import { app } from '../${lib}/app'
import { createClient } from '../${lib}/client' 

import rest from '@feathersjs/rest-client'

const port = app.get('port')
const appUrl = \`http://\${app.get('host')}:\${port}\`

describe('client tests', () => {
  const client = createClient(rest(appUrl).axios(axios))

  it('initialized the client', () => {
    assert.ok(client)
  })
})
`

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    when<AppGeneratorContext>((ctx) => ctx.client, renderSource(template, toFile('test', 'client.test')))
  )
