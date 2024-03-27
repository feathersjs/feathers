import superagent from 'superagent'
import { clientTests } from '@feathersjs/tests-vitest'
import { Server } from 'http'
import getPort from 'get-port'

import * as feathers from '../dist/feathers'
import app from './fixture'

describe('Superagent REST connector', async function () {
  let server: Server
  const port = await getPort()
  const rest = feathers.rest(`http://localhost:${port}`)
  const client = feathers.default().configure(rest.superagent(superagent))

  beforeAll(async () => {
    server = await app().listen(port)
  })

  afterAll(
    () =>
      new Promise<void>((resolve) => {
        server.close(() => resolve())
      })
  )

  clientTests(client, 'todos')
})
