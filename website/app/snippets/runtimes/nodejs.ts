import { createServer } from 'node:http'
import { feathers } from 'feathers'
import { createHandler, toNodeHandler } from 'feathers/http'

const app = feathers()

app.use('messages', {
  async find() {
    return [{ id: 1, text: 'Hello world' }]
  }
})

const handler = createHandler(app)
const server = createServer(toNodeHandler(handler))

server.listen(3030)
