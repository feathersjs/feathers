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
- [Channels](./channels) - Channels are used to send real-time events to clients

## Client

More details on how to use Feathers on the client

- [Usage](./client) - Feathers client usage in Node, React Native and the browser (also with Webpack and Browserify)
- [REST](./client/rest) - Feathers client and direct REST API server usage
- [Socket.io](./client/socketio) - Feathers client and direct Socket.io API server usage
