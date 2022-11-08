# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0-pre.33](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.32...v5.0.0-pre.33) (2022-11-08)

### Bug Fixes

- **cli:** Fix MongoDB connection database name parsing ([#2845](https://github.com/feathersjs/feathers/issues/2845)) ([50e7463](https://github.com/feathersjs/feathers/commit/50e7463971ef95cb98358b70a721e67554d92eb5))
- **cli:** Use proper MSSQL client ([#2853](https://github.com/feathersjs/feathers/issues/2853)) ([bae5176](https://github.com/feathersjs/feathers/commit/bae5176488b46fc377e53719d20e0036e087aa16))
- **docs:** Add JavaScript web app frontend guide ([#2834](https://github.com/feathersjs/feathers/issues/2834)) ([68cf03f](https://github.com/feathersjs/feathers/commit/68cf03f092da38ccbec5e9fd42b95d00f5a0a9f2))

### Features

- **mongodb:** Add ObjectId resolvers and MongoDB option in the guide ([#2847](https://github.com/feathersjs/feathers/issues/2847)) ([c5c1fba](https://github.com/feathersjs/feathers/commit/c5c1fba5718a63412075cd3838b86b889eb0bd48))

# [5.0.0-pre.32](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.31...v5.0.0-pre.32) (2022-10-26)

### Bug Fixes

- **cli:** Ensure code injection points are not code style dependent ([#2832](https://github.com/feathersjs/feathers/issues/2832)) ([0776e26](https://github.com/feathersjs/feathers/commit/0776e26bfe4c1df9d2786499941bd3faba1715c0))
- **cli:** Only generate authentication setup when selected ([#2823](https://github.com/feathersjs/feathers/issues/2823)) ([7d219d9](https://github.com/feathersjs/feathers/commit/7d219d9c5269267b50f3ce99a5653d645f9927c1))
- **docs:** Review transport API docs and update Express middleware setup ([#2811](https://github.com/feathersjs/feathers/issues/2811)) ([1b97f14](https://github.com/feathersjs/feathers/commit/1b97f14d474f5613482f259eeaa585c24fcfab43))
- **transports:** Add remaining middleware for generated apps to Koa and Express ([#2796](https://github.com/feathersjs/feathers/issues/2796)) ([0d5781a](https://github.com/feathersjs/feathers/commit/0d5781a5c72a0cbb2ec8211bfa099f0aefe115a2))

### Features

- **cli:** Add authentication client to generated client ([#2801](https://github.com/feathersjs/feathers/issues/2801)) ([bd59f91](https://github.com/feathersjs/feathers/commit/bd59f91b45a01c2eea0c4386e567f4de5aa6ad99))

# [5.0.0-pre.31](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.30...v5.0.0-pre.31) (2022-10-12)

### Features

- **cli:** Generate full client test suite and improve typed client ([#2788](https://github.com/feathersjs/feathers/issues/2788)) ([57119b6](https://github.com/feathersjs/feathers/commit/57119b6bb2797f7297cf054268a248c093ecd538))
- **cli:** Improve generated schema definitions ([#2783](https://github.com/feathersjs/feathers/issues/2783)) ([474a9fd](https://github.com/feathersjs/feathers/commit/474a9fda2107e9bcf357746320a8e00cda8182b6))

# [5.0.0-pre.30](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.29...v5.0.0-pre.30) (2022-10-07)

### Bug Fixes

- **core:** Ensure setup and teardown can be overriden and maintain hook functionality ([#2779](https://github.com/feathersjs/feathers/issues/2779)) ([ab580cb](https://github.com/feathersjs/feathers/commit/ab580cbcaa68d19144d86798c13bf564f9d424a6))

### Features

- **cli:** Add ability to `npm init feathers` ([#2755](https://github.com/feathersjs/feathers/issues/2755)) ([d734931](https://github.com/feathersjs/feathers/commit/d734931ffd4f983a05d9e771ce0e43b696c2bc0e))
- **cli:** Improve CLI interface ([#2753](https://github.com/feathersjs/feathers/issues/2753)) ([c7e1b7e](https://github.com/feathersjs/feathers/commit/c7e1b7e80aacb84441908c3d73512d9cf7557f7e))
- **core:** Allow to unregister services at runtime ([#2756](https://github.com/feathersjs/feathers/issues/2756)) ([d16601f](https://github.com/feathersjs/feathers/commit/d16601f2277dca5357866ffdefba2a611f6dc7fa))
- **schema:** Make schemas validation library independent and add TypeBox support ([#2772](https://github.com/feathersjs/feathers/issues/2772)) ([44172d9](https://github.com/feathersjs/feathers/commit/44172d99b566d11d9ceda04f1d0bf72b6d05ce76))

# [5.0.0-pre.29](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.28...v5.0.0-pre.29) (2022-09-16)

### Features

- Add CORS support to oAuth, Express, Koa and generated application ([#2744](https://github.com/feathersjs/feathers/issues/2744)) ([fd218f2](https://github.com/feathersjs/feathers/commit/fd218f289f8ca4c101e9938e8683e2efef6e8131))
- **authentication-oauth:** Koa and transport independent oAuth authentication ([#2737](https://github.com/feathersjs/feathers/issues/2737)) ([9231525](https://github.com/feathersjs/feathers/commit/9231525a24bb790ba9c5d940f2867a9c727691c9))
- **cli:** Add custom environment variable support to generated application ([#2751](https://github.com/feathersjs/feathers/issues/2751)) ([c7bf80d](https://github.com/feathersjs/feathers/commit/c7bf80d82c28c190e3f0136d51af5b7de1bc4868))
- **cli:** Adding ClientService to CLI ([#2750](https://github.com/feathersjs/feathers/issues/2750)) ([1d45427](https://github.com/feathersjs/feathers/commit/1d45427988521ac028755cbe128685fcdf34f636))

# [5.0.0-pre.28](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.27...v5.0.0-pre.28) (2022-08-03)

### Bug Fixes

- **cli:** Improve generated application and client ([#2701](https://github.com/feathersjs/feathers/issues/2701)) ([bd55ffb](https://github.com/feathersjs/feathers/commit/bd55ffb812e89bf215f4515e7f137656ea888c3f))

# [5.0.0-pre.27](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.26...v5.0.0-pre.27) (2022-07-13)

### Bug Fixes

- **cli:** Fix flaky authentication migration and SQL id schema types ([#2676](https://github.com/feathersjs/feathers/issues/2676)) ([04ce9a5](https://github.com/feathersjs/feathers/commit/04ce9a53f4226cd6283f9dc241876e90ddf48618))

### Features

- **cli:** Add support for Prettier ([#2684](https://github.com/feathersjs/feathers/issues/2684)) ([83aa8f9](https://github.com/feathersjs/feathers/commit/83aa8f9f212cb122d831dca8858852b0ac9b4da8))
- **cli:** Improve generated application folder structure ([#2678](https://github.com/feathersjs/feathers/issues/2678)) ([d114557](https://github.com/feathersjs/feathers/commit/d114557721e73d6302aa88c11e3726dbcbd5c92b))

# [5.0.0-pre.26](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.25...v5.0.0-pre.26) (2022-06-22)

### Bug Fixes

- **cli:** Fix compilation folders that got mixed up ([fc4cb74](https://github.com/feathersjs/feathers/commit/fc4cb742f7f9164096d9319b13dfaaa5f54686a6))

# [5.0.0-pre.25](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.24...v5.0.0-pre.25) (2022-06-22)

### Bug Fixes

- **cli:** Generator fixes to work with the new guide ([#2674](https://github.com/feathersjs/feathers/issues/2674)) ([b773fa5](https://github.com/feathersjs/feathers/commit/b773fa5dbd7ff450cfb2f7b93e64882592262712))

# [5.0.0-pre.24](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.23...v5.0.0-pre.24) (2022-06-21)

### Features

- **cli:** Add generators for new Knex SQL database adapter ([#2673](https://github.com/feathersjs/feathers/issues/2673)) ([0fb2c0f](https://github.com/feathersjs/feathers/commit/0fb2c0f629116f71184b8698c383af8cfd149688))
- **cli:** Add hook generator ([#2667](https://github.com/feathersjs/feathers/issues/2667)) ([24e4bc0](https://github.com/feathersjs/feathers/commit/24e4bc04a67fadee0e6a96a8389d788faba5c305))
- **cli:** Add support for JavaScript to the new CLI ([#2668](https://github.com/feathersjs/feathers/issues/2668)) ([ebac587](https://github.com/feathersjs/feathers/commit/ebac587f7d00dc7607c3f546352d79f79b89a5d4))
- **cli:** Add typed client to a generated app ([#2669](https://github.com/feathersjs/feathers/issues/2669)) ([5b801b5](https://github.com/feathersjs/feathers/commit/5b801b5017ddc3eaa95622b539f51d605916bc86))
- **cli:** Initial Feathers v5 CLI and Pinion generator ([#2578](https://github.com/feathersjs/feathers/issues/2578)) ([7f59ae7](https://github.com/feathersjs/feathers/commit/7f59ae7f1471895ba8a82aa4702f1a23f71b7682))
