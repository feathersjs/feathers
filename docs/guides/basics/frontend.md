# Building a frontend

As we have seen [when getting started](./starting.md), Feathers works great in the browser and comes with client services that allow to easily connect to a Feathers server.

In this chapter we will create a real-time chat frontend with signup and login using modern plain JavaScript. It will only work in the latest versions of Chrome, Firefox, Safari and Edge since we won't be using a transpiler like Webpack or Babel (which is also why there won't be a TypeScript option). The final version can be found [here](https://github.com/feathersjs/feathers-chat/).

![The Feathers chat application](./assets/feathers-chat.png)

> __Note:__ We will not be using a frontend framework so we can focus on what Feathers is all about. Feathers is framework agnostic and can be used with any frontend framework like React, VueJS or Angular. For more information see the [frameworks section](../frameworks.md).

## Set up the page

First, let's update `public/index.html` to initialize everything we need for the chat frontend:

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
    <script src="//unpkg.com/@feathersjs/client@^4.3.0/dist/feathers.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="client.js"></script>
  </body>
</html>
```

This will load our chat CSS style, add a container div `#app` and load several libraries:

- The browser version of Feathers (since we are not using a module loader like Webpack or Browserify)
- Socket.io provided by the chat API
- [MomentJS](https://momentjs.com/) to format dates
- A `client.js` for our code to live in

Let’s create `public/client.js` where all the following code will live. Each of the following code samples should be added to the end of that file.

## Connect to the API

We’ll start with the most important thing first, the connection to our Feathers API that connects to our server using websockets and initializes the [authentication client](./authentication.md):

```js
/* global io, feathers, moment */
// Establish a Socket.io connection
const socket = io();
// Initialize our Feathers client application through Socket.io
// with hooks and authentication.
const client = feathers();

client.configure(feathers.socketio(socket));
// Use localStorage to store our login token
client.configure(feathers.authentication());
```

## Base HTML

Next, we have to define some static and dynamic HTML that we can insert into the page when we want to show the login page (which also doubles as the signup page) and the actual chat interface:

```js
// Login screen
const loginHTML = `<main class="login container">
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet text-center heading">
      <h1 class="font-100">Log in or signup</h1>
    </div>
  </div>
  <div class="row">
    <div class="col-12 col-6-tablet push-3-tablet col-4-desktop push-4-desktop">
      <form class="form">
        <fieldset>
          <input class="block" type="email" name="email" placeholder="email">
        </fieldset>

        <fieldset>
          <input class="block" type="password" name="password" placeholder="password">
        </fieldset>

        <button type="button" id="login" class="button button-primary block signup">
          Log in
        </button>

        <button type="button" id="signup" class="button button-primary block signup">
          Sign up and log in
        </button>

        <a class="button button-primary block" href="/oauth/github">
          Login with GitHub
        </a>
      </form>
    </div>
  </div>
</main>`;

// Chat base HTML (without user list and messages)
const chatHTML = `<main class="flex flex-column">
  <header class="title-bar flex flex-row flex-center">
    <div class="title-wrapper block center-element">
      <img class="logo" src="http://feathersjs.com/img/feathers-logo-wide.png"
        alt="Feathers Logo">
      <span class="title">Chat</span>
    </div>
  </header>

  <div class="flex flex-row flex-1 clear">
    <aside class="sidebar col col-3 flex flex-column flex-space-between">
      <header class="flex flex-row flex-center">
        <h4 class="font-300 text-center">
          <span class="font-600 online-count">0</span> users
        </h4>
      </header>

      <ul class="flex flex-column flex-1 list-unstyled user-list"></ul>
      <footer class="flex flex-row flex-center">
        <a href="#" id="logout" class="button button-primary">
          Sign Out
        </a>
      </footer>
    </aside>

    <div class="flex flex-column col col-9">
      <main class="chat flex flex-column flex-1 clear"></main>

      <form class="flex flex-row flex-space-between" id="send-message">
        <input type="text" name="text" class="flex flex-1">
        <button class="button-primary" type="submit">Send</button>
      </form>
    </div>
  </div>
</main>`;

// Helper to safely escape HTML
const escape = str => str.replace(/&/g, '&amp;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Add a new user to the list
const addUser = user => {
  const userList = document.querySelector('.user-list');

  if(userList) {
    // Add the user to the list
    userList.innerHTML += `<li>
      <a class="block relative" href="#">
        <img src="${user.avatar}" alt="" class="avatar">
        <span class="absolute username">${escape(user.name || user.email)}</span>
      </a>
    </li>`;

    // Update the number of users
    const userCount = document.querySelectorAll('.user-list li').length;
    
    document.querySelector('.online-count').innerHTML = userCount;
  }
};

// Renders a message to the page
const addMessage = message => {
  // The user that sent this message (added by the populate-user hook)
  const { user = {} } = message;
  const chat = document.querySelector('.chat');
  // Escape HTML to prevent XSS attacks
  const text = escape(message.text);

  if(chat) {
    chat.innerHTML += `<div class="message flex flex-row">
      <img src="${user.avatar}" alt="${user.name || user.email}" class="avatar">
      <div class="message-wrapper">
        <p class="message-header">
          <span class="username font-600">${escape(user.name || user.email)}</span>
          <span class="sent-date font-300">${moment(message.createdAt).format('MMM Do, hh:mm:ss')}</span>
        </p>
        <p class="message-content font-300">${text}</p>
      </div>
    </div>`;

    // Always scroll to the bottom of our message list
    chat.scrollTop = chat.scrollHeight - chat.clientHeight;
  }
};
```

This will add the following variables and functions:

- `loginHTML` contains some static HTML for the login/signup page
- `chatHTML` contains the main chat page content (once a user is logged in)
- `addUser(user)` is a function to add a new user to the user list on the left
- `addMessage(message)` is a function to add a new message to the list. It will also make sure that we always scroll to the bottom of the message list as messages get added

## Displaying pages

Next, we'll add two functions to display the login and chat page, where we'll also add a list of the 25 newest chat messages and the registered users.

```js
// Show the login page
const showLogin = (error) => {
  if(document.querySelectorAll('.login').length && error) {
    document.querySelector('.heading').insertAdjacentHTML('beforeend', `<p>There was an error: ${error.message}</p>`);
  } else {
    document.getElementById('app').innerHTML = loginHTML;
  }
};

// Shows the chat page
const showChat = async () => {
  document.getElementById('app').innerHTML = chatHTML;

  // Find the latest 25 messages. They will come with the newest first
  const messages = await client.service('messages').find({
    query: {
      $sort: { createdAt: -1 },
      $limit: 25
    }
  });
  
  // We want to show the newest message last
  messages.data.reverse().forEach(addMessage);

  // Find all users
  const users = await client.service('users').find();

  // Add each user to the list
  users.data.forEach(addUser);
};
```

- `showLogin(error)` will either show the content of loginHTML or, if the login page is already showing, add an error message. This will happen when you try to log in with invalid credentials or sign up with a user that already exists.
- `showChat()` does several things. First, we add the static chatHTML to the page. Then we get the latest 25 messages from the messages Feathers service (this is the same as the `/messages` endpoint of our chat API) using the Feathers query syntax. Since the list will come back with the newest message first, we need to reverse the data. Then we add each message by calling our `addMessage` function so that it looks like a chat app should — with old messages getting older as you scroll up. After that we get a list of all registered users to show them in the sidebar by calling addUser.

## Login and signup

Alright. Now we can show the login page (including an error message when something goes wrong) and if we are logged in call the `showChat` we defined above. We’ve built out the UI, now we have to add the functionality to actually allow people to sign up, log in and also log out.

```js
// Retrieve email/password object from the login/signup page
const getCredentials = () => {
  const user = {
    email: document.querySelector('[name="email"]').value,
    password: document.querySelector('[name="password"]').value
  };

  return user;
};

// Log in either using the given email/password or the token from storage
const login = async credentials => {
  try {
    if(!credentials) {
      // Try to authenticate using an existing token
      await client.reAuthenticate();
    } else {
      // Otherwise log in with the `local` strategy using the credentials we got
      await client.authenticate({
        strategy: 'local',
        ...credentials
      });
    }

    // If successful, show the chat page
    showChat();
  } catch(error) {
    // If we got an error, show the login page
    showLogin(error);
  }
};
```

- `getCredentials()` gets us the values of the username (email) and password fields from the login/signup page to be used directly with Feathers authentication.
- `login(credentials)` will either authenticate the credentials returned by getCredentials against our Feathers API using the local authentication strategy (e.g. username and password) or, if no credentials are given, try and use the JWT stored in localStorage. This will try and get the JWT from localStorage first where it is put automatically once you log in successfully so that we don’t have to log in every time we visit the chat. Only if that doesn’t work it will show the login page. Finally, if the login was successful it will show the chat page.

## Event listeners and real-time

In the last step we will add event listeners for all buttons and functionality to send new message and make the user and message list update in real-time.

```js
const addEventListener = (selector, event, handler) => {
  document.addEventListener(event, async ev => {
    if (ev.target.closest(selector)) {
      handler(ev);
    }
  });
};

// "Signup and login" button click handler
addEventListener('#signup', 'click', async () => {
  // For signup, create a new user and then log them in
  const credentials = getCredentials();
    
  // First create the user
  await client.service('users').create(credentials);
  // If successful log them in
  await login(credentials);
});

// "Login" button click handler
addEventListener('#login', 'click', async () => {
  const user = getCredentials();

  await login(user);
});

// "Logout" button click handler
addEventListener('#logout', 'click', async () => {
  await client.logout();
    
  document.getElementById('app').innerHTML = loginHTML;
});

// "Send" message form submission handler
addEventListener('#send-message', 'submit', async ev => {
  // This is the message text input field
  const input = document.querySelector('[name="text"]');

  ev.preventDefault();

  // Create a new message and then clear the input field
  await client.service('messages').create({
    text: input.value
  });

  input.value = '';
});

// Listen to created events and add the new message in real-time
client.service('messages').on('created', addMessage);

// We will also see when new users get created in real-time
client.service('users').on('created', addUser);

// Call login right away so we can show the chat window
// If the user can already be authenticated
login();
```

- `addEventListener` is a helper function that lets us add listeners to elements that get added or removed dynamically
- We also added click event listeners for three buttons. `#login` will get the credentials and just log in with those. Clicking `#signup` will signup and log in at the same time. It will first create a new user on our API and then log in with that same user information. Finally, `#logout` will forget the JWT and then show the login page again.
- The `#submit` button event listener gets the message text from the input field, creates a new message on the messages service and then clears out the field.
- Next, we added two `created` event listeners. One for `messages` which calls the `addMessage` function to add the new message to the list and one for `users` which adds the user to the list via `addUser`. This is how Feathers does real-time and everything we need to do in order to get everything to update automatically.
- To kick our application off, we call `login()` which as mentioned above will either show the chat application right away (if we signed in before and the token isn’t expired) or the login page.

## Using the chat application

That’s it. We now have a plain JavaScript real-time chat frontend with login and signup. This example demonstrates many of the basic principles of how you interact with a Feathers API. You can log in with your GitHub account by following the "Login with GitHub" button, with the email (`hello@feathersjs.com`) and password (`supersecret`) from the user we registered in the [authentication chapter](./authentication.md) or sign up and log in with a different email address.

If you run into an issue, remember you can find the complete working example at

:::: tabs :options="{ useUrlFragment: false }"
::: tab "JavaScript"
The [feathersjs/feathers-chat](https://github.com/feathersjs/feathers-chat) repository
:::
::: tab "TypeScript"
The [feathersjs/feathers-chat-ts](https://github.com/feathersjs/feathers-chat-ts) repository
:::
::::

## What's next?

In the final chapter, we'll look at [how to write automated tests for our API](./testing.md).
