import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const tsKoaApp = ({
  transports
}: AppGeneratorContext) => /* ts */ `import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import {
  koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic
} from '@feathersjs/koa'
${transports.includes('websockets') ? "import socketio from '@feathersjs/socketio'" : ''}

import type { Application } from './declarations'
import { configurationValidator } from './schemas/configuration'
import { logErrorHook } from './logger'
import { services } from './services/index'
import { channels } from './channels'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
${
  transports.includes('websockets')
    ? `app.configure(socketio({
  cors: {
    origin: app.get('origins')
  }
}))`
    : ''
}
app.configure(services)
app.configure(channels)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [ logErrorHook ]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
`

const tsExpressApp = ({
  transports
}: AppGeneratorContext) => /* ts */ `import { feathers } from '@feathersjs/feathers'
import express, {
  rest, json, urlencoded, cors, compression,
  serveStatic, notFound, errorHandler
} from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
${transports.includes('websockets') ? "import socketio from '@feathersjs/socketio'" : ''}

import type { Application } from './declarations'
import { configurationValidator } from './schemas/configuration'
import { logger, logErrorHook } from './logger'
import { services } from './services/index'
import { channels } from './channels'

const app: Application = express(feathers())

// Load app configuration
app.configure(configuration(configurationValidator))
app.use(cors())
app.use(compression())
app.use(json())
app.use(urlencoded({ extended: true }))
// Host the public folder
app.use('/', serveStatic(app.get('public')))

// Configure services and real-time functionality
app.configure(rest())
${
  transports.includes('websockets')
    ? `app.configure(socketio({
  cors: {
    origin: app.get('origins')
  }
}))`
    : ''
}
app.configure(services)
app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(notFound())
app.use(errorHandler({ logger }))

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [ logErrorHook ]
  },
  before: {},
  after: {},
  error: {}
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: []
})

export { app }
`

const template = (ctx: AppGeneratorContext) =>
  ctx.framework === 'express' ? tsExpressApp(ctx) : tsKoaApp(ctx)

export const generate = (ctx: AppGeneratorContext) =>
  generator(ctx).then(
    renderSource(
      template,
      toFile<AppGeneratorContext>(({ lib }) => lib, 'app')
    )
  )
