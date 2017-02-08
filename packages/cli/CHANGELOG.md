# Change Log

## [v1.3.0-pre.1](https://github.com/feathersjs/feathers-cli/tree/v1.3.0-pre.1) (2017-02-08)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.7...v1.3.0-pre.1)

**Fixed bugs:**

- Won't install on NodeJS v6.x [\#26](https://github.com/feathersjs/feathers-cli/issues/26)
- feathers generate hook fails when some hooks are commented out [\#25](https://github.com/feathersjs/feathers-cli/issues/25)

**Closed issues:**

- Use eslint instead of jshint to allow auto fix from the generator [\#58](https://github.com/feathersjs/feathers-cli/issues/58)
- Add Knex driver support when generating a database service with the CLI [\#57](https://github.com/feathersjs/feathers-cli/issues/57)
- Cannot create 'user' service [\#56](https://github.com/feathersjs/feathers-cli/issues/56)
- Services become plural? [\#55](https://github.com/feathersjs/feathers-cli/issues/55)
- support new feathers-authentication 1.0 and feathers-configuration 0.4? [\#54](https://github.com/feathersjs/feathers-cli/issues/54)
- Support yarn for generating app [\#53](https://github.com/feathersjs/feathers-cli/issues/53)
- Ability to add properties to existing models [\#52](https://github.com/feathersjs/feathers-cli/issues/52)
- Ability to add properties to existing models [\#51](https://github.com/feathersjs/feathers-cli/issues/51)
- Add option for creating application without static content \[Feature Request\] [\#49](https://github.com/feathersjs/feathers-cli/issues/49)
- Error on Node version 7.1.0 [\#48](https://github.com/feathersjs/feathers-cli/issues/48)
- Error when generating new service [\#47](https://github.com/feathersjs/feathers-cli/issues/47)
- Removing services with the CLI [\#45](https://github.com/feathersjs/feathers-cli/issues/45)
- jshint errors failing tests [\#43](https://github.com/feathersjs/feathers-cli/issues/43)
- add slack hooks for \#activity [\#42](https://github.com/feathersjs/feathers-cli/issues/42)
- Update dependencies: feathers-configuration [\#37](https://github.com/feathersjs/feathers-cli/issues/37)
- Add service to manage file uploads [\#36](https://github.com/feathersjs/feathers-cli/issues/36)
- Feathers doesn't exit when generating a Generic Service [\#35](https://github.com/feathersjs/feathers-cli/issues/35)
- CamelCase service name variable if service name is a dash-separated string [\#34](https://github.com/feathersjs/feathers-cli/issues/34)
- Don't run a continuous process, be transactional [\#33](https://github.com/feathersjs/feathers-cli/issues/33)
- toLowerCase error [\#32](https://github.com/feathersjs/feathers-cli/issues/32)
- Add default filters for real-time events if service is generated with authentication required [\#31](https://github.com/feathersjs/feathers-cli/issues/31)
- Add command to list existing services [\#30](https://github.com/feathersjs/feathers-cli/issues/30)
- Add command to generate auth secret [\#29](https://github.com/feathersjs/feathers-cli/issues/29)
- Can't generate a new service \(Node 6.2.0 on Mac OS X 10.11.5\) [\#28](https://github.com/feathersjs/feathers-cli/issues/28)
- Add rethinkdb support [\#23](https://github.com/feathersjs/feathers-cli/issues/23)
- Check for latest version of the generator [\#22](https://github.com/feathersjs/feathers-cli/issues/22)
- Remove Yeoman dependency [\#17](https://github.com/feathersjs/feathers-cli/issues/17)
- Support update notifications [\#15](https://github.com/feathersjs/feathers-cli/issues/15)
- Remove the "generate" command shortcut [\#14](https://github.com/feathersjs/feathers-cli/issues/14)
- Generate a directory for the app [\#10](https://github.com/feathersjs/feathers-cli/issues/10)
- Running a Feathers app isn't clear when in interactive mode [\#9](https://github.com/feathersjs/feathers-cli/issues/9)
- Generate and run database migrations [\#6](https://github.com/feathersjs/feathers-cli/issues/6)

**Merged pull requests:**

- Update all dependencies 🌴 [\#61](https://github.com/feathersjs/feathers-cli/pull/61) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Refactoring to use commander instead of Vorpal [\#59](https://github.com/feathersjs/feathers-cli/pull/59) ([daffl](https://github.com/daffl))
- added --config [\#50](https://github.com/feathersjs/feathers-cli/pull/50) ([slajax](https://github.com/slajax))
- clean up jshint errors [\#44](https://github.com/feathersjs/feathers-cli/pull/44) ([slajax](https://github.com/slajax))
- service generator auto-mounting [\#41](https://github.com/feathersjs/feathers-cli/pull/41) ([slajax](https://github.com/slajax))
- add alias `feathers g` for `feathers generate` [\#21](https://github.com/feathersjs/feathers-cli/pull/21) ([jeremyjs](https://github.com/jeremyjs))

## [v1.2.7](https://github.com/feathersjs/feathers-cli/tree/v1.2.7) (2016-05-18)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.6...v1.2.7)

**Closed issues:**

- Throw a warning if someone tries to use a dependency name for the project [\#20](https://github.com/feathersjs/feathers-cli/issues/20)
- Using a hyphen in service name silently fails. [\#19](https://github.com/feathersjs/feathers-cli/issues/19)
- Generate Hooks [\#18](https://github.com/feathersjs/feathers-cli/issues/18)

## [v1.2.6](https://github.com/feathersjs/feathers-cli/tree/v1.2.6) (2016-04-12)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.5...v1.2.6)

**Fixed bugs:**

- Can't generate a project on Linux Mint [\#11](https://github.com/feathersjs/feathers-cli/issues/11)

## [v1.2.5](https://github.com/feathersjs/feathers-cli/tree/v1.2.5) (2016-04-07)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.4...v1.2.5)

## [v1.2.4](https://github.com/feathersjs/feathers-cli/tree/v1.2.4) (2016-04-03)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.3...v1.2.4)

## [v1.2.3](https://github.com/feathersjs/feathers-cli/tree/v1.2.3) (2016-04-03)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.2...v1.2.3)

**Fixed bugs:**

- UNMET PEER DEPENDENCY yo@\>=1.0.0 [\#13](https://github.com/feathersjs/feathers-cli/issues/13)
- Disable yeoman updates [\#12](https://github.com/feathersjs/feathers-cli/issues/12)

**Merged pull requests:**

- Passing disableNotifyUpdate: true to generator options [\#16](https://github.com/feathersjs/feathers-cli/pull/16) ([derek-watson](https://github.com/derek-watson))

## [v1.2.2](https://github.com/feathersjs/feathers-cli/tree/v1.2.2) (2016-03-30)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.2.1...v1.2.2)

**Merged pull requests:**

- bumping generator version [\#8](https://github.com/feathersjs/feathers-cli/pull/8) ([ekryski](https://github.com/ekryski))

## [v1.2.1](https://github.com/feathersjs/feathers-cli/tree/v1.2.1) (2016-03-29)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.1.1...v1.2.1)

**Closed issues:**

- Support the plugin generator [\#4](https://github.com/feathersjs/feathers-cli/issues/4)

**Merged pull requests:**

- Process exits after running single commands issued from the command l… [\#7](https://github.com/feathersjs/feathers-cli/pull/7) ([derek-watson](https://github.com/derek-watson))
- supporting "generate plugin" command via generator-feathers-plugin [\#5](https://github.com/feathersjs/feathers-cli/pull/5) ([derek-watson](https://github.com/derek-watson))

## [v1.1.1](https://github.com/feathersjs/feathers-cli/tree/v1.1.1) (2016-03-26)
[Full Changelog](https://github.com/feathersjs/feathers-cli/compare/v1.1.0...v1.1.1)

## [v1.1.0](https://github.com/feathersjs/feathers-cli/tree/v1.1.0) (2016-03-26)
**Fixed bugs:**

- Fixing yeoman generator registration [\#3](https://github.com/feathersjs/feathers-cli/pull/3) ([derek-watson](https://github.com/derek-watson))

**Closed issues:**

- Errors when running generate [\#2](https://github.com/feathersjs/feathers-cli/issues/2)



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*