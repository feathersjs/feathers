---
layout: page
title: FAQ
permalink: /faq/
weight: 4
---

On this page you can find a list of Feathers related questions that came up before. Make sure to also head over to the [Express FAQ](http://expressjs.com/faq.html). As already mentioned, since Feathers directly extends Express, everything applies here as well. You are more than welcome to submit any questions as a [GitHub issue](https://github.com/feathersjs/feathers/issues) or on [Stackoverflow](http://stackoverflow.com) using the `feathers` or `feathersjs` tag.

## Why another Node web framework?

We know! Oh God another NodeJS framework! We really didn't want to add another name to the long list of NodeJS web frameworks but also wanted to explore a different approach than any other library we have seen. We strongly believe that data is the core of the web and should be the focus of web applications.

We also think that your data resources can and should be encapsulated in such a way that they can be scalable, easily testable and self contained. The classic web MVC pattern used to work well but is becoming antiquated in today's web.

## Do I get websocket events from REST calls?

## Is there a way to know where a method call came from?

Sometimes you want to allow certain service calls internally (like creating a new user) but not through the REST or Websocket API.

```js
app.use(function(req, res, next) {
  req.feathers.external = 'rest';
  next();
});

app.configure(feathers.socketio(function(io) {
  io.use(function(socket, next) {
    socket.request.feathers.external = 'socketio';
    next();
  });
}));
```

## How do I add authorization?

## Can I only send certain events?

## How can I filter my data?

## Can I add custom middleware to a service?

## How do I configure multiple servers?

## What about Koa?
