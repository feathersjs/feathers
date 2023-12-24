# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.12](https://github.com/feathersjs/feathers/compare/v5.0.11...v5.0.12) (2023-11-28)

### Bug Fixes

- **schema:** Allow $in and $nin queries to work for arrays ([#3352](https://github.com/feathersjs/feathers/issues/3352)) ([677c214](https://github.com/feathersjs/feathers/commit/677c214a353a7f9a1f90649b9bbec4d0d6517a6f))

## [5.0.11](https://github.com/feathersjs/feathers/compare/v5.0.10...v5.0.11) (2023-10-11)

### Bug Fixes

- **knex:** Update all dependencies and Knex peer ([#3308](https://github.com/feathersjs/feathers/issues/3308)) ([d2f9860](https://github.com/feathersjs/feathers/commit/d2f986036c4741cce2339d8abbcc6b2eb037a12a))

## [5.0.10](https://github.com/feathersjs/feathers/compare/v5.0.9...v5.0.10) (2023-10-03)

### Bug Fixes

- **typebox:** Allow default value in StringEnum ([#3281](https://github.com/feathersjs/feathers/issues/3281)) ([25af09a](https://github.com/feathersjs/feathers/commit/25af09ad065e72768bf88bc8b529b68f2ca4da17))

## [5.0.9](https://github.com/feathersjs/feathers/compare/v5.0.8...v5.0.9) (2023-09-27)

### Bug Fixes

- **typebox:** allow TUnion<TObject[]> inside getValidator ([#3262](https://github.com/feathersjs/feathers/issues/3262)) ([cf9df96](https://github.com/feathersjs/feathers/commit/cf9df96c1011fcf13e9c6d652b06036bb0aac1c3))

## [5.0.8](https://github.com/feathersjs/feathers/compare/v5.0.7...v5.0.8) (2023-07-19)

**Note:** Version bump only for package @feathersjs/typebox

## [5.0.7](https://github.com/feathersjs/feathers/compare/v5.0.6...v5.0.7) (2023-07-14)

**Note:** Version bump only for package @feathersjs/typebox

## [5.0.6](https://github.com/feathersjs/feathers/compare/v5.0.5...v5.0.6) (2023-06-15)

**Note:** Version bump only for package @feathersjs/typebox

## [5.0.5](https://github.com/feathersjs/feathers/compare/v5.0.4...v5.0.5) (2023-04-28)

### Bug Fixes

- **typebox:** Revert to TypeBox 0.25 ([#3183](https://github.com/feathersjs/feathers/issues/3183)) ([cacedf5](https://github.com/feathersjs/feathers/commit/cacedf59e3d2df836777f0cd06ab1b2484ed87c5))

## [5.0.4](https://github.com/feathersjs/feathers/compare/v5.0.3...v5.0.4) (2023-04-12)

### Bug Fixes

- Make sure all Readme files are up to date ([#3154](https://github.com/feathersjs/feathers/issues/3154)) ([a5f0b38](https://github.com/feathersjs/feathers/commit/a5f0b38bbf2a11486415a39533bcc6c67fb51e3e))
- **typebox:** Implement custom TypeBuilder for backwards compatibility ([#3150](https://github.com/feathersjs/feathers/issues/3150)) ([962bd87](https://github.com/feathersjs/feathers/commit/962bd87217212320b1a68f6556a16b8a6b8f757c))

## [5.0.3](https://github.com/feathersjs/feathers/compare/v5.0.2...v5.0.3) (2023-04-05)

### Bug Fixes

- **authentication:** Ensure authentication.entity configuration can be null ([#3136](https://github.com/feathersjs/feathers/issues/3136)) ([c47349b](https://github.com/feathersjs/feathers/commit/c47349b9dcf2067b7b572c5463b15b2a8fbda972))
- **dependencies:** Update all dependencies ([#3139](https://github.com/feathersjs/feathers/issues/3139)) ([f24276e](https://github.com/feathersjs/feathers/commit/f24276e9a909e2e58a0730c730258ce1f70f4028))
- **knex:** Get by id and transactions should work with params.knex ([#3146](https://github.com/feathersjs/feathers/issues/3146)) ([b172b5e](https://github.com/feathersjs/feathers/commit/b172b5ea9b461642874eb7d2ba01dc4cfc275155))
- **typebox:** Upgrade to TypeBox 0.26.0 ([#3113](https://github.com/feathersjs/feathers/issues/3113)) ([d1d9598](https://github.com/feathersjs/feathers/commit/d1d95984dd94d2b9305e7338421f84f9c4f733fd))

## [5.0.1](https://github.com/feathersjs/feathers/compare/v5.0.0...v5.0.1) (2023-03-15)

**Note:** Version bump only for package @feathersjs/typebox

# [5.0.0](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.38...v5.0.0) (2023-02-24)

**Note:** Version bump only for package @feathersjs/typebox

# [5.0.0-pre.38](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.37...v5.0.0-pre.38) (2023-02-17)

### Features

- **schema:** Add schema helper for handling Object ids ([#3058](https://github.com/feathersjs/feathers/issues/3058)) ([1393bed](https://github.com/feathersjs/feathers/commit/1393bed81a9ee814de6aab0e537af83e667591a2))

# [5.0.0-pre.37](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.36...v5.0.0-pre.37) (2023-02-09)

### Bug Fixes

- **typebox:** Allow nested or in and queries ([#3029](https://github.com/feathersjs/feathers/issues/3029)) ([39e0b78](https://github.com/feathersjs/feathers/commit/39e0b785238b809aa9b4dea9b95efc3c188c9baa))

# [5.0.0-pre.36](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.35...v5.0.0-pre.36) (2023-01-29)

### Bug Fixes

- **configuration:** Add pool and connection object to SQL database default configuration ([#3023](https://github.com/feathersjs/feathers/issues/3023)) ([092c749](https://github.com/feathersjs/feathers/commit/092c749d43f7da4d019576d1210fe7d3719a44a2))
- **schema:** Fix TypeBox extension value query syntax inference ([#3010](https://github.com/feathersjs/feathers/issues/3010)) ([f1c7a76](https://github.com/feathersjs/feathers/commit/f1c7a76586bbb8aed66ef866c3dcd666d79f3a24))
- Update all dependencies ([#3024](https://github.com/feathersjs/feathers/issues/3024)) ([283dc47](https://github.com/feathersjs/feathers/commit/283dc4798d85584bc031e6e54b83b4ea77d1edd0))

# [5.0.0-pre.35](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.34...v5.0.0-pre.35) (2023-01-12)

### Features

- **generators:** Move core code generators to shared generators package ([#2982](https://github.com/feathersjs/feathers/issues/2982)) ([0328d22](https://github.com/feathersjs/feathers/commit/0328d2292153870bc43958f73d2c6f288a8cec17))
- **schema:** Allow to add additional operators to the query syntax ([#2941](https://github.com/feathersjs/feathers/issues/2941)) ([f324940](https://github.com/feathersjs/feathers/commit/f324940d5795b41e8c6fc113defb0beb7ab03a0a))

# [5.0.0-pre.34](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.33...v5.0.0-pre.34) (2022-12-14)

### Bug Fixes

- **schema:** Allow query schemas with no properties, error on unsupported types ([#2904](https://github.com/feathersjs/feathers/issues/2904)) ([b66c734](https://github.com/feathersjs/feathers/commit/b66c734357478f51b2d38fa7f3eee08640cea26e))
- **typebox:** Improve query syntax defaults ([#2888](https://github.com/feathersjs/feathers/issues/2888)) ([59f3cdc](https://github.com/feathersjs/feathers/commit/59f3cdca6376e34fe39a7b91db837d0325aeb5db))

# [5.0.0-pre.33](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.32...v5.0.0-pre.33) (2022-11-08)

### Features

- **schema:** Add StringEnum to TypeBox module ([#2827](https://github.com/feathersjs/feathers/issues/2827)) ([65d3665](https://github.com/feathersjs/feathers/commit/65d36656f50a48f633fa3fcabaea10521d04bf1c))

# [5.0.0-pre.32](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.31...v5.0.0-pre.32) (2022-10-26)

**Note:** Version bump only for package @feathersjs/typebox

# [5.0.0-pre.31](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.30...v5.0.0-pre.31) (2022-10-12)

### Features

- **cli:** Improve generated schema definitions ([#2783](https://github.com/feathersjs/feathers/issues/2783)) ([474a9fd](https://github.com/feathersjs/feathers/commit/474a9fda2107e9bcf357746320a8e00cda8182b6))

# [5.0.0-pre.30](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.29...v5.0.0-pre.30) (2022-10-07)

### Features

- **schema:** Make schemas validation library independent and add TypeBox support ([#2772](https://github.com/feathersjs/feathers/issues/2772)) ([44172d9](https://github.com/feathersjs/feathers/commit/44172d99b566d11d9ceda04f1d0bf72b6d05ce76))
