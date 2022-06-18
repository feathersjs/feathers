import { feathers } from '@feathersjs/feathers'

const app = feathers()

class MessageService {
  async get(id) {
    return {
      id,
      text: `This it the ${id} message!`
    }
  }
}

// Register a service instance on the app
app.use('messages', new MessageService())

// Get the service and call the service method
const message = await app.service('messages').get('test')
