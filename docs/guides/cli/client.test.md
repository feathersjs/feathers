# Client test

The `client.test` file contains end-to-end integration tests for the [generated client](./client.md).

## Authentication

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

Note that you can use `client` for client side interactions and the server side [application](./app.md#application) `app` object for server side calls in the same file. For example, if the user required an email verification but you don't want to test sending out emails you can call something like `app.service('users').patch(user.id, { isVerified: true })` to enable the new user on the server.

</BlockQuote>
