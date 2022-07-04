---
outline: deep
---

# Quick start

Now that we are [ready to roll](./setup.md) we can create our first Feathers application. In this quick start guide we'll create our first Feathers API server and a simple website to use it from scratch. You'll see how easy it is to get started with Feathers, even without a generator or boilerplate.

<img style="margin: 2em;" src="/img/main-character-bench.svg" alt="Getting started">

Let's create a new folder for our application:

```sh
mkdir feathers-basics
cd feathers-basics
```

Since any Feathers application is a Node application, we can create a default [package.json](https://docs.npmjs.com/files/package.json) using `npm`:



<LanguageBlock global-id="ts">

```sh
npm init --yes
# Install TypeScript and its NodeJS wrapper
npm i typescript ts-node --save-dev
# Also initialize a TS configuration file that uses modern JavaScript
npx tsc --init --target es2020
```

</LanguageBlock>

<LanguageBlock global-id="js">

```sh
npm init --yes
```

</LanguageBlock>

## Installing Feathers

Feathers can be installed like any other Node module by installing the [@feathersjs/feathers](https://www.npmjs.com/package/@feathersjs/feathers) package through [npm](https://www.npmjs.com). The same package can also be used with module loaders like Vite, Webpack, and in React Native.

```sh
npm install @feathersjs/feathers@pre --save
```

<BlockQuote label="note">

All Feathers core modules are in the `@feathersjs` namespace.

</BlockQuote>

## Our first app

Now we can create a Feathers application with a simple `messages` service that allows to create new messages and find all existing ones.

<LanguageBlock global-id="ts">

Create a file called `app.ts` with the following content:

<<< @/examples/ts/first-app.ts

We can run it with

```sh
npx ts-node app.ts
```

</LanguageBlock>
<LanguageBlock global-id="js">

Create a file called `app.mjs` with the following content:


<<< @/examples/js/first-app.js

```sh
node app.mjs
```

</LanguageBlock>

We will see something like this:

```sh
A new message has been created { id: 0, text: 'Hello Feathers' }
A new message has been created { id: 1, text: 'Hello again' }
All messages [ { id: 0, text: 'Hello Feathers' },
  { id: 1, text: 'Hello again' } ]
```

Here we implemented only `find` and `create` but a service can also have a few other methods, specifically `get`, `update`, `patch` and `remove`. We will learn more about service methods and events throughout this guide, but this sums up some of the most important concepts upon which Feathers is built.

## An API server

Ok, so we created a Feathers application and a service and we are listening to events, but it is only a simple NodeJS script that prints some output and then exits. What we really want is to host it as an API webserver. This is where Feathers transports come in. A transport takes a service like the one we created above and turns it into a server that other clients (like a web- or mobile application) can talk to.

In the following example we will take our existing service and use

- `@feathersjs/koa` which uses [KoaJS](https://koajs.com/) to automatically turn our services into a REST API
- `@feathersjs/socketio` which uses Socket.io to do the same as a WebSocket, real-time API (as we will see in a bit this is where the `created` event we saw above comes in handy).

<LanguageBlock global-id="ts">

Run

```sh
npm install @feathersjs/socketio@pre @feathersjs/koa@pre \
  koa-static @types/koa-static --save
```

Then update `app.ts` with the following content:

<<< @/examples/ts/api-server.ts{2-4,42-55,59-62,64-67}

We can start the server with

```sh
npx ts-node app.ts
```

</LanguageBlock>
<LanguageBlock  global-id="js">

Run

```sh
npm install @feathersjs/socketio@pre @feathersjs/koa@pre koa-static --save
```

Then update `app.mjs` with the following content:

<<< @/examples/js/api-server.js{2-4,33-56}

We can start the server with

```sh
node app.mjs
```

</LanguageBlock>

<BlockQuote type="info">

The server will stay running until you stop it by pressing Control + C in the terminal.

</BlockQuote>

And visit

```
http://localhost:3030/messages
```

to see an array with the one message we created on the server.

<BlockQuote>

The built-in [JSON viewer in Firefox](https://developer.mozilla.org/en-US/docs/Tools/JSON_viewer) or a browser plugin like [JSON viewer for Chrome](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh) makes it nicer to view JSON responses in the browser.


</BlockQuote>


This is the basic setup of a Feathers API server.

- The `app.use` calls probably look familiar if you have used Express before.
- `app.configure` calls set up the Feathers transport to host the API.
- `app.on('connection')` and `app.publish` are used to set up event channels, which send real-time events to the proper clients (everybody that is connected to our server in this case). You can learn [more about the channels API](../../api/channels.md) after finishing this guide.

## In the browser

Now we can look at one of the really cool features of Feathers: **It works the same in a web browser!** This means that we could take [our first app example](#our-first-app) from above and run it just the same in a website. Since we already have a server running, however, let's go a step further and create a Feathers app that talks to our `messages` service on the server using a real-time Socket.io connection.

In the same folder, add the following `index.html` page:

<<< @/examples/first-frontend.html

If you now go to

```
http://localhost:3030
```

you will see a simple website that allows creating new messages. It is possible to open the page in two tabs and see new messages show up on either side in real-time. You can verify that the messages got created by visiting

```
http://localhost:3030/messages
```

You'll see the JSON response including all current messages.

## What's next?

In this chapter we created our first Feathers application and a service that allows creating new messages, storing them in memory, and retrieving them. We then hosted that service as a REST and real-time API server and used Feathers in the browser to connect to that server and create a website that can send new messages and show all existing messages, with messaging updates showing up in realtime.

Even though we are using just NodeJS and Feathers from scratch without any additional tools, we didn't write lot of code for what we are getting. In the [next chapter](./generator.md) we will look at the Feathers CLI which can create a similar Feathers application with a recommended file structure. We can also use it to add authentication and database connections, all set up for us, automatically.
