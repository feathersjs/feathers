# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [4.0.0-pre.5](https://github.com/feathersjs/feathers/compare/v4.0.0-pre.4...v4.0.0-pre.5) (2019-07-10)


### Bug Fixes

* Fix feathers-memory dependency that did not get updated ([9422b13](https://github.com/feathersjs/feathers/commit/9422b13))
* Remove unnecessary top level export files in @feathersjs/express ([#1442](https://github.com/feathersjs/feathers/issues/1442)) ([73c3fb2](https://github.com/feathersjs/feathers/commit/73c3fb2))


### Features

* @feathersjs/express allow to pass an existing Express application instance ([#1446](https://github.com/feathersjs/feathers/issues/1446)) ([853a6b0](https://github.com/feathersjs/feathers/commit/853a6b0))





# [4.0.0-pre.4](https://github.com/feathersjs/feathers/compare/v4.0.0-pre.3...v4.0.0-pre.4) (2019-07-05)


### Bug Fixes

* @feathersjs/adapter-commons: remove data from `remove` arguments ([#1426](https://github.com/feathersjs/feathers/issues/1426)) ([fd54ae9](https://github.com/feathersjs/feathers/commit/fd54ae9))
* @feathersjs/express: allow middleware arrays ([#1421](https://github.com/feathersjs/feathers/issues/1421)) ([b605ab8](https://github.com/feathersjs/feathers/commit/b605ab8))
* @feathersjs/express: replace `reduce` with `map` ([#1429](https://github.com/feathersjs/feathers/issues/1429)) ([44542e9](https://github.com/feathersjs/feathers/commit/44542e9))
* Clean up hooks code ([#1407](https://github.com/feathersjs/feathers/issues/1407)) ([f25c88b](https://github.com/feathersjs/feathers/commit/f25c88b))
* Fix @feathersjs/feathers typings http import ([abbc07b](https://github.com/feathersjs/feathers/commit/abbc07b))
* Fix OpenCollective link ([28888a1](https://github.com/feathersjs/feathers/commit/28888a1))
* Improve transport-commons types ([#1396](https://github.com/feathersjs/feathers/issues/1396)) ([f9d8536](https://github.com/feathersjs/feathers/commit/f9d8536))
* Updated typings for ServiceMethods ([#1409](https://github.com/feathersjs/feathers/issues/1409)) ([b5ee7e2](https://github.com/feathersjs/feathers/commit/b5ee7e2))


### Features

* adapter-commons: add `allowsMulti(method)` to AdapterService ([#1431](https://github.com/feathersjs/feathers/issues/1431)) ([e688851](https://github.com/feathersjs/feathers/commit/e688851))
* Add hook-less methods and service option types to adapter-commons ([#1433](https://github.com/feathersjs/feathers/issues/1433)) ([857f54a](https://github.com/feathersjs/feathers/commit/857f54a))





# [4.0.0-pre.3](https://github.com/feathersjs/feathers/compare/v4.0.0-pre.2...v4.0.0-pre.3) (2019-06-01)


### Bug Fixes

* Make oAuth paths more consistent and improve authentication client ([#1377](https://github.com/feathersjs/feathers/issues/1377)) ([adb2543](https://github.com/feathersjs/feathers/commit/adb2543))
* Set authenticated: true after successful authentication ([#1367](https://github.com/feathersjs/feathers/issues/1367)) ([9918cff](https://github.com/feathersjs/feathers/commit/9918cff))
* Typings fix and improvements. ([#1364](https://github.com/feathersjs/feathers/issues/1364)) ([515b916](https://github.com/feathersjs/feathers/commit/515b916))
* Update dependencies and fix tests ([#1373](https://github.com/feathersjs/feathers/issues/1373)) ([d743a7f](https://github.com/feathersjs/feathers/commit/d743a7f))





# [4.0.0-pre.2](https://github.com/feathersjs/feathers/compare/v4.0.0-pre.1...v4.0.0-pre.2) (2019-05-15)


### Bug Fixes

* Throw NotAuthenticated on token verification errors ([#1357](https://github.com/feathersjs/feathers/issues/1357)) ([e0120df](https://github.com/feathersjs/feathers/commit/e0120df))
* **typescript:** finally should be optional ([#1350](https://github.com/feathersjs/feathers/issues/1350)) ([f439a9e](https://github.com/feathersjs/feathers/commit/f439a9e))
* Add fallback for legacy socket authenticate event ([#1356](https://github.com/feathersjs/feathers/issues/1356)) ([61b1056](https://github.com/feathersjs/feathers/commit/61b1056))
* Correctly read the oauth strategy config ([#1349](https://github.com/feathersjs/feathers/issues/1349)) ([9abf314](https://github.com/feathersjs/feathers/commit/9abf314))
* Fix versioning tests. Closes [#1346](https://github.com/feathersjs/feathers/issues/1346) ([dd519f6](https://github.com/feathersjs/feathers/commit/dd519f6))
* Use `export =` in TypeScript definitions ([#1285](https://github.com/feathersjs/feathers/issues/1285)) ([12d0f4b](https://github.com/feathersjs/feathers/commit/12d0f4b))


### Features

* Add global disconnect event ([#1355](https://github.com/feathersjs/feathers/issues/1355)) ([85afcca](https://github.com/feathersjs/feathers/commit/85afcca))





# [4.0.0-pre.1](https://github.com/feathersjs/feathers/compare/v4.0.0-pre.0...v4.0.0-pre.1) (2019-05-08)


### Bug Fixes

* Add registerPublisher alias for .publish ([#1302](https://github.com/feathersjs/feathers/issues/1302)) ([98fe8f8](https://github.com/feathersjs/feathers/commit/98fe8f8))
* Always require strategy parameter in authentication ([#1327](https://github.com/feathersjs/feathers/issues/1327)) ([d4a8021](https://github.com/feathersjs/feathers/commit/d4a8021))
* Bring back params.authenticated ([#1317](https://github.com/feathersjs/feathers/issues/1317)) ([a0ffd5e](https://github.com/feathersjs/feathers/commit/a0ffd5e))
* Do not log as errors below a 500 response ([#1256](https://github.com/feathersjs/feathers/issues/1256)) ([33fd0e4](https://github.com/feathersjs/feathers/commit/33fd0e4))
* Guard against null in client side logout function ([#1319](https://github.com/feathersjs/feathers/issues/1319)) ([fa7f057](https://github.com/feathersjs/feathers/commit/fa7f057))
* Handle error oAuth redirect in authentication client ([#1307](https://github.com/feathersjs/feathers/issues/1307)) ([12d48ee](https://github.com/feathersjs/feathers/commit/12d48ee))
* Improve authentication parameter handling ([#1333](https://github.com/feathersjs/feathers/issues/1333)) ([6e77204](https://github.com/feathersjs/feathers/commit/6e77204))
* Improve oAuth option handling and usability ([#1335](https://github.com/feathersjs/feathers/issues/1335)) ([adb137d](https://github.com/feathersjs/feathers/commit/adb137d))
* Merge httpStrategies and authStrategies option ([#1308](https://github.com/feathersjs/feathers/issues/1308)) ([afa4d55](https://github.com/feathersjs/feathers/commit/afa4d55))
* Rename jwtStrategies option to authStrategies ([#1305](https://github.com/feathersjs/feathers/issues/1305)) ([4aee151](https://github.com/feathersjs/feathers/commit/4aee151))
* Update version number check ([53575c5](https://github.com/feathersjs/feathers/commit/53575c5))
* Updated HooksObject typings ([#1300](https://github.com/feathersjs/feathers/issues/1300)) ([b28058c](https://github.com/feathersjs/feathers/commit/b28058c))


### Features

* Add params.headers to all transports when available ([#1303](https://github.com/feathersjs/feathers/issues/1303)) ([ebce79b](https://github.com/feathersjs/feathers/commit/ebce79b))
* Change and *JWT methods to *accessToken ([#1304](https://github.com/feathersjs/feathers/issues/1304)) ([5ac826b](https://github.com/feathersjs/feathers/commit/5ac826b))
* express use service.methods ([#945](https://github.com/feathersjs/feathers/issues/945)) ([3f0b1c3](https://github.com/feathersjs/feathers/commit/3f0b1c3))





# [4.0.0-pre.0](https://github.com/feathersjs/feathers/compare/v3.2.0-pre.1...v4.0.0-pre.0) (2019-04-21)


### Bug Fixes

* Add test to make sure different id in adapter query works ([#1165](https://github.com/feathersjs/feathers/issues/1165)) ([0ba4580](https://github.com/feathersjs/feathers/commit/0ba4580))
* Add whitelist and filter support to common adapter service ([#1132](https://github.com/feathersjs/feathers/issues/1132)) ([df1daaa](https://github.com/feathersjs/feathers/commit/df1daaa))
* Added path and method in to express request for passport ([#1112](https://github.com/feathersjs/feathers/issues/1112)) ([afa1cb4](https://github.com/feathersjs/feathers/commit/afa1cb4))
* Authentication core improvements ([#1260](https://github.com/feathersjs/feathers/issues/1260)) ([c5dc7a2](https://github.com/feathersjs/feathers/commit/c5dc7a2))
* Catch connection initialization errors ([#1043](https://github.com/feathersjs/feathers/issues/1043)) ([4f9acd6](https://github.com/feathersjs/feathers/commit/4f9acd6))
* Compare socket event data using lodash's isEqual instead of indexOf ([#1061](https://github.com/feathersjs/feathers/issues/1061)) ([f706db3](https://github.com/feathersjs/feathers/commit/f706db3))
* Do not inherit app object from Object prototype ([#1153](https://github.com/feathersjs/feathers/issues/1153)) ([ed8c2e4](https://github.com/feathersjs/feathers/commit/ed8c2e4))
* Fix AdapterService multi option when set to true ([#1134](https://github.com/feathersjs/feathers/issues/1134)) ([40402fc](https://github.com/feathersjs/feathers/commit/40402fc))
* Improve JWT authentication option handling ([#1261](https://github.com/feathersjs/feathers/issues/1261)) ([31b956b](https://github.com/feathersjs/feathers/commit/31b956b))
* make codeclimate conform to rule of three ([#1076](https://github.com/feathersjs/feathers/issues/1076)) ([0a2ce87](https://github.com/feathersjs/feathers/commit/0a2ce87))
* Make Mocha a proper devDependency for every repository ([#1053](https://github.com/feathersjs/feathers/issues/1053)) ([9974803](https://github.com/feathersjs/feathers/commit/9974803))
* More robust parsing of mongodb connection string. Use new url parser. ([#1002](https://github.com/feathersjs/feathers/issues/1002)) ([74b31df](https://github.com/feathersjs/feathers/commit/74b31df))
* Normalize params to object even when it is falsy ([#1012](https://github.com/feathersjs/feathers/issues/1012)) ([af97818](https://github.com/feathersjs/feathers/commit/af97818))
* Only merge authenticated property on update ([8a564f7](https://github.com/feathersjs/feathers/commit/8a564f7))
* reduce authentication connection hook complexity and remove unnecessary checks ([fa94b2f](https://github.com/feathersjs/feathers/commit/fa94b2f))
* support a secretProvider ([#1063](https://github.com/feathersjs/feathers/issues/1063)) ([9da26ad](https://github.com/feathersjs/feathers/commit/9da26ad))
* Support Logger swallowing ([#995](https://github.com/feathersjs/feathers/issues/995)) ([5b3b37e](https://github.com/feathersjs/feathers/commit/5b3b37e)), closes [/github.com/feathersjs/generator-feathers/pull/392#issuecomment-420408312](https://github.com//github.com/feathersjs/generator-feathers/pull/392/issues/issuecomment-420408312)
* Throw error in `filterQuery` when query parameter is unknown ([#1131](https://github.com/feathersjs/feathers/issues/1131)) ([cd1a183](https://github.com/feathersjs/feathers/commit/cd1a183))
* Update 401.html ([#983](https://github.com/feathersjs/feathers/issues/983)) ([cec6bae](https://github.com/feathersjs/feathers/commit/cec6bae))
* Update 404.html ([#984](https://github.com/feathersjs/feathers/issues/984)) ([72132d1](https://github.com/feathersjs/feathers/commit/72132d1))
* Update adapter common tests ([#1135](https://github.com/feathersjs/feathers/issues/1135)) ([8166dda](https://github.com/feathersjs/feathers/commit/8166dda))
* Update adapter common tests to check for falsy ([#1140](https://github.com/feathersjs/feathers/issues/1140)) ([2856722](https://github.com/feathersjs/feathers/commit/2856722))
* Update adapter tests to not rely on error instance ([#1202](https://github.com/feathersjs/feathers/issues/1202)) ([6885e0e](https://github.com/feathersjs/feathers/commit/6885e0e))
* Update all dependencies to latest ([#1206](https://github.com/feathersjs/feathers/issues/1206)) ([e51e0f6](https://github.com/feathersjs/feathers/commit/e51e0f6))
* **adapter-commons:** Keep Symbols when filtering a query ([#1141](https://github.com/feathersjs/feathers/issues/1141)) ([c9f55d8](https://github.com/feathersjs/feathers/commit/c9f55d8))
* **authentication:** Fall back when req.app is not the application when emitting events ([#1185](https://github.com/feathersjs/feathers/issues/1185)) ([6a534f0](https://github.com/feathersjs/feathers/commit/6a534f0))
* **chore:** Add .npmignore to adapter-commons ([8e129d8](https://github.com/feathersjs/feathers/commit/8e129d8))
* **chore:** Properly configure and run code linter ([#1092](https://github.com/feathersjs/feathers/issues/1092)) ([fd3fc34](https://github.com/feathersjs/feathers/commit/fd3fc34))
* **chore:** Remove CLI and generators that belong in their own repositories ([#1091](https://github.com/feathersjs/feathers/issues/1091)) ([e894ac8](https://github.com/feathersjs/feathers/commit/e894ac8))
* **compile-task:** on windows machine ([#60](https://github.com/feathersjs/feathers/issues/60)) ([617e0a4](https://github.com/feathersjs/feathers/commit/617e0a4))
* **docs/new-features:** syntax highlighting ([#347](https://github.com/feathersjs/feathers/issues/347)) ([4ab7c95](https://github.com/feathersjs/feathers/commit/4ab7c95))
* **knex:** Fix knex + sql server issues when using authentication generator ([#257](https://github.com/feathersjs/feathers/issues/257)) ([8f8f75f](https://github.com/feathersjs/feathers/commit/8f8f75f))
* **package:** update @feathersjs/commons to version 2.0.0 ([#31](https://github.com/feathersjs/feathers/issues/31)) ([c1ef5b1](https://github.com/feathersjs/feathers/commit/c1ef5b1))
* **package:** update @feathersjs/commons to version 2.0.0 ([#692](https://github.com/feathersjs/feathers/issues/692)) ([ca665ab](https://github.com/feathersjs/feathers/commit/ca665ab))
* **package:** update config to version 3.0.0 ([#1100](https://github.com/feathersjs/feathers/issues/1100)) ([c9f4b42](https://github.com/feathersjs/feathers/commit/c9f4b42))
* use minimal RegExp matching for better performance ([#977](https://github.com/feathersjs/feathers/issues/977)) ([3ca7e97](https://github.com/feathersjs/feathers/commit/3ca7e97))
* **package:** update @feathersjs/commons to version 2.0.0 ([#45](https://github.com/feathersjs/feathers/issues/45)) ([9e82595](https://github.com/feathersjs/feathers/commit/9e82595))
* **package:** update @feathersjs/commons to version 2.0.0 ([#84](https://github.com/feathersjs/feathers/issues/84)) ([78ed39c](https://github.com/feathersjs/feathers/commit/78ed39c))
* **package:** update debug to version 3.0.0 ([#2](https://github.com/feathersjs/feathers/issues/2)) ([7e19603](https://github.com/feathersjs/feathers/commit/7e19603))
* **package:** update debug to version 3.0.0 ([#22](https://github.com/feathersjs/feathers/issues/22)) ([0b62606](https://github.com/feathersjs/feathers/commit/0b62606))
* **package:** update debug to version 3.0.0 ([#30](https://github.com/feathersjs/feathers/issues/30)) ([baf7a00](https://github.com/feathersjs/feathers/commit/baf7a00))
* **package:** update debug to version 3.0.0 ([#31](https://github.com/feathersjs/feathers/issues/31)) ([902ddf5](https://github.com/feathersjs/feathers/commit/902ddf5))
* **package:** update debug to version 3.0.0 ([#31](https://github.com/feathersjs/feathers/issues/31)) ([f23d617](https://github.com/feathersjs/feathers/commit/f23d617))
* **package:** update debug to version 3.0.0 ([#45](https://github.com/feathersjs/feathers/issues/45)) ([2391434](https://github.com/feathersjs/feathers/commit/2391434))
* **package:** update debug to version 3.0.0 ([#45](https://github.com/feathersjs/feathers/issues/45)) ([9b9bde5](https://github.com/feathersjs/feathers/commit/9b9bde5))
* **package:** update debug to version 3.0.0 ([#555](https://github.com/feathersjs/feathers/issues/555)) ([f788804](https://github.com/feathersjs/feathers/commit/f788804))
* **package:** update debug to version 3.0.0 ([#59](https://github.com/feathersjs/feathers/issues/59)) ([fedcf06](https://github.com/feathersjs/feathers/commit/fedcf06))
* **package:** update debug to version 3.0.0 ([#61](https://github.com/feathersjs/feathers/issues/61)) ([6f5009c](https://github.com/feathersjs/feathers/commit/6f5009c))
* **package:** update debug to version 3.0.0 ([#83](https://github.com/feathersjs/feathers/issues/83)) ([49f1de9](https://github.com/feathersjs/feathers/commit/49f1de9))
* **package:** update debug to version 3.0.0 ([#86](https://github.com/feathersjs/feathers/issues/86)) ([fd1bb6b](https://github.com/feathersjs/feathers/commit/fd1bb6b))
* **package:** update debug to version 3.0.1 ([#46](https://github.com/feathersjs/feathers/issues/46)) ([f8ada69](https://github.com/feathersjs/feathers/commit/f8ada69))
* **package:** update generator-feathers to version 1.0.3 ([#81](https://github.com/feathersjs/feathers/issues/81)) ([0c66bc5](https://github.com/feathersjs/feathers/commit/0c66bc5))
* **package:** update generator-feathers to version 1.0.5 ([#83](https://github.com/feathersjs/feathers/issues/83)) ([229caba](https://github.com/feathersjs/feathers/commit/229caba))
* **package:** update generator-feathers to version 1.0.6 ([#86](https://github.com/feathersjs/feathers/issues/86)) ([7ae8e56](https://github.com/feathersjs/feathers/commit/7ae8e56))
* **package:** update generator-feathers to version 1.1.0 ([#93](https://github.com/feathersjs/feathers/issues/93)) ([f393e4c](https://github.com/feathersjs/feathers/commit/f393e4c))
* **package:** update generator-feathers to version 1.1.1 ([#95](https://github.com/feathersjs/feathers/issues/95)) ([3279ba9](https://github.com/feathersjs/feathers/commit/3279ba9))
* **package:** update generator-feathers to version 1.2.0 ([#96](https://github.com/feathersjs/feathers/issues/96)) ([8eb5674](https://github.com/feathersjs/feathers/commit/8eb5674))
* **package:** update generator-feathers to version 1.2.10 ([#115](https://github.com/feathersjs/feathers/issues/115)) ([c1db2b2](https://github.com/feathersjs/feathers/commit/c1db2b2))
* **package:** update generator-feathers to version 1.2.11 ([#116](https://github.com/feathersjs/feathers/issues/116)) ([bba6550](https://github.com/feathersjs/feathers/commit/bba6550))
* **package:** update generator-feathers to version 1.2.12 ([#119](https://github.com/feathersjs/feathers/issues/119)) ([e5c737d](https://github.com/feathersjs/feathers/commit/e5c737d))
* **package:** update generator-feathers to version 1.2.2 ([#98](https://github.com/feathersjs/feathers/issues/98)) ([ee629e3](https://github.com/feathersjs/feathers/commit/ee629e3)), closes [#97](https://github.com/feathersjs/feathers/issues/97)
* **package:** update generator-feathers to version 1.2.3 ([#99](https://github.com/feathersjs/feathers/issues/99)) ([b6cf361](https://github.com/feathersjs/feathers/commit/b6cf361))
* **package:** update generator-feathers to version 1.2.4 ([#101](https://github.com/feathersjs/feathers/issues/101)) ([2182fef](https://github.com/feathersjs/feathers/commit/2182fef))
* **package:** update generator-feathers to version 1.2.5 ([#104](https://github.com/feathersjs/feathers/issues/104)) ([295f6aa](https://github.com/feathersjs/feathers/commit/295f6aa))
* **package:** update generator-feathers to version 1.2.6 ([#106](https://github.com/feathersjs/feathers/issues/106)) ([66125dc](https://github.com/feathersjs/feathers/commit/66125dc))
* **package:** update generator-feathers to version 1.2.9 ([#110](https://github.com/feathersjs/feathers/issues/110)) ([17e55dc](https://github.com/feathersjs/feathers/commit/17e55dc))
* **package:** update generator-feathers to version 2.0.0 ([#126](https://github.com/feathersjs/feathers/issues/126)) ([eff6627](https://github.com/feathersjs/feathers/commit/eff6627))
* **package:** update generator-feathers to version 2.1.0 ([#128](https://github.com/feathersjs/feathers/issues/128)) ([b712355](https://github.com/feathersjs/feathers/commit/b712355))
* **package:** update generator-feathers to version 2.1.1 ([#129](https://github.com/feathersjs/feathers/issues/129)) ([1f91c0b](https://github.com/feathersjs/feathers/commit/1f91c0b))
* **package:** update generator-feathers to version 2.2.0 ([#130](https://github.com/feathersjs/feathers/issues/130)) ([308ad0b](https://github.com/feathersjs/feathers/commit/308ad0b))
* **package:** update generator-feathers to version 2.3.0 ([#131](https://github.com/feathersjs/feathers/issues/131)) ([7894807](https://github.com/feathersjs/feathers/commit/7894807))
* **package:** update generator-feathers to version 2.3.1 ([#132](https://github.com/feathersjs/feathers/issues/132)) ([c3e3187](https://github.com/feathersjs/feathers/commit/c3e3187))
* **package:** update generator-feathers to version 2.4.0 ([#137](https://github.com/feathersjs/feathers/issues/137)) ([1645d2e](https://github.com/feathersjs/feathers/commit/1645d2e))
* **package:** update generator-feathers to version 2.4.1 ([#140](https://github.com/feathersjs/feathers/issues/140)) ([e5a5f7c](https://github.com/feathersjs/feathers/commit/e5a5f7c))
* **package:** update generator-feathers to version 2.4.4 ([#151](https://github.com/feathersjs/feathers/issues/151)) ([3dcd480](https://github.com/feathersjs/feathers/commit/3dcd480))
* **package:** update generator-feathers to version 2.5.2 ([#155](https://github.com/feathersjs/feathers/issues/155)) ([493ca4b](https://github.com/feathersjs/feathers/commit/493ca4b))
* **package:** update generator-feathers to version 2.5.3 ([#156](https://github.com/feathersjs/feathers/issues/156)) ([ef570a8](https://github.com/feathersjs/feathers/commit/ef570a8))
* **package:** update generator-feathers to version 2.5.4 ([#158](https://github.com/feathersjs/feathers/issues/158)) ([787f30c](https://github.com/feathersjs/feathers/commit/787f30c))
* **package:** update generator-feathers to version 2.5.5 ([#159](https://github.com/feathersjs/feathers/issues/159)) ([bbd1b29](https://github.com/feathersjs/feathers/commit/bbd1b29))
* **package:** update generator-feathers to version 2.5.6 ([#161](https://github.com/feathersjs/feathers/issues/161)) ([cb72a5c](https://github.com/feathersjs/feathers/commit/cb72a5c))
* **package:** update generator-feathers to version 2.6.0 ([#164](https://github.com/feathersjs/feathers/issues/164)) ([6212ec9](https://github.com/feathersjs/feathers/commit/6212ec9))
* **package:** update generator-feathers-plugin to version 0.11.0 ([#105](https://github.com/feathersjs/feathers/issues/105)) ([d40bb75](https://github.com/feathersjs/feathers/commit/d40bb75))
* **package:** update generator-feathers-plugin to version 0.12.1 ([#112](https://github.com/feathersjs/feathers/issues/112)) ([f374e01](https://github.com/feathersjs/feathers/commit/f374e01))
* **package:** update generator-feathers-plugin to version 1.0.0 ([#134](https://github.com/feathersjs/feathers/issues/134)) ([ee905b0](https://github.com/feathersjs/feathers/commit/ee905b0))
* **package:** update jsonwebtoken to version 8.0.0 ([#567](https://github.com/feathersjs/feathers/issues/567)) ([6811626](https://github.com/feathersjs/feathers/commit/6811626))
* **package:** update ms to version 2.0.0 ([#509](https://github.com/feathersjs/feathers/issues/509)) ([7e4b0b6](https://github.com/feathersjs/feathers/commit/7e4b0b6))
* **package:** update passport to version 0.4.0 ([#558](https://github.com/feathersjs/feathers/issues/558)) ([dcb14a5](https://github.com/feathersjs/feathers/commit/dcb14a5))
* **package:** update passport-jwt to version 4.0.0 ([#58](https://github.com/feathersjs/feathers/issues/58)) ([77a3800](https://github.com/feathersjs/feathers/commit/77a3800))
* **package:** update socket.io to version 2.0.0 ([#75](https://github.com/feathersjs/feathers/issues/75)) ([d4a4b71](https://github.com/feathersjs/feathers/commit/d4a4b71))
* **package:** update yeoman-environment to version 2.0.0 ([#89](https://github.com/feathersjs/feathers/issues/89)) ([2355652](https://github.com/feathersjs/feathers/commit/2355652))
* **package:** update yeoman-generator to version 2.0.0 ([#279](https://github.com/feathersjs/feathers/issues/279)) ([4f38e8b](https://github.com/feathersjs/feathers/commit/4f38e8b))
* **package:** update yeoman-generator to version 2.0.0 ([#46](https://github.com/feathersjs/feathers/issues/46)) ([7071095](https://github.com/feathersjs/feathers/commit/7071095))
* **package:** update yeoman-generator to version 3.0.0 ([#374](https://github.com/feathersjs/feathers/issues/374)) ([acdbbca](https://github.com/feathersjs/feathers/commit/acdbbca))


### chore

* **package:** Move adapter tests into their own module ([#1164](https://github.com/feathersjs/feathers/issues/1164)) ([dcc1e6b](https://github.com/feathersjs/feathers/commit/dcc1e6b))
* drop support for Node.js 0.10 ([#48](https://github.com/feathersjs/feathers/issues/48)) ([3f7555a](https://github.com/feathersjs/feathers/commit/3f7555a))


### Features

* @feathers/cli: introduce option to choose jest for tests instead of mocha ([#1057](https://github.com/feathersjs/feathers/issues/1057)) ([1356a1c](https://github.com/feathersjs/feathers/commit/1356a1c))
* @feathersjs/authentication-oauth ([#1299](https://github.com/feathersjs/feathers/issues/1299)) ([656bae7](https://github.com/feathersjs/feathers/commit/656bae7))
* Add authentication through oAuth redirect to authentication client ([#1301](https://github.com/feathersjs/feathers/issues/1301)) ([35d8043](https://github.com/feathersjs/feathers/commit/35d8043))
* Add AuthenticationBaseStrategy and make authentication option handling more explicit ([#1284](https://github.com/feathersjs/feathers/issues/1284)) ([2667d92](https://github.com/feathersjs/feathers/commit/2667d92))
* Add TypeScript definitions ([#1275](https://github.com/feathersjs/feathers/issues/1275)) ([9dd6713](https://github.com/feathersjs/feathers/commit/9dd6713))
* Added generators for feathers-objection & feathers-cassandra ([#1010](https://github.com/feathersjs/feathers/issues/1010)) ([c8b27d0](https://github.com/feathersjs/feathers/commit/c8b27d0))
* Allow registering a service at the root level ([#1115](https://github.com/feathersjs/feathers/issues/1115)) ([c73d322](https://github.com/feathersjs/feathers/commit/c73d322))
* Allow to skip sending service events ([#1270](https://github.com/feathersjs/feathers/issues/1270)) ([b487bbd](https://github.com/feathersjs/feathers/commit/b487bbd))
* Authentication v3 client ([#1240](https://github.com/feathersjs/feathers/issues/1240)) ([65b43bd](https://github.com/feathersjs/feathers/commit/65b43bd))
* Authentication v3 core server implementation ([#1205](https://github.com/feathersjs/feathers/issues/1205)) ([1bd7591](https://github.com/feathersjs/feathers/commit/1bd7591))
* Authentication v3 Express integration ([#1218](https://github.com/feathersjs/feathers/issues/1218)) ([82bcfbe](https://github.com/feathersjs/feathers/commit/82bcfbe))
* Authentication v3 local authentication ([#1211](https://github.com/feathersjs/feathers/issues/1211)) ([0fa5f7c](https://github.com/feathersjs/feathers/commit/0fa5f7c))
* Common database adapter utilities and test suite ([#1130](https://github.com/feathersjs/feathers/issues/1130)) ([17b3dc8](https://github.com/feathersjs/feathers/commit/17b3dc8))
* Make custom query for oAuth authentication ([#1124](https://github.com/feathersjs/feathers/issues/1124)) ([5d43e3c](https://github.com/feathersjs/feathers/commit/5d43e3c))
* Remove (hook, next) signature and SKIP support ([#1269](https://github.com/feathersjs/feathers/issues/1269)) ([211c0f8](https://github.com/feathersjs/feathers/commit/211c0f8))
* Support params symbol to skip authenticate hook ([#1296](https://github.com/feathersjs/feathers/issues/1296)) ([d16cf4d](https://github.com/feathersjs/feathers/commit/d16cf4d))


### BREAKING CHANGES

* Rewrite for authentication v3
* Update authentication strategies for @feathersjs/authentication v3
* **package:** Removes adapter tests from @feathersjs/adapter-commons
* Move database adapter utilities from @feathersjs/commons into its own module
* This module no longer supports Node.js 0.10
