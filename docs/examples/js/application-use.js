import { feathers, Id } from '@feathersjs/feathers'

class MessageService {
  async get(id) {
    return {
      id,
      text: `This it the ${id} message!`
    }
  }
}

const app = feathers()

// Register a service instance on the app
app.use('messages', new MessageService())

// Get the service and call the service method with the correct types
const message = await app.service('messages').get('test')
