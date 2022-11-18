---
outline: deep
---

# Authentication

The file in `src/authentication.ts` sets up an [authentication service](../../api/authentication/service.md) and registers [authentication strategies](../../api/authentication/strategy.md). Depending on the strategies you selected it looks similar to this:

```ts
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'

import type { Application } from './declarations'

declare module './declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())

  app.use('authentication', authentication)
}
```

## Client tests

If you selected a local strategy, `src/client.ts` will be updated with a client side integration test that looks similar to this:

```ts
it('creates and authenticates a user with email and password', async () => {
  const userData: userData = {
    email: 'someone@example.com',
    password: 'supersecret'
  }

  await client.service('users').create(userData)

  const { user, accessToken } = await client.authenticate({
    strategy: 'local',
    ...userData
  })

  assert.ok(accessToken, 'Created access token for user')
  assert.ok(user, 'Includes user in authentication data')
  assert.strictEqual(user.password, undefined, 'Password is hidden to clients')

  await client.logout()

  // Remove the test user on the server
  await app.service('users').remove(user.id)
})
```

This test will create a new user with the generated client, log in, verify a user was returned and log out again. To keep the test self-contained it will then remove the test user on the server

<BlockQuote type="tip">

Note that you can use `client` for client side interactions and the server side [application](./application.md#application) `app` object for server side calls in the same file. For example, if the user required an email verification but you don't want to test sending out emails you can call something like `app.service('users').patch(user.id, { verified: true })` to enable the new user on the server.

</BlockQuote>

## oAuth

Note that when selecting oAuth logins (Google, Facebook, GitHub etc.), the standard registered oAuth strategy only uses the `<name>Id` property to create a new user. This will fail validation against the default user [schema](./schemas.md) which requires an `email` property to exist. If the provider (and user) allows fetching the email, you can customize the oAuth strategy like shown for GitHub in the [oAuth authentication guide](../basics/authentication.md#login-with-github). You can also make the email in the schema optional with `email: Type.Optional(Type.String())`.
