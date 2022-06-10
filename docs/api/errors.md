# Errors

[![npm version](https://img.shields.io/npm/v/@feathersjs/errors.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/errors)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/errors/CHANGELOG.md)

```
npm install @feathersjs/errors --save
```

The `@feathersjs/errors` module contains a set of standard error classes used by all other Feathers modules.

## Examples

Here are a few ways that you can use them:

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const { NotFound, GeneralError, BadRequest } = require('@feathersjs/errors');

// If you were to create an error yourself.
const notFound = new NotFound('User does not exist');

// You can wrap existing errors
const existing = new GeneralError(new Error('I exist'));

// You can also pass additional data
const data = new BadRequest('Invalid email', {
  email: 'sergey@google.com'
});

// You can also pass additional data without a message
const dataWithoutMessage = new BadRequest({
  email: 'sergey@google.com'
});

// If you need to pass multiple errors
const validationErrors = new BadRequest('Invalid Parameters', {
  errors: { email: 'Email already taken' }
});

// You can also omit the error message and we'll put in a default one for you
const validationErrors = new BadRequest({
  errors: {
    email: 'Invalid Email'
  }
});
```
:::

::: tab "TypeScript"
```ts
import { NotFound, GeneralError, BadRequest } from '@feathersjs/errors';

// If you were to create an error yourself.
const notFound = new NotFound('User does not exist');

// You can wrap existing errors
const existing = new GeneralError(new Error('I exist'));

// You can also pass additional data
const data = new BadRequest('Invalid email', {
  email: 'sergey@google.com'
});

// You can also pass additional data without a message
const dataWithoutMessage = new BadRequest({
  email: 'sergey@google.com'
});

// If you need to pass multiple errors
const validationErrors = new BadRequest('Invalid Parameters', {
  errors: { email: 'Email already taken' }
});

// You can also omit the error message and we'll put in a default one for you
const validationErrors = new BadRequest({
  errors: {
    email: 'Invalid Email'
  }
});
```
:::

::::

## Feathers errors

The following error types, all of which are instances of `FeathersError`, are available:

> **ProTip:** All of the Feathers plugins will automatically emit the appropriate Feathers errors for you. For example, most of the database adapters will already send `Conflict` or `Unprocessable` errors with the validation errors from the ORM.

- 400: `BadRequest`
- 401: `NotAuthenticated`
- 402: `PaymentError`
- 403: `Forbidden`
- 404: `NotFound`
- 405: `MethodNotAllowed`
- 406: `NotAcceptable`
- 408: `Timeout`
- 409: `Conflict`
- 411: `LengthRequired`
- 422: `Unprocessable`
- 429: `TooManyRequests`
- 500: `GeneralError`
- 501: `NotImplemented`
- 502: `BadGateway`
- 503: `Unavailable`

Feathers errors contain the following fields:

- `name` - The error name (e.g. "BadRequest", "ValidationError", etc.)
- `message` - The error message string
- `code` - The HTTP status code
- `className` - A CSS class name that can be handy for styling errors based on the error type. (e.g. "bad-request" , etc.)
- `data` - An object containing anything you passed to a Feathers error except for the `errors` object and `message`.
- `errors` - An object containing whatever was passed to a Feathers error inside `errors`. This is typically validation errors or if you want to group multiple errors together.

> **ProTip:** To convert a Feathers error back to an object call `error.toJSON()`. A normal `console.log` of a JavaScript Error object will not automatically show those additional properties described above (even though they can be accessed directly).

## Custom errors

You can create custom errors by extending from the `FeathersError` class and calling its constructor with `(msg, name, code, className, data)`:

- `message` - The error message
- `name` - The error name (e.g. `MyError`)
- `code` - An [HTTP error code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
- `className` - The full name of the error class (e.g. `my-error`)
- `data` - Additional data to include in the error


```js
const { FeathersError } = require('@feathersjs/errors');

class UnsupportedMediaType extends FeathersError {
  constructor(message, data) {
    super(message, 'UnsupportedMediaType', 415, 'unsupported-media-type', data);
  }
}

const error = new UnsupportedMediaType('Not supported');

console.log(error.toJSON());
```

## Server Side Errors

Promises swallow errors if you forget to add a `catch()` statement. Therefore, you should make sure that you **always** call `.catch()` on your promises. To catch uncaught errors at a global level you can add the code below to your top-most file.

```js
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise ', p, ' reason: ', reason);
});
```

## Error Handling

It is important to make sure that errors get cleaned up before they go back to the client. [Express error handling middleware](https://docs.feathersjs.com/api/express.html#expresserrorhandler) works only for REST calls. If you want to make sure that ws errors are handled as well, you need to use [App Hooks](https://docs.feathersjs.com/guides/basics/hooks.html#application-hooks). App Error Hooks get called on an error to every service call regardless of transport.

Here is an example error handler you can add to app.hooks errors.

```js
const errors = require("@feathersjs/errors");
const errorHandler = ctx => {
  if (ctx.error) {
    const error = ctx.error;
    if (!error.code) {
      const newError = new errors.GeneralError("server error");
      ctx.error = newError;
      return ctx;
    }
    if (error.code === 404 || process.env.NODE_ENV === "production") {
      error.stack = null;
    }
    return ctx;
  }
};
```

then add it to the error.all hook

```js
module.exports = {
  //...
  error: {
    all: [errorHandler],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
```
