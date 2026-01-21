

# API

This section describes all the individual modules and APIs of Feathers.

## Core

Feathers core functionality that works on the client and the server

- [Application](./application) - The main Feathers application API
- [Services](./services) - Service objects and their methods and Feathers specific functionality
- [Hooks](./hooks) - Pluggable middleware for service methods
- [Events](./events) - Events sent by Feathers service methods
- [Errors](./errors) - A collection of error classes used throughout Feathers

## Transports

Expose a Feathers application as an API server

- [HTTP](./http) - Web Standard HTTP handler for Deno, Bun, Cloudflare Workers, and Node.js
- [Koa](./koa) - Feathers KoaJS framework bindings, REST API provider and error middleware.
- [Express](./express) - Feathers Express framework bindings, REST API provider and error middleware.
- [Socket.io](./socketio) - The Socket.io real-time transport provider
- [Channels](./channels) - Channels are used to send real-time events to clients
- [Configuration](./configuration) - A node-config wrapper to initialize configuration of a server side application.

## Authentication

Feathers authentication mechanism

- [Service](./authentication/service) - The main authentication service configuration
- [Hook](./authentication/hook) - The hook used to authenticate service method calls
- [Strategies](./authentication/strategy) - More about authentication strategies
- [Local](./authentication/local) - Local email/password authentication
- [JWT](./authentication/jwt) - JWT authentication
- [OAuth](./authentication/oauth) - Using OAuth logins (Facebook, Twitter etc.)

## Client

More details on how to use Feathers on the client

- [Usage](./client) - Feathers client usage in Node, React Native and the browser (also with Webpack and Browserify)
- [REST](./client/rest) - Feathers client and direct REST API server usage
- [Socket.io](./client/socketio) - Feathers client and direct Socket.io API server usage
- [Authentication](authentication/client) - A client for Feathers authentication

## Schema

Model definitions for validating and resolving data.

- [TypeBox](./schema/typebox) - Integration for TypeBox, a JSON schema type builder
- [JSON schema](./schema/schema) - JSON schema integration
- [Validators](./schema/validators) - Schema validators and validation hooks
- [Resolvers](./schema/resolvers) - Dynamic data resolvers

## Databases

Feathers common database adapter API and querying mechanism

- [Adapters](./databases/adapters) - A list of supported database adapters
- [Common API](./databases/common) - Database adapter common initialization and configuration API
- [Querying](./databases/querying) - The common querying mechanism
- [MongoDB](./databases/querying) - The adapter for MongoDB databases
- [SQL](./databases/knex) - The adapter for SQL databases using KnexJS
- [Memory](./databases/memory) - The adapter for in-memory data storage
