---
outline: deep
---

# Service Shared

The `<service>.shared` file contains variables and type declarations that are shared between the [client](./client.md) and the [server application](./app.md). It can also be used for shared utility functions or schemas (e.g. for client side validation).

## Variables

By default two shared variables are exported:

- `<name>Path` - The path of the service. Changing this will change the path for the service in all places like the application, the client and types
- `<name>Methods` - The list of service methods available to the client. This can be updated with service and custom methods a client should be able to use.

## Client setup

This file also includes the client side service registration which will be included in the [client](./client.md). It will register a client side service based on the shared path and methods.
