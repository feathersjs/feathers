import { feathers } from '@feathersjs/feathers'

// This is the interface for the message data
interface Message {
  id?: number
  text: string
}

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  messages: Message[] = []

  async find() {
    // Just return all our messages
    return this.messages
  }

  async create(data: Pick<Message, 'text'>) {
    // The new message is the data text with a unique identifier added
    // using the messages length since it changes whenever we add one
    const message: Message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message)

    return message
  }
}

// This tells TypeScript what services we are registering
type ServiceTypes = {
  messages: MessageService
}

const app = feathers<ServiceTypes>()

// Register the message service on the Feathers application
app.use('messages', new MessageService())

// Log every time a new message has been created
app.service('messages').on('created', (message: Message) => {
  console.log('A new message has been created', message)
})

// A function that creates messages and then logs
// all existing messages on the service
const main = async () => {
  // Create a new message on our message service
  await app.service('messages').create({
    text: 'Hello Feathers'
  })

  // And another one
  await app.service('messages').create({
    text: 'Hello again'
  })

  // Find all existing messages
  const messages = await app.service('messages').find()

  console.log('All messages', messages)
}

main()
