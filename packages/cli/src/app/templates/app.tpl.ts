import { generator, toFile } from '@feathershq/pinion'
import { renderSource } from '../../commons'
import { AppGeneratorContext } from '../index'

const tsKoaApp = ({ transports }: AppGeneratorContext) =>
  `import serveStatic from 'koa-static'
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication } from '@feathersjs/koa'
${transports.includes('websockets') ? "import socketio from '@feathersjs/socketio'" : ''}

import { configurationSchema } from './schemas/configuration.schema'
import { logErrorHook } from './logger'
import { Application } from './declarations'
import { services } from './services'
import { channels } from './channels'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationSchema))

// Set up Koa middleware
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
${transports.includes('websockets') ? 'app.configure(socketio())' : ''}
app.configure(services)
app.configure(channels)
app.hooks([ logErrorHook ])

export { app }
`

const tsExpressApp = ({ transports }: AppGeneratorContext) =>
  `import compress from 'compression'
import helmet from 'helmet'

import { feathers } from '@feathersjs/feathers'
import * as express from '@feathersjs/express'
import configuration from '@feathersjs/configuration'
${transports.includes('websockets') ? "import socketio from '@feathersjs/socketio'" : ''}

import { configurationSchema } from './schemas/configuration.schema'
import { logger, logErrorHook } from './logger'
import { Application } from './declarations'
import { services } from './services'
import { channels } from './channels'

const app: Application = express.default(feathers())

// Load app configuration
app.configure(configuration(configurationSchema))
app.use(helmet())
app.use(compress())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
// Host the public folder
app.use('/', express.static(app.get('public')))

// Configure services and real-time functionality
app.configure(express.rest())
${transports.includes('websockets') ? 'app.configure(socketio())' : ''}
app.configure(services)
app.configure(channels)

// Configure a middleware for 404s and the error handler
app.use(express.notFound())
app.use(express.errorHandler({ logger }))
app.hooks([ logErrorHook ])

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
