---
layout: page
title: Learn
description: Learn how to get the most out of Feathers
permalink: /learn/
weight: 2
---

So you're ready to learn more about Feathers, eh? If you haven't checked out the [Quick Start guide](/quick-start/) head over there first to get a brief intro to the basic parts of a Feathers app. On this page you'll find additional resources and guides how to do more with Feathers.

## API docs

For the API documentation with detailed information about the Feathers specific API, configuration and to see the changelog and license head over to the [Docs](/docs/) page.

## Frontend Frameworks

Feathers works great with any front-end that connects through HTTP/HTTPS or websockets to your Feathers REST API. Sometimes it is just a few lines of code to make a front-end turn real-time. To help you out we've provided some simple TodoMVC style examples and guides that all connect to the same Feathers real-time API ([todos.feathersjs.com](http://todos.feathersjs.com)):

- [jQuery](http://feathersjs.github.io/todomvc/feathers/jquery/)
- [React](http://feathersjs.github.io/todomvc/feathers/react/)
- [Angular](http://feathersjs.github.io/todomvc/feathers/angularjs/)
- [CanJS](http://feathersjs.github.io/todomvc/feathers/canjs/)

We don't know all the frameworks out there so if you don't see your favourite, submit an issue or - even better - a pull request and we'll try our best to make it happen.

## Databases

Feathers already has plug-ins for *Create, Read, Update and Delete* operations on many different databases. All plug-ins provide a common way to filter, sort and limit records, which makes switching between databases super easy. Our [MongoDB guide](/learn/mongodb) goes into a bit more detail on how to use Feathers with MongoDB (**spoiler:** it's only 16 lines of code to build a complete REST and real-time API with a MongoDB backend). For more information about other databases visit their own plug-in page:

- [In memory](https://github.com/feathersjs/feathers-memory) - A service that stores everything locally in memory. Probably not ideal in production environments but great for prototyping.
- [MongoDB](https://github.com/feathersjs/feathers-mongodb) - A basic MongoDB implementation, easy to use.
- [Mongoose](https://github.com/feathersjs/feathers-mongoose) - Support for the MongoDB ODM which gives you schemas and validation out of the box.
- [NeDB](https://github.com/feathersjs/feathers-nedb) - A file based database similar to MongoDB. Great if you want to ship your application and use it without having to set up a datbase server.
- [MySQL](https://github.com/feathersjs/feathers-mysql)
- [PostgreSQL](https://github.com/feathersjs/feathers-postgresql)

If you are wondering how to customize those existing adapters and make it easier to switch between different databases, read more about hooks in the next paragraph.

## Hooks and validation

While not part of the core, [feathers-hooks](https://github.com/feathersjs/feathers-hooks) is a powerful plugin that allows to customize service method execution with small pluggable, reusable Lego-pieces very similar to Express middleware. We created a [guide how to use hooks for validation](/learn/validation/) and you can read more about the theory and patterns behind it [in this blog post](https://medium.com/all-about-feathersjs/api-service-composition-with-hooks-47af13aa6c01).

## Authentication

Since Feathers directly extends Express you can use any of its authentication mechanism. The [Authentication Guide](/learn/authentication) describes more specifically how to set up shared authentication between HTTP and websockets using PassportJS, sessions and a service for managing users.

## Authorization

Once set up with user authentication, our [Authorization Guide](/learn/authorization) talks about how to use hooks for user authorization and how to dispatch real-time events only to specific authenticated users.
