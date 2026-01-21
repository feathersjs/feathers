

# Quick start

Alright then! Let's learn Feathers. In this quick start guide we'll create our first Feathers app, an API server and a simple website to use it. You'll see how easy it is to get started with Feathers in just a single file without additional boilerplate or tooling. If you want to jump right into creating a complete application you can go to the [Creating An App](./generator) chapter.

<img style="margin: 2em;" src="/img/main-character-bench.svg" alt="Getting started">

Feathers works with all [currently active NodeJS releases](https://github.com/nodejs/Release#release-schedule). All guides are assuming the languages features from the most current stable NodeJS release which you can get from the [NodeJS website](https://nodejs.org/en/).

::tip
You can follow this guide on your own computer in the terminal or try the steps out live without installing anything in the [Feathers Quick Start on Stackblitz](https://stackblitz.com/@daffl/collections/feathers-quick-start).
::

After successful installation, the `node` and `npm` commands should be available on the terminal:

```
node --version
```

```
npm --version
```

::warning[Important]
Running NodeJS and npm should not require admin or root privileges.
::

Let's create a new folder for our application:

```sh
mkdir feathers-basics
cd feathers-basics
```

Since any Feathers application is a Node application, we can create a default [package.json](https://docs.npmjs.com/files/package.json) using `npm`:

```sh
npm init --yes
# Install TypeScript and its NodeJS wrapper
npm i typescript ts-node @types/node --save-dev
# Also initialize a TS configuration file that uses modern JavaScript
npx tsc --init --target es2020
```

## Installing Feathers

Feathers can be installed like any other Node module by installing the [@feathersjs/feathers](https://www.npmjs.com/package/@feathersjs/feathers) package through [npm](https://www.npmjs.com). The same package can also be used with module loaders like Vite, Webpack, and in React Native.

```sh
npm install @feathersjs/feathers --save
```

::note[note]
All Feathers core modules are in the `@feathersjs` namespace.
::

## Our first app

Now we can create a Feathers application with a simple `messages` service that allows us to create new messages and find all existing ones.

Create a file called `app.ts` with the following content:

```ts
import { feathers } from '@feathersjs/feathers'

// This is the interface for the message data
interface Message {
  id?: number
  text: string
}

// A messages service that allows us to create new
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
```

We can run it with

```sh
npx ts-node app.ts
```

[Try it out live >](https://stackblitz.com/edit/node-mupbmh?embed=1&file=app.ts&view=editor)

We will see something like this in the terminal:

```sh
A new message has been created { id: 0, text: 'Hello Feathers' }
A new message has been created { id: 1, text: 'Hello again' }
All messages [ { id: 0, text: 'Hello Feathers' },
  { id: 1, text: 'Hello again' } ]
```

Here we implemented only `find` and `create`, but a service can also have a few other methods, specifically `get`, `update`, `patch` and `remove`. We will learn more about service methods and events throughout this guide, but this sums up some of the most important concepts upon which Feathers is built.

## An API Server

So far we've created a Feathers application, a message service, and are listening to events. However, this is only a simple NodeJS script that prints some output and then exits. What we really want is to host it as an API server. This is where Feathers transports come in.

A transport takes a service like the one we created above and turns it into a server that other clients can talk to, like a website or mobile application.

In the following example we will take our existing service and use:

- `@feathersjs/koa` which uses [KoaJS](https://koajs.com/) to automatically turn our services into a REST API
- `@feathersjs/socketio` which uses Socket.io to do the same as a WebSocket, real-time API (as we will see in a bit this is where the `created` event we saw above comes in handy).

Run:

```sh
npm install @feathersjs/socketio @feathersjs/koa --save
```

Then update `app.ts` with the following content:

```ts{2-4,42-55,58-65}
import { feathers } from '@feathersjs/feathers'
import { koa, rest, bodyParser, errorHandler, serveStatic } from '@feathersjs/koa'
import socketio from '@feathersjs/socketio'

// This is the interface for the message data
interface Message {
  id?: number
  text: string
}

// A messages service that allows us to create new
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

// Creates an KoaJS compatible Feathers application
const app = koa<ServiceTypes>(feathers())

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
```

[Try it out live >](https://stackblitz.com/edit/node-zfinli?embed=1&file=app.ts)

We can start the server with

```sh
npx ts-node app.ts
```

::note
The server will stay running until you stop it by pressing **Control + C** in the terminal.
::

And in the browser visit

```
http://localhost:3030/messages
```

to see an array with the one message we created on the server.

::note
The built-in [JSON viewer in Firefox](https://developer.mozilla.org/en-US/docs/Tools/JSON_viewer) or a browser plugin like [JSON viewer for Chrome](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) makes it nicer to view JSON responses in the browser.
::

This is the basic setup of a Feathers API server.

- The `app.use` calls probably look familiar if you have used something like Koa or Express before.
- `app.configure` calls set up the Feathers transport to host the API.
- `app.on('connection')` and `app.publish` are used to set up event channels, which send real-time events to the proper clients (everybody that is connected to our server in this case). You can learn [more about the channels API](../../api/channels) after finishing this guide.

## In the browser

Now we can look at one of the really cool features of Feathers: **It works the same in a web browser!** This means that we could take [our first app example](#our-first-app) from above and run it just the same in a website. Since we already have a server running, however, let's go a step further and create a Feathers app that talks to our `messages` service on the server using a real-time Socket.io connection.

In the same folder, add the following `index.html` page:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Feathers Example</title>
    <link href="https://cdn.jsdelivr.net/npm/daisyui@2.46.1/dist/full.css" rel="stylesheet" type="text/css" />
    <link
      href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2/dist/tailwind.min.css"
      rel="stylesheet"
      type="text/css"
    />
    <link rel="stylesheet" href="https://feathersjs.com/feathers-chat.css" />
  </head>
  <body data-theme="dracula">
    <main id="main" class="p-8">
      <h1 class="font-medium leading-tight text-5xl mt-0 mb-2">Welcome to Feathers</h1>

      <div class="form-control w-full py-2">
        <form class="input-group overflow-hidden" onsubmit="sendMessage(event)">
          <input name="message" id="message-text" type="text" class="input input-bordered w-full" />
          <button type="submit" class="btn">Send</button>
        </form>
      </div>
      <h2 class="pt-1 pb-2 text-lg">Messages</h2>
    </main>

    <script src="//unpkg.com/@feathersjs/client@^5.0.0/dist/feathers.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script type="text/javascript">
      // Set up socket.io
      const socket = io('http://localhost:3030')
      // Initialize a Feathers app
      const app = feathers()

      // Register socket.io to talk to our server
      app.configure(feathers.socketio(socket))

      // Form submission handler that sends a new message
      async function sendMessage(event) {
        const messageInput = document.getElementById('message-text')

        event.preventDefault()

        // Create a new message with the input field value
        await app.service('messages').create({
          text: messageInput.value
        })

        messageInput.value = ''
      }

      // Renders a single message on the page
      function addMessage(message) {
        document.getElementById('main').innerHTML += `<div class="chat chat-start">
          <div class="chat-bubble">${message.text}</div>
        </div>`
      }

      const main = async () => {
        // Find all existing messages
        const messages = await app.service('messages').find()

        // Add existing messages to the list
        messages.forEach(addMessage)

        // Add any newly created message to the list in real-time
        app.service('messages').on('created', addMessage)
      }

      main()
    </script>
  </body>
</html>
```

[Try it out live >](https://stackblitz.com/edit/node-m7cjfd?embed=1&file=index.html)

Now in the browser if you go to

```
http://localhost:3030
```

you will see a simple website that allows creating new messages. It is possible to open the page in two tabs and see new messages show up on either side in real-time. You can verify that the messages got created by visiting

```
http://localhost:3030/messages
```

You'll see the JSON response including all current messages.

## What's next?

In this chapter we created our first Feathers application and a service that allows creating new messages, storing them in memory, and retrieving them. We then hosted that service as a REST and real-time API server and used Feathers in the browser to connect to that server and create a website that can send new messages and show all existing messages in real-time.

Even though we are using just NodeJS and Feathers from scratch without any additional tools, we didn't write a lot of code. In the [next chapter](./generator) we will look at the Feathers CLI which can create a similar Feathers application with a recommended file structure, models, database connections, authentication and more.
