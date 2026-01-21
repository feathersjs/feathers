

# Server Side Rendering

Since Feathers is just an extension of Express it's really simple to render templated views on the server with data from your Feathers services. There are a few different ways that you can structure your app so this guide will show you 3 typical ways you might have your Feathers app organized.

## Rendering views from services

You probably already know that when you register a Feathers service, Feathers creates RESTful endpoints for that service automatically. Well, really those are just Express routes, so you can define your own as well.

> **ProTip:** Your own defined REST endpoints won't work with hooks and won't emit socket events. If you find you need that functionality it's probably better for you to turn your endpoints into a minimal Feathers service.

Let's say you want to render a list of messages from most recent to oldest using the [Pug](https://pugjs.org/) template engine.

```js
// You've set up your main Feathers app already

// Register your view engine
app.set('view engine', 'pug');

// Register your message service
app.use('/api/messages', memory());

// Inside your main Feathers app
app.get('/messages', function(req, res, next){
  // You namespace your feathers service routes so that
  // don't get route conflicts and have nice URLs.
  app.service('api/messages')
    .find({ query: {$sort: { updatedAt: -1 } } })
    .then(result => res.render('message-list', result.data))
    .catch(next);
});
```

Simple right? We've now rendered a list of messages using the `/views/message-list.pug` view template. All your hooks will get triggered just like they would normally so you can use hooks to pre-filter your data and keep your template rendering routes super tight. See [Using Template Engines with Express](https://expressjs.com/en/guide/using-template-engines.html) for more information.

> **ProTip:** If you call a Feathers service "internally" (ie. not over sockets or REST) you won't have a `context.params.provider` attribute. This allows you to have hooks only execute when services are called externally vs. from your own code.

## Using authentication

Feathers is by default stateless and does not use any sessions. You already can protect Express endpoints with the [express.authenticate](../../api/express#express-authenticate) middleware, however this will only work when passing the `Authorization` header (usually with a JWT) which a normal browser request does not support.

In order to render authenticated pages, [express-session](https://www.npmjs.com/package/express-session) can be used to add the authentication information to the (browser) session:

> npm i express-session --save

Now you can add the following to `src/middleware/index.js|ts`:

```js
const session = require('express-session');
const { authenticate } = require('@feathersjs/express');

// This sets `req.authentication` from the information added to the session
const setSessionAuthentication = (req, res, next) => {
  req.authentication = req.session.authentication;
  next();
};

module.exports = function (app) {
  // Initialize Express-session - might have to be configured
  // with a persisten storage adapter (like Redis)
  app.use(session({
    secret: 'session-secret',
    saveUninitialized: false,
    resave: true
  }));

  // An endpoint that you can POST to with `email` and `password` that
  // will then perform a local user authentication
  // e.g <form action="/login" method="post"></form>
  app.post('/login', async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // Run normal local authentication through our service
      const { accessToken } = await app.service('authentication').create({
        strategy: 'local',
        email,
        password
      });

      // Register the JWT authentication information on the session
      req.session.authentication = {
        strategy: 'jwt',
        accessToken
      };

      // Redirect to an authenticated page
      res.redirect('/hello');
    } catch (error) {
      next(error);
    }
  });

  // Remove the authentication information from the session to log out
  app.get('logout', (req, res) => {
    delete req.session.authentication;
    res.end('You are now logged out');
  });

  // Renders an authenticated page or an 401 error page
  // Always needs `setSessionAuthentication, authenticate('jwt')` middleware first
  app.get('/hello', setSessionAuthentication, authenticate('jwt'), (req, res) => {
    res.end(`Authenticated page with user ${req.user.email}`);
  });
};
```
