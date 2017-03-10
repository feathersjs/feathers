# Change Log

## [v0.3.1](https://github.com/feathersjs/feathers-authentication-client/tree/v0.3.1) (2017-03-10)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.3.0...v0.3.1)

**Closed issues:**

- The latest tag on NPM is wrong [\#35](https://github.com/feathersjs/feathers-authentication-client/issues/35)
- exp claim should be optional [\#33](https://github.com/feathersjs/feathers-authentication-client/issues/33)

**Merged pull requests:**

- Fix \#33 exp claim should be optional [\#34](https://github.com/feathersjs/feathers-authentication-client/pull/34) ([whollacsek](https://github.com/whollacsek))

## [v0.3.0](https://github.com/feathersjs/feathers-authentication-client/tree/v0.3.0) (2017-03-08)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.2.0...v0.3.0)

## [v0.2.0](https://github.com/feathersjs/feathers-authentication-client/tree/v0.2.0) (2017-03-07)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.10...v0.2.0)

**Closed issues:**

- Support `authenticated` and `logout` client side events [\#29](https://github.com/feathersjs/feathers-authentication-client/issues/29)
- The default header mismatches the default feathers-authentication header [\#23](https://github.com/feathersjs/feathers-authentication-client/issues/23)
- Re-authenticating fails when passing options [\#22](https://github.com/feathersjs/feathers-authentication-client/issues/22)
- Socket.io timeout does nothing when there is JWT token available [\#19](https://github.com/feathersjs/feathers-authentication-client/issues/19)

**Merged pull requests:**

- Fix header casing [\#32](https://github.com/feathersjs/feathers-authentication-client/pull/32) ([daffl](https://github.com/daffl))
- Add client side `authenticated` and `logout` events [\#31](https://github.com/feathersjs/feathers-authentication-client/pull/31) ([daffl](https://github.com/daffl))
- Add support for socket timeouts and some refactoring [\#30](https://github.com/feathersjs/feathers-authentication-client/pull/30) ([daffl](https://github.com/daffl))

## [v0.1.10](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.10) (2017-03-03)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.9...v0.1.10)

**Merged pull requests:**

- Remove hardcoded values for Config and Credentials typings [\#28](https://github.com/feathersjs/feathers-authentication-client/pull/28) ([myknbani](https://github.com/myknbani))

## [v0.1.9](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.9) (2017-03-01)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.8...v0.1.9)

**Merged pull requests:**

- Typescript Definitions [\#25](https://github.com/feathersjs/feathers-authentication-client/pull/25) ([AbraaoAlves](https://github.com/AbraaoAlves))

## [v0.1.8](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.8) (2017-02-05)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.7...v0.1.8)

**Closed issues:**

- Uncaught TypeError: Cannot read property 'options' of undefined [\#26](https://github.com/feathersjs/feathers-authentication-client/issues/26)
- Browser Version [\#24](https://github.com/feathersjs/feathers-authentication-client/issues/24)

**Merged pull requests:**

- Hoist upgrade handler into current scope by using an arrow function [\#27](https://github.com/feathersjs/feathers-authentication-client/pull/27) ([daffl](https://github.com/daffl))

## [v0.1.7](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.7) (2017-01-29)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.6...v0.1.7)

**Closed issues:**

- \[Webpack\] TypeError: \_this4.storage.getItem is not a function [\#18](https://github.com/feathersjs/feathers-authentication-client/issues/18)
- \[Feature request\] Signup via socket [\#17](https://github.com/feathersjs/feathers-authentication-client/issues/17)
- Missing auth token when used with feathers-rest in comparison to feathers-socketio [\#16](https://github.com/feathersjs/feathers-authentication-client/issues/16)
- Cannot read property 'on' of undefined - feathers-authentication-client [\#12](https://github.com/feathersjs/feathers-authentication-client/issues/12)

**Merged pull requests:**

- Update passport.js [\#20](https://github.com/feathersjs/feathers-authentication-client/pull/20) ([bertho-zero](https://github.com/bertho-zero))

## [v0.1.6](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.6) (2016-12-14)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.5...v0.1.6)

**Closed issues:**

- `logout\(\)` doesn't resolve [\#10](https://github.com/feathersjs/feathers-authentication-client/issues/10)

**Merged pull requests:**

- Fix linting [\#13](https://github.com/feathersjs/feathers-authentication-client/pull/13) ([marshallswain](https://github.com/marshallswain))

## [v0.1.5](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.5) (2016-12-13)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.4...v0.1.5)

## [v0.1.4](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.4) (2016-12-13)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.3...v0.1.4)

**Closed issues:**

- populateAccessToken tries to access non-existent property [\#11](https://github.com/feathersjs/feathers-authentication-client/issues/11)
- Socket client should automatically auth on reconnect [\#2](https://github.com/feathersjs/feathers-authentication-client/issues/2)

**Merged pull requests:**

- More specific imports for StealJS [\#14](https://github.com/feathersjs/feathers-authentication-client/pull/14) ([marshallswain](https://github.com/marshallswain))

## [v0.1.3](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.3) (2016-11-23)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.2...v0.1.3)

**Closed issues:**

- Client should ensure socket.io upgrade is complete before authenticating [\#4](https://github.com/feathersjs/feathers-authentication-client/issues/4)

**Merged pull requests:**

- Socket reconnect [\#9](https://github.com/feathersjs/feathers-authentication-client/pull/9) ([ekryski](https://github.com/ekryski))

## [v0.1.2](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.2) (2016-11-22)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.1...v0.1.2)

**Merged pull requests:**

- Custom jwt strategy names [\#8](https://github.com/feathersjs/feathers-authentication-client/pull/8) ([ekryski](https://github.com/ekryski))

## [v0.1.1](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.1) (2016-11-21)
[Full Changelog](https://github.com/feathersjs/feathers-authentication-client/compare/v0.1.0...v0.1.1)

**Merged pull requests:**

- Socket reconnect upgrade auth [\#3](https://github.com/feathersjs/feathers-authentication-client/pull/3) ([marshallswain](https://github.com/marshallswain))

## [v0.1.0](https://github.com/feathersjs/feathers-authentication-client/tree/v0.1.0) (2016-11-18)
**Closed issues:**

- Relation with feathers-authentication [\#6](https://github.com/feathersjs/feathers-authentication-client/issues/6)
- Client: Docs for getJWT & verifyJWT [\#1](https://github.com/feathersjs/feathers-authentication-client/issues/1)

**Merged pull requests:**

- Feathers authentication 1.0 compatible client [\#7](https://github.com/feathersjs/feathers-authentication-client/pull/7) ([ekryski](https://github.com/ekryski))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*