---
outline: deep
---

# Authenticate Hook

The `authenticate` hook will use `params.authentication` of the service method call and run [authenticationService.authenticate()](./service.md#authenticate-data-params-strategies).

The hook will

- Throw an error if the strategy fails
- Throw an error if no authentication information is set and it is an external call (`params.provider` is set) or do nothing if it is an internal call (`params.provider` is `undefined`)
- If successful, merge `params` with the return value of the authentication strategy

For example, a successful [JWT strategy](./jwt.md) authentication will set:

```js
params.authentication.payload // The decoded payload
params.authentication.strategy === 'jwt' // The strategy name
params.user // or params[entity] if entity is not `null`
```

In the following hooks and for the service method call. It can be used as a `before` or `around` [hook](../hooks.md).

## authenticate(...strategies)

Check `params.authentication` against a list of authentication strategy names.

```ts
import { authenticate } from '@feathersjs/authentication'

// Authenticate with `jwt` and `api-key` strategy
// using app.service('authentication') as the authentication service
app.service('messages').hooks({
  around: {
    all: [authenticate('jwt', 'api-key')]
  }
})
```

## authenticate(options)

Check `params.authentication` against a list of strategies and specific authentication service. Available `options` are:

- `service` - The path to the authentication service
- `strategies` - A list of strategy names

```js
import { authenticate } from '@feathersjs/authentication'

// Authenticate with `jwt` and `api-key` strategy
// using app.service('v1/authentication') as the authentication service
app.service('messages').hooks({
  before: {
    all: [
      authenticate({
        service: 'v1/authentication',
        strategies: ['jwt', 'api-key']
      })
    ]
  }
})
```
