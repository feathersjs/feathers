# Change Log

## [v1.2.0](https://github.com/feathersjs/authentication-local/tree/v1.2.0) (2018-05-02)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.1.3...v1.2.0)

**Merged pull requests:**

- added support for nested password fields option in hash password hook [\#64](https://github.com/feathersjs/authentication-local/pull/64) ([ThePesta](https://github.com/ThePesta))

## [v1.1.3](https://github.com/feathersjs/authentication-local/tree/v1.1.3) (2018-04-20)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.1.2...v1.1.3)

**Merged pull requests:**

- Adding tests and calling to hasOwnProperty on Object.prototype instead of assuming valid prototype [\#63](https://github.com/feathersjs/authentication-local/pull/63) ([pmabres](https://github.com/pmabres))

## [v1.1.2](https://github.com/feathersjs/authentication-local/tree/v1.1.2) (2018-04-15)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.1.1...v1.1.2)

**Closed issues:**

- Protect hooks does not support dot notation [\#61](https://github.com/feathersjs/authentication-local/issues/61)

**Merged pull requests:**

- Use latest version of Lodash [\#62](https://github.com/feathersjs/authentication-local/pull/62) ([daffl](https://github.com/daffl))

## [v1.1.1](https://github.com/feathersjs/authentication-local/tree/v1.1.1) (2018-03-25)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.1.0...v1.1.1)

**Closed issues:**

- hash-password hook will skip users if they are missing password [\#58](https://github.com/feathersjs/authentication-local/issues/58)
- User service create method gets called upon each validation [\#56](https://github.com/feathersjs/authentication-local/issues/56)

**Merged pull requests:**

- Do not skip users that have no password [\#60](https://github.com/feathersjs/authentication-local/pull/60) ([daffl](https://github.com/daffl))
- Update sinon to the latest version 🚀 [\#59](https://github.com/feathersjs/authentication-local/pull/59) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update sinon-chai to the latest version 🚀 [\#57](https://github.com/feathersjs/authentication-local/pull/57) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v1.1.0](https://github.com/feathersjs/authentication-local/tree/v1.1.0) (2018-01-23)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.4...v1.1.0)

**Closed issues:**

- protect hook attempts to map through 'result.data' on all service methods. [\#53](https://github.com/feathersjs/authentication-local/issues/53)
- Protect hook should check for toJSON [\#48](https://github.com/feathersjs/authentication-local/issues/48)

**Merged pull requests:**

- Use .toJSON if available [\#55](https://github.com/feathersjs/authentication-local/pull/55) ([daffl](https://github.com/daffl))
- Only map data for find method [\#54](https://github.com/feathersjs/authentication-local/pull/54) ([daffl](https://github.com/daffl))
- Update @feathersjs/authentication-jwt to the latest version 🚀 [\#52](https://github.com/feathersjs/authentication-local/pull/52) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update mocha to the latest version 🚀 [\#51](https://github.com/feathersjs/authentication-local/pull/51) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v1.0.4](https://github.com/feathersjs/authentication-local/tree/v1.0.4) (2018-01-03)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.3...v1.0.4)

## [v1.0.3](https://github.com/feathersjs/authentication-local/tree/v1.0.3) (2018-01-03)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.2...v1.0.3)

**Closed issues:**

- local authentication bug with users as sequelize service [\#47](https://github.com/feathersjs/authentication-local/issues/47)

**Merged pull requests:**

- Update documentation to correspond with latest release [\#50](https://github.com/feathersjs/authentication-local/pull/50) ([daffl](https://github.com/daffl))
- Update semistandard to the latest version 🚀 [\#49](https://github.com/feathersjs/authentication-local/pull/49) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v1.0.2](https://github.com/feathersjs/authentication-local/tree/v1.0.2) (2017-12-06)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.1...v1.0.2)

**Closed issues:**

- why is the password send as plain text instead of encrypting it on client side? [\#44](https://github.com/feathersjs/authentication-local/issues/44)

**Merged pull requests:**

- Update hook.result if an external provider is set [\#46](https://github.com/feathersjs/authentication-local/pull/46) ([daffl](https://github.com/daffl))
- Update feathers-memory to the latest version 🚀 [\#45](https://github.com/feathersjs/authentication-local/pull/45) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v1.0.1](https://github.com/feathersjs/authentication-local/tree/v1.0.1) (2017-11-16)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.0...v1.0.1)

**Merged pull requests:**

- Add default export for better ES module \(TypeScript\) compatibility [\#43](https://github.com/feathersjs/authentication-local/pull/43) ([daffl](https://github.com/daffl))
- Update @feathersjs/authentication to the latest version 🚀 [\#42](https://github.com/feathersjs/authentication-local/pull/42) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v1.0.0](https://github.com/feathersjs/authentication-local/tree/v1.0.0) (2017-11-01)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.0-pre.2...v1.0.0)

**Merged pull requests:**

- Update dependencies for release [\#41](https://github.com/feathersjs/authentication-local/pull/41) ([daffl](https://github.com/daffl))

## [v1.0.0-pre.2](https://github.com/feathersjs/authentication-local/tree/v1.0.0-pre.2) (2017-10-27)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v1.0.0-pre.1...v1.0.0-pre.2)

**Merged pull requests:**

- Safely dispatch without password [\#40](https://github.com/feathersjs/authentication-local/pull/40) ([daffl](https://github.com/daffl))

## [v1.0.0-pre.1](https://github.com/feathersjs/authentication-local/tree/v1.0.0-pre.1) (2017-10-25)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.4.4...v1.0.0-pre.1)

**Closed issues:**

- How configure local strategy to feathers-authentication? [\#36](https://github.com/feathersjs/authentication-local/issues/36)
- An in-range update of feathers is breaking the build 🚨 [\#32](https://github.com/feathersjs/authentication-local/issues/32)

**Merged pull requests:**

- Update to Feathers v3 [\#39](https://github.com/feathersjs/authentication-local/pull/39) ([daffl](https://github.com/daffl))
- Rename repository and use npm scope [\#38](https://github.com/feathersjs/authentication-local/pull/38) ([daffl](https://github.com/daffl))
- Update to new plugin infrastructure [\#37](https://github.com/feathersjs/authentication-local/pull/37) ([daffl](https://github.com/daffl))
- Update mocha to the latest version 🚀 [\#35](https://github.com/feathersjs/authentication-local/pull/35) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update sinon to the latest version 🚀 [\#34](https://github.com/feathersjs/authentication-local/pull/34) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Add babel-polyfill and package-lock.json [\#33](https://github.com/feathersjs/authentication-local/pull/33) ([daffl](https://github.com/daffl))
- Update sinon to the latest version 🚀 [\#29](https://github.com/feathersjs/authentication-local/pull/29) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.4.4](https://github.com/feathersjs/authentication-local/tree/v0.4.4) (2017-08-11)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.4.3...v0.4.4)

**Closed issues:**

- i18n support [\#28](https://github.com/feathersjs/authentication-local/issues/28)
- Couldn't store jwt token in cookies [\#17](https://github.com/feathersjs/authentication-local/issues/17)
- Strategy for subapp [\#9](https://github.com/feathersjs/authentication-local/issues/9)

**Merged pull requests:**

- Update debug to the latest version 🚀 [\#31](https://github.com/feathersjs/authentication-local/pull/31) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Increase bcrypt cost factor, add future cost factor auto-optimization [\#30](https://github.com/feathersjs/authentication-local/pull/30) ([micaksica2](https://github.com/micaksica2))

## [v0.4.3](https://github.com/feathersjs/authentication-local/tree/v0.4.3) (2017-06-22)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.4.2...v0.4.3)

**Closed issues:**

- Log a warning if service.id is undefined or null [\#19](https://github.com/feathersjs/authentication-local/issues/19)

**Merged pull requests:**

- throw error if service.id is missing [\#27](https://github.com/feathersjs/authentication-local/pull/27) ([marshallswain](https://github.com/marshallswain))

## [v0.4.2](https://github.com/feathersjs/authentication-local/tree/v0.4.2) (2017-06-22)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.4.1...v0.4.2)

## [v0.4.1](https://github.com/feathersjs/authentication-local/tree/v0.4.1) (2017-06-22)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.4.0...v0.4.1)

**Merged pull requests:**

- Resolves \#14 - Passes Feathers params to service hooks [\#15](https://github.com/feathersjs/authentication-local/pull/15) ([thomas-p-wilson](https://github.com/thomas-p-wilson))

## [v0.4.0](https://github.com/feathersjs/authentication-local/tree/v0.4.0) (2017-06-22)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.3.4...v0.4.0)

**Closed issues:**

- Module is using the wrong default config key [\#21](https://github.com/feathersjs/authentication-local/issues/21)
- Feathers params not available to user service hooks [\#14](https://github.com/feathersjs/authentication-local/issues/14)
- Bad error message is returned for invalid credentials [\#10](https://github.com/feathersjs/authentication-local/issues/10)

**Merged pull requests:**

- Greenkeeper/chai 4.0.2 [\#26](https://github.com/feathersjs/authentication-local/pull/26) ([daffl](https://github.com/daffl))
- Return Invalid login message when user doesn’t exist [\#25](https://github.com/feathersjs/authentication-local/pull/25) ([marshallswain](https://github.com/marshallswain))
- Adding separate entity username and password fields [\#23](https://github.com/feathersjs/authentication-local/pull/23) ([adamvr](https://github.com/adamvr))
- use the correct default config key. Closes \#21 [\#22](https://github.com/feathersjs/authentication-local/pull/22) ([ekryski](https://github.com/ekryski))
- Update feathers-socketio to the latest version 🚀 [\#20](https://github.com/feathersjs/authentication-local/pull/20) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update semistandard to the latest version 🚀 [\#18](https://github.com/feathersjs/authentication-local/pull/18) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update feathers-hooks to the latest version 🚀 [\#16](https://github.com/feathersjs/authentication-local/pull/16) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))
- Update dependencies to enable Greenkeeper 🌴 [\#13](https://github.com/feathersjs/authentication-local/pull/13) ([greenkeeper[bot]](https://github.com/apps/greenkeeper))

## [v0.3.4](https://github.com/feathersjs/authentication-local/tree/v0.3.4) (2017-03-28)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.3.3...v0.3.4)

**Closed issues:**

- Shouldn't it be `authentication` instead of the old `auth` there? [\#11](https://github.com/feathersjs/authentication-local/issues/11)

**Merged pull requests:**

- Fix default authentication config name [\#12](https://github.com/feathersjs/authentication-local/pull/12) ([marshallswain](https://github.com/marshallswain))

## [v0.3.3](https://github.com/feathersjs/authentication-local/tree/v0.3.3) (2017-01-27)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.3.2...v0.3.3)

**Closed issues:**

- Support dot notation [\#7](https://github.com/feathersjs/authentication-local/issues/7)
- Automatically register the authenticate hook with 'local' [\#4](https://github.com/feathersjs/authentication-local/issues/4)

**Merged pull requests:**

- Add support for dot notation, fix some whitespace [\#8](https://github.com/feathersjs/authentication-local/pull/8) ([elfey](https://github.com/elfey))

## [v0.3.2](https://github.com/feathersjs/authentication-local/tree/v0.3.2) (2016-12-14)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.3.1...v0.3.2)

## [v0.3.1](https://github.com/feathersjs/authentication-local/tree/v0.3.1) (2016-12-14)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.3.0...v0.3.1)

**Closed issues:**

- Add docs section on expected request params. [\#5](https://github.com/feathersjs/authentication-local/issues/5)

**Merged pull requests:**

- Document expected request data [\#6](https://github.com/feathersjs/authentication-local/pull/6) ([marshallswain](https://github.com/marshallswain))

## [v0.3.0](https://github.com/feathersjs/authentication-local/tree/v0.3.0) (2016-11-23)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.2.0...v0.3.0)

**Closed issues:**

- Doesn't pull configuration from `auth.local` by default [\#2](https://github.com/feathersjs/authentication-local/issues/2)
- Does not pull from global auth config when strategy has a custom name [\#1](https://github.com/feathersjs/authentication-local/issues/1)

**Merged pull requests:**

- Payload support [\#3](https://github.com/feathersjs/authentication-local/pull/3) ([ekryski](https://github.com/ekryski))

## [v0.2.0](https://github.com/feathersjs/authentication-local/tree/v0.2.0) (2016-11-16)
[Full Changelog](https://github.com/feathersjs/authentication-local/compare/v0.1.0...v0.2.0)

## [v0.1.0](https://github.com/feathersjs/authentication-local/tree/v0.1.0) (2016-11-09)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*