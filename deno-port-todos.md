# Pending fixes

- feathers/src/dependencies.ts
  - Where is the `events.js` file we need?
- feathers/src/events.ts
  - `service.on` and `service.emit`
- feathers/src/application.ts
  - LegacyHookMap and HookMap types
- feathers/src/index.ts
  - typeof module
- feathers/src/service.ts
  - serviceOptions.methods
- authentication/src/service.ts
  - Why is transport-commons imported?
  - How do we handle `declare module '@feathersjs/feathers/lib/declarations' {`?
- transport-commons/src/channels/index.ts
  - How do we handle `declare module '@feathersjs/feathers/lib/declarations' {`?
- transport-commons/src/routing/index.ts
  - How do we handle `declare module '@feathersjs/feathers/lib/declarations' {`?
- transport-commons/src/socket/utils.ts
  - process.env.NODE_ENV
- client
  - Webpack build?

## Fix imports

- authentication/src/core.ts
- authentication/src/jwt.ts
- authentication/src/service.ts

## Additional Tasks

- [ ] Make a new websocket package for Deno.
- [ ] Make a new rest package for Deno.
- [ ] Publish sift to Deno: https://github.com/crcn/sift.js/issues/238
