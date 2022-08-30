---
outline: deep
---

# Getting ready

Alright then! Let's learn Feathers. In this section, we'll take a look at

- What we will cover in this guide
- What needs to be installed to use Feathers
- Things you should already know

## What we will do

In this guide we will get a [quick start](./starting.md) at creating our first Feathers REST and real-time API, along with a website to use it from scratch. We will learn about the [Feathers CLI](./generator.md) and the core concepts of [services](./services.md), [hooks](./hooks.md) and [authentication](./authentication.md).  We'll do this by building a chat application with user signup, login (including GitHub), and the ability to send and receive messages in real-time. It will look like this:

![The Feathers chat application](./assets/feathers-chat.png)

<LanguageBlock global-id="ts">

You can find the final version here: [feathersjs/feathers-chat-ts](https://github.com/feathersjs/feathers-chat-ts)

</LanguageBlock>

<LanguageBlock global-id="js">

You can find the final version here: [feathersjs/feathers-chat](https://github.com/feathersjs/feathers-chat)

</LanguageBlock>

## Prerequisites

We will be writing code for Node.js and the browser. Let's cover the requirements.

### Node.js Requirements

Feathers works with Node.js 14 and later. It will always support the [currently active releases](https://github.com/nodejs/Release#release-schedule). We recommend using the latest available version on the [NodeJS website](https://nodejs.org/en/).

Instead of installing Node from the website, we recommend using a version manager that works on your OS.  Version managers are tools to quickly install any version of NodeJS and keep it up to date.  Install a version manager that matches your system before you continue.

- [NVM for MacOS and other Unix systems](https://github.com/creationix/nvm)
- [NVM for Windows](https://github.com/coreybutler/nvm-windows)

After successful installation, the `node` and `npm` commands should be available on the terminal and show a similar version number when running the following commands:

```
$ node --version
```

```
$ npm --version
```

<BlockQuote type="danger" label="Important">

Running NodeJS and npm should not require admin or root privileges.

</BlockQuote>

### Browser Requirements

Feathers also works in the browser and supports all modern browsers. The examples used in the guides work with browsers that support `async/await`.

## What you should know

In order to get the most out of this guide you should have experience in a few areas.  First, choose the programming language you'd like to use:

<BlockQuote label="Select a Programming Language">

  <LanguageSelect hide-label/>

</BlockQuote>

To complete this guide, you'll need


- Reasonable JavaScript experience using [ES6](http://es6-features.org/) features like [async/await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)

<LanguageBlock global-id="ts" inline>

- Knowledge of [TypeScript generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)

</LanguageBlock>

- Some NodeJS experience, including its [module system](https://nodejs.org/api/modules.html).
- Familiarity with HTTP, [REST APIs](https://en.wikipedia.org/wiki/Representational_state_transfer), and websockets is also helpful but not necessary.

Feathers works standalone but also provides an integration with [Koa](../../api/koa.md) or [Express](../../api/express.md). This guide does not require any in-depth knowledge of the web framework you chose but some experience may be helpful in the future.

## What's next?

All set up and good to go? Let's [install Feathers and create our first app](./starting.md).
