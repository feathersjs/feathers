---
layout: page
title: Learn
description: Learn how to get the most out of Feathers
permalink: /learn/
weight: 2
---

So you're ready to learn more about Feathers, eh? If you haven't checked out the [Quick Start guide](/quick-start/) head over there first to get a brief intro to the basic parts of a Feathers app. On this page you'll find additional resources and guides about to do more with Feathers.

## Front-end Frameworks

Feathers works great with any front-end that connects through HTTP/HTTPS or websockets to your Feathers REST API. Sometimes it is just a few lines of code to make a front-end turn real-time. To help you out we've provided some simple TodoMVC style examples and guides that all connect to the same Feathers real-time API ([todos.feathersjs.com](http://todos.feathersjs.com)):

- [jQuery]()
- [React]()
- [Angular]()
- [CanJS]()
- [iOS]()
- [Android]()

We can't possibly support or no about all the frameworks out there so if you don't see your favourite, submit an issue or - even better - a pull request and we'll try our best to make it happen.

## Databases

Feathers already has plug-ins for CRUD (Create, Read, Update, Delete) operations on many different databases. All plug-ins provide a common way to filter, sort and limit records which makes switching between databases super easy. Our [MongoDB guide]() goes into a bit more detail on how to use Feathers with MongoDB (**spoiler:** it's only 16 lines of code to build a complete REST and real-time API with a MongoDB backend). For more information about other databases visit their very own plug-in page:

- [In memory]() - A service that stores everything locally in memory. Probably not ideal in production environments but great for prototyping.
- [MongoDB]() - A basic MongoDB implementation, easy to use.
- [Mongoose]() - Support for the MongoDB ODM which gives you schemas and validation out of the box.
- [NeDB]() - A file based database similar to MongoDB. Great if you want to ship your application and use it without having to set up a datbase server.
- [MySQL]() - A basic MySQL/MariaDB implementation.
- [PostgreSQL]() - A basic PostgreSQL implementation.

If you need to customize those existing adapters they can be easily extended or you can use hooks. Read more about hooks in the next paragraph.

## Hooks and validation

While not part of the core, [feathers-hooks]() is a powerful plug-in that allows you to customize service method execution with small pluggable, reusable methods (concerns), very similar to Express middleware. We created a [guide on how to use hooks for validation]() and you can read more about the theory and patterns behind it [in this blog post]().

## Authentication

Since Feathers directly extends Express you can use any of its authentication mechanisms. The [Authentication Guide](/learn/authentication) describes how to set up shared authentication between HTTP and websockets using PassportJS. We'll go through how to manage sessions, set up a service for managing users, and authenticate a user.

## Authorization

Once set up with user authentication, our [Authorization Guide](/learn/authorization) will walk you through how to use hooks for user authorization and how to dispatch real-time events to only specific authenticated users.
