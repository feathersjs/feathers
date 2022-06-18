---
outline: deep
---

# API

This section describes all the individual modules and APIs of Feathers. There are three main sections of the API:

- __Core:__ The Feathers core functionality that can be used on the server and the client
- __Server:__ Feathers server side modules used with Core when creating an API server in NodeJS
- __Client:__ Modules used on the client (NodeJS, browser or React Native) together with Core when connecting to a Feathers API server.

 Here is an overview how the individual sections of the API documentation fit together:

![Feathers Architecture overview](./assets/architecture-overview.svg)

## Core

Feathers core functionality that works on the client and the server

- [Application](application) - The main Feathers application API
- [Services](services) - Service objects and their methods and Feathers specific functionality
- [Hooks](hooks) - Pluggable middleware for service  methods
- [Events](events) - Events sent by Feathers service methods
- [Errors](errors) - A collection of error classes used throughout Feathers

## Transports

Expose a Feathers application as an API server

- [Koa](koa) - Feathers KoaJS framework bindings, REST API provider and error middleware.
- [Express](express) - Feathers Express framework bindings, REST API provider and error middleware.
- [Socket.io](socketio) - The Socket.io real-time transport provider
- [Configuration](configuration) - A node-config wrapper to initialize configuration of a server side application.
- [Channels](channels) - Decide what events to send to connected real-time clients

## Client

More details on how to use Feathers on the client

- [Usage](client) - Feathers client usage in Node, React Native and the browser (also with Webpack and Browserify)
- [REST](client/rest) - Feathers client and direct REST API server usage
- [Socket.io](client/socketio) - Feathers client and direct Socket.io API server usage

## Authentication

Feathers authentication mechanism

- [Service](authentication/service) - The main authentication service configuration
- [Strategies](authentication/strategy) - More about authentication strategies
- [Local](authentication/local) - Local email/password authentication
- [JWT](authentication/jwt) - JWT authentication
- [OAuth](authentication/oauth) - Using OAuth logins (Facebook, Twitter etc.)
- [Client](authentication/client) - A client for a Feathers authentication server

## Databases

Feathers common database adapter API and querying mechanism

- [Adapters](databases/adapters) - A list of supported database adapters
- [Common API](databases/common) - Database adapter common initialization and configuration API
- [Querying](databases/querying) - The common querying mechanism
- [Memory Adapter](databases/memory) - The adapter for in-memory data storage
- [MongoDB Adapter](databases/mongodb) - The adapter for MongoDB databases
- [Knex Adapter](databases/knex) - The adapter for SQL databases using KnexJS