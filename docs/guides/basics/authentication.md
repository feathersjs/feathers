---
outline: deep
---

# Authentication

We now have a fully functional chat application consisting of [services](./services.md) and [schemas](./schemas.md). The services come with authentication enabled by default, so before we can use it we need to create a new user and learn how Feathers authentication works. We will look at authenticating our REST API, and then how to authenticate with Feathers in the browser.

## Registering a user

Although the frontend we will create [JavaScript Frontend chapter](../frontend/javascript.md) will allow to register new users, let's have a quick look at how the REST API can be used directly to register a new user. We can do this by sending a POST request to `http://localhost:3030/users` with JSON data like this as the body:

```js
// POST /users
{
  "email": "hello@feathersjs.com",
  "password": "supersecret"
}
```

Try it:

```sh
curl 'http://localhost:3030/users/' \
  -H 'Content-Type: application/json' \
  --data-binary '{ "email": "hello@feathersjs.com", "password": "supersecret" }'
```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/6bcea48aac6c7494c2ad)

<BlockQuote type="note">

For SQL databases, creating a user with the same email address will only work once, then fail since it already exists in the database.

</BlockQuote>

This will return something like this:

```json
{
  "id": "<user id>",
  "email": "hello@feathersjs.com",
  "avatar": "https://s.gravatar.com/avatar/ffe2a09df37d7c646e974a2d2b8d3e03?s=60"
}
```

Which means our user has been created successfully.

<BlockQuote type="note">

The password is stored securely in the database but will never be included in a response to an external client.

</BlockQuote>

## Get a token

By default, Feathers uses [JSON web token](https://jwt.io/) for authentication. It is an access token that is valid for a limited time (one day by default) that is issued by the Feathers server and needs to be sent with every API request that requires authentication. Usually a token is issued for a specific user and in our case we want a JWT for the user we just created.

<BlockQuote type="tip">

If you are wondering why Feathers is using JWT for authentication, have a look at [this FAQ](../../help/faq.md#why-are-you-using-jwt-for-sessions).

</BlockQuote>

Tokens can be created by sending a POST request to the `/authentication` endpoint (which is the same as calling the `create` method on the `authentication` service set up in `src/authentication`) and passing the authentication strategy you want to use. To get a token for an existing user through a username (email) and password login we can use the built-in `local` authentication strategy with a request like this:

```js
// POST /authentication
{
  "strategy": "local",
  "email": "hello@feathersjs.com",
  "password": "supersecret"
}
```

Try it:

```sh
curl 'http://localhost:3030/authentication/' \
  -H 'Content-Type: application/json' \
  --data-binary '{ "strategy": "local", "email": "hello@feathersjs.com", "password": "supersecret" }'
```

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/6bcea48aac6c7494c2ad)

This will return something like this:

```json
{
  "accessToken": "<JWT for this user>",
  "authentication": {
    "strategy":"local"
  },
  "user":{
    "id":"<user id>",
    "email":"hello@feathersjs.com",
    "avatar":"https://s.gravatar.com/avatar/ffe2a09df37d7c646e974a2d2b8d3e03?s=60",
  }
}
```

The `accessToken` can now be used for other REST requests that require authentication by sending the `Authorization: Bearer <JWT for this user>` HTTP header.

<BlockQuote type="tip">

For more information about the direct usage of the REST API see the [REST client API](../../api/client/rest.md) and for websockets the [Socket.io client API](../../api/client/socketio.md).

</BlockQuote>

## Browser authentication

When using Feathers on the client, the authentication client does all those authentication steps for us automatically. It stores the access token as long as it is valid so that a user does not have to log in every time they visit our site and sends it with every request. It also takes care of making sure that the user is always authenticated again, for example after they went offline for a bit. Since we will need it in the [building a frontend chapter](../frontend/javascript.md), let's update the existing `public/index.html` file like this:

```html
<html lang="en">
  <head>
    <meta http-equiv="content-type" content="text/html; charset=utf-8">
    <meta name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0" />
    <title>FeathersJS chat</title>
    <link rel="shortcut icon" href="favicon.ico">
    <link rel="stylesheet" href="//unpkg.com/feathers-chat@4.0.0/public/base.css">
    <link rel="stylesheet" href="//unpkg.com/feathers-chat@4.0.0/public/chat.css">
  </head>
  <body>
    <div id="app" class="flex flex-column"></div>
    <script src="//cdnjs.cloudflare.com/ajax/libs/moment.js/2.12.0/moment.js"></script>
    <script src="//unpkg.com/@feathersjs/client@^5.0.0-pre.24/dist/feathers.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="client.js"></script>
  </body>
</html>
```

Create a new file `public/client.js` where we can now set up the Feathers client similar to the [getting started example](./starting.md). We also add a `login` method that first tries to use a stored token by calling `app.reAuthenticate()`. If that fails, we try to log in with email/password of our registered user:

```js
// Establish a Socket.io connection
const socket = io();

// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();
client.configure(feathers.socketio(socket));

// Use localStorage to store our login token
client.configure(feathers.authentication({
  storage: window.localStorage
}));

const login = async () => {
  try {
    // First try to log in with an existing JWT
    return await client.reAuthenticate();
  } catch (error) {
    // If that errors, log in with email/password
    // Here we would normally show a login page
    // to get the login information
    return await client.authenticate({
      strategy: 'local',
      email: 'hello@feathersjs.com',
      password: 'supersecret'
    });
  }
};

const main = async () => {
  const auth = await login();

  console.log('User is authenticated', auth);

  // Log us out again
  await client.logout();
};

main();
```

If you now open the console and visit 

```
http://localhost:3030
```

you will see that our user has been authenticated.

## What's next?

Sweet! We now have an API that can register new users with email/password. This means we have everything we need to a frontend for our chat application. You have your choice of

- [Plain JavaScipt](../frontend/javascript.md)
- [React](../frontend/react.md)
- [VueJS](../frontend/vuejs.md)
- [And More](../frameworks.md)
