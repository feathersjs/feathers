import axios from 'axios'
import { Server } from 'http'
import { feathers, Application as FeathersApplication } from '@feathersjs/feathers'
import * as express from '@feathersjs/express'
import rest from '@feathersjs/rest-client'

import authClient from '../../src'
import getApp from './fixture'
import commonTests from './commons'
import getPort from 'get-port'

describe('@feathersjs/authentication-client Express integration', async () => {
  let app: express.Application
  let server: Server
  const port = await getPort()

  beforeAll(async () => {
    const restApp = express
      .default(feathers())
      .use(express.json())
      .configure(express.rest())
      .use(express.parseAuthentication())
    app = getApp(restApp as unknown as FeathersApplication) as express.Application
    app.use(express.errorHandler())

    server = await app.listen(port)
  })

  afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())))

  commonTests(
    () => app,
    () => {
      return feathers()
        .configure(rest(`http://localhost:${port}`).axios(axios))
        .configure(authClient())
    },
    {
      email: 'expressauth@feathersjs.com',
      password: 'secret',
      provider: 'rest'
    }
  )
})
