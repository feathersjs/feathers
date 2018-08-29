# generator-feathers

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/generator-feathers)](https://david-dm.org/feathersjs/feathers?path=packages/generator-feathers)
[![Download Status](https://img.shields.io/npm/dm/generator-feathers.svg?style=flat-square)](https://www.npmjs.com/package/generator-feathers)

> A Yeoman generator for a Feathers application

## Installation

First you need install [yeoman](http://yeoman.io/).

```bash
npm install -g yo
```

Then install the feathers generator.

```bash
npm install -g yo generator-feathers
```

## Usage

Create a directory for your new app.

```bash
mkdir my-new-app; cd my-new-app/
```

Generate your app and follow the prompts.

```bash
yo feathers
```

Start your brand new app! 💥

```bash
npm start
```

## Available commands

```bash
# short alias for generate new application
yo feathers

# set up authentication
yo feathers:authentication

# set up a database connection
yo feathers:connection

# generate new hook
yo feathers:hook

# generate new middleware
yo feathers:middleware

# generate new service
yo feathers:service
```

## Production
[feathers/feathers-configuration](https://github.com/feathersjs/feathers-configuration) uses `NODE_ENV` to find a configuration file under `config/`. After updating `config/production.js` you can run 

```bash
NODE_ENV=production npm start
```

## Contributing

To contribute PRs for these generators, you will need to clone the repo
then inside the repo's directory, run `npm link`. This sets up a global
link to your local package for running tests (`npm test`) and generating
new feathers apps/services/hooks/etc.

When finished testing, optionally run `npm uninstall generator-feathers` to remove
the link.

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
