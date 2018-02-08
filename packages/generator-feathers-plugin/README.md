# generator-feathers-plugin [![Build Status](https://travis-ci.org/feathersjs/generator-feathers-plugin.png?branch=master)](https://travis-ci.org/feathersjs/generator-feathers-plugin)

[![Greenkeeper badge](https://badges.greenkeeper.io/feathersjs/generator-feathers-plugin.svg)](https://greenkeeper.io/)

[![Build Status](https://travis-ci.org/feathersjs/generator-feathers-plugin.png?branch=master)](https://travis-ci.org/feathersjs/generator-feathers-plugin)
[![Dependency Status](https://img.shields.io/david/feathersjs/generator-feathers-plugin.svg?style=flat-square)](https://david-dm.org/feathersjs/generator-feathers-plugin)
[![Download Status](https://img.shields.io/npm/dm/generator-feathers-plugin.svg?style=flat-square)](https://www.npmjs.com/package/generator-feathers-plugin)

> A [Yeoman](http://yeoman.io) generator for initializing new [Feathersjs](https://github.com/feathersjs) plug-ins.

## Getting Started

To install [generator-feathers-plugin](https://github.com/feathersjs/generator-feathers-plugin) from [npm](https://www.npmjs.org/), run:

```
$ npm install -g generator-feathers-plugin
```

Finally, initiate the generator:

```
$ yo feathers-plugin
```

This will generate a standard plug-in scaffold with a basic example app that you should modify accordingly to suit your plug-in.

## Writing Your Plug-in

We follow proper semantic versioning. That means breaking changes are major releases. Your module version should be < 1.0 until you feel that it is ready for for production.

Feel free to add modules as you see fit but remember that **less is more**.

Please add tests for your modules and write your code using ES6 syntax.

## Running Tests

Simply run `npm test`.

Tests use the [Mocha](https://mochajs.org/) test runner and the [Chai](http://chaijs.com/) assertion library. We use the `expect` syntax.

## Publishing

The `package.json` file has helpful scripts to publish your package, tag it, and push it up to production. Please use those.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
