# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [5.0.12](https://github.com/feathersjs/feathers/compare/v5.0.11...v5.0.12) (2023-11-28)

### Bug Fixes

- **generators:** use `export type` vs `export` ([#3246](https://github.com/feathersjs/feathers/issues/3246)) ([82d30fd](https://github.com/feathersjs/feathers/commit/82d30fd37914e61935e068e89fc389f6bf47aaad))

## [5.0.11](https://github.com/feathersjs/feathers/compare/v5.0.10...v5.0.11) (2023-10-11)

### Bug Fixes

- **knex:** Update all dependencies and Knex peer ([#3308](https://github.com/feathersjs/feathers/issues/3308)) ([d2f9860](https://github.com/feathersjs/feathers/commit/d2f986036c4741cce2339d8abbcc6b2eb037a12a))
- **schema:** HookContext is now typed in schema ([#3306](https://github.com/feathersjs/feathers/issues/3306)) ([65fab86](https://github.com/feathersjs/feathers/commit/65fab86407b813122f24db928a59986c7286f270))

## [5.0.10](https://github.com/feathersjs/feathers/compare/v5.0.9...v5.0.10) (2023-10-03)

**Note:** Version bump only for package @feathersjs/generators

## [5.0.9](https://github.com/feathersjs/feathers/compare/v5.0.8...v5.0.9) (2023-09-27)

### Bug Fixes

- **generators:** Fix configure channels when not real-time app ([#3271](https://github.com/feathersjs/feathers/issues/3271)) ([c619ab2](https://github.com/feathersjs/feathers/commit/c619ab2c57f692c419fee610c269c1502b124852))

## [5.0.8](https://github.com/feathersjs/feathers/compare/v5.0.7...v5.0.8) (2023-07-19)

**Note:** Version bump only for package @feathersjs/generators

## [5.0.7](https://github.com/feathersjs/feathers/compare/v5.0.6...v5.0.7) (2023-07-14)

### Bug Fixes

- **generators:** Fix channel/service configuration order for Koa based apps ([580344e](https://github.com/feathersjs/feathers/commit/580344e96fe8a2f17fd53476af5a0c7ddefac0b6))

## [5.0.6](https://github.com/feathersjs/feathers/compare/v5.0.5...v5.0.6) (2023-06-15)

**Note:** Version bump only for package @feathersjs/generators

## [5.0.5](https://github.com/feathersjs/feathers/compare/v5.0.4...v5.0.5) (2023-04-28)

### Bug Fixes

- **generators:** Add sourceMap to tsconfig.json template ([#3166](https://github.com/feathersjs/feathers/issues/3166)) ([3049b7a](https://github.com/feathersjs/feathers/commit/3049b7a425d01cdd3058442c7183307a06cfc87a))

## [5.0.4](https://github.com/feathersjs/feathers/compare/v5.0.3...v5.0.4) (2023-04-12)

### Bug Fixes

- Make sure all Readme files are up to date ([#3154](https://github.com/feathersjs/feathers/issues/3154)) ([a5f0b38](https://github.com/feathersjs/feathers/commit/a5f0b38bbf2a11486415a39533bcc6c67fb51e3e))

## [5.0.3](https://github.com/feathersjs/feathers/compare/v5.0.2...v5.0.3) (2023-04-05)

### Bug Fixes

- **dependencies:** Update all dependencies ([#3139](https://github.com/feathersjs/feathers/issues/3139)) ([f24276e](https://github.com/feathersjs/feathers/commit/f24276e9a909e2e58a0730c730258ce1f70f4028))
- **generators:** Properly log unhandled rejection ([#3149](https://github.com/feathersjs/feathers/issues/3149)) ([eda8f78](https://github.com/feathersjs/feathers/commit/eda8f78fa5084c3247ad10b051610b3c51a13d24))

## [5.0.2](https://github.com/feathersjs/feathers/compare/v5.0.1...v5.0.2) (2023-03-23)

### Bug Fixes

- **generators:** Make sure TypeScript version in generated app matches ([#3122](https://github.com/feathersjs/feathers/issues/3122)) ([f0acfdf](https://github.com/feathersjs/feathers/commit/f0acfdf9d33337bf40ca12126c2550f56e31fa3b))

## [5.0.1](https://github.com/feathersjs/feathers/compare/v5.0.0...v5.0.1) (2023-03-15)

### Bug Fixes

- **generators:** Conditionally import channels in Express app ([#3106](https://github.com/feathersjs/feathers/issues/3106)) ([c2dbaaa](https://github.com/feathersjs/feathers/commit/c2dbaaa4d1d5a5675b5812a7ed2317076ac414fe))

# [5.0.0](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.38...v5.0.0) (2023-02-24)

### Bug Fixes

- **generators:** Fix typo in service client generator ([#3068](https://github.com/feathersjs/feathers/issues/3068)) ([612032e](https://github.com/feathersjs/feathers/commit/612032eced24ecbcf255d51ff0d537d74227cfd7))

# [5.0.0-pre.38](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.37...v5.0.0-pre.38) (2023-02-17)

### Features

- **generators:** Final tweaks to the generators ([#3060](https://github.com/feathersjs/feathers/issues/3060)) ([1bf1544](https://github.com/feathersjs/feathers/commit/1bf1544fa8deeaa44ba354fb539dc3f1fd187767))
- **schema:** Add schema helper for handling Object ids ([#3058](https://github.com/feathersjs/feathers/issues/3058)) ([1393bed](https://github.com/feathersjs/feathers/commit/1393bed81a9ee814de6aab0e537af83e667591a2))

# [5.0.0-pre.37](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.36...v5.0.0-pre.37) (2023-02-09)

### Bug Fixes

- **generators:** Add schema selection to CI test matrix ([#3035](https://github.com/feathersjs/feathers/issues/3035)) ([7484b16](https://github.com/feathersjs/feathers/commit/7484b164fba4ac2ee379dc5c6363f964f45e94d3))
- **generators:** Fix Knex migration generated filename ([#3033](https://github.com/feathersjs/feathers/issues/3033)) ([1ac18a7](https://github.com/feathersjs/feathers/commit/1ac18a7143173d973af982772678834f7a7334f7))
- **generators:** Generated app does not start when choosing JSON schema ([#3034](https://github.com/feathersjs/feathers/issues/3034)) ([7b8250b](https://github.com/feathersjs/feathers/commit/7b8250bd535c3c5ec7429a65139335ad43616ae0))

### Features

- **mongodb:** Add Object ID keyword converter and update MongoDB CLI & docs ([#3041](https://github.com/feathersjs/feathers/issues/3041)) ([ca0994e](https://github.com/feathersjs/feathers/commit/ca0994eaecb5a31f310bc980d106834e11f24f41))

# [5.0.0-pre.36](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.35...v5.0.0-pre.36) (2023-01-29)

### Bug Fixes

- **generators:** Add main schema to all validators ([#2997](https://github.com/feathersjs/feathers/issues/2997)) ([5854dea](https://github.com/feathersjs/feathers/commit/5854dea7f610262121a49623ec5bbd474dcd3ef3))
- **generators:** Add TypeScript as normal instead of dev dependency ([#3011](https://github.com/feathersjs/feathers/issues/3011)) ([2f67398](https://github.com/feathersjs/feathers/commit/2f673987f38b199e75aff629b7cdfcaebfd69c4c))
- **generators:** Do not removeAdditional in queries ([#3000](https://github.com/feathersjs/feathers/issues/3000)) ([ef501bc](https://github.com/feathersjs/feathers/commit/ef501bcfa528119168787e9d857f1bb90e0c3114))
- Update all dependencies ([#3024](https://github.com/feathersjs/feathers/issues/3024)) ([283dc47](https://github.com/feathersjs/feathers/commit/283dc4798d85584bc031e6e54b83b4ea77d1edd0))

### Features

- **generators:** Add service file for shared information ([#3008](https://github.com/feathersjs/feathers/issues/3008)) ([0a1665d](https://github.com/feathersjs/feathers/commit/0a1665d23e002afadb40ed99bf0168f0fceb0054))

# [5.0.0-pre.35](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.34...v5.0.0-pre.35) (2023-01-12)

### Features

- **generators:** Move core code generators to shared generators package ([#2982](https://github.com/feathersjs/feathers/issues/2982)) ([0328d22](https://github.com/feathersjs/feathers/commit/0328d2292153870bc43958f73d2c6f288a8cec17))
