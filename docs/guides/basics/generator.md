---
outline: deep
---

# Generating an app

In the [quick start](./starting.md) we created a Feathers application in a single file to get a better understanding of how Feathers itself works. 

<img style="margin: 2em;" src="/img/main-character-coding.svg" alt="Getting started">

The Feathers CLI allows us to initialize a new Feathers server with a recommended structure and generate things we commonly need like authentication, a database connection or new services.

## Generating the application

You can create a new Feathers application by running `npm create feathers <name>`. To create a new Feathers application called `feathers-chat` we can run:

```sh
npm create feathers feathers-chat
```

If you never ran the command before you might be ask to confirm the package installation by pressing enter.

<BlockQuote type="warning">

Since the generated application is using modern features like ES modules, the Feathers CLI requires Node 16 or newer. The `feathers --version` command should show `5.0.0-pre.30` or later.

</BlockQuote>

First, choose if you want to use JavaScript or TypeScript. When presented with the project name, just hit enter, or enter a name (no spaces). Next, write a short description of your application. All other questions should be confirmed with the default selection by hitting Enter.

Once you confirm the last prompt, the final selection should look similar to this:

![feathers generate app prompts](./assets/generate-app.png)

<BlockQuote type="warning" label="Note">

`SQLite` creates an SQL database in a file so we don't need to have a database server running. For any other selection, the database you choose has to be available at the connection string.

</BlockQuote>

Sweet! We generated our first Feathers application in a new folder called `feathers-chat` so we need to go there.

```sh
cd feathers-chat
```


## Running the server and tests

The server can be started by running

<LanguageBlock global-id="ts">

```sh
npm run compile
npm start
```

</LanguageBlock>

<LanguageBlock global-id="js">

```sh
npm start
```

</LanguageBlock>



After that, you will see the Feathers logo at 

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

<BlockQuote type="warning" label="Note">

Keep this command running throughout the rest of this guide so it will reload all our changes automatically.

</BlockQuote>

## What's next?

In this chapter we installed the Feathers CLI and created a new Feathers application. To learn more about the generated files and what you can do with the CLI, have a look at the [CLI guide](../cli/index.md) after finishing the Getting Started guide. In [the next chapter](./services.md) we will learn more about Feathers services and databases.
