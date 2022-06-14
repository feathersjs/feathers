import serveStatic from 'koa-static'
import { feathers } from '@feathersjs/feathers'
import configuration from '@feathersjs/configuration'
import { koa, rest, bodyParser, errorHandler, parseAuthentication } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

import services from './services'
import channels from './channels'
import { logErrorHook } from './logger'
import { Application } from './declarations'

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration())

// Set up Koa middleware
app.use(serveStatic(app.get('public')))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(socketio())
app.configure(services)
app.configure(channels)
app.hooks([ logErrorHook ])

export { app }
