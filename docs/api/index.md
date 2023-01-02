---
outline: deep
---

# API

This section describes all the individual modules and APIs of Feathers.

## Core

Feathers core functionality that works on the client and the server

- [Application](./application.md) - The main Feathers application API
- [Services](./services.md) - Service objects and their methods and Feathers specific functionality
- [Hooks](./hooks.md) - Pluggable middleware for service methods
- [Events](./events.md) - Events sent by Feathers service methods
- [Errors](./errors.md) - A collection of error classes used throughout Feathers

## Transports

Expose a Feathers application as an API server

- [Configuration](./configuration.md) - A node-config wrapper to initialize configuration of a server side application.
- [Koa](./koa.md) - Feathers KoaJS framework bindings, REST API provider and error middleware.
- [Express](./express.md) - Feathers Express framework bindings, REST API provider and error middleware.
- [Socket.io](./socketio.md) - The Socket.io real-time transport provider
- [Channels](./channels.md) - Channels are used to send real-time events to clients

## Authentication

Feathers authentication mechanism

- [Service](./authentication/service.md) - The main authentication service configuration
- [Hook](./authentication/hook.md) - The hook used to authenticate service method calls
- [Strategies](./authentication/strategy.md) - More about authentication strategies
- [Local](./authentication/local.md) - Local email/password authentication
- [JWT](./authentication/jwt.md) - JWT authentication
- [OAuth](./authentication/oauth.md) - Using OAuth logins (Facebook, Twitter etc.)

## Client

More details on how to use Feathers on the client

- [Usage](./client.md) - Feathers client usage in Node, React Native and the browser (also with Webpack and Browserify)
- [REST](./client/rest.md) - Feathers client and direct REST API server usage
- [Socket.io](./client/socketio.md) - Feathers client and direct Socket.io API server usage
- [Authentication](authentication/client) - A client for Feathers authentication

## Schema

Model definitions for validating and resolving data.

- [TypeBox](./schema/typebox.md) - Integration for TypeBox, a JSON schema type builder
- [JSON schema](./schema/schema.md) - JSON schema integration
- [Validators](./schema/validators.md) - Schema validators and validation hooks
- [Resolvers](./schema/resolvers.md) - Dynamic data resolvers

## Databases

Feathers common database adapter API and querying mechanism

- [Adapters](./databases/adapters.md) - A list of supported database adapters
- [Common API](./databases/common.md) - Database adapter common initialization and configuration API
- [Querying](./databases/querying.md) - The common querying mechanism
- [MongoDB](./databases/querying.md) - The adapter for MongoDB databases
- [SQL](./databases/knex.md) - The adapter for SQL databases using KnexJS
- [Memory](./databases/memory.md) - The adapter for in-memory data storage
