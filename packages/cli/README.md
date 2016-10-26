# Feathers CLI

> The command line interface for Feathers applications

[![Build Status](https://travis-ci.org/feathersjs/feathers-cli.png?branch=master)](https://travis-ci.org/feathersjs/feathers-cli)
[![Code Climate](https://codeclimate.com/github/feathersjs/feathers-cli.png)](https://codeclimate.com/github/feathersjs/feathers-cli)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-cli/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-cli/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-cli.svg?style=flat-square)](https://david-dm.org/feathersjs/feathers-cli)
[![Download Status](https://img.shields.io/npm/dm/feathers-cli.svg?style=flat-square)](https://www.npmjs.com/package/feathers-cli)
[![Slack Status](http://slack.feathersjs.com/badge.svg)](http://slack.feathersjs.com)

[![NPM](https://nodei.co/npm/feathers-cli.png?downloads=true&stars=true)](https://nodei.co/npm/feathers-cli/)

## Installation

```bash
npm install -g feathers-cli
```

## Usage

```
$ feathers help

  Commands:

    help [command...]     Provides help for a given command.
    exit                  Exits application.
    generate              alias for generate app
    generate app          generate new application
    generate hook         generate new hook
    generate middleware   generate new middleware
    generate model        generate new model
    generate service      generate new service
    generate plugin       generate new plugin

$ feathers generate

  ? What type of API are you making? (Press <space> to select)

  ❯◉ REST
   ◉ Realtime via Socket.io
   ◯ Realtime via Primus

  (answer all the prompts to generate your app)

$ npm start
```

## About

Feathers CLI's generators are provided by [generator-feathers](https://github.com/feathersjs/generator-feathers) and [generator-feathers-plugin](https://github.com/feathersjs/generator-feathers-plugin). Its interactive command line is built on [Vorpal](http://vorpal.js.org/).


## Changelog

__1.2.4__

- Bumping to generator-feathers@0.8.0
- Fixed missing peer dependency yo@>=1.0.0
- Disabling upgrade notifications

__1.2.2__

- Bumping to generator-feathers@0.7.0


__1.2.1__

- Properly exiting after executing a command passed in `process.argv`

__1.2.0__

- Supporting "generate plugin" command via feathersjs/generator-feathers-plugin

__1.1.1__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
