---
outline: deep
---

# Service tests

The `<service>.test` file contains tests for a specific service. By default it just checks if the service has been registered.

## Testing the service

Services can be tested by using the [application](./app.md) object through Feathers standard APIs:

```ts
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('users service', () => {
  it('registered the service', () => {
    const service = app.service('users')

    assert.ok(service, 'Registered the service')
  })

  it('finds all users', async () => {
    const users = await app.service('users').find({
      paginate: false
    })

    assert.ok(Array.isArray(users))
  })
})
```

## Authenticated tests

To test service internals that require a logged in user, it is not necessary to go through the full authentication flow. Instead a test user can be created and then passed as `params.user` just like it would when authenticated:

```ts
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from 'assert'
import { app } from '../../../src/app'

describe('messages service', () => {
  it('registered the service', () => {
    const service = app.service('messages')

    assert.ok(service, 'Registered the service')
  })

  it('can create a new message for a user', async () => {
    const user = await app.service('users').create({
      email: 'test@feathersjs.com',
      password: 'supersecret'
    })

    const message = await app.service('messages').create(
      {
        text: 'Hello world'
      },
      { user }
    )

    assert.strictEqual(message.userId, user.id)

    await app.service('messages').remove(message.id)
    await app.service('users').remove(user.id)
  })
})
```

<BlockQuote label="tip">

If you want to test the full authentication and external access flow the [client.test](./client.test.md) can be used.

</BlockQuote>
