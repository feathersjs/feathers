# Errors

::badges{npm="@feathersjs/errors" changelog="https://github.com/feathersjs/feathers/blob/dove/packages/errors/CHANGELOG.md"}
::

```
npm install @feathersjs/errors --save
```

The `@feathersjs/errors` module contains a set of standard error classes used by all other Feathers modules.

## Examples

Here are a few ways that you can use them:

```ts
import { NotFound, GeneralError, BadRequest } from '@feathersjs/errors'

// If you were to create an error yourself.
const notFound = new NotFound('User does not exist')

// You can wrap existing errors
const existing = new GeneralError(new Error('I exist'))

// You can also pass additional data
const data = new BadRequest('Invalid email', {
  email: 'sergey@google.com'
})

// You can also pass additional data without a message
const dataWithoutMessage = new BadRequest({
  email: 'sergey@google.com'
})

// If you need to pass multiple errors
const validationErrors = new BadRequest('Invalid Parameters', {
  errors: { email: 'Email already taken' }
})

// You can also omit the error message and we'll put in a default one for you
const validationErrors = new BadRequest({
  errors: {
    email: 'Invalid Email'
  }
})
```

## Feathers errors

The following error types, all of which are instances of `FeathersError`, are available:

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

::tip
All of the Feathers core modules and most plugins and database adapters automatically emit the appropriate Feathers errors for you. For example, most of the database adapters will already send `Conflict` or `Unprocessable` errors on validation errors.
::

Feathers errors contain the following fields:

- `name` - The error name (e.g. "BadRequest", "ValidationError", etc.)
- `message` - The error message string
- `code` - The HTTP status code
- `className` - A CSS class name that can be handy for styling errors based on the error type. (e.g. "bad-request" , etc.)
- `data` - An object containing anything you passed to a Feathers error except for the `errors` object and `message`.
- `errors` - An object containing whatever was passed to a Feathers error inside `errors`. This is typically validation errors or if you want to group multiple errors together.

::warning[Important]
To convert a Feathers error back to an object call `error.toJSON()`. A normal `console.log` of a JavaScript Error object will not automatically show those additional properties described above (even though they can be accessed directly).
::

## Custom errors

You can create custom errors by extending from the `FeathersError` class and calling its constructor with `(message, name, code, className, data)`:

- `message` - The error message
- `name` - The error name (e.g. `MyError`)
- `code` - An [HTTP error code](https://www.w3.org/Protocols/rfc2616/rfc2616-sec10.html)
- `className` - The full name of the error class (e.g. `my-error`)
- `data` - Additional data to include in the error

```ts
import { FeathersError } from '@feathersjs/errors'

class UnsupportedMediaType extends FeathersError {
  constructor(message: string, data: any) {
    super(message, 'UnsupportedMediaType', 415, 'unsupported-media-type', data)
  }
}

const error = new UnsupportedMediaType('Not supported')

console.log(error.toJSON())
```

## Error Handling

It is important to make sure that errors get cleaned up before they go back to the client. [Express error handling middleware](https://docs.feathersjs.com/api/express.html#expresserrorhandler) works only for REST calls. If you want to make sure that ws errors are handled as well, you need to use [application error hooks](hooks#application-hooks) which are called on any service call error.

Here is an example error handler you can add to app.hooks errors.

```js
const errors = require('@feathersjs/errors')
const errorHandler = (ctx) => {
  if (ctx.error) {
    const error = ctx.error
    if (!error.code) {
      const newError = new errors.GeneralError('server error')
      ctx.error = newError
      return ctx
    }
    if (error.code === 404 || process.env.NODE_ENV === 'production') {
      error.stack = null
    }
    return ctx
  }
}
```

then add it as an [application level](./application#hooks-hooks) error hook

```ts
app.hooks({
  //...
  error: {
    all: [errorHandler]
  }
})
```
