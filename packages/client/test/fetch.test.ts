/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import fetch from 'node-fetch'
import { Server } from 'http'
import { clientTests } from '@feathersjs/tests-vitest'

import * as feathers from '../dist/feathers'
import app from './fixture'
import getPort from 'get-port'

describe('fetch REST connector', async function () {
  let server: Server
  const port = await getPort()
  const rest = feathers.rest(`http://localhost:${port}`)
  const client = feathers.default().configure(rest.fetch(fetch))

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
