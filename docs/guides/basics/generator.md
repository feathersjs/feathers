---
outline: deep
---

# Generating an app

In the [getting started chapter](./starting.md) we created a Feathers application in a single file to get a better understanding of how Feathers itself works. 

<img style="margin: 2em;" src="/img/main-character-coding.svg" alt="Getting started">

The Feathers CLI allows us to initialize a new Feathers server with a recommended structure and generate things we commonly need like authentication, a database connection or new services. It can be installed via:

```sh
npm install @feathersjs/cli@pre -g
```

<BlockQuote type="warning">

Since the generated application is using modern features like ES modules, the Feathers CLI requires Node 16 or newer. The `feathers --version` command should show `5.0.0-pre.27` or later.

</BlockQuote>

## Generating the application

Let's create a new directory for our app and in it, generate a new application:

```sh
mkdir feathers-chat
cd feathers-chat/
feathers generate app
```

First, choose if you want to use JavaScript or TypeScript. When presented with the project name, just hit enter, or enter a name (no spaces). Next, write a short description of your application. All other questions should be confirmed with the default selection by hitting Enter.

Once you confirm the last prompt, the final selection should look similar to this:

![feathers generate app prompts](./assets/generate-app.png)

<BlockQuote type="warning">

`SQLite` creates an SQL database in a file so we don't need to have a database server running. For any other selection, the database you choose has to be available at the connection string.

</BlockQuote>

## Running the server and tests

Once everything is installed, the server can be started by running

```sh
npm start
```

After that, you can see a welcome page at 

```
http://localhost:3030
```

While we will learn [more about writing tests later](./testing.md), the app also comes with a set of basic tests which can be run with

```sh
npm test
```

There is also a handy development command that restarts the server automatically whenever we make a code change:

```sh
npm run dev
```

You can keep this command running throughout the rest of this guide, it will reload all our changes automatically.

## What's next?

In this chapter we installed the Feathers CLI and created a new Feathers application. To learn more about the generated files and what you can do with the CLI, have a look at the [CLI guide](../cli/index.md) after finishing the Getting Started guide. In [the next chapter](./services.md) we will learn more about Feathers services and databases.
