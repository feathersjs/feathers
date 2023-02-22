---
outline: deep
---

# The Feathers CLI

The Feathers generator allows you to quickly scaffold a Feathers app with the latest standardized file structure.

## Install the CLI

When creating an application (e.g. `my-app`) with

```
npm create feathers@latest my-app
```

the Feathers CLI will be installed locally into your new project. This is preferred over global installation so that everybody working on your project has the same version and commands available by running `npx feathers`.

## CLI Commands

In a generated application you should be able to run the `generate` command with no arguments:

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

### Authentication

```
npx feathers generate authentication
```

Will set up Feathers authentication and a users service. This is required for any other service that needs authentication.

### Service

```
npx feathers generate service
```

Generates a service connected to a database or a custom service.

### Connection

```
npx feathers generate connection
```

Sets up a new database connection. This is already done when creating a new application but you can still set up other databases.

### Hook

```
npx feathers generate hook
```

Generates a new hook in the `hooks` folder that can then be registered in your services.

### App

This is the command that runs automatically when calling

```
npm create feathers@latest my-app
```
