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

Bun.serve({
  port: 3030,
  fetch: handler
})
