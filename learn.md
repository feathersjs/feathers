---
layout: page
title: Learn
description: Learn how to get the most out of Feathers
permalink: /learn/
weight: 2
---

On this page you can find additional resources and guides about Feathers. Make sure to first get familiar with the basics in the [Quick Start guide](/quick-start/).

## API docs

For the API documentation with detailed information about the Feathers specific API, configuration and to see the changelog and license head over to the [Docs](/docs/) page.

## Frontend Frameworks

Feathers works great with any frontend that can connect through the REST API or websockets. Sometimes it is just a few lines of code to make a frontend turn real-time which is why implemented some TodoMVC examples and guides that all connect to the same Feathers real-time API:

- [jQuery]()
- [React]()
- [Angular]()
- [CanJS]()
- [iOS]()
- [Android]()

We don't know all the frameworks out there so if you don't see your favourite, submit an issue or - even better - a pull request and we'll try our best to make it happen.

## Databases

Feathers already has plugins for CRUD operations on many different databases. All plugins provide a common way to filter, sort and limit records to make switching between databases easier. Our [MongoDB guide]() goes a little more into detail how to use Feathers with MongoDB (spoiler: it's only 16 lines of code to build a complete REST and real-time API with a MongoDB backend). For more information about other databases visit their plugin pages:

- [In memory]() - A service that stores everything locally in memory. Probably not ideal in production environments but great for prototyping.
- [MongoDB]() - A basic MongoDB implementation, easy to use.
- [Mongoose]() - Support for the MongoDB ODM which gives you schemas and validation out of the box.
- [NeDB]() - A file based database similar to MongoDB. Great if you want to ship your application and use it without having to set up a datbase server.
- [MySQL]()
- [PostgreSQL]()

If you are wondering how to customize those existing adapters and make it easier to switch between different databases, read more about hooks in the next paragraph.

## Hooks and validation

While not part of the core, [feathers-hooks]() is a powerful plugin that allows to customize service method execution with small pluggable, reusable Lego-pieces very similar to Express middleware. We created a [guide how to use hooks for validation]() and you can read more about the theory and patterns behind it [in this blog post]().

## Authentication

Since Feathers directly extends Express you can use any of its authentication mechanism. The [Authentication Guide](/learn/authentication) describes more specifically how to set up shared authentication between HTTP and websockets using PassportJS, sessions and a service for managing users.

## Authorization

Once set up with user authentication, our [Authorization Guide](/learn/authorization) talks about how to use hooks for user authorization and how to dispatch real-time events only to specific authenticated users.
