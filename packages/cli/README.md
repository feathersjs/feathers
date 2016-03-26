# Feathers CLI

> The command line interface for Feathers applications

[![Build Status](https://travis-ci.org/feathersjs/feathers-cli.png?branch=master)](https://travis-ci.org/feathersjs/feathers-cli)

[![NPM](https://nodei.co/npm/feathers-cli.png?downloads=true&stars=true)](https://nodei.co/npm/feathers-cli/)

## Installation

```bash
npm install -g feathers-cli
```

## Usage

```
feathers generate

  ? What type of API are you making? (Press <space> to select)

  ❯◉ REST
   ◉ Realtime via Socket.io
   ◯ Realtime via Primus

  (answer all the prompts to generate your app)

npm start
```

## Available Commands

```
feathers help

  Commands:

    help [command...]     Provides help for a given command.
    exit                  Exits application.
    generate              alias for generate app
    generate app          generate new application
    generate hook         generate new hook
    generate middleware   generate new middleware
    generate model        generate new model
    generate service      generate new service
```

## About

Feathers CLI's generators are provided by [generator-feathers](https://github.com/feathersjs/generator-feathers), its interactive command line is built on [Vorpal](http://vorpal.js.org/).


## Changelog

__1.0.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
