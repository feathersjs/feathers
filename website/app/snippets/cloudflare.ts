import { feathers } from 'feathers'
import { createHandler } from 'feathers/http'

class MessageService {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
}

const app = feathers<{ messages: MessageService }>()

app.use('messages', new MessageService())

const handler = createHandler(app)

export default {
  fetch: handler
}
