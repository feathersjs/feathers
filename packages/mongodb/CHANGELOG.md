# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.12](https://github.com/feathersjs/feathers/compare/v5.0.11...v5.0.12) (2023-11-28)

### Bug Fixes

- allow \_patch to modify the entire base schema ([#3300](https://github.com/feathersjs/feathers/issues/3300)) ([0f41622](https://github.com/feathersjs/feathers/commit/0f41622307589b3a0b62ac411a73e6a601bda171))

## [5.0.11](https://github.com/feathersjs/feathers/compare/v5.0.10...v5.0.11) (2023-10-11)

### Bug Fixes

- **knex:** Update all dependencies and Knex peer ([#3308](https://github.com/feathersjs/feathers/issues/3308)) ([d2f9860](https://github.com/feathersjs/feathers/commit/d2f986036c4741cce2339d8abbcc6b2eb037a12a))

## [5.0.10](https://github.com/feathersjs/feathers/compare/v5.0.9...v5.0.10) (2023-10-03)

**Note:** Version bump only for package @feathersjs/mongodb

## [5.0.9](https://github.com/feathersjs/feathers/compare/v5.0.8...v5.0.9) (2023-09-27)

**Note:** Version bump only for package @feathersjs/mongodb

## [5.0.8](https://github.com/feathersjs/feathers/compare/v5.0.7...v5.0.8) (2023-07-19)

**Note:** Version bump only for package @feathersjs/mongodb

## [5.0.7](https://github.com/feathersjs/feathers/compare/v5.0.6...v5.0.7) (2023-07-14)

**Note:** Version bump only for package @feathersjs/mongodb

## [5.0.6](https://github.com/feathersjs/feathers/compare/v5.0.5...v5.0.6) (2023-06-15)

**Note:** Version bump only for package @feathersjs/mongodb

## [5.0.5](https://github.com/feathersjs/feathers/compare/v5.0.4...v5.0.5) (2023-04-28)

### Bug Fixes

- **mongodb:** Speed up multi create ([#3171](https://github.com/feathersjs/feathers/issues/3171)) ([e34f728](https://github.com/feathersjs/feathers/commit/e34f728139a1008503aa440f1b7cf6395719417b))

## [5.0.4](https://github.com/feathersjs/feathers/compare/v5.0.3...v5.0.4) (2023-04-12)

### Bug Fixes

- Make sure all Readme files are up to date ([#3154](https://github.com/feathersjs/feathers/issues/3154)) ([a5f0b38](https://github.com/feathersjs/feathers/commit/a5f0b38bbf2a11486415a39533bcc6c67fb51e3e))

## [5.0.3](https://github.com/feathersjs/feathers/compare/v5.0.2...v5.0.3) (2023-04-05)

### Bug Fixes

- **dependencies:** Update all dependencies ([#3139](https://github.com/feathersjs/feathers/issues/3139)) ([f24276e](https://github.com/feathersjs/feathers/commit/f24276e9a909e2e58a0730c730258ce1f70f4028))
- **mongodb:** Add MongoDB as peerDependency ([#3148](https://github.com/feathersjs/feathers/issues/3148)) ([0137b40](https://github.com/feathersjs/feathers/commit/0137b40fb694fa95e3b7b7ad41504831b894d977))

## [5.0.1](https://github.com/feathersjs/feathers/compare/v5.0.0...v5.0.1) (2023-03-15)

### Bug Fixes

- **memory/mongodb:** $select as only property & force 'id' in '$select' ([#3081](https://github.com/feathersjs/feathers/issues/3081)) ([fbe3cf5](https://github.com/feathersjs/feathers/commit/fbe3cf5199e102b5aeda2ae33828d5034df3d105))

# [5.0.0](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.38...v5.0.0) (2023-02-24)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.38](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.37...v5.0.0-pre.38) (2023-02-17)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.37](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.36...v5.0.0-pre.37) (2023-02-09)

### Features

- **mongodb:** Add Object ID keyword converter and update MongoDB CLI & docs ([#3041](https://github.com/feathersjs/feathers/issues/3041)) ([ca0994e](https://github.com/feathersjs/feathers/commit/ca0994eaecb5a31f310bc980d106834e11f24f41))

# [5.0.0-pre.36](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.35...v5.0.0-pre.36) (2023-01-29)

### Bug Fixes

- **databases:** Ensure that query sanitization is not necessary when using query schemas ([#3022](https://github.com/feathersjs/feathers/issues/3022)) ([dbf514e](https://github.com/feathersjs/feathers/commit/dbf514e85d1508b95c007462a39b3cadd4ff391d))
- **databases:** Improve documentation for adapters and allow dynamic Knex adapter options ([#3019](https://github.com/feathersjs/feathers/issues/3019)) ([66c4b5e](https://github.com/feathersjs/feathers/commit/66c4b5e72000dd03acb57fca1cad4737c85c9c9e))
- Update all dependencies ([#3024](https://github.com/feathersjs/feathers/issues/3024)) ([283dc47](https://github.com/feathersjs/feathers/commit/283dc4798d85584bc031e6e54b83b4ea77d1edd0))

### Features

- **database:** Add and to the query syntax ([#3021](https://github.com/feathersjs/feathers/issues/3021)) ([00cb0d9](https://github.com/feathersjs/feathers/commit/00cb0d9c302ae951ae007d3d6ceba33e254edd9c))

# [5.0.0-pre.35](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.34...v5.0.0-pre.35) (2023-01-12)

### Bug Fixes

- **databases:** Make sure adapter method signatures are exported properly ([#2943](https://github.com/feathersjs/feathers/issues/2943)) ([458d668](https://github.com/feathersjs/feathers/commit/458d66859e256c5854e7590f0b4a11b233fe0374))

### Features

- **generators:** Move core code generators to shared generators package ([#2982](https://github.com/feathersjs/feathers/issues/2982)) ([0328d22](https://github.com/feathersjs/feathers/commit/0328d2292153870bc43958f73d2c6f288a8cec17))

# [5.0.0-pre.34](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.33...v5.0.0-pre.34) (2022-12-14)

### Bug Fixes

- **schema:** Check for undefined value in resolveQueryObjectId resolver ([#2914](https://github.com/feathersjs/feathers/issues/2914)) ([d9449fa](https://github.com/feathersjs/feathers/commit/d9449fa835f58fc9cec5f7254c50219494129140))

### Features

- **adapter:** Add patch data type to adapters and refactor AdapterBase usage ([#2906](https://github.com/feathersjs/feathers/issues/2906)) ([9ddc2e6](https://github.com/feathersjs/feathers/commit/9ddc2e6b028f026f939d6af68125847e5c6734b4))

# [5.0.0-pre.33](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.32...v5.0.0-pre.33) (2022-11-08)

### Features

- **mongodb:** Add ObjectId resolvers and MongoDB option in the guide ([#2847](https://github.com/feathersjs/feathers/issues/2847)) ([c5c1fba](https://github.com/feathersjs/feathers/commit/c5c1fba5718a63412075cd3838b86b889eb0bd48))

# [5.0.0-pre.32](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.31...v5.0.0-pre.32) (2022-10-26)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.31](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.30...v5.0.0-pre.31) (2022-10-12)

### Features

- **cli:** Generate full client test suite and improve typed client ([#2788](https://github.com/feathersjs/feathers/issues/2788)) ([57119b6](https://github.com/feathersjs/feathers/commit/57119b6bb2797f7297cf054268a248c093ecd538))
- **cli:** Improve generated schema definitions ([#2783](https://github.com/feathersjs/feathers/issues/2783)) ([474a9fd](https://github.com/feathersjs/feathers/commit/474a9fda2107e9bcf357746320a8e00cda8182b6))

# [5.0.0-pre.30](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.29...v5.0.0-pre.30) (2022-10-07)

### Features

- **core:** Allow to unregister services at runtime ([#2756](https://github.com/feathersjs/feathers/issues/2756)) ([d16601f](https://github.com/feathersjs/feathers/commit/d16601f2277dca5357866ffdefba2a611f6dc7fa))

# [5.0.0-pre.29](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.28...v5.0.0-pre.29) (2022-09-16)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.28](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.27...v5.0.0-pre.28) (2022-08-03)

### Bug Fixes

- **cli:** Improve generated application and client ([#2701](https://github.com/feathersjs/feathers/issues/2701)) ([bd55ffb](https://github.com/feathersjs/feathers/commit/bd55ffb812e89bf215f4515e7f137656ea888c3f))
- **mongodb:** Ensure transactions are used properly in create ([#2699](https://github.com/feathersjs/feathers/issues/2699)) ([fe22615](https://github.com/feathersjs/feathers/commit/fe22615b7fa17d3c20ac26d6f82097917c9b63f6))

# [5.0.0-pre.27](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.26...v5.0.0-pre.27) (2022-07-13)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.26](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.25...v5.0.0-pre.26) (2022-06-22)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.25](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.24...v5.0.0-pre.25) (2022-06-22)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.24](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.23...v5.0.0-pre.24) (2022-06-21)

### Features

- **authentication-local:** Add passwordHash property resolver ([#2660](https://github.com/feathersjs/feathers/issues/2660)) ([b41279b](https://github.com/feathersjs/feathers/commit/b41279b55eea3771a6fa4983a37be2413287bbc6))
- **knex:** Add KnexJS SQL database adapter to core ([#2671](https://github.com/feathersjs/feathers/issues/2671)) ([9380fff](https://github.com/feathersjs/feathers/commit/9380fff58596e8bb90b8bb098d2795b7eadfec20))

# [5.0.0-pre.23](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.22...v5.0.0-pre.23) (2022-06-06)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.22](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.21...v5.0.0-pre.22) (2022-05-24)

**Note:** Version bump only for package @feathersjs/mongodb

# [5.0.0-pre.21](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.20...v5.0.0-pre.21) (2022-05-23)

### Bug Fixes

- **typescript:** Make additional types generic to work with extended types ([#2625](https://github.com/feathersjs/feathers/issues/2625)) ([269fdec](https://github.com/feathersjs/feathers/commit/269fdecc5961092dc8608b3cbe16f433c80bfa96))

# [5.0.0-pre.20](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.19...v5.0.0-pre.20) (2022-05-04)

### Bug Fixes

- **dependencies:** Lock monorepo package version numbers ([#2623](https://github.com/feathersjs/feathers/issues/2623)) ([5640c10](https://github.com/feathersjs/feathers/commit/5640c1020cc139994e695d658c08bad3494db507))

# [5.0.0-pre.19](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.18...v5.0.0-pre.19) (2022-05-01)

### Features

- **mongodb:** Add feathers-mongodb adapter as @feathersjs/mongodb ([#2610](https://github.com/feathersjs/feathers/issues/2610)) ([6d43734](https://github.com/feathersjs/feathers/commit/6d43734a53db02c435cafc52a22dca414e5d0940))
