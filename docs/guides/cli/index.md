---
outline: deep
---

# The Feathers CLI

The Feathers generator allows you to quickly scaffold a Feathers app with the latest standardized file structure.

## Install the CLI

When creating an application with `npm create feathers`, the Feathers CLI will be installed locally into your new project. This is preferred over global installation so that everybody working on your project has the same version and commands available by running `npx feathers`.

## CLI Commands

Once you've installed the CLI, you should be able to run the `generate` command with no arguments:

```bash
npx feathers generate
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
