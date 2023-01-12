---
outline: deep
---

# Writing tests

The best way to test an application is by writing tests that make sure it behaves to clients as we would expect. Feathers makes testing your application a lot easier because the services we create can be tested directly instead of having to fake HTTP requests and responses. In this chapter we will implement unit tests for our users and messages services.

You can run code linting and Mocha tests with:

```sh
npm test
```

This should already pass but it won't be testing any of the functionality we added in the guide so far.

## Test database setup

When testing database functionality, we want to make sure that the tests use a different database. We can achieve this by updating the test environment configuration in `config/test.json` with the following content:

```json
{
  "nedb": "../test/data"
}
```

This will set up the NeDB database to use `test/data` as the base directory instead of `data/` when the `NODE_ENV` environment variable is set to `test`. The same thing can be done with connection strings for other databases.

<BlockQuote type="warning" label="Important">

When using Git for version control, the `data/` and `test/data` folders should be added to `.gitignore`.

</BlockQuote>

We also want to make sure that the database is cleaned up before every test run. To make that possible across platforms, first run:

```sh
npm install shx --save-dev
```

Now we can update the `scripts` section of our `package.json` to the following:



<LanguageBlock global-id="ts">

```json
  "scripts": {
    "test": "npm run compile && npm run mocha",
    "dev": "ts-node-dev --no-notify src/",
    "start": "npm run compile && node lib/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test ts-mocha \"test/**/*.ts\" --recursive --exit",
    "compile": "shx rm -rf lib/ && tsc"
  },
```

</LanguageBlock>

<LanguageBlock global-id="js">

```json
  "scripts": {
    "test": "npm run eslint && npm run mocha",
    "eslint": "eslint src/. test/. --config .eslintrc.json",
    "start": "node src/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test mocha test/ --recursive --exit"
  }
```

</LanguageBlock>



On Windows the `mocha` command should look like this:

```sh
npm run clean & SET NODE_ENV=test& mocha test/ --recursive --exit
```

This will make sure that the `test/data` folder is removed before every test run and `NODE_ENV` is set properly.

## Testing services

To test the `messages` and `users` services (with all hooks wired up), we could use any REST API testing tool to make requests and verify that they return correct responses.

There is a much faster, easier and complete approach. Since everything on top of our own hooks and services is already provided (and tested) by Feathers, we can require the [application](../../api/application.md) object and use the [service methods](../../api/services.md) directly. We "fake" authentication by setting `params.user` manually.

By default, the generator creates a service test file that only tests that the service exists.



<LanguageBlock global-id="ts">

E.g. like this in `test/services/users.test.ts`:

```ts
import assert from 'assert';
import app from '../../src/app';

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
});
```

</LanguageBlock>

<LanguageBlock global-id="js">

E.g. like this in `test/services/users.test.js`:

```js
const assert = require('assert');
const app = require('../../src/app');

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });
});
```

</LanguageBlock>



We can then add similar tests that use the service. In this case we are:
1. verifying that users can be created, the default profile image gets set and the password is encrypted
2. ensuring that the password does not get sent to external requests



<LanguageBlock global-id="ts">

Replace `test/services/users.test.ts` with the following:

```ts
import assert from 'assert';
import app from '../../src/app';

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });

  it('creates a user, encrypts password and adds gravatar', async () => {
    const user = await app.service('users').create({
      email: 'test@example.com',
      password: 'secret'
    });

    // Verify Gravatar has been set as we'd expect
    assert.equal(user.avatar, 'https://s.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?s=60');
    // Makes sure the password got encrypted
    assert.ok(user.password !== 'secret');
  });

  it('removes password for external requests', async () => {
    // Setting `provider` indicates an external request
    const params = { provider: 'rest' };

    const user = await app.service('users').create({
      email: 'test2@example.com',
      password: 'secret'
    }, params);

    // Make sure password has been removed
    assert.ok(!user.password);
  });
});
```

</LanguageBlock>

<LanguageBlock global-id="js">

Replace `test/services/users.test.js` with the following:

```js
const assert = require('assert');
const app = require('../../src/app');

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });

  it('creates a user, encrypts password and adds gravatar', async () => {
    const user = await app.service('users').create({
      email: 'test@example.com',
      password: 'secret'
    });

    // Verify Gravatar has been set as we'd expect
    assert.equal(user.avatar, 'https://s.gravatar.com/avatar/55502f40dc8b7c769880b10874abc9d0?s=60');
    // Makes sure the password got encrypted
    assert.ok(user.password !== 'secret');
  });

  it('removes password for external requests', async () => {
    // Setting `provider` indicates an external request
    const params = { provider: 'rest' };

    const user = await app.service('users').create({
      email: 'test2@example.com',
      password: 'secret'
    }, params);

    // Make sure password has been removed
    assert.ok(!user.password);
  });
});
```

</LanguageBlock>



We take a similar approach for the messages service test by creating a test-specific user from the `users` service, then pass it as `params.user` when creating a new message and validates that message's content:



<LanguageBlock global-id="ts">

Update `test/services/messages.test.ts` as follows:

```ts
import assert from 'assert';
import app from '../../src/app';

describe('\'messages\' service', () => {
  it('registered the service', () => {
    const service = app.service('messages');

    assert.ok(service, 'Registered the service');
  });

  it('creates and processes message, adds user information', async () => {
    // Create a new user we can use for testing
    const user = await app.service('users').create({
      email: 'messagetest@example.com',
      password: 'supersecret'
    });

    // The messages service call params (with the user we just created)
    const params = { user };
    const message = await app.service('messages').create({
      text: 'a test',
      additional: 'should be removed'
    }, params);

    assert.equal(message.text, 'a test');
    // `userId` should be set to passed users it
    assert.equal(message.userId, user._id);
    // Additional property has been removed
    assert.ok(!message.additional);
    // `user` has been populated
    assert.deepEqual(message.user, user);
  });
});
```

</LanguageBlock>

<LanguageBlock global-id="js">

Update `test/services/messages.test.js` as follows:

```js
const assert = require('assert');
const app = require('../../src/app');

describe('\'messages\' service', () => {
  it('registered the service', () => {
    const service = app.service('messages');

    assert.ok(service, 'Registered the service');
  });

  it('creates and processes message, adds user information', async () => {
    // Create a new user we can use for testing
    const user = await app.service('users').create({
      email: 'messagetest@example.com',
      password: 'supersecret'
    });

    // The messages service call params (with the user we just created)
    const params = { user };
    const message = await app.service('messages').create({
      text: 'a test',
      additional: 'should be removed'
    }, params);

    assert.equal(message.text, 'a test');
    // `userId` should be set to the provided user's id
    assert.equal(message.userId, user._id);
    // Additional property has been removed
    assert.ok(!message.additional);
    // `user` has been populated
    assert.deepEqual(message.user, user);
  });
});
```

</LanguageBlock>



Run `npm test` one more time, to verify that all tests are passing.

## Code coverage

Code coverage is a great way to get some insights into how much of our code is actually executed during the tests. Using [Istanbul](https://github.com/gotwarlost/istanbul) we can add it easily:

```sh
npm install nyc --save-dev
```



<LanguageBlock global-id="ts">

For TypeScript we also have to install the TypeScript reporter:

```sh
npm install @istanbuljs/nyc-config-typescript --save-dev
```

Add the following `.nycrc` file:

```json
{
  "extends": "@istanbuljs/nyc-config-typescript",
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx"
  ]
}
```

And then update the `scripts` section of our `package.json` to:

```json
  "scripts": {
    "test": "npm run compile && npm run coverage",
    "dev": "ts-node-dev --no-notify src/",
    "start": "npm run compile && node lib/",
    "clean": "shx rm -rf test/data/",
    "coverage": "nyc npm run mocha",
    "mocha": "npm run clean && NODE_ENV=test ts-mocha \"test/**/*.ts\" --recursive --exit",
    "compile": "shx rm -rf lib/ && tsc"
  },
```

</LanguageBlock>

<LanguageBlock global-id="js">

Now we have to update the `scripts` section of our `package.json` to:

```js
  "scripts": {
    "test": "npm run eslint && npm run coverage",
    "coverage": "nyc npm run mocha",
    "eslint": "eslint src/. test/. --config .eslintrc.json",
    "dev": "nodemon src/",
    "start": "node src/",
    "clean": "shx rm -rf test/data/",
    "mocha": "npm run clean && NODE_ENV=test mocha test/ --recursive --exit"
  },
```

</LanguageBlock>

On Windows, the `coverage` command looks like this:

```sh
npm run clean & SET NODE_ENV=test& nyc mocha
```

Now run:

```sh
npm test
```

This will print out some additional coverage information.

<BlockQuote type="warning" label="Important">

When using Git for version control, the `.nyc_output/` folder should be added to `.gitignore`.

</BlockQuote>

## What's next?

That’s it! Our chat guide is completed! We now have a fully-tested REST and real-time API, with a plain JavaScript frontend including login and signup. Follow up in the [Feathers API documentation](../../api/) for more details about using Feathers, or start building your own first Feathers application!
