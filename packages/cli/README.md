# Feathers CLI

[![Build Status](https://travis-ci.org/feathersjs/feathers-cli.png?branch=master)](https://travis-ci.org/feathersjs/feathers-cli)

> The command line interface for Feathers applications

## Installation

```bash
npm install -g feathers-cli
```

## Usage

Enter the interactive prompt

```
$ feathers

feathers$ help

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

## Creating a new Feathers application

```bash
mkdir my-new-app          # create a new directory for your app
cd my-new-app

feathers generate         # follow the prompts and generate your app

npm start                 # start your app
```


## About

Feathers CLI's generators are provided by [generator-feathers](https://github.com/feathersjs/generator-feathers), its interactive command line is built on [Vorpal](http://vorpal.js.org/).


## Changelog

__1.0.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
