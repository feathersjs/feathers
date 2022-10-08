---
outline: deep
---

# The Feathers CLI

The Feathers generator allows you to quickly scaffold a Feathers app with the latest standardized file structure.

## Install the CLI

You can install the `@feathersjs/cli@pre` package as a global node module or run it directly with `npx`. We recommend installing the package locally unless you are in an enviroment that specifically prevents global modules.

### Global Install (Preferred)

Install the cli globally by running the following command:

```bash
npm i -g @feathersjs/cli@pre
```

Now you will be able to run the generator by using the `feathers` command.

### Run Directly With npx

The `npx` command that comes bundled with `npm` allows you to run the Feathers CLI directly, avoiding the need to install a global module.

```bash
npx @feathersjs/cli@pre generate app
```



## CLI Commands

Once you've installed the CLI, you should be able to run the `generate` command with no arguments:

```bash
feathers generate
```

You'll see the following output:

```bash
Usage: feathers generate|g [options] [command]

Run a generator. Currently available: 
  app: Generate a new application 
  service: Generate a new service 
  hook: Generate a hook 
  connection: Add a new database connection 
  authentication: Add authentication to the application 

Options:
  -h, --help         display help for command

Commands:
  app [options]      Generate a new application
  service [options]  Generate a new service
  hook [options]     Generate a hook
  connection         Add a new database connection
  authentication     Add authentication to the application
  help [command]     display help for command
```

### The App Generator

Learn about the app generator on the [Generate an App](./generate-app.md) page.

### View the Help Output

You can see the generator's help output by running a command followed by `-h`, like `feathers generate app -h`.  Here's what it looks like:

```bash
Usage: feathers generate app [options]

Generate a new application

Options:
  --name <name>  The name of the application
  -h, --help     display help for command
```

