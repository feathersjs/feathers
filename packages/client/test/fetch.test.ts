/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import fetch from 'node-fetch'
import { Server } from 'http'
import { clientTests } from '@feathersjs/tests'

import * as feathers from '../dist/feathers'
import app from './fixture'

describe('fetch REST connector', function () {
  let server: Server
  const rest = feathers.rest('http://localhost:8889')
  const client = feathers.default().configure(rest.fetch(fetch))

  before(async () => {
    server = await app().listen(8889)
  })

  after(function (done) {
    server.close(done)
  })

  clientTests(client, 'todos')
})
