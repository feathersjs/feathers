import { feathers } from '@feathersjs/feathers'
import { koa, rest, bodyParser, errorHandler } from '@feathersjs/koa'
import serveStatic from 'koa-static'
import socketio from '@feathersjs/socketio'

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  constructor() {
    this.messages = []
  }

  async find() {
    // Just return all our messages
    return this.messages
  }

  async create(data) {
    // The new message is the data text with a unique identifier added
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message)

    return message
  }
}

// Creates an ExpressJS compatible Feathers application
const app = koa(feathers())

// Use the current folder for static file hosting
app.use(serveStatic('.'))
// Register the error handle
app.use(errorHandler())
// Parse JSON request bodies
app.use(bodyParser())

// Register REST service handler
app.configure(rest())
// Configure Socket.io real-time APIs
app.configure(socketio())
// Register our messages service
app.use('messages', new MessageService())

// Add any new real-time connection to the `everybody` channel
app.on('connection', (connection) => app.channel('everybody').join(connection))
// Publish all events to the `everybody` channel
app.publish((_data) => app.channel('everybody'))

// Start the server
app
  .listen(3030)
  .then(() => console.log('Feathers server listening on localhost:3030'))

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server'
})
