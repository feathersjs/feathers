import { createServer } from 'node:http'
import { feathers } from 'feathers'
import { createHandler, toNodeHandler } from 'feathers/http'

class MessageService {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
}

const app = feathers<{ messages: MessageService }>()

app.use('messages', new MessageService())

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030)
