# Quick start

Now that we are [ready to roll](./setup.md) we can create our first Feathers application. In this quick start guide we'll create our first Feathers REST and real-time API server and a simple website to use it from scratch. It will show how easy it is to get started with Feathers even without a generator or boilerplate.

Let's create a new folder for our application:

```sh
mkdir feathers-basics
cd feathers-basics
```

Since any Feathers application is a Node application, we can create a default [package.json](https://docs.npmjs.com/files/package.json) using `npm`:

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
```sh
npm init --yes
```
:::
::: tab "TypeScript"

```sh
# Install TypeScript and its NodeJS wrapper globally
npm i typescript ts-node -g

npm init --yes
# Also initialize a TS configuration file that uses modern JavaScript
tsc --init --target es2018
```
:::
::::

## Installing Feathers

Feathers can be installed like any other Node module by installing the [@feathersjs/feathers](https://www.npmjs.com/package/@feathersjs/feathers) package through [npm](https://www.npmjs.com). The same package can also be used with a module loader like Webpack or Browserify and in React Native.

```sh
npm install @feathersjs/feathers --save
```

> __Note:__ All Feathers core modules are in the `@feathersjs` namespace.

## Our first app

Now we can create a Feathers application with a simple messages service that allows to create new messages and find all existing ones.

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
Create a file called `app.js` with the following content:

```js
const feathers = require('@feathersjs/feathers');
const app = feathers();

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  constructor() {
    this.messages = [];
  }

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data) {
    // The new message is the data merged with a unique identifier
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

// Register the message service on the Feathers application
app.use('messages', new MessageService());

// Log every time a new message has been created
app.service('messages').on('created', message => {
  console.log('A new message has been created', message);
});

// A function that creates new messages and then logs
// all existing messages
const main = async () => {
  // Create a new message on our message service
  await app.service('messages').create({
    text: 'Hello Feathers'
  });

  await app.service('messages').create({
    text: 'Hello again'
  });

  // Find all existing messages
  const messages = await app.service('messages').find();

  console.log('All messages', messages);
};

main();
```
:::
::: tab "TypeScript"
Create a file called `app.ts` with the following content:

```ts
import feathers from '@feathersjs/feathers';

// This is the interface for the message data
interface Message {
  id?: number;
  text: string;
}

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  messages: Message[] = [];

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data: Pick<Message, 'text'>) {
    // The new message is the data text with a unique identifier added
    // using the messages length since it changes whenever we add one
    const message: Message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

const app = feathers();

// Register the message service on the Feathers application
app.use('messages', new MessageService());

// Log every time a new message has been created
app.service('messages').on('created', (message: Message) => {
  console.log('A new message has been created', message);
});

// A function that creates messages and then logs
// all existing messages on the service
const main = async () => {
  // Create a new message on our message service
  await app.service('messages').create({
    text: 'Hello Feathers'
  });

  // And another one
  await app.service('messages').create({
    text: 'Hello again'
  });
  
  // Find all existing messages
  const messages = await app.service('messages').find();

  console.log('All messages', messages);
};

main();
```
:::
::::

We can run it with

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
```sh
node app.js
```
:::
::: tab "TypeScript"
```sh
ts-node app.ts
```
:::
::::

And should see

```sh
A new message has been created { id: 0, text: 'Hello Feathers' }
A new message has been created { id: 1, text: 'Hello again' }
All messages [ { id: 0, text: 'Hello Feathers' },
  { id: 1, text: 'Hello again' } ]
```

Here we implemented only `find` and `create` but a service can also have a few other methods, specifically `get`, `update`, `patch` and `remove`. We will learn more about service methods and events throughout this guide but this sums up some of the most important concepts that Feathers is built on.

## An API server

Ok, so we created a Feathers application and a service and we are listening to events but it is only a simple NodeJS script that prints some output and then exits. What we really want is hosting it as an API webserver. This is where Feathers transports come in. A transport takes a service like the one we created above and turns it into a server that other clients (like a web- or mobile application) can talk to.

In the following example we will take our existing service and use

- `@feathersjs/express` which uses Express to automatically turn our services into a REST API
- `@feathersjs/socketio` which uses Socket.io to do the same as a websocket real-time API (as we will see in a bit this is where the `created` event we saw above comes in handy)

```sh
npm install @feathersjs/socketio @feathersjs/express --save
```

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"

Update `app.js` with the following content:

```js
const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  constructor() {
    this.messages = [];
  }

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data) {
    // The new message is the data merged with a unique identifier
    // using the messages length since it changes whenever we add one
    const message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register an in-memory messages service
app.use('/messages', new MessageService());
// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server'
});
```
:::
::: tab "TypeScript"

Update `app.ts` with the following content:

```js
import feathers from '@feathersjs/feathers';
import '@feathersjs/transport-commons';
import express from '@feathersjs/express';
import socketio from '@feathersjs/socketio';

// This is the interface for the message data
interface Message {
  id: number;
  text: string;
}

// A messages service that allows to create new
// and return all existing messages
class MessageService {
  messages: Message[] = [];

  async find () {
    // Just return all our messages
    return this.messages;
  }

  async create (data: Pick<Message, 'text'>) {
    // The new message is the data text with a unique identifier added
    // using the messages length since it changes whenever we add one
    const message: Message = {
      id: this.messages.length,
      text: data.text
    }

    // Add new message to the list
    this.messages.push(message);

    return message;
  }
}

// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

// Express middleware to parse HTTP JSON bodies
app.use(express.json());
// Express middleware to parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Express middleware to to host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());
// Register our messages service
app.use('/messages', new MessageService());
// Express middleware with a nicer error handler
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

// For good measure let's create a message
// So our API doesn't look so empty
app.service('messages').create({
  text: 'Hello world from the server'
});
```
:::
::::

Now you can run the server via

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
```sh
node app.js
```
:::
::: tab "TypeScript"
```sh
ts-node app.ts
```
:::
::::

> __Note:__ The server will stay running until you stop it by pressing Control + C in the terminal.

And visit [localhost:3030/messages](http://localhost:3030/messages) to see an array with the one message we created on the server.

> __Pro Tip:__ The built-in [JSON viewer in Firefox](https://developer.mozilla.org/en-US/docs/Tools/JSON_viewer) or a browser plugin like [JSON viewer for Chrome](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) makes it nicer to view JSON responses in the browser.

This is the basic setup of a Feathers API server. The `app.use` calls probably look familiar if you have used Express before. The `app.configure` calls set up the Feathers transport to host the API. `app.on('connection')` and `app.publish` are used to set up event channels which send real-time events to the proper clients (everybody that is connected to our server in this case). You can learn more about channels after finishing this guide in the [channels API](../../api/channels.md).

## In the browser

Now we can look at one of the really cool features of Feathers. It works the same way in a web browser! This means that we could take [our first app example](#our-first-app) from above and run it just the same as a website. Since we already have a server running however, let's go a step further and create a Feathers app that talks to our messages service on the server using a real-time Socket.io connection. In the same folder, add the following `index.html` page:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Feathers Example</title>
  <link rel="stylesheet" href="//unpkg.com/feathers-chat@4.0.0/public/base.css">
  <link rel="stylesheet" href="//unpkg.com/feathers-chat@4.0.0/public/chat.css">
</head>
<body>
  <main id="main" class="container">
    <h1>Welcome to Feathers</h1>
    <form class="form" onsubmit="sendMessage(event.preventDefault())">
      <input type="text" id="message-text" placeholder="Enter message here">
      <button type="submit" class="button button-primary">Send message</button>
    </form>

    <h2>Here are the current messages:</h2>
  </main>

  <script src="//unpkg.com/@feathersjs/client@^4.3.0/dist/feathers.js"></script>
  <script src="//cdnjs.cloudflare.com/ajax/libs/socket.io/2.0.4/socket.io.js"></script>
  <script type="text/javascript">
    // Set up socket.io
    const socket = io('http://localhost:3030');
    // Initialize a Feathers app
    const app = feathers();
    
    // Register socket.io to talk to our server
    app.configure(feathers.socketio(socket));

    // Form submission handler that sends a new message
    async function sendMessage () {
      const messageInput = document.getElementById('message-text');

      // Create a new message with the input field value
      await app.service('messages').create({
        text: messageInput.value
      });

      messageInput.value = '';
    }

    // Renders a single message on the page
    function addMessage (message) {
      document.getElementById('main').innerHTML += `<p>${message.text}</p>`;
    }
    
    const main = async () => {
      // Find all existing messages
      const messages = await app.service('messages').find();

      // Add existing messages to the list
      messages.forEach(addMessage);

      // Add any newly created message to the list in real-time
      app.service('messages').on('created', addMessage);
    };

    main();
  </script>
</body>
</html>
```

If you now go to [localhost:3030](http://localhost:3030) you will see a simple website that allows to create new messages. It is possible to open the page in two tabs and see new messages show up on either side in real-time. You can verify that the messages got created by visiting [localhost:3030/messages](http://localhost:3030/messages).

## What's next?

In this chapter we created our first Feathers application and a service that allows to create new messages, store them in-memory and return all messages. We then hosted that service as a REST and real-time API server and used Feathers in the browser to connect to that server and create a website that can send new messages, show all existing messages and update with new messages in real-time.

Even though we are using just NodeJS and Feathers from scratch without any additional tools, it was not a lot of code for what we are getting. In the [next chapter](./generator.md) we will look at the Feathers CLI which can create a similar Feathers application with a recommended file structure and things like authentication and database connections set up for us automatically.
