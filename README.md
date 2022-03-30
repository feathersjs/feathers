<img style="width: 100%; max-width: 400px;" src="http://feathersjs.com/img/feathers-logo-wide.png" alt="Feathers logo">

## A framework for real-time applications and REST APIs with JavaScript and TypeScript

[![CI](https://github.com/feathersjs/feathers/workflows/CI/badge.svg)](https://github.com/feathersjs/feathers/actions?query=workflow%3ACI)
[![Maintainability](https://api.codeclimate.com/v1/badges/cb5ec42a2d0cc1a47a02/maintainability)](https://codeclimate.com/github/feathersjs/feathers/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/cb5ec42a2d0cc1a47a02/test_coverage)](https://codeclimate.com/github/feathersjs/feathers/test_coverage)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/feathers.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/feathers)
[![Discord](https://badgen.net/badge/icon/discord?icon=discord&label)](https://discord.gg/qa8kez8QBx)

Feathers is a lightweight web-framework for creating real-time applications and REST APIs using JavaScript or TypeScript.

Feathers can interact with any backend technology, supports over a dozen databases and works with any frontend technology like React, VueJS, Angular, React Native, Android or iOS.

## Getting started

You can build your first real-time and REST API in just 4 commands:

```bash
$ npm install -g @feathersjs/cli
$ mkdir my-new-app
$ cd my-new-app/
$ feathers generate app
$ npm start
```

To learn more about Feathers visit the website at [feathersjs.com](http://feathersjs.com) or jump right into [the Feathers guides](http://docs.feathersjs.com/guides).

## Documentation

The [Feathers docs](http://docs.feathersjs.com) are loaded with awesome stuff and tell you every thing you need to know about using and configuring Feathers.

## Dependencies

Here's a list of third party dependencies and why they may be included when using the feathers generator.

- axios
  - A Fetch API alternative that works in Node 16 and older. Used in the default tests.
- feathers-sequelize
  - Known bug, you may need this if you use SQL, but it get's included in generated projects regardless. Feel free to remove it.
- install
  - Included for compatibility... will be removed in Feathers v6
- mocha (Installed upon request)
- shx
  - A set of convenient shell utilities. Used by default on generated tests.
- winston
  - A very popular logger with many plugins. This is easy to remove should you prefer another logger. There are no tight integrations with Feathers by default, it's merely preconfigured with the bare minimum.

## License

Copyright (c) 2022 [Feathers contributors](https://github.com/feathersjs/feathers/graphs/contributors)

Licensed under the [MIT license](LICENSE).
