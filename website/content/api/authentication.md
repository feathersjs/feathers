

# Authentication

The `@feathersjs/authentication` plugins provide a collection of tools for username/password, JWT and OAuth (GitHub, Facebook etc.) authentication as well as custom authentication mechanisms.

## authenticate

`authenticate(...strategies)` is a hook that allows to authenticate a service method with one or more registered authentication strategies.

```ts
import { authenticate } from '@feathersjs/authentication'

app.service('messages').hooks({
  before: {
    all: [authenticate('jwt')]
  }
})
```

## Legacy Documentation

For detailed documentation on the authentication service, strategies (JWT, Local, OAuth), and client usage, see the [Feathers v5 (Dove) authentication documentation](https://eagle.feathersjs.com/api/authentication/).
