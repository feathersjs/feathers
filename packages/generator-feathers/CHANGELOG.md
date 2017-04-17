# Change Log

## [v1.0.3](https://github.com/feathersjs/generator-feathers/tree/v1.0.3) (2017-04-17)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.2...v1.0.3)

**Closed issues:**

- Use JSCodeshift without error message [\#198](https://github.com/feathersjs/generator-feathers/issues/198)

**Merged pull requests:**

- Use our fork of JSCodeshift for now to avoid installation error messages [\#201](https://github.com/feathersjs/generator-feathers/pull/201) ([daffl](https://github.com/daffl))
- Add Greenkeeper badge 🌴 [\#200](https://github.com/feathersjs/generator-feathers/pull/200) ([greenkeeper[bot]](https://github.com/integration/greenkeeper))

## [v1.0.2](https://github.com/feathersjs/generator-feathers/tree/v1.0.2) (2017-04-12)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.1...v1.0.2)

## [v1.0.1](https://github.com/feathersjs/generator-feathers/tree/v1.0.1) (2017-04-12)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0...v1.0.1)

**Closed issues:**

- Unexpected token on app generate [\#199](https://github.com/feathersjs/generator-feathers/issues/199)

**Merged pull requests:**

- add default scope for google. fix \#14 [\#197](https://github.com/feathersjs/generator-feathers/pull/197) ([iamso](https://github.com/iamso))

## [v1.0.0](https://github.com/feathersjs/generator-feathers/tree/v1.0.0) (2017-04-11)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.7...v1.0.0)

## [v1.0.0-pre.7](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.7) (2017-04-08)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.6...v1.0.0-pre.7)

**Merged pull requests:**

- Add restrictToOwner hook to generated users service [\#196](https://github.com/feathersjs/generator-feathers/pull/196) ([daffl](https://github.com/daffl))
- Friendly updates to the generator [\#195](https://github.com/feathersjs/generator-feathers/pull/195) ([marshallswain](https://github.com/marshallswain))
- Add a successRedirect by default [\#194](https://github.com/feathersjs/generator-feathers/pull/194) ([marshallswain](https://github.com/marshallswain))
- Adding hook to discard password to the users service [\#192](https://github.com/feathersjs/generator-feathers/pull/192) ([daffl](https://github.com/daffl))

## [v1.0.0-pre.6](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.6) (2017-03-16)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.5...v1.0.0-pre.6)

**Closed issues:**

- Integration with GraphQL [\#188](https://github.com/feathersjs/generator-feathers/issues/188)
- Trailing whitespace in some generators [\#186](https://github.com/feathersjs/generator-feathers/issues/186)
- Add more junk management to gitignore [\#184](https://github.com/feathersjs/generator-feathers/issues/184)
- Set package.json author and license according to npm/git  [\#183](https://github.com/feathersjs/generator-feathers/issues/183)
- Rethink db option is 'database' instead of 'db' and db config gets overwritten [\#181](https://github.com/feathersjs/generator-feathers/issues/181)

**Merged pull requests:**

- Generate tests for hooks and services [\#191](https://github.com/feathersjs/generator-feathers/pull/191) ([daffl](https://github.com/daffl))
- Add email unique index to NeDB user model [\#190](https://github.com/feathersjs/generator-feathers/pull/190) ([daffl](https://github.com/daffl))
- Set name based on npm [\#189](https://github.com/feathersjs/generator-feathers/pull/189) ([daffl](https://github.com/daffl))
- Trailing whitespace cleanup \(\#186\) [\#187](https://github.com/feathersjs/generator-feathers/pull/187) ([bitsoflogic](https://github.com/bitsoflogic))
- ignore junk files [\#185](https://github.com/feathersjs/generator-feathers/pull/185) ([OmgImAlexis](https://github.com/OmgImAlexis))
- Add support for selecting application hooks and old event filter [\#182](https://github.com/feathersjs/generator-feathers/pull/182) ([daffl](https://github.com/daffl))

## [v1.0.0-pre.5](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.5) (2017-02-23)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.4...v1.0.0-pre.5)

**Fixed bugs:**

- Add profileFields to config for Facebook auth [\#138](https://github.com/feathersjs/generator-feathers/issues/138)

**Closed issues:**

- RethinkDB console printed database name is incorrect. [\#176](https://github.com/feathersjs/generator-feathers/issues/176)
- RethinkDB configuration values overwritten when generating new service [\#174](https://github.com/feathersjs/generator-feathers/issues/174)
- RethinkDB does not support kebab-case database names [\#173](https://github.com/feathersjs/generator-feathers/issues/173)
- Generate Service - RethinkDB Issues [\#170](https://github.com/feathersjs/generator-feathers/issues/170)
- Generate Service - RethinkDB incorrect config [\#168](https://github.com/feathersjs/generator-feathers/issues/168)
- npm install feathers-cli@pre -g / feathers generate service  Unhandled 'error' event [\#165](https://github.com/feathersjs/generator-feathers/issues/165)

**Merged pull requests:**

- Rethinkdb finalization [\#180](https://github.com/feathersjs/generator-feathers/pull/180) ([daffl](https://github.com/daffl))
- Add .idea/ [\#178](https://github.com/feathersjs/generator-feathers/pull/178) ([j2L4e](https://github.com/j2L4e))
- Suggest valid RethinkDB database name and prevent overwriting configuration settings [\#175](https://github.com/feathersjs/generator-feathers/pull/175) ([luke3butler](https://github.com/luke3butler))
- Run generator tests for RethinkDB [\#172](https://github.com/feathersjs/generator-feathers/pull/172) ([daffl](https://github.com/daffl))
- Improved checks and error messages if the generator can run properly [\#171](https://github.com/feathersjs/generator-feathers/pull/171) ([daffl](https://github.com/daffl))
- Fix RethinkDB generation [\#169](https://github.com/feathersjs/generator-feathers/pull/169) ([luke3butler](https://github.com/luke3butler))
- Update yeoman-assert to version 3.0.0 🚀 [\#167](https://github.com/feathersjs/generator-feathers/pull/167) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Add profileFields for Facebook authentication [\#155](https://github.com/feathersjs/generator-feathers/pull/155) ([supasate](https://github.com/supasate))

## [v1.0.0-pre.4](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.4) (2017-02-08)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.3...v1.0.0-pre.4)

**Merged pull requests:**

- Minor improvements [\#166](https://github.com/feathersjs/generator-feathers/pull/166) ([ekryski](https://github.com/ekryski))

## [v1.0.0-pre.3](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.3) (2017-02-08)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.2...v1.0.0-pre.3)

## [v1.0.0-pre.2](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.2) (2017-02-08)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v1.0.0-pre.1...v1.0.0-pre.2)

## [v1.0.0-pre.1](https://github.com/feathersjs/generator-feathers/tree/v1.0.0-pre.1) (2017-02-08)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.8...v1.0.0-pre.1)

**Implemented enhancements:**

- Mongoose models should be PascalCase [\#135](https://github.com/feathersjs/generator-feathers/issues/135)
- Add global error handler [\#120](https://github.com/feathersjs/generator-feathers/issues/120)
- Feature: choose between ESLint + AirBnB and jshint? [\#112](https://github.com/feathersjs/generator-feathers/issues/112)
- Option to choose database-adapter [\#103](https://github.com/feathersjs/generator-feathers/issues/103)

**Fixed bugs:**

- Generate Service - Duplicating const in services/index.js [\#124](https://github.com/feathersjs/generator-feathers/issues/124)

**Closed issues:**

- Make directory structure configurable [\#158](https://github.com/feathersjs/generator-feathers/issues/158)
- Plugin-based generation? [\#151](https://github.com/feathersjs/generator-feathers/issues/151)
- sequelize service generator not using es5 classes? [\#148](https://github.com/feathersjs/generator-feathers/issues/148)
- users service's folder should match the service name. [\#115](https://github.com/feathersjs/generator-feathers/issues/115)
- Descriptive filenames and directory structure [\#95](https://github.com/feathersjs/generator-feathers/issues/95)
- Considerations for setting up model relationships with sequelize [\#94](https://github.com/feathersjs/generator-feathers/issues/94)
- Support generating basic front ends [\#73](https://github.com/feathersjs/generator-feathers/issues/73)
- Add feathers-mailer support [\#58](https://github.com/feathersjs/generator-feathers/issues/58)
- Remove inflection and ask for service path [\#44](https://github.com/feathersjs/generator-feathers/issues/44)
- Support selecting plugins [\#33](https://github.com/feathersjs/generator-feathers/issues/33)
- Support passing in attributes when generating a model [\#24](https://github.com/feathersjs/generator-feathers/issues/24)

**Merged pull requests:**

- Generator refactoring2 [\#164](https://github.com/feathersjs/generator-feathers/pull/164) ([ekryski](https://github.com/ekryski))
- Generator refactoring2 [\#163](https://github.com/feathersjs/generator-feathers/pull/163) ([ekryski](https://github.com/ekryski))
- Add models directory for new generators [\#162](https://github.com/feathersjs/generator-feathers/pull/162) ([DesignByOnyx](https://github.com/DesignByOnyx))
- Generator refactoring [\#159](https://github.com/feathersjs/generator-feathers/pull/159) ([daffl](https://github.com/daffl))
- feathers-configuration 0.4.0 [\#154](https://github.com/feathersjs/generator-feathers/pull/154) ([slajax](https://github.com/slajax))
- Move freezeTableName so it doesn't need to be set on every model. [\#150](https://github.com/feathersjs/generator-feathers/pull/150) ([Qard](https://github.com/Qard))

## [v0.8.8](https://github.com/feathersjs/generator-feathers/tree/v0.8.8) (2016-09-12)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.7...v0.8.8)

**Closed issues:**

- Generating Service: No function expression found after module.exports [\#146](https://github.com/feathersjs/generator-feathers/issues/146)
- Command to list application services and its hooks names [\#139](https://github.com/feathersjs/generator-feathers/issues/139)

**Merged pull requests:**

- Update mocha to version 3.0.0 🚀 [\#145](https://github.com/feathersjs/generator-feathers/pull/145) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Update yeoman-generator to version 0.24.1 🚀 [\#144](https://github.com/feathersjs/generator-feathers/pull/144) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Update update-notifier to version 1.0.1 🚀 [\#141](https://github.com/feathersjs/generator-feathers/pull/141) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- mocha@2.5.0 breaks build 🚨 [\#137](https://github.com/feathersjs/generator-feathers/pull/137) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v0.8.7](https://github.com/feathersjs/generator-feathers/tree/v0.8.7) (2016-05-19)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.6...v0.8.7)

**Closed issues:**

- TypeError after `npm link` [\#134](https://github.com/feathersjs/generator-feathers/issues/134)
- Investigate moving services/authentication [\#122](https://github.com/feathersjs/generator-feathers/issues/122)
- Add webpack dev and prod setup [\#93](https://github.com/feathersjs/generator-feathers/issues/93)

**Merged pull requests:**

- Test and fix for commented out hooks [\#136](https://github.com/feathersjs/generator-feathers/pull/136) ([daffl](https://github.com/daffl))
- Update update-notifier to version 0.7.0 🚀 [\#133](https://github.com/feathersjs/generator-feathers/pull/133) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Greenkeeper yeoman generator 0.23.0 [\#132](https://github.com/feathersjs/generator-feathers/pull/132) ([daffl](https://github.com/daffl))
- Remove typo, update year in generated README [\#123](https://github.com/feathersjs/generator-feathers/pull/123) ([lord](https://github.com/lord))
- Run the generator tests without Babel to make sure they pass in their… [\#121](https://github.com/feathersjs/generator-feathers/pull/121) ([daffl](https://github.com/daffl))

## [v0.8.6](https://github.com/feathersjs/generator-feathers/tree/v0.8.6) (2016-04-24)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.5...v0.8.6)

**Fixed bugs:**

- Generator fails on node v0.12.x [\#118](https://github.com/feathersjs/generator-feathers/issues/118)

**Merged pull requests:**

- removing const. Closes \#118 [\#119](https://github.com/feathersjs/generator-feathers/pull/119) ([ekryski](https://github.com/ekryski))

## [v0.8.5](https://github.com/feathersjs/generator-feathers/tree/v0.8.5) (2016-04-16)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.4...v0.8.5)

**Closed issues:**

- Allow hyphenate generated names [\#113](https://github.com/feathersjs/generator-feathers/issues/113)
- Error: Cannot find module 'feathers-errors/handler' [\#78](https://github.com/feathersjs/generator-feathers/issues/78)

**Merged pull requests:**

- Throw an error if the project name is the same as one of the dependen… [\#117](https://github.com/feathersjs/generator-feathers/pull/117) ([daffl](https://github.com/daffl))
- Pass fewer arrow functions to Mocha. feathersjs/feathers\#297 [\#116](https://github.com/feathersjs/generator-feathers/pull/116) ([wkw](https://github.com/wkw))
- Allow hyphenated-names in services - fixes \#113 [\#114](https://github.com/feathersjs/generator-feathers/pull/114) ([toddgeist](https://github.com/toddgeist))

## [v0.8.4](https://github.com/feathersjs/generator-feathers/tree/v0.8.4) (2016-04-12)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.3...v0.8.4)

**Merged pull requests:**

- Fix AST transformation when there is another expression [\#111](https://github.com/feathersjs/generator-feathers/pull/111) ([daffl](https://github.com/daffl))

## [v0.8.3](https://github.com/feathersjs/generator-feathers/tree/v0.8.3) (2016-04-11)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.2...v0.8.3)

**Merged pull requests:**

- Fix generated app tests for latest packages [\#110](https://github.com/feathersjs/generator-feathers/pull/110) ([daffl](https://github.com/daffl))

## [v0.8.2](https://github.com/feathersjs/generator-feathers/tree/v0.8.2) (2016-04-07)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.1...v0.8.2)

## [v0.8.1](https://github.com/feathersjs/generator-feathers/tree/v0.8.1) (2016-04-03)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.8.0...v0.8.1)

## [v0.8.0](https://github.com/feathersjs/generator-feathers/tree/v0.8.0) (2016-04-03)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.7.0...v0.8.0)

**Implemented enhancements:**

- Support bypassing update notification [\#102](https://github.com/feathersjs/generator-feathers/issues/102)
- Added an option to bypass the update notification [\#101](https://github.com/feathersjs/generator-feathers/pull/101) ([derek-watson](https://github.com/derek-watson))

**Merged pull requests:**

- Update all dependencies 🌴 [\#100](https://github.com/feathersjs/generator-feathers/pull/100) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v0.7.0](https://github.com/feathersjs/generator-feathers/tree/v0.7.0) (2016-03-30)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.20...v0.7.0)

**Closed issues:**

- All generator tests fail on node v5.8.0 [\#98](https://github.com/feathersjs/generator-feathers/issues/98)
- Set the idField in auth config if auth is enabled and using a relational db [\#96](https://github.com/feathersjs/generator-feathers/issues/96)
- Hardening user service hooks [\#92](https://github.com/feathersjs/generator-feathers/issues/92)

**Merged pull requests:**

- V0.7 [\#99](https://github.com/feathersjs/generator-feathers/pull/99) ([ekryski](https://github.com/ekryski))
- Promoting the use of feathers-cli [\#97](https://github.com/feathersjs/generator-feathers/pull/97) ([derek-watson](https://github.com/derek-watson))

## [v0.6.20](https://github.com/feathersjs/generator-feathers/tree/v0.6.20) (2016-03-23)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.19...v0.6.20)

**Closed issues:**

- 'corsWhitelist' should default to empty array [\#90](https://github.com/feathersjs/generator-feathers/issues/90)
- use mongodb instead of mongoose when yo feathers:service and select mongodb [\#89](https://github.com/feathersjs/generator-feathers/issues/89)
- Allow empty values for CORS domains [\#85](https://github.com/feathersjs/generator-feathers/issues/85)

**Merged pull requests:**

- Allow empty CORS whitelist [\#91](https://github.com/feathersjs/generator-feathers/pull/91) ([daffl](https://github.com/daffl))

## [v0.6.19](https://github.com/feathersjs/generator-feathers/tree/v0.6.19) (2016-03-22)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.18...v0.6.19)

**Fixed bugs:**

- 'user' table for SQL databases needs to be 'users' [\#87](https://github.com/feathersjs/generator-feathers/issues/87)
- Generated hook tests don't pass [\#76](https://github.com/feathersjs/generator-feathers/issues/76)
- Choosing your own db causes a syntax error in generated user service [\#74](https://github.com/feathersjs/generator-feathers/issues/74)
- AST transforms don't play well with comments [\#72](https://github.com/feathersjs/generator-feathers/issues/72)

**Closed issues:**

- Can't choose "remove" in hook generator [\#82](https://github.com/feathersjs/generator-feathers/issues/82)
- Mongoose and Sequelize Models should have correct fields generated based on the auth providers configured [\#75](https://github.com/feathersjs/generator-feathers/issues/75)
- Error on generating restrict-to-sender hook [\#71](https://github.com/feathersjs/generator-feathers/issues/71)

**Merged pull requests:**

- fixing how models are generated.  [\#88](https://github.com/feathersjs/generator-feathers/pull/88) ([ekryski](https://github.com/ekryski))
- Add test and fix for generic service [\#86](https://github.com/feathersjs/generator-feathers/pull/86) ([daffl](https://github.com/daffl))
- Allows AST transformations when there are comments. [\#84](https://github.com/feathersjs/generator-feathers/pull/84) ([daffl](https://github.com/daffl))
- Updating dependencies [\#83](https://github.com/feathersjs/generator-feathers/pull/83) ([corymsmith](https://github.com/corymsmith))
- Typo in box-sizing style [\#81](https://github.com/feathersjs/generator-feathers/pull/81) ([lauritzsh](https://github.com/lauritzsh))
- Typo in font-family style [\#80](https://github.com/feathersjs/generator-feathers/pull/80) ([lauritzsh](https://github.com/lauritzsh))
- Log slightly more helpful database information [\#79](https://github.com/feathersjs/generator-feathers/pull/79) ([thejones](https://github.com/thejones))
- jslint error in authentication [\#77](https://github.com/feathersjs/generator-feathers/pull/77) ([sod](https://github.com/sod))

## [v0.6.18](https://github.com/feathersjs/generator-feathers/tree/v0.6.18) (2016-03-16)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.17...v0.6.18)

**Fixed bugs:**

- Generator fails on description when package.json file already exists [\#69](https://github.com/feathersjs/generator-feathers/issues/69)

**Merged pull requests:**

- Fix last Object.assign references and package.json as props [\#70](https://github.com/feathersjs/generator-feathers/pull/70) ([daffl](https://github.com/daffl))

## [v0.6.17](https://github.com/feathersjs/generator-feathers/tree/v0.6.17) (2016-03-13)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.16...v0.6.17)

**Merged pull requests:**

- Some more generator fixes for the release [\#68](https://github.com/feathersjs/generator-feathers/pull/68) ([daffl](https://github.com/daffl))

## [v0.6.16](https://github.com/feathersjs/generator-feathers/tree/v0.6.16) (2016-03-11)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.15...v0.6.16)

## [v0.6.15](https://github.com/feathersjs/generator-feathers/tree/v0.6.15) (2016-03-10)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.14...v0.6.15)

**Merged pull requests:**

- Removing the dry-run arg so the update script actually updates [\#67](https://github.com/feathersjs/generator-feathers/pull/67) ([ccummings](https://github.com/ccummings))

## [v0.6.14](https://github.com/feathersjs/generator-feathers/tree/v0.6.14) (2016-03-10)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.13...v0.6.14)

**Closed issues:**

- Add Babel or throw an error when using Node \< 5 [\#64](https://github.com/feathersjs/generator-feathers/issues/64)

**Merged pull requests:**

- Make generator and generated app compatible with older versions of Node [\#66](https://github.com/feathersjs/generator-feathers/pull/66) ([daffl](https://github.com/daffl))

## [v0.6.13](https://github.com/feathersjs/generator-feathers/tree/v0.6.13) (2016-03-10)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.12...v0.6.13)

## [v0.6.12](https://github.com/feathersjs/generator-feathers/tree/v0.6.12) (2016-03-10)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.11...v0.6.12)

## [v0.6.11](https://github.com/feathersjs/generator-feathers/tree/v0.6.11) (2016-03-09)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.10...v0.6.11)

**Implemented enhancements:**

- Present a warning to upgrade if the generator is out of date [\#63](https://github.com/feathersjs/generator-feathers/issues/63)

**Merged pull requests:**

- Addng an update prompt when any generators are invoked [\#65](https://github.com/feathersjs/generator-feathers/pull/65) ([ccummings](https://github.com/ccummings))

## [v0.6.10](https://github.com/feathersjs/generator-feathers/tree/v0.6.10) (2016-03-09)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.9...v0.6.10)

**Fixed bugs:**

- Generated app won't start on windows? [\#62](https://github.com/feathersjs/generator-feathers/issues/62)

## [v0.6.9](https://github.com/feathersjs/generator-feathers/tree/v0.6.9) (2016-03-08)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.8...v0.6.9)

**Merged pull requests:**

- mssql to make use of config/\*.json connection string [\#61](https://github.com/feathersjs/generator-feathers/pull/61) ([diego-vieira](https://github.com/diego-vieira))

## [v0.6.8](https://github.com/feathersjs/generator-feathers/tree/v0.6.8) (2016-03-07)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.7...v0.6.8)

**Fixed bugs:**

- Not all passport token strategies expose the Strategy the same way [\#59](https://github.com/feathersjs/generator-feathers/issues/59)

## [v0.6.7](https://github.com/feathersjs/generator-feathers/tree/v0.6.7) (2016-02-28)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.6...v0.6.7)

**Closed issues:**

- TokenStrategy is not a function [\#57](https://github.com/feathersjs/generator-feathers/issues/57)

## [v0.6.6](https://github.com/feathersjs/generator-feathers/tree/v0.6.6) (2016-02-25)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.5...v0.6.6)

**Closed issues:**

- Generator do not create users service if authentication providers is local. [\#55](https://github.com/feathersjs/generator-feathers/issues/55)

**Merged pull requests:**

- fixing when local auth is only auth [\#56](https://github.com/feathersjs/generator-feathers/pull/56) ([ekryski](https://github.com/ekryski))

## [v0.6.5](https://github.com/feathersjs/generator-feathers/tree/v0.6.5) (2016-02-25)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.4...v0.6.5)

## [v0.6.4](https://github.com/feathersjs/generator-feathers/tree/v0.6.4) (2016-02-24)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.3...v0.6.4)

**Closed issues:**

- Using sequelize data is erased every time server starts [\#54](https://github.com/feathersjs/generator-feathers/issues/54)
- errors.handler is not a function [\#52](https://github.com/feathersjs/generator-feathers/issues/52)
- Error running `yo feathers` [\#51](https://github.com/feathersjs/generator-feathers/issues/51)

**Merged pull requests:**

- Bug fixes [\#53](https://github.com/feathersjs/generator-feathers/pull/53) ([ekryski](https://github.com/ekryski))

## [v0.6.3](https://github.com/feathersjs/generator-feathers/tree/v0.6.3) (2016-02-23)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.2...v0.6.3)

**Closed issues:**

- use requireDir for load global hooks? [\#42](https://github.com/feathersjs/generator-feathers/issues/42)

**Merged pull requests:**

- Fix Sequelize model [\#50](https://github.com/feathersjs/generator-feathers/pull/50) ([daffl](https://github.com/daffl))

## [v0.6.2](https://github.com/feathersjs/generator-feathers/tree/v0.6.2) (2016-02-22)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.1...v0.6.2)

## [v0.6.1](https://github.com/feathersjs/generator-feathers/tree/v0.6.1) (2016-02-22)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.6.0...v0.6.1)

## [v0.6.0](https://github.com/feathersjs/generator-feathers/tree/v0.6.0) (2016-02-22)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.5.0...v0.6.0)

**Closed issues:**

- Convert regex replacement to AST [\#47](https://github.com/feathersjs/generator-feathers/issues/47)
- Importing hooks are brittle [\#46](https://github.com/feathersjs/generator-feathers/issues/46)
- add .gitignore to application generator [\#40](https://github.com/feathersjs/generator-feathers/issues/40)
- Possibly remove Babel from generated app [\#31](https://github.com/feathersjs/generator-feathers/issues/31)
- auto configuring of service is brittle [\#29](https://github.com/feathersjs/generator-feathers/issues/29)
- Be able to generate middleware [\#27](https://github.com/feathersjs/generator-feathers/issues/27)
- Include auth hooks in the user service if auth is enabled [\#23](https://github.com/feathersjs/generator-feathers/issues/23)
- Auth: Generator should build a config object for feathers-authentication [\#2](https://github.com/feathersjs/generator-feathers/issues/2)

**Merged pull requests:**

- Oauth [\#49](https://github.com/feathersjs/generator-feathers/pull/49) ([ekryski](https://github.com/ekryski))
- Use AST transformations to import generated services and hooks [\#48](https://github.com/feathersjs/generator-feathers/pull/48) ([daffl](https://github.com/daffl))
- Adds middleware generator and automatic inclusion of auth hooks. [\#45](https://github.com/feathersjs/generator-feathers/pull/45) ([ekryski](https://github.com/ekryski))
- Adding utility library for AST transformations [\#43](https://github.com/feathersjs/generator-feathers/pull/43) ([daffl](https://github.com/daffl))
- Update README.md [\#41](https://github.com/feathersjs/generator-feathers/pull/41) ([kulakowka](https://github.com/kulakowka))
- Update sequelize.js [\#39](https://github.com/feathersjs/generator-feathers/pull/39) ([kulakowka](https://github.com/kulakowka))
- Migrate generated app to be usable without Babel and Node 5 directly [\#38](https://github.com/feathersjs/generator-feathers/pull/38) ([daffl](https://github.com/daffl))

## [v0.5.0](https://github.com/feathersjs/generator-feathers/tree/v0.5.0) (2016-02-16)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.4.0...v0.5.0)

**Closed issues:**

- Error: Invalid 'secret' provider configuration. [\#36](https://github.com/feathersjs/generator-feathers/issues/36)
- Generated home page can be something helpful [\#34](https://github.com/feathersjs/generator-feathers/issues/34)
- README is not getting populated by template data [\#28](https://github.com/feathersjs/generator-feathers/issues/28)

**Merged pull requests:**

- Bug fixes [\#37](https://github.com/feathersjs/generator-feathers/pull/37) ([ekryski](https://github.com/ekryski))
- updating to new feathers-errors error handler [\#35](https://github.com/feathersjs/generator-feathers/pull/35) ([ekryski](https://github.com/ekryski))

## [v0.4.0](https://github.com/feathersjs/generator-feathers/tree/v0.4.0) (2016-02-07)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.3.0...v0.4.0)

**Closed issues:**

- Generated hooks have too much :shit: in them [\#30](https://github.com/feathersjs/generator-feathers/issues/30)

**Merged pull requests:**

- updating error handler to be more HTML friendly [\#32](https://github.com/feathersjs/generator-feathers/pull/32) ([ekryski](https://github.com/ekryski))

## [v0.3.0](https://github.com/feathersjs/generator-feathers/tree/v0.3.0) (2016-01-27)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.2.0...v0.3.0)

**Closed issues:**

- Make sure that generated hooks are auto imported [\#25](https://github.com/feathersjs/generator-feathers/issues/25)
- Give the generated pages some sexy [\#21](https://github.com/feathersjs/generator-feathers/issues/21)

**Merged pull requests:**

- Spit shine [\#26](https://github.com/feathersjs/generator-feathers/pull/26) ([ekryski](https://github.com/ekryski))

## [v0.2.0](https://github.com/feathersjs/generator-feathers/tree/v0.2.0) (2016-01-27)
[Full Changelog](https://github.com/feathersjs/generator-feathers/compare/v0.1.0...v0.2.0)

**Closed issues:**

- Some sub commands appear to hang [\#20](https://github.com/feathersjs/generator-feathers/issues/20)
- Generator should automatically import generated services. [\#17](https://github.com/feathersjs/generator-feathers/issues/17)
- AssertionError: Trying to copy from a source that does not exist [\#16](https://github.com/feathersjs/generator-feathers/issues/16)
- Remove api versioning at service level [\#13](https://github.com/feathersjs/generator-feathers/issues/13)
- We need to use cors before the auth plugin. [\#12](https://github.com/feathersjs/generator-feathers/issues/12)
- Can we move server to src [\#11](https://github.com/feathersjs/generator-feathers/issues/11)

**Merged pull requests:**

- Setting up best practices [\#22](https://github.com/feathersjs/generator-feathers/pull/22) ([ekryski](https://github.com/ekryski))
- Fixing error "choosing your own db" [\#19](https://github.com/feathersjs/generator-feathers/pull/19) ([ekryski](https://github.com/ekryski))
- moving server to src and fixing importing of services.  [\#18](https://github.com/feathersjs/generator-feathers/pull/18) ([ekryski](https://github.com/ekryski))
- Generator tweaks [\#14](https://github.com/feathersjs/generator-feathers/pull/14) ([daffl](https://github.com/daffl))

## [v0.1.0](https://github.com/feathersjs/generator-feathers/tree/v0.1.0) (2016-01-14)
**Closed issues:**

- Generate services for each adapter. [\#6](https://github.com/feathersjs/generator-feathers/issues/6)
- Database setup still needed. [\#5](https://github.com/feathersjs/generator-feathers/issues/5)
- Move config folder inside src. [\#4](https://github.com/feathersjs/generator-feathers/issues/4)
- Add cors options to generator. [\#3](https://github.com/feathersjs/generator-feathers/issues/3)

**Merged pull requests:**

- Sub generators [\#10](https://github.com/feathersjs/generator-feathers/pull/10) ([ekryski](https://github.com/ekryski))
- Feathers 2.0 [\#7](https://github.com/feathersjs/generator-feathers/pull/7) ([ekryski](https://github.com/ekryski))
- Typo Fix. [\#1](https://github.com/feathersjs/generator-feathers/pull/1) ([marshallswain](https://github.com/marshallswain))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*