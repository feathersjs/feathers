import { feathers, Id } from '@feathersjs/feathers'

class MessageService {
  async get(id: Id) {
    return {
      id,
      text: `This it the ${id} message!`
    }
  }
}

type ServiceTypes = {
  // Add services path to type mapping here
  messages: MessageService
}

const app = feathers<ServiceTypes>()

// Register a service instance on the app
app.use('messages', new MessageService())

// Get the service and call the service method with the correct types
const message = await app.service('messages').get('test')
