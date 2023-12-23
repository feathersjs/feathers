import axios from 'axios'
import { Server } from 'http'
import { feathers, Application as FeathersApplication } from '@feathersjs/feathers'
import * as express from '@feathersjs/express'
import rest from '@feathersjs/rest-client'

import authClient from '../../src/index'
import getApp from './fixture'
import commonTests from './commons'

describe('@feathersjs/authentication-client Express integration', () => {
  let app: express.Application
  let server: Server

  before(async () => {
    const restApp = express
      .default(feathers())
      .use(express.json())
      .configure(express.rest())
      .use(express.parseAuthentication())
    app = getApp(restApp as unknown as FeathersApplication) as express.Application
    app.use(express.errorHandler())

    server = await app.listen(9776)
  })

  after((done) => server.close(() => done()))

  commonTests(
    () => app,
    () => {
      return feathers().configure(rest('http://localhost:9776').axios(axios)).configure(authClient())
    },
    {
      email: 'expressauth@feathersjs.com',
      password: 'secret',
      provider: 'rest'
    }
  )
})
