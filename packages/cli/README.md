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

## Create a new application

Create a directory for your new app.

```bash
mkdir my-new-app
cd my-new-app
```

Generate your app and follow the prompts

```bash
$ feathers

feathers$ generate
```

Start your brand new app! 💥

```bash
npm start
```


## About

Feathers CLI's generators are provided by [generator-feathers](https://github.com/feathersjs/generator-feathers), and its interactive command line is built on [Vorpal](http://vorpal.js.org/).


## Changelog

__1.0.0__

- Initial release

## License

Copyright (c) 2016

Licensed under the [MIT license](LICENSE).
