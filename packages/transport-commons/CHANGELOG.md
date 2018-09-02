# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="4.1.3"></a>
## [4.1.3](https://github.com/feathersjs/feathers/compare/@feathersjs/transport-commons@4.1.2...@feathersjs/transport-commons@4.1.3) (2018-09-02)

**Note:** Version bump only for package @feathersjs/transport-commons





# Change Log

## [v4.1.1](https://github.com/feathersjs/transport-commons/tree/v4.1.1) (2018-07-03)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v4.1.0...v4.1.1)

**Merged pull requests:**

- Properly dispatch arrays that do not come from Feathers hook events [\#77](https://github.com/feathersjs/transport-commons/pull/77) ([daffl](https://github.com/daffl))

## [v4.1.0](https://github.com/feathersjs/transport-commons/tree/v4.1.0) (2018-06-28)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v4.0.2...v4.1.0)

**Merged pull requests:**

- Remove empty channels [\#75](https://github.com/feathersjs/transport-commons/pull/75) ([daffl](https://github.com/daffl))

## [v4.0.2](https://github.com/feathersjs/transport-commons/tree/v4.0.2) (2018-06-12)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v4.0.1...v4.0.2)

**Merged pull requests:**

- Fix looking up invalid path names through sockets [\#76](https://github.com/feathersjs/transport-commons/pull/76) ([daffl](https://github.com/daffl))

## [v4.0.1](https://github.com/feathersjs/transport-commons/tree/v4.0.1) (2018-05-30)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v4.0.0...v4.0.1)

**Merged pull requests:**

- Update Codeclimate settings [\#74](https://github.com/feathersjs/transport-commons/pull/74) ([daffl](https://github.com/daffl))

## [v4.0.0](https://github.com/feathersjs/transport-commons/tree/v4.0.0) (2018-02-09)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.2.0...v4.0.0)

**Closed issues:**

- Additional data for client errors [\#72](https://github.com/feathersjs/transport-commons/issues/72)

**Merged pull requests:**

- Throw a Timeout error on send timeout instead of Error [\#73](https://github.com/feathersjs/transport-commons/pull/73) ([TimNZ](https://github.com/TimNZ))
- Pass connection in params [\#71](https://github.com/feathersjs/transport-commons/pull/71) ([daffl](https://github.com/daffl))
- Move socket handling into its own file [\#70](https://github.com/feathersjs/transport-commons/pull/70) ([daffl](https://github.com/daffl))

## [v3.2.0](https://github.com/feathersjs/transport-commons/tree/v3.2.0) (2018-01-30)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.1.5...v3.2.0)

**Closed issues:**

- Publishing to a channel fails after passing safety check [\#66](https://github.com/feathersjs/transport-commons/issues/66)
- Feathers Server Ends unexpected if some arg to socket.io is a ipv6 local subnet [\#65](https://github.com/feathersjs/transport-commons/issues/65)

**Merged pull requests:**

- Rename to @feathersjs/transport-commons [\#69](https://github.com/feathersjs/transport-commons/pull/69) ([daffl](https://github.com/daffl))
- Switch to Radix tree based routing [\#68](https://github.com/feathersjs/transport-commons/pull/68) ([daffl](https://github.com/daffl))
- Update mocha to the latest version 🚀 [\#64](https://github.com/feathersjs/transport-commons/pull/64) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update semistandard to the latest version 🚀 [\#63](https://github.com/feathersjs/transport-commons/pull/63) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v3.1.5](https://github.com/feathersjs/transport-commons/tree/v3.1.5) (2017-12-12)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.1.4...v3.1.5)

## [v3.1.4](https://github.com/feathersjs/transport-commons/tree/v3.1.4) (2017-12-12)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.1.3...v3.1.4)

**Merged pull requests:**

- Fix dispatching of arrays [\#62](https://github.com/feathersjs/transport-commons/pull/62) ([daffl](https://github.com/daffl))

## [v3.1.3](https://github.com/feathersjs/transport-commons/tree/v3.1.3) (2017-12-12)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.1.2...v3.1.3)

**Merged pull requests:**

- Make sure that each entry in an array is dispatched as its own even [\#61](https://github.com/feathersjs/transport-commons/pull/61) ([daffl](https://github.com/daffl))

## [v3.1.2](https://github.com/feathersjs/transport-commons/tree/v3.1.2) (2017-12-06)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.1.1...v3.1.2)

**Merged pull requests:**

- Fix another error when there are no results [\#60](https://github.com/feathersjs/transport-commons/pull/60) ([daffl](https://github.com/daffl))

## [v3.1.1](https://github.com/feathersjs/transport-commons/tree/v3.1.1) (2017-12-06)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.1.0...v3.1.1)

**Merged pull requests:**

- Always use a combined channel [\#59](https://github.com/feathersjs/transport-commons/pull/59) ([daffl](https://github.com/daffl))

## [v3.1.0](https://github.com/feathersjs/transport-commons/tree/v3.1.0) (2017-12-06)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.1...v3.1.0)

**Merged pull requests:**

- Give channel dispatchers a precedence [\#58](https://github.com/feathersjs/transport-commons/pull/58) ([daffl](https://github.com/daffl))

## [v3.0.1](https://github.com/feathersjs/transport-commons/tree/v3.0.1) (2017-11-03)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0...v3.0.1)

**Closed issues:**

- Allow socket calls without params and callback [\#54](https://github.com/feathersjs/transport-commons/issues/54)

**Merged pull requests:**

- Allow socket calls without query and callback [\#55](https://github.com/feathersjs/transport-commons/pull/55) ([daffl](https://github.com/daffl))

## [v3.0.0](https://github.com/feathersjs/transport-commons/tree/v3.0.0) (2017-11-01)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.7...v3.0.0)

## [v3.0.0-pre.7](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.7) (2017-10-25)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.6...v3.0.0-pre.7)

**Merged pull requests:**

- Update to better returnHook handling [\#53](https://github.com/feathersjs/transport-commons/pull/53) ([daffl](https://github.com/daffl))

## [v3.0.0-pre.6](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.6) (2017-10-21)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.5...v3.0.0-pre.6)

**Closed issues:**

- feathers-socket-commons produces error when it get bundled and steal-socket.io gets used as connection [\#44](https://github.com/feathersjs/transport-commons/issues/44)
- Surface src/events.js lines 44-69 for feathers-hooks-common/src/filters/combine.js [\#40](https://github.com/feathersjs/transport-commons/issues/40)

**Merged pull requests:**

- Updates for Feathers v3 \(Buzzard\) [\#52](https://github.com/feathersjs/transport-commons/pull/52) ([daffl](https://github.com/daffl))
- Rename repository and use npm scope [\#51](https://github.com/feathersjs/transport-commons/pull/51) ([daffl](https://github.com/daffl))

## [v3.0.0-pre.5](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.5) (2017-10-18)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.4...v3.0.0-pre.5)

**Merged pull requests:**

- Pass events property to the client [\#50](https://github.com/feathersjs/transport-commons/pull/50) ([daffl](https://github.com/daffl))

## [v3.0.0-pre.4](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.4) (2017-10-17)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.3...v3.0.0-pre.4)

**Merged pull requests:**

- Fix the event name and add some channel debug statements [\#49](https://github.com/feathersjs/transport-commons/pull/49) ([daffl](https://github.com/daffl))

## [v3.0.0-pre.3](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.3) (2017-10-16)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.2...v3.0.0-pre.3)

**Merged pull requests:**

- Update mocha to the latest version 🚀 [\#48](https://github.com/feathersjs/transport-commons/pull/48) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v3.0.0-pre.2](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.2) (2017-09-28)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v3.0.0-pre.1...v3.0.0-pre.2)

**Merged pull requests:**

- Add feathers-channels [\#47](https://github.com/feathersjs/transport-commons/pull/47) ([daffl](https://github.com/daffl))

## [v3.0.0-pre.1](https://github.com/feathersjs/transport-commons/tree/v3.0.0-pre.1) (2017-09-08)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.4.0...v3.0.0-pre.1)

**Fixed bugs:**

- Socket events don't fire for sub-apps nested more than 2 deep [\#5](https://github.com/feathersjs/transport-commons/issues/5)

**Closed issues:**

- more tests [\#38](https://github.com/feathersjs/transport-commons/issues/38)

**Merged pull requests:**

- Prepare v3.0-pre [\#46](https://github.com/feathersjs/transport-commons/pull/46) ([daffl](https://github.com/daffl))
- Update debug to the latest version 🚀 [\#45](https://github.com/feathersjs/transport-commons/pull/45) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update feathers-socketio to the latest version 🚀 [\#43](https://github.com/feathersjs/transport-commons/pull/43) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update semistandard to the latest version 🚀 [\#42](https://github.com/feathersjs/transport-commons/pull/42) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update dependencies to enable Greenkeeper 🌴 [\#41](https://github.com/feathersjs/transport-commons/pull/41) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v2.4.0](https://github.com/feathersjs/transport-commons/tree/v2.4.0) (2017-01-07)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.3.1...v2.4.0)

**Implemented enhancements:**

- support service.json [\#34](https://github.com/feathersjs/transport-commons/issues/34)
- Socket event filters should not force returning data [\#4](https://github.com/feathersjs/transport-commons/issues/4)
- bootstrap service.filters [\#37](https://github.com/feathersjs/transport-commons/pull/37) ([slajax](https://github.com/slajax))

**Closed issues:**

- Sockets timed out request - retry on reconnection \[feat?\] [\#32](https://github.com/feathersjs/transport-commons/issues/32)

**Merged pull requests:**

- Normalize arguments when client sends packed data. [\#39](https://github.com/feathersjs/transport-commons/pull/39) ([devel-pa](https://github.com/devel-pa))
- Create .codeclimate.yml [\#33](https://github.com/feathersjs/transport-commons/pull/33) ([larkinscott](https://github.com/larkinscott))
- Update feathers-commons to version 0.8.0 🚀 [\#31](https://github.com/feathersjs/transport-commons/pull/31) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- jshint —\> semistandard [\#30](https://github.com/feathersjs/transport-commons/pull/30) ([corymsmith](https://github.com/corymsmith))
- Code coverage [\#29](https://github.com/feathersjs/transport-commons/pull/29) ([ekryski](https://github.com/ekryski))

## [v2.3.1](https://github.com/feathersjs/transport-commons/tree/v2.3.1) (2016-09-02)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.3.0...v2.3.1)

**Merged pull requests:**

- Make service off method be namespaced [\#26](https://github.com/feathersjs/transport-commons/pull/26) ([t2t2](https://github.com/t2t2))
- Update mocha to version 3.0.0 🚀 [\#25](https://github.com/feathersjs/transport-commons/pull/25) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v2.3.0](https://github.com/feathersjs/transport-commons/tree/v2.3.0) (2016-07-24)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.2.1...v2.3.0)

**Fixed bugs:**

- Error in filter chain for 'created' event after app.authenticate\(\) [\#12](https://github.com/feathersjs/transport-commons/issues/12)

**Merged pull requests:**

- Skip subsequent filters instead of rejecting the promise [\#24](https://github.com/feathersjs/transport-commons/pull/24) ([daffl](https://github.com/daffl))

## [v2.2.1](https://github.com/feathersjs/transport-commons/tree/v2.2.1) (2016-07-05)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.2.0...v2.2.1)

## [v2.2.0](https://github.com/feathersjs/transport-commons/tree/v2.2.0) (2016-07-05)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.1.0...v2.2.0)

**Implemented enhancements:**

- Support native websockets directly [\#8](https://github.com/feathersjs/transport-commons/issues/8)

**Fixed bugs:**

- Calling `off` on primus fails [\#7](https://github.com/feathersjs/transport-commons/issues/7)

**Closed issues:**

- Should add other eventEmitter methods [\#22](https://github.com/feathersjs/transport-commons/issues/22)
- Patch event sends the whole data back [\#21](https://github.com/feathersjs/transport-commons/issues/21)

**Merged pull requests:**

- Pass all EventEmitter methods to the client connection [\#23](https://github.com/feathersjs/transport-commons/pull/23) ([daffl](https://github.com/daffl))

## [v2.1.0](https://github.com/feathersjs/transport-commons/tree/v2.1.0) (2016-05-29)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v2.0.0...v2.1.0)

**Closed issues:**

- Client should convert error objects to feathers-errors [\#19](https://github.com/feathersjs/transport-commons/issues/19)

**Merged pull requests:**

- Make client convert to feathers-errors [\#20](https://github.com/feathersjs/transport-commons/pull/20) ([daffl](https://github.com/daffl))

## [v2.0.0](https://github.com/feathersjs/transport-commons/tree/v2.0.0) (2016-05-23)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v1.0.0...v2.0.0)

**Merged pull requests:**

- Better handling of sub-apps and sockets [\#18](https://github.com/feathersjs/transport-commons/pull/18) ([daffl](https://github.com/daffl))
- Update babel-plugin-add-module-exports to version 0.2.0 🚀 [\#17](https://github.com/feathersjs/transport-commons/pull/17) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- babel-polyfill@6.7.4 breaks build 🚨 [\#16](https://github.com/feathersjs/transport-commons/pull/16) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v1.0.0](https://github.com/feathersjs/transport-commons/tree/v1.0.0) (2016-04-28)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v0.2.3...v1.0.0)

**Implemented enhancements:**

- Support acknowledgement timeouts [\#9](https://github.com/feathersjs/transport-commons/issues/9)

**Closed issues:**

- Feathers over sockets is totally silent when a hook has errors [\#13](https://github.com/feathersjs/transport-commons/issues/13)
- Listener warning when you register your own events on the socket [\#10](https://github.com/feathersjs/transport-commons/issues/10)

**Merged pull requests:**

- Support timeouts for socket clients [\#15](https://github.com/feathersjs/transport-commons/pull/15) ([daffl](https://github.com/daffl))
- Convert errors in socket callbacks [\#14](https://github.com/feathersjs/transport-commons/pull/14) ([daffl](https://github.com/daffl))

## [v0.2.3](https://github.com/feathersjs/transport-commons/tree/v0.2.3) (2016-04-16)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v0.2.2...v0.2.3)

**Merged pull requests:**

- Remove connection setMaxListeners [\#11](https://github.com/feathersjs/transport-commons/pull/11) ([daffl](https://github.com/daffl))

## [v0.2.2](https://github.com/feathersjs/transport-commons/tree/v0.2.2) (2016-03-22)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v0.2.1...v0.2.2)

**Merged pull requests:**

- Allow chaining event listeners. [\#6](https://github.com/feathersjs/transport-commons/pull/6) ([joshuajabbour](https://github.com/joshuajabbour))

## [v0.2.1](https://github.com/feathersjs/transport-commons/tree/v0.2.1) (2016-03-08)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v0.2.0...v0.2.1)

**Merged pull requests:**

- Set connection max listeners and better debug messages [\#3](https://github.com/feathersjs/transport-commons/pull/3) ([daffl](https://github.com/daffl))

## [v0.2.0](https://github.com/feathersjs/transport-commons/tree/v0.2.0) (2016-02-08)
[Full Changelog](https://github.com/feathersjs/transport-commons/compare/v0.1.0...v0.2.0)

**Merged pull requests:**

- Query params [\#2](https://github.com/feathersjs/transport-commons/pull/2) ([ekryski](https://github.com/ekryski))
- Adding nsp check [\#1](https://github.com/feathersjs/transport-commons/pull/1) ([marshallswain](https://github.com/marshallswain))

## [v0.1.0](https://github.com/feathersjs/transport-commons/tree/v0.1.0) (2016-01-21)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*
