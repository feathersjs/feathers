import { toFile } from '@featherscloud/pinion'
import { renderSource } from '../../commons.js'
import { AppGeneratorContext } from '../index.js'

const tsKoaApp = ({
  transports,
  schema
}: AppGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import {
  koa, rest, bodyParser, errorHandler, parseAuthentication, cors, serveStatic
} from '@feathersjs/koa'
${transports.includes('websockets') ? "import socketio from '@feathersjs/socketio'" : ''}

${schema !== false ? `import { configurationValidator } from './configuration'` : ''}
import type { Application } from './declarations'
import { logError } from './hooks/log-error'
import { services } from './services/index'
${transports.includes('websockets') ? `import { channels } from './channels'` : ''}

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(${schema !== false ? 'configurationValidator' : ''}))

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
${transports.includes('websockets') ? 'app.configure(channels)' : ''}


// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [ logError ]
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
  transports,
  schema
}: AppGeneratorContext) => /* ts */ `// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from '@feathersjs/feathers'
import express, {
  rest, json, urlencoded, cors,
  serveStatic, notFound, errorHandler
} from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
${transports.includes('websockets') ? "import socketio from '@feathersjs/socketio'" : ''}

import type { Application } from './declarations'
${schema !== false ? `import { configurationValidator } from './configuration'` : ''}
import { logger } from './logger'
import { logError } from './hooks/log-error'
import { services } from './services/index'
${transports.includes('websockets') ? `import { channels } from './channels'` : ''}

const app: Application = express(feathers())

// Load app configuration
app.configure(configuration(${schema !== false ? 'configurationValidator' : ''}))
app.use(cors())
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
${transports.includes('websockets') ? 'app.configure(channels)' : ''}

// Configure a middleware for 404s and the error handler
app.use(notFound())
app.use(errorHandler({ logger }))

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [ logError ]
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
  Promise.resolve(ctx).then(
    renderSource(
      template,
      toFile<AppGeneratorContext>(({ lib }) => lib, 'app')
    )
  )
