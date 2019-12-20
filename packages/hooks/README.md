# Hooks

[![Build Status](https://travis-ci.org/feathersjs/feathers.png?branch=master)](https://travis-ci.org/feathersjs/feathers)
[![Dependency Status](https://img.shields.io/david/feathersjs/feathers.svg?style=flat-square&path=packages/hooks)](https://david-dm.org/feathersjs/feathers?path=packages/hooks)
[![Download Status](https://img.shields.io/npm/dm/@feathersjs/hooks.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/hooks)

`@feathersjs/hooks` brings Koa style middleware to any asynchronous JavaScript function.

## Installation

```bash
npm install @feathersjs/hooks --save
```

## Quick Example

The following example logs the runtime of a function:

```js
const hooks = require('@feathersjs/hooks');
const logRuntime = async (ctx, next) => {
  const start = new Date().getTime();

  await next();

  const end = new Date().getTime();

  console.log(`Function call took ${end - start}ms`);
}

const sayHello = hooks(async message => {
  return `Hello ${message}!`;
}, [ logRuntime ]);

console.log(await sayHello('David'));
```

## Documentation

### Hook functions

Hook functions take a context `ctx` and an asynchronous `next` function as their argument. The control flow is the exact same as in [KoaJS](). A hook function can do things before calling `await next()` and after all other hooks and the function call returned:

```js
const hooks = require('@feathersjs/hooks');

const sayHello = async message => {
  return `Hello ${message}!`;
};

const logMethod = async (ctx, next) => {
  console.log('Before calling method');
  console.log('Arguments are', ctx.arguments);

  await next();

  console.log('Method called');
  console.log('Result is', ctx.result);
}

const hookedSayHello = hooks(sayHello, [ logMethod ]);
```

### Context

- `ctx.arguments` - The arguments of the function as an array
- `ctx.method` - The name of the function (if it belongs to an object)
- `ctx.this` - The `this` context of the function being called

### Decorators

Hooks can also be attached through [ES experimental](https://babeljs.io/docs/en/babel-plugin-proposal-decorators) or TypeScript decorators:

```js
import hooks from '@feathersjs/hooks';

class App {
  @hooks([ logMethod ])
  async sayHi (name) {
    return `Hello ${name}`;
  }
}
```

## More Examples

### Cache results

The following example is a simple hook that caches the results of a function call and uses the cached value if available. This is useful e.g. for external Ajax requests:

```js
const hooks = require('@feathersjs/hooks');
const cache = () => {
  const cacheData = {};
  
  return async (ctx, next) => {
    const key = JSON.stringify(ctx);

    if (cacheData[key]) {
      ctx.result = cacheData[key];

      return next();
    }

    await next();

    cacheData[key] = ctx.result;
  }
}

const getData = hooks(async url => {
  return axios.get(url);
}, [ cache() ]);

await getData('http://url-that-takes-long-to-respond');
```

### Decorators

```js
import hooks from '@feathersjs/hooks';

class Api {
  @hooks([
    logRuntime,
    cache()
  ])
  async getMessages () {
    const { data } = axios.get('http://myserver.com/users');

    return data;
  }
}
```

## License

Copyright (c) 2019

Licensed under the [MIT license](LICENSE).
