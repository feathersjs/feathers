# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 6.0.0-pre.0 (2026-01-31)

### Bug Fixes

- **chore:** Remove CLI and generators that belong in their own repositories ([#1091](https://github.com/feathersjs/feathers/issues/1091)) ([e894ac8](https://github.com/feathersjs/feathers/commit/e894ac8e1b9a33762af0b811e72d218e6080ce21))
- **cli:** Add JS extension to binaries ([#3398](https://github.com/feathersjs/feathers/issues/3398)) ([aaf181d](https://github.com/feathersjs/feathers/commit/aaf181d924d0cb67c7792a54197082c59109264d))
- **cli:** Add unhandledRejection handler to generated index file ([#2932](https://github.com/feathersjs/feathers/issues/2932)) ([e3cedc8](https://github.com/feathersjs/feathers/commit/e3cedc8e00f52d892f21fd6a3eb4ca4fe40a903c))
- **cli:** Ensure code injection points are not code style dependent ([#2832](https://github.com/feathersjs/feathers/issues/2832)) ([0776e26](https://github.com/feathersjs/feathers/commit/0776e26bfe4c1df9d2786499941bd3faba1715c0))
- **cli:** Fix another ES module issue ([#3395](https://github.com/feathersjs/feathers/issues/3395)) ([8e39884](https://github.com/feathersjs/feathers/commit/8e39884a23d0e7868546dce4f7a3ee6e954c2b31))
- **cli:** Fix compilation folders that got mixed up ([fc4cb74](https://github.com/feathersjs/feathers/commit/fc4cb742f7f9164096d9319b13dfaaa5f54686a6))
- **cli:** Fix flaky authentication migration and SQL id schema types ([#2676](https://github.com/feathersjs/feathers/issues/2676)) ([04ce9a5](https://github.com/feathersjs/feathers/commit/04ce9a53f4226cd6283f9dc241876e90ddf48618))
- **cli:** Fix MongoDB connection database name parsing ([#2845](https://github.com/feathersjs/feathers/issues/2845)) ([50e7463](https://github.com/feathersjs/feathers/commit/50e7463971ef95cb98358b70a721e67554d92eb5))
- **cli:** Generator fixes to work with the new guide ([#2674](https://github.com/feathersjs/feathers/issues/2674)) ([b773fa5](https://github.com/feathersjs/feathers/commit/b773fa5dbd7ff450cfb2f7b93e64882592262712))
- **cli:** Improve generated application and client ([#2701](https://github.com/feathersjs/feathers/issues/2701)) ([bd55ffb](https://github.com/feathersjs/feathers/commit/bd55ffb812e89bf215f4515e7f137656ea888c3f))
- **cli:** Minor generated app improvements ([#2936](https://github.com/feathersjs/feathers/issues/2936)) ([ba1a550](https://github.com/feathersjs/feathers/commit/ba1a5500a8a5ea4ab44da44ac509e48c723d7efd))
- **cli:** mongodb connection string for node 17+ ([#2875](https://github.com/feathersjs/feathers/issues/2875)) ([7fa2012](https://github.com/feathersjs/feathers/commit/7fa2012897d8429b522fbca72211fc9be1c25f7e))
- **cli:** Only generate authentication setup when selected ([#2823](https://github.com/feathersjs/feathers/issues/2823)) ([7d219d9](https://github.com/feathersjs/feathers/commit/7d219d9c5269267b50f3ce99a5653d645f9927c1))
- **cli:** Properly log validation errors in log-error hook ([54c883c](https://github.com/feathersjs/feathers/commit/54c883c2bb5c35c02b1a2081b2f17554550aa1d4))
- **cli:** Use correct package manager when installing an app ([#2973](https://github.com/feathersjs/feathers/issues/2973)) ([99c2a70](https://github.com/feathersjs/feathers/commit/99c2a70b77f0b68698a66180b69a56cb20c2ca0d))
- **cli:** Use proper MSSQL client ([#2853](https://github.com/feathersjs/feathers/issues/2853)) ([bae5176](https://github.com/feathersjs/feathers/commit/bae5176488b46fc377e53719d20e0036e087aa16))
- **core:** Ensure setup and teardown can be overriden and maintain hook functionality ([#2779](https://github.com/feathersjs/feathers/issues/2779)) ([ab580cb](https://github.com/feathersjs/feathers/commit/ab580cbcaa68d19144d86798c13bf564f9d424a6))
- **core:** Update to latest feathersjs/hooks ([#3434](https://github.com/feathersjs/feathers/issues/3434)) ([1499ccc](https://github.com/feathersjs/feathers/commit/1499ccc41fb3ebba97b2c84e0cb19bc48ad3c651))
- **dependencies:** Update all dependencies ([#3139](https://github.com/feathersjs/feathers/issues/3139)) ([f24276e](https://github.com/feathersjs/feathers/commit/f24276e9a909e2e58a0730c730258ce1f70f4028))
- **dependencies:** Update all dependencies ([#3545](https://github.com/feathersjs/feathers/issues/3545)) ([221b92b](https://github.com/feathersjs/feathers/commit/221b92bb0ee5d54fb1036742968797cb02e56da2))
- **dependencies:** Update all dependencies ([#3625](https://github.com/feathersjs/feathers/issues/3625)) ([2698e4e](https://github.com/feathersjs/feathers/commit/2698e4e2996fbf479d82435938d907bc3d5b583a))
- **dependencies:** Update dependencies ([#3571](https://github.com/feathersjs/feathers/issues/3571)) ([ad611cb](https://github.com/feathersjs/feathers/commit/ad611cb6ffb1dc31d603ba5817331318c5a23217))
- **docs:** Add JavaScript web app frontend guide ([#2834](https://github.com/feathersjs/feathers/issues/2834)) ([68cf03f](https://github.com/feathersjs/feathers/commit/68cf03f092da38ccbec5e9fd42b95d00f5a0a9f2))
- **docs:** Review transport API docs and update Express middleware setup ([#2811](https://github.com/feathersjs/feathers/issues/2811)) ([1b97f14](https://github.com/feathersjs/feathers/commit/1b97f14d474f5613482f259eeaa585c24fcfab43))
- **generators:** Move generators and CLI to featherscloud/pinion ([#3386](https://github.com/feathersjs/feathers/issues/3386)) ([eb87c99](https://github.com/feathersjs/feathers/commit/eb87c9922db56c5610e5b808f3ffe033c830e2b2))
- **knex:** Update all dependencies and Knex peer ([#3308](https://github.com/feathersjs/feathers/issues/3308)) ([d2f9860](https://github.com/feathersjs/feathers/commit/d2f986036c4741cce2339d8abbcc6b2eb037a12a))
- Make Mocha a proper devDependency for every repository ([#1053](https://github.com/feathersjs/feathers/issues/1053)) ([9974803](https://github.com/feathersjs/feathers/commit/99748032a6571a792883be31ec955a749629d0da))
- Make sure all Readme files are up to date ([#3154](https://github.com/feathersjs/feathers/issues/3154)) ([a5f0b38](https://github.com/feathersjs/feathers/commit/a5f0b38bbf2a11486415a39533bcc6c67fb51e3e))
- **package:** update generator-feathers to version 1.0.3 ([#81](https://github.com/feathersjs/feathers/issues/81)) ([0c66bc5](https://github.com/feathersjs/feathers/commit/0c66bc5cf20bd6c982feddb2623fa5628cbbec62))
- **package:** update generator-feathers to version 1.0.5 ([#83](https://github.com/feathersjs/feathers/issues/83)) ([229caba](https://github.com/feathersjs/feathers/commit/229caba4394671d1b1c903652ce5ec9e5351f611))
- **package:** update generator-feathers to version 1.0.6 ([#86](https://github.com/feathersjs/feathers/issues/86)) ([7ae8e56](https://github.com/feathersjs/feathers/commit/7ae8e56a4c0d4d0d4fcbb4cee51f3af79ea25ba0))
- **package:** update generator-feathers to version 1.1.0 ([#93](https://github.com/feathersjs/feathers/issues/93)) ([f393e4c](https://github.com/feathersjs/feathers/commit/f393e4c594e971106b9e45a3c9fbccef2e65a688))
- **package:** update generator-feathers to version 1.1.1 ([#95](https://github.com/feathersjs/feathers/issues/95)) ([3279ba9](https://github.com/feathersjs/feathers/commit/3279ba9a0b583216ec2bfd4682dad5d98dc34b3c))
- **package:** update generator-feathers to version 1.2.0 ([#96](https://github.com/feathersjs/feathers/issues/96)) ([8eb5674](https://github.com/feathersjs/feathers/commit/8eb56742f2f4797d672184931f6550533c8e0fa4))
- **package:** update generator-feathers to version 1.2.10 ([#115](https://github.com/feathersjs/feathers/issues/115)) ([c1db2b2](https://github.com/feathersjs/feathers/commit/c1db2b2697dad6192b05782ad2ef98407fe4216b))
- **package:** update generator-feathers to version 1.2.11 ([#116](https://github.com/feathersjs/feathers/issues/116)) ([bba6550](https://github.com/feathersjs/feathers/commit/bba6550bb168f106b52f022dcd533e9a4efbac8f))
- **package:** update generator-feathers to version 1.2.12 ([#119](https://github.com/feathersjs/feathers/issues/119)) ([e5c737d](https://github.com/feathersjs/feathers/commit/e5c737d25a4667198e2cd0e6086e339460494920))
- **package:** update generator-feathers to version 1.2.2 ([#98](https://github.com/feathersjs/feathers/issues/98)) ([ee629e3](https://github.com/feathersjs/feathers/commit/ee629e3bd3f730e35ff199092eea62b6cd617e39)), closes [#97](https://github.com/feathersjs/feathers/issues/97)
- **package:** update generator-feathers to version 1.2.3 ([#99](https://github.com/feathersjs/feathers/issues/99)) ([b6cf361](https://github.com/feathersjs/feathers/commit/b6cf361f2e4e22689a5d644a3ea0882382f601af))
- **package:** update generator-feathers to version 1.2.4 ([#101](https://github.com/feathersjs/feathers/issues/101)) ([2182fef](https://github.com/feathersjs/feathers/commit/2182fefe7e43a87b9365d1458cf50bb6240d6f55))
- **package:** update generator-feathers to version 1.2.5 ([#104](https://github.com/feathersjs/feathers/issues/104)) ([295f6aa](https://github.com/feathersjs/feathers/commit/295f6aa64bf75017e934b4e86b867fceda28e740))
- **package:** update generator-feathers to version 1.2.6 ([#106](https://github.com/feathersjs/feathers/issues/106)) ([66125dc](https://github.com/feathersjs/feathers/commit/66125dc95583bb8e1f1c83b181aec951c4725e0c))
- **package:** update generator-feathers to version 1.2.9 ([#110](https://github.com/feathersjs/feathers/issues/110)) ([17e55dc](https://github.com/feathersjs/feathers/commit/17e55dc37d94d79dab9dccd15cc6851e9acc716f))
- **package:** update generator-feathers to version 2.0.0 ([#126](https://github.com/feathersjs/feathers/issues/126)) ([eff6627](https://github.com/feathersjs/feathers/commit/eff66273491ec0e4fee21aad8df51563b8742d3f))
- **package:** update generator-feathers to version 2.1.0 ([#128](https://github.com/feathersjs/feathers/issues/128)) ([b712355](https://github.com/feathersjs/feathers/commit/b71235571a1c738789042178b6931b9159f4c4ea))
- **package:** update generator-feathers to version 2.1.1 ([#129](https://github.com/feathersjs/feathers/issues/129)) ([1f91c0b](https://github.com/feathersjs/feathers/commit/1f91c0bce36e5a2807f9aea31c27a105152a1366))
- **package:** update generator-feathers to version 2.2.0 ([#130](https://github.com/feathersjs/feathers/issues/130)) ([308ad0b](https://github.com/feathersjs/feathers/commit/308ad0b8cdeb10db26b1aa07cf086f47289da03b))
- **package:** update generator-feathers to version 2.3.0 ([#131](https://github.com/feathersjs/feathers/issues/131)) ([7894807](https://github.com/feathersjs/feathers/commit/789480739ab19f455ba8552d437c89209d48de19))
- **package:** update generator-feathers to version 2.3.1 ([#132](https://github.com/feathersjs/feathers/issues/132)) ([c3e3187](https://github.com/feathersjs/feathers/commit/c3e3187f4260673ec339873df6678747b7c4a9a7))
- **package:** update generator-feathers to version 2.4.0 ([#137](https://github.com/feathersjs/feathers/issues/137)) ([1645d2e](https://github.com/feathersjs/feathers/commit/1645d2e7dd47a6c0493923fddae2df99a38d1e77))
- **package:** update generator-feathers to version 2.4.1 ([#140](https://github.com/feathersjs/feathers/issues/140)) ([e5a5f7c](https://github.com/feathersjs/feathers/commit/e5a5f7cbdf3ed545c7de6c815c649872017ac853))
- **package:** update generator-feathers to version 2.4.4 ([#151](https://github.com/feathersjs/feathers/issues/151)) ([3dcd480](https://github.com/feathersjs/feathers/commit/3dcd480a37713df500d16db54f10b41b3caf56c8))
- **package:** update generator-feathers to version 2.5.2 ([#155](https://github.com/feathersjs/feathers/issues/155)) ([493ca4b](https://github.com/feathersjs/feathers/commit/493ca4bb0698bf93d95ef348f9b5f4c592b489e2))
- **package:** update generator-feathers to version 2.5.3 ([#156](https://github.com/feathersjs/feathers/issues/156)) ([ef570a8](https://github.com/feathersjs/feathers/commit/ef570a85132a270fe788da139df54ab8caf69822))
- **package:** update generator-feathers to version 2.5.4 ([#158](https://github.com/feathersjs/feathers/issues/158)) ([787f30c](https://github.com/feathersjs/feathers/commit/787f30c54e530d5b2d958d277ed41618efe864c7))
- **package:** update generator-feathers to version 2.5.5 ([#159](https://github.com/feathersjs/feathers/issues/159)) ([bbd1b29](https://github.com/feathersjs/feathers/commit/bbd1b29bb273df44fd4c56d7e9f951bdfd19f750))
- **package:** update generator-feathers to version 2.5.6 ([#161](https://github.com/feathersjs/feathers/issues/161)) ([cb72a5c](https://github.com/feathersjs/feathers/commit/cb72a5c05f7ef2fd28f137ab818b3574ffbd1e77))
- **package:** update generator-feathers to version 2.6.0 ([#164](https://github.com/feathersjs/feathers/issues/164)) ([6212ec9](https://github.com/feathersjs/feathers/commit/6212ec91bc18b40cfcee4dc6c8bd98a8d62a528f))
- **package:** update generator-feathers-plugin to version 0.11.0 ([#105](https://github.com/feathersjs/feathers/issues/105)) ([d40bb75](https://github.com/feathersjs/feathers/commit/d40bb75dbeb0c72a64493a8592ef6caffdaabfcc))
- **package:** update generator-feathers-plugin to version 0.12.1 ([#112](https://github.com/feathersjs/feathers/issues/112)) ([f374e01](https://github.com/feathersjs/feathers/commit/f374e011f485b714710a5ad14157b1e12d89aa85))
- **package:** update generator-feathers-plugin to version 1.0.0 ([#134](https://github.com/feathersjs/feathers/issues/134)) ([ee905b0](https://github.com/feathersjs/feathers/commit/ee905b09372f856a699b8edf15ef4e1147378b7d))
- **package:** update yeoman-environment to version 2.0.0 ([#89](https://github.com/feathersjs/feathers/issues/89)) ([2355652](https://github.com/feathersjs/feathers/commit/235565214f149c1ec7da3aa480b6bccf251912c3))
- **transports:** Add remaining middleware for generated apps to Koa and Express ([#2796](https://github.com/feathersjs/feathers/issues/2796)) ([0d5781a](https://github.com/feathersjs/feathers/commit/0d5781a5c72a0cbb2ec8211bfa099f0aefe115a2))
- Update all dependencies ([#3024](https://github.com/feathersjs/feathers/issues/3024)) ([283dc47](https://github.com/feathersjs/feathers/commit/283dc4798d85584bc031e6e54b83b4ea77d1edd0))
- Update all dependencies ([#3613](https://github.com/feathersjs/feathers/issues/3613)) ([5136bbd](https://github.com/feathersjs/feathers/commit/5136bbd2e2eeb4e6579e07c9e914006629542363))
- Update dependencies ([#3584](https://github.com/feathersjs/feathers/issues/3584)) ([119fa4e](https://github.com/feathersjs/feathers/commit/119fa4e1ade8b0078aa235083d566e2538b3a084))

### Features

- **adapter:** Add patch data type to adapters and refactor AdapterBase usage ([#2906](https://github.com/feathersjs/feathers/issues/2906)) ([9ddc2e6](https://github.com/feathersjs/feathers/commit/9ddc2e6b028f026f939d6af68125847e5c6734b4))
- Add CORS support to oAuth, Express, Koa and generated application ([#2744](https://github.com/feathersjs/feathers/issues/2744)) ([fd218f2](https://github.com/feathersjs/feathers/commit/fd218f289f8ca4c101e9938e8683e2efef6e8131))
- **authentication-oauth:** Koa and transport independent oAuth authentication ([#2737](https://github.com/feathersjs/feathers/issues/2737)) ([9231525](https://github.com/feathersjs/feathers/commit/9231525a24bb790ba9c5d940f2867a9c727691c9))
- **cli:** Add ability to `npm init feathers` ([#2755](https://github.com/feathersjs/feathers/issues/2755)) ([d734931](https://github.com/feathersjs/feathers/commit/d734931ffd4f983a05d9e771ce0e43b696c2bc0e))
- **cli:** Add authentication client to generated client ([#2801](https://github.com/feathersjs/feathers/issues/2801)) ([bd59f91](https://github.com/feathersjs/feathers/commit/bd59f91b45a01c2eea0c4386e567f4de5aa6ad99))
- **cli:** Add custom environment variable support to generated application ([#2751](https://github.com/feathersjs/feathers/issues/2751)) ([c7bf80d](https://github.com/feathersjs/feathers/commit/c7bf80d82c28c190e3f0136d51af5b7de1bc4868))
- **cli:** Add generators for new Knex SQL database adapter ([#2673](https://github.com/feathersjs/feathers/issues/2673)) ([0fb2c0f](https://github.com/feathersjs/feathers/commit/0fb2c0f629116f71184b8698c383af8cfd149688))
- **cli:** Add hook generator ([#2667](https://github.com/feathersjs/feathers/issues/2667)) ([24e4bc0](https://github.com/feathersjs/feathers/commit/24e4bc04a67fadee0e6a96a8389d788faba5c305))
- **cli:** Add support for JavaScript to the new CLI ([#2668](https://github.com/feathersjs/feathers/issues/2668)) ([ebac587](https://github.com/feathersjs/feathers/commit/ebac587f7d00dc7607c3f546352d79f79b89a5d4))
- **cli:** Add support for Prettier ([#2684](https://github.com/feathersjs/feathers/issues/2684)) ([83aa8f9](https://github.com/feathersjs/feathers/commit/83aa8f9f212cb122d831dca8858852b0ac9b4da8))
- **cli:** Add typed client to a generated app ([#2669](https://github.com/feathersjs/feathers/issues/2669)) ([5b801b5](https://github.com/feathersjs/feathers/commit/5b801b5017ddc3eaa95622b539f51d605916bc86))
- **cli:** Adding ClientService to CLI ([#2750](https://github.com/feathersjs/feathers/issues/2750)) ([1d45427](https://github.com/feathersjs/feathers/commit/1d45427988521ac028755cbe128685fcdf34f636))
- **cli:** Generate full client test suite and improve typed client ([#2788](https://github.com/feathersjs/feathers/issues/2788)) ([57119b6](https://github.com/feathersjs/feathers/commit/57119b6bb2797f7297cf054268a248c093ecd538))
- **cli:** Improve CLI interface ([#2753](https://github.com/feathersjs/feathers/issues/2753)) ([c7e1b7e](https://github.com/feathersjs/feathers/commit/c7e1b7e80aacb84441908c3d73512d9cf7557f7e))
- **cli:** Improve generated application folder structure ([#2678](https://github.com/feathersjs/feathers/issues/2678)) ([d114557](https://github.com/feathersjs/feathers/commit/d114557721e73d6302aa88c11e3726dbcbd5c92b))
- **cli:** Improve generated schema definitions ([#2783](https://github.com/feathersjs/feathers/issues/2783)) ([474a9fd](https://github.com/feathersjs/feathers/commit/474a9fda2107e9bcf357746320a8e00cda8182b6))
- **cli:** Initial Feathers v5 CLI and Pinion generator ([#2578](https://github.com/feathersjs/feathers/issues/2578)) ([7f59ae7](https://github.com/feathersjs/feathers/commit/7f59ae7f1471895ba8a82aa4702f1a23f71b7682))
- **cli:** Use separate patch schema and types ([#2916](https://github.com/feathersjs/feathers/issues/2916)) ([7088af6](https://github.com/feathersjs/feathers/commit/7088af64a539dc7f1a016d832b77b98aaaf92603))
- **core:** Allow to unregister services at runtime ([#2756](https://github.com/feathersjs/feathers/issues/2756)) ([d16601f](https://github.com/feathersjs/feathers/commit/d16601f2277dca5357866ffdefba2a611f6dc7fa))
- **docs:** CLI and application structure guide ([#2818](https://github.com/feathersjs/feathers/issues/2818)) ([142914f](https://github.com/feathersjs/feathers/commit/142914fc001a8420056dd56db992c1c4f1bd312c))
- ES module v5 compatibility layer for v6 ([#3607](https://github.com/feathersjs/feathers/issues/3607)) ([1dfff88](https://github.com/feathersjs/feathers/commit/1dfff8832eedca895eeaafd7f3acf0f8a27be23c))
- **generators:** Final tweaks to the generators ([#3060](https://github.com/feathersjs/feathers/issues/3060)) ([1bf1544](https://github.com/feathersjs/feathers/commit/1bf1544fa8deeaa44ba354fb539dc3f1fd187767))
- **generators:** Move core code generators to shared generators package ([#2982](https://github.com/feathersjs/feathers/issues/2982)) ([0328d22](https://github.com/feathersjs/feathers/commit/0328d2292153870bc43958f73d2c6f288a8cec17))
- **mongodb:** Add ObjectId resolvers and MongoDB option in the guide ([#2847](https://github.com/feathersjs/feathers/issues/2847)) ([c5c1fba](https://github.com/feathersjs/feathers/commit/c5c1fba5718a63412075cd3838b86b889eb0bd48))
- **schema:** Make schemas validation library independent and add TypeBox support ([#2772](https://github.com/feathersjs/feathers/issues/2772)) ([44172d9](https://github.com/feathersjs/feathers/commit/44172d99b566d11d9ceda04f1d0bf72b6d05ce76))
- **schema:** Split resolver options and property resolvers ([#2889](https://github.com/feathersjs/feathers/issues/2889)) ([4822c94](https://github.com/feathersjs/feathers/commit/4822c949812e5a1dceff3c62b2f9de4781b4d601))
- **schema:** Virtual property resolvers ([#2900](https://github.com/feathersjs/feathers/issues/2900)) ([7d03b57](https://github.com/feathersjs/feathers/commit/7d03b57ae2f633bdd4a368e0d5955011fbd6c329))

### Reverts

- Revert "Add basic shell command (#138)" ([2518966](https://github.com/feathersjs/feathers/commit/251896623af20208e40f74d0d8921f0d00c874a8)), closes [#138](https://github.com/feathersjs/feathers/issues/138)

### BREAKING CHANGES

- All packages are now ES modules only
## [5.0.43](https://github.com/feathersjs/feathers/compare/v5.0.42...v5.0.43) (2026-03-21)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.42](https://github.com/feathersjs/feathers/compare/v5.0.41...v5.0.42) (2026-03-04)

### Bug Fixes

- Update dependencies ([#3666](https://github.com/feathersjs/feathers/issues/3666)) ([477bf45](https://github.com/feathersjs/feathers/commit/477bf45f9c9dbde77a14a07828aa02300de23ae7))

## [5.0.41](https://github.com/feathersjs/feathers/compare/v5.0.40...v5.0.41) (2026-02-19)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.40](https://github.com/feathersjs/feathers/compare/v5.0.39...v5.0.40) (2026-02-03)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.39](https://github.com/feathersjs/feathers/compare/v5.0.38...v5.0.39) (2026-01-31)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.38](https://github.com/feathersjs/feathers/compare/v5.0.37...v5.0.38) (2026-01-31)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.37](https://github.com/feathersjs/feathers/compare/v5.0.36...v5.0.37) (2025-11-10)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.36](https://github.com/feathersjs/feathers/compare/v5.0.35...v5.0.36) (2025-11-08)

### Bug Fixes

- **dependencies:** Update all dependencies ([#3625](https://github.com/feathersjs/feathers/issues/3625)) ([2698e4e](https://github.com/feathersjs/feathers/commit/2698e4e2996fbf479d82435938d907bc3d5b583a))

## [5.0.35](https://github.com/feathersjs/feathers/compare/v5.0.34...v5.0.35) (2025-09-09)

### Bug Fixes

- Update all dependencies ([#3613](https://github.com/feathersjs/feathers/issues/3613)) ([5136bbd](https://github.com/feathersjs/feathers/commit/5136bbd2e2eeb4e6579e07c9e914006629542363))

## [5.0.34](https://github.com/feathersjs/feathers/compare/v5.0.33...v5.0.34) (2025-05-03)

### Bug Fixes

- Update dependencies ([#3584](https://github.com/feathersjs/feathers/issues/3584)) ([119fa4e](https://github.com/feathersjs/feathers/commit/119fa4e1ade8b0078aa235083d566e2538b3a084))

## [5.0.33](https://github.com/feathersjs/feathers/compare/v5.0.32...v5.0.33) (2025-02-24)

### Bug Fixes

- **dependencies:** Update dependencies ([#3571](https://github.com/feathersjs/feathers/issues/3571)) ([ad611cb](https://github.com/feathersjs/feathers/commit/ad611cb6ffb1dc31d603ba5817331318c5a23217))

## [5.0.32](https://github.com/feathersjs/feathers/compare/v5.0.31...v5.0.32) (2025-02-01)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.31](https://github.com/feathersjs/feathers/compare/v5.0.30...v5.0.31) (2024-10-31)

### Bug Fixes

- **dependencies:** Update all dependencies ([#3545](https://github.com/feathersjs/feathers/issues/3545)) ([221b92b](https://github.com/feathersjs/feathers/commit/221b92bb0ee5d54fb1036742968797cb02e56da2))

## [5.0.30](https://github.com/feathersjs/feathers/compare/v5.0.29...v5.0.30) (2024-09-02)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.29](https://github.com/feathersjs/feathers/compare/v5.0.28...v5.0.29) (2024-07-10)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.28](https://github.com/feathersjs/feathers/compare/v5.0.27...v5.0.28) (2024-07-10)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.27](https://github.com/feathersjs/feathers/compare/v5.0.26...v5.0.27) (2024-06-18)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.26](https://github.com/feathersjs/feathers/compare/v5.0.25...v5.0.26) (2024-06-09)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.25](https://github.com/feathersjs/feathers/compare/v5.0.24...v5.0.25) (2024-05-03)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.24](https://github.com/feathersjs/feathers/compare/v5.0.23...v5.0.24) (2024-03-13)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.23](https://github.com/feathersjs/feathers/compare/v5.0.22...v5.0.23) (2024-02-25)

### Bug Fixes

- **core:** Update to latest feathersjs/hooks ([#3434](https://github.com/feathersjs/feathers/issues/3434)) ([1499ccc](https://github.com/feathersjs/feathers/commit/1499ccc41fb3ebba97b2c84e0cb19bc48ad3c651))

## [5.0.22](https://github.com/feathersjs/feathers/compare/v5.0.21...v5.0.22) (2024-02-15)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.21](https://github.com/feathersjs/feathers/compare/v5.0.20...v5.0.21) (2024-01-25)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.20](https://github.com/feathersjs/feathers/compare/v5.0.19...v5.0.20) (2024-01-24)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.19](https://github.com/feathersjs/feathers/compare/v5.0.18...v5.0.19) (2024-01-23)

### Bug Fixes

- **cli:** Add JS extension to binaries ([#3398](https://github.com/feathersjs/feathers/issues/3398)) ([aaf181d](https://github.com/feathersjs/feathers/commit/aaf181d924d0cb67c7792a54197082c59109264d))

## [5.0.18](https://github.com/feathersjs/feathers/compare/v5.0.17...v5.0.18) (2024-01-22)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.17](https://github.com/feathersjs/feathers/compare/v5.0.16...v5.0.17) (2024-01-22)

### Bug Fixes

- **cli:** Fix another ES module issue ([#3395](https://github.com/feathersjs/feathers/issues/3395)) ([8e39884](https://github.com/feathersjs/feathers/commit/8e39884a23d0e7868546dce4f7a3ee6e954c2b31))

## [5.0.16](https://github.com/feathersjs/feathers/compare/v5.0.15...v5.0.16) (2024-01-22)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.15](https://github.com/feathersjs/feathers/compare/v5.0.14...v5.0.15) (2024-01-22)

### Bug Fixes

- **generators:** Move generators and CLI to featherscloud/pinion ([#3386](https://github.com/feathersjs/feathers/issues/3386)) ([eb87c99](https://github.com/feathersjs/feathers/commit/eb87c9922db56c5610e5b808f3ffe033c830e2b2))

## [5.0.14](https://github.com/feathersjs/feathers/compare/v5.0.13...v5.0.14) (2024-01-05)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.13](https://github.com/feathersjs/feathers/compare/v5.0.12...v5.0.13) (2023-12-29)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.12](https://github.com/feathersjs/feathers/compare/v5.0.11...v5.0.12) (2023-11-28)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.11](https://github.com/feathersjs/feathers/compare/v5.0.10...v5.0.11) (2023-10-11)

### Bug Fixes

- **knex:** Update all dependencies and Knex peer ([#3308](https://github.com/feathersjs/feathers/issues/3308)) ([d2f9860](https://github.com/feathersjs/feathers/commit/d2f986036c4741cce2339d8abbcc6b2eb037a12a))

## [5.0.10](https://github.com/feathersjs/feathers/compare/v5.0.9...v5.0.10) (2023-10-03)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.9](https://github.com/feathersjs/feathers/compare/v5.0.8...v5.0.9) (2023-09-27)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.8](https://github.com/feathersjs/feathers/compare/v5.0.7...v5.0.8) (2023-07-19)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.7](https://github.com/feathersjs/feathers/compare/v5.0.6...v5.0.7) (2023-07-14)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.6](https://github.com/feathersjs/feathers/compare/v5.0.5...v5.0.6) (2023-06-15)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.5](https://github.com/feathersjs/feathers/compare/v5.0.4...v5.0.5) (2023-04-28)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.4](https://github.com/feathersjs/feathers/compare/v5.0.3...v5.0.4) (2023-04-12)

### Bug Fixes

- Make sure all Readme files are up to date ([#3154](https://github.com/feathersjs/feathers/issues/3154)) ([a5f0b38](https://github.com/feathersjs/feathers/commit/a5f0b38bbf2a11486415a39533bcc6c67fb51e3e))

## [5.0.3](https://github.com/feathersjs/feathers/compare/v5.0.2...v5.0.3) (2023-04-05)

### Bug Fixes

- **dependencies:** Update all dependencies ([#3139](https://github.com/feathersjs/feathers/issues/3139)) ([f24276e](https://github.com/feathersjs/feathers/commit/f24276e9a909e2e58a0730c730258ce1f70f4028))

## [5.0.2](https://github.com/feathersjs/feathers/compare/v5.0.1...v5.0.2) (2023-03-23)

**Note:** Version bump only for package @feathersjs/cli

## [5.0.1](https://github.com/feathersjs/feathers/compare/v5.0.0...v5.0.1) (2023-03-15)

**Note:** Version bump only for package @feathersjs/cli

# [5.0.0](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.38...v5.0.0) (2023-02-24)

**Note:** Version bump only for package @feathersjs/cli

# [5.0.0-pre.38](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.37...v5.0.0-pre.38) (2023-02-17)

### Features

- **generators:** Final tweaks to the generators ([#3060](https://github.com/feathersjs/feathers/issues/3060)) ([1bf1544](https://github.com/feathersjs/feathers/commit/1bf1544fa8deeaa44ba354fb539dc3f1fd187767))

# [5.0.0-pre.37](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.36...v5.0.0-pre.37) (2023-02-09)

**Note:** Version bump only for package @feathersjs/cli

# [5.0.0-pre.36](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.35...v5.0.0-pre.36) (2023-01-29)

### Bug Fixes

- Update all dependencies ([#3024](https://github.com/feathersjs/feathers/issues/3024)) ([283dc47](https://github.com/feathersjs/feathers/commit/283dc4798d85584bc031e6e54b83b4ea77d1edd0))

# [5.0.0-pre.35](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.34...v5.0.0-pre.35) (2023-01-12)

### Bug Fixes

- **cli:** Add unhandledRejection handler to generated index file ([#2932](https://github.com/feathersjs/feathers/issues/2932)) ([e3cedc8](https://github.com/feathersjs/feathers/commit/e3cedc8e00f52d892f21fd6a3eb4ca4fe40a903c))
- **cli:** Minor generated app improvements ([#2936](https://github.com/feathersjs/feathers/issues/2936)) ([ba1a550](https://github.com/feathersjs/feathers/commit/ba1a5500a8a5ea4ab44da44ac509e48c723d7efd))
- **cli:** Properly log validation errors in log-error hook ([54c883c](https://github.com/feathersjs/feathers/commit/54c883c2bb5c35c02b1a2081b2f17554550aa1d4))
- **cli:** Use correct package manager when installing an app ([#2973](https://github.com/feathersjs/feathers/issues/2973)) ([99c2a70](https://github.com/feathersjs/feathers/commit/99c2a70b77f0b68698a66180b69a56cb20c2ca0d))

### Features

- **generators:** Move core code generators to shared generators package ([#2982](https://github.com/feathersjs/feathers/issues/2982)) ([0328d22](https://github.com/feathersjs/feathers/commit/0328d2292153870bc43958f73d2c6f288a8cec17))

# [5.0.0-pre.34](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.33...v5.0.0-pre.34) (2022-12-14)

### Bug Fixes

- **cli:** mongodb connection string for node 17+ ([#2875](https://github.com/feathersjs/feathers/issues/2875)) ([7fa2012](https://github.com/feathersjs/feathers/commit/7fa2012897d8429b522fbca72211fc9be1c25f7e))

### Features

- **adapter:** Add patch data type to adapters and refactor AdapterBase usage ([#2906](https://github.com/feathersjs/feathers/issues/2906)) ([9ddc2e6](https://github.com/feathersjs/feathers/commit/9ddc2e6b028f026f939d6af68125847e5c6734b4))
- **cli:** Use separate patch schema and types ([#2916](https://github.com/feathersjs/feathers/issues/2916)) ([7088af6](https://github.com/feathersjs/feathers/commit/7088af64a539dc7f1a016d832b77b98aaaf92603))
- **docs:** CLI and application structure guide ([#2818](https://github.com/feathersjs/feathers/issues/2818)) ([142914f](https://github.com/feathersjs/feathers/commit/142914fc001a8420056dd56db992c1c4f1bd312c))
- **schema:** Split resolver options and property resolvers ([#2889](https://github.com/feathersjs/feathers/issues/2889)) ([4822c94](https://github.com/feathersjs/feathers/commit/4822c949812e5a1dceff3c62b2f9de4781b4d601))
- **schema:** Virtual property resolvers ([#2900](https://github.com/feathersjs/feathers/issues/2900)) ([7d03b57](https://github.com/feathersjs/feathers/commit/7d03b57ae2f633bdd4a368e0d5955011fbd6c329))

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
