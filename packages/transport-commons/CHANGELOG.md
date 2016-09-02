# Change Log

## [v2.3.1](https://github.com/feathersjs/feathers-socket-commons/tree/v2.3.1) (2016-09-02)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v2.3.0...v2.3.1)

**Merged pull requests:**

- Make service off method be namespaced [\#26](https://github.com/feathersjs/feathers-socket-commons/pull/26) ([t2t2](https://github.com/t2t2))
- Update mocha to version 3.0.0 🚀 [\#25](https://github.com/feathersjs/feathers-socket-commons/pull/25) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v2.3.0](https://github.com/feathersjs/feathers-socket-commons/tree/v2.3.0) (2016-07-24)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v2.2.1...v2.3.0)

**Fixed bugs:**

- Error in filter chain for 'created' event after app.authenticate\(\) [\#12](https://github.com/feathersjs/feathers-socket-commons/issues/12)

**Merged pull requests:**

- Skip subsequent filters instead of rejecting the promise [\#24](https://github.com/feathersjs/feathers-socket-commons/pull/24) ([daffl](https://github.com/daffl))

## [v2.2.1](https://github.com/feathersjs/feathers-socket-commons/tree/v2.2.1) (2016-07-05)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v2.2.0...v2.2.1)

## [v2.2.0](https://github.com/feathersjs/feathers-socket-commons/tree/v2.2.0) (2016-07-05)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v2.1.0...v2.2.0)

**Implemented enhancements:**

- Support native websockets directly [\#8](https://github.com/feathersjs/feathers-socket-commons/issues/8)

**Fixed bugs:**

- Calling `off` on primus fails [\#7](https://github.com/feathersjs/feathers-socket-commons/issues/7)

**Closed issues:**

- Should add other eventEmitter methods [\#22](https://github.com/feathersjs/feathers-socket-commons/issues/22)
- Patch event sends the whole data back [\#21](https://github.com/feathersjs/feathers-socket-commons/issues/21)

**Merged pull requests:**

- Pass all EventEmitter methods to the client connection [\#23](https://github.com/feathersjs/feathers-socket-commons/pull/23) ([daffl](https://github.com/daffl))

## [v2.1.0](https://github.com/feathersjs/feathers-socket-commons/tree/v2.1.0) (2016-05-29)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v2.0.0...v2.1.0)

**Closed issues:**

- Client should convert error objects to feathers-errors [\#19](https://github.com/feathersjs/feathers-socket-commons/issues/19)

**Merged pull requests:**

- Make client convert to feathers-errors [\#20](https://github.com/feathersjs/feathers-socket-commons/pull/20) ([daffl](https://github.com/daffl))

## [v2.0.0](https://github.com/feathersjs/feathers-socket-commons/tree/v2.0.0) (2016-05-23)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v1.0.0...v2.0.0)

**Merged pull requests:**

- Better handling of sub-apps and sockets [\#18](https://github.com/feathersjs/feathers-socket-commons/pull/18) ([daffl](https://github.com/daffl))
- Update babel-plugin-add-module-exports to version 0.2.0 🚀 [\#17](https://github.com/feathersjs/feathers-socket-commons/pull/17) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- babel-polyfill@6.7.4 breaks build 🚨 [\#16](https://github.com/feathersjs/feathers-socket-commons/pull/16) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v1.0.0](https://github.com/feathersjs/feathers-socket-commons/tree/v1.0.0) (2016-04-28)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v0.2.3...v1.0.0)

**Implemented enhancements:**

- Support acknowledgement timeouts [\#9](https://github.com/feathersjs/feathers-socket-commons/issues/9)

**Closed issues:**

- Feathers over sockets is totally silent when a hook has errors [\#13](https://github.com/feathersjs/feathers-socket-commons/issues/13)
- Listener warning when you register your own events on the socket [\#10](https://github.com/feathersjs/feathers-socket-commons/issues/10)

**Merged pull requests:**

- Support timeouts for socket clients [\#15](https://github.com/feathersjs/feathers-socket-commons/pull/15) ([daffl](https://github.com/daffl))
- Convert errors in socket callbacks [\#14](https://github.com/feathersjs/feathers-socket-commons/pull/14) ([daffl](https://github.com/daffl))

## [v0.2.3](https://github.com/feathersjs/feathers-socket-commons/tree/v0.2.3) (2016-04-16)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v0.2.2...v0.2.3)

**Merged pull requests:**

- Remove connection setMaxListeners [\#11](https://github.com/feathersjs/feathers-socket-commons/pull/11) ([daffl](https://github.com/daffl))

## [v0.2.2](https://github.com/feathersjs/feathers-socket-commons/tree/v0.2.2) (2016-03-22)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v0.2.1...v0.2.2)

**Merged pull requests:**

- Allow chaining event listeners. [\#6](https://github.com/feathersjs/feathers-socket-commons/pull/6) ([joshuajabbour](https://github.com/joshuajabbour))

## [v0.2.1](https://github.com/feathersjs/feathers-socket-commons/tree/v0.2.1) (2016-03-08)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v0.2.0...v0.2.1)

**Merged pull requests:**

- Set connection max listeners and better debug messages [\#3](https://github.com/feathersjs/feathers-socket-commons/pull/3) ([daffl](https://github.com/daffl))

## [v0.2.0](https://github.com/feathersjs/feathers-socket-commons/tree/v0.2.0) (2016-02-08)
[Full Changelog](https://github.com/feathersjs/feathers-socket-commons/compare/v0.1.0...v0.2.0)

**Merged pull requests:**

- Query params [\#2](https://github.com/feathersjs/feathers-socket-commons/pull/2) ([ekryski](https://github.com/ekryski))
- Adding nsp check [\#1](https://github.com/feathersjs/feathers-socket-commons/pull/1) ([marshallswain](https://github.com/marshallswain))

## [v0.1.0](https://github.com/feathersjs/feathers-socket-commons/tree/v0.1.0) (2016-01-21)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*