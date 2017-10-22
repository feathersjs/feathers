# Feathers CLI

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/feathers-cli.svg)](https://greenkeeper.io/)

> The command line interface for Feathers applications

[![Build Status](https://img.shields.io/travis/feathersjs/feathers-cli/master.svg)](https://travis-ci.org/feathersjs/feathers-cli)
[![Test Coverage](https://codeclimate.com/github/feathersjs/feathers-cli/badges/coverage.svg)](https://codeclimate.com/github/feathersjs/feathers-cli/coverage)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers-cli.svg)](https://david-dm.org/feathersjs/feathers-cli)
[![Download Status](https://img.shields.io/npm/dm/feathers-cli.svg)](https://www.npmjs.com/package/feathers-cli)

## Installation

```bash
npm install -g feathers-cli
```

## Usage

```
$ mkdir myproject

$ cd myproject

$ feathers help

  Usage: feathers generate [type]


  Commands:

    generate [type]  Run a generator. Type can be
      • app - Create a new Feathers application in the current folder
      • authentication - Set up authentication for the current application
      • connection - Initialize a new database connection
      • hook - Create a new hook
      • middleware - Create an Express middleware
      • service - Generate a new service
      • plugin - Create a new Feathers plugin

    *

  Options:

    -h, --help     output usage information
    -V, --version  output the version number

$ feathers generate app

$ npm start
```

## About

Feathers CLI's generators are provided by [generator-feathers](https://github.com/feathersjs/generator-feathers) and [generator-feathers-plugin](https://github.com/feathersjs/generator-feathers-plugin).

## License

Copyright (c) 2017

Licensed under the [MIT license](LICENSE).
