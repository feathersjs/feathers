import { EventEmitter } from 'events'
import { feathers, Id } from '@feathersjs/feathers'

// Feathers services will always be event emitters
// but we can also extend it for better type consistency
class MessageService extends EventEmitter {
  async doSomething(data, params) {
    this.emit('something', 'I did something')
    return data
  }

  async get(id) {
    return {
      id,
      text: `This is the ${id} message!`
    }
  }
}

const app = feathers()

// Register a service with options
app.use('messages', new MessageService(), {
  methods: ['get', 'doSomething'],
  events: ['something']
})
