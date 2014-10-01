## Changelog

__[1.0.0](https://github.com/feathersjs/feathers/issues?q=milestone%3A1.0.0)__

- Remove app.lookup and make the functionality available as app.service ([#94](https://github.com/feathersjs/feathers/pull/94))
- Allow not passing parameters in websocket calls ([#92](https://github.com/feathersjs/feathers/pull/91))
- Add _setup method ([#91](https://github.com/feathersjs/feathers/pull/91))
- Throw an error when registering a service after application start ([#78](https://github.com/feathersjs/feathers/pull/78))
- Send socket parameters as params.query ([#72](https://github.com/feathersjs/feathers/pull/72))
- Send HTTP 201 and 204 status codes ([#71](https://github.com/feathersjs/feathers/pull/71))
- Upgrade to SocketIO 1.0 ([#70](https://github.com/feathersjs/feathers/pull/70))
- Upgrade to Express 4.0 ([#55](https://github.com/feathersjs/feathers/pull/55), [#54](https://github.com/feathersjs/feathers/issues/54))
- Allow service methods to return a promise ([#59](https://github.com/feathersjs/feathers/pull/59))
- Allow to register services with custom middleware ([#56](https://github.com/feathersjs/feathers/pull/56))
- REST provider should not be added by default ([#53](https://github.com/feathersjs/feathers/issues/53))

__[0.4.0](https://github.com/feathersjs/feathers/issues?q=milestone%3A0.4.0)__

- Allow socket provider event filtering and params passthrough ([#49](https://github.com/feathersjs/feathers/pull/49), [#50](https://github.com/feathersjs/feathers/pull/50), [#51](https://github.com/feathersjs/feathers/pull/51))
- Added `patch` support ([#47](https://github.com/feathersjs/feathers/pull/47))
- Allow to configure REST handler manually ([#40](https://github.com/feathersjs/feathers/issues/40), [#52](https://github.com/feathersjs/feathers/pull/52))


__0.3.2__

- Allows Feathers to use other Express apps ([#46](https://github.com/feathersjs/feathers/pull/46))
- Updated dependencies and switched to Lodash ([#42](https://github.com/feathersjs/feathers/pull/42))

__0.3.1__

- REST provider refactoring ([#35](https://github.com/feathersjs/feathers/pull/35)) to make it easier to develop plugins
- HTTP requests now return 405 (Method not allowed) when trying to access unavailable service methods ([#35](https://github.com/feathersjs/feathers/pull/35))

__0.3.0__

- Added [Primus](https://github.com/primus/primus) provider ([#34](https://github.com/feathersjs/feathers/pull/34))
- `app.setup(server)` to support HTTPS (and other functionality that requires a custom server) ([#33](https://github.com/feathersjs/feathers/pull/33))
- Removed bad SocketIO configuration ([#19](https://github.com/feathersjs/feathers/issues/19))
- Add .npmignore to not publish .idea folder ([#30](https://github.com/feathersjs/feathers/issues/30))
- Remove middleware: connect.bodyParser() ([#27](https://github.com/feathersjs/feathers/pull/27))

__0.2.0__

- Pre-initialize `req.feathers` in REST provider to set service parameters
- Allowing to initialize services with or without slashes to be more express-compatible

__0.1.0__

- First beta release
- Directly extends Express
- Removed built in services and moved to [Legs](https://github.com/feathersjs/legs)
- Created [example repository](https://github.com/feathersjs/examples)

__0.0.x__

- Initial test alpha releases
