# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0-pre.29](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.28...v5.0.0-pre.29) (2022-09-16)


### Bug Fixes

* **authentication-oauth:** Fix oAuth origin and error handling ([#2752](https://github.com/feathersjs/feathers/issues/2752)) ([f7e1c33](https://github.com/feathersjs/feathers/commit/f7e1c33de1b7af0672a302d2ba6e15d997f0aa83))
* **schema:** Fix for Ajv global collision bug [#2681](https://github.com/feathersjs/feathers/issues/2681) ([#2702](https://github.com/feathersjs/feathers/issues/2702)) ([0b2def6](https://github.com/feathersjs/feathers/commit/0b2def6ca483fad6ca22fcc4ea9873bc027925d8))
* **socketio:** Reinitialize hooks on overriden setup method ([#2722](https://github.com/feathersjs/feathers/issues/2722)) ([5e8e7c4](https://github.com/feathersjs/feathers/commit/5e8e7c442238fdc929a0a36b8b8ca2b230ce761f))


### Features

* Add CORS support to oAuth, Express, Koa and generated application ([#2744](https://github.com/feathersjs/feathers/issues/2744)) ([fd218f2](https://github.com/feathersjs/feathers/commit/fd218f289f8ca4c101e9938e8683e2efef6e8131))
* **authentication-oauth:** Koa and transport independent oAuth authentication ([#2737](https://github.com/feathersjs/feathers/issues/2737)) ([9231525](https://github.com/feathersjs/feathers/commit/9231525a24bb790ba9c5d940f2867a9c727691c9))
* **cli:** Add custom environment variable support to generated application ([#2751](https://github.com/feathersjs/feathers/issues/2751)) ([c7bf80d](https://github.com/feathersjs/feathers/commit/c7bf80d82c28c190e3f0136d51af5b7de1bc4868))
* **cli:** Adding ClientService to CLI ([#2750](https://github.com/feathersjs/feathers/issues/2750)) ([1d45427](https://github.com/feathersjs/feathers/commit/1d45427988521ac028755cbe128685fcdf34f636))





# [5.0.0-pre.28](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.27...v5.0.0-pre.28) (2022-08-03)


### Bug Fixes

* **authentication-client:** Properly handle missing token error ([#2700](https://github.com/feathersjs/feathers/issues/2700)) ([160746e](https://github.com/feathersjs/feathers/commit/160746e2bceb465fd1b6a003415f8ab38daba521))
* **cli:** Improve generated application and client ([#2701](https://github.com/feathersjs/feathers/issues/2701)) ([bd55ffb](https://github.com/feathersjs/feathers/commit/bd55ffb812e89bf215f4515e7f137656ea888c3f))
* **core:** Get hooks to work reliably with custom methods ([#2714](https://github.com/feathersjs/feathers/issues/2714)) ([8d7e04a](https://github.com/feathersjs/feathers/commit/8d7e04acd0f0e2af9f4c13efee652d296dd3bc51))
* **knex:** Fix PostgreSQL integration issues and run CI tests against pg ([#2698](https://github.com/feathersjs/feathers/issues/2698)) ([1f71d78](https://github.com/feathersjs/feathers/commit/1f71d7884656c1494004931f4979ad59d23e4ee6))
* **mongodb:** Ensure transactions are used properly in create ([#2699](https://github.com/feathersjs/feathers/issues/2699)) ([fe22615](https://github.com/feathersjs/feathers/commit/fe22615b7fa17d3c20ac26d6f82097917c9b63f6))





# [5.0.0-pre.27](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.26...v5.0.0-pre.27) (2022-07-13)


### Bug Fixes

* **authentication-client:** Ensure reAuthenticate works in parallel with other requests ([#2690](https://github.com/feathersjs/feathers/issues/2690)) ([41b3761](https://github.com/feathersjs/feathers/commit/41b376106b47e2f40a8914db7a5ed2935e070c08))
* **cli:** Fix flaky authentication migration and SQL id schema types ([#2676](https://github.com/feathersjs/feathers/issues/2676)) ([04ce9a5](https://github.com/feathersjs/feathers/commit/04ce9a53f4226cd6283f9dc241876e90ddf48618))
* Freeze the resolver context ([#2685](https://github.com/feathersjs/feathers/issues/2685)) ([247dccb](https://github.com/feathersjs/feathers/commit/247dccb2eb72551962030321cb1c0ecb11b0181e))
* **socketio-client:** Make Socket.io client event target compatible ([#2686](https://github.com/feathersjs/feathers/issues/2686)) ([716c49a](https://github.com/feathersjs/feathers/commit/716c49a270e4be5e5276192092c292f72ffcfa19))


### Features

* **cli:** Add support for Prettier ([#2684](https://github.com/feathersjs/feathers/issues/2684)) ([83aa8f9](https://github.com/feathersjs/feathers/commit/83aa8f9f212cb122d831dca8858852b0ac9b4da8))
* **cli:** Improve generated application folder structure ([#2678](https://github.com/feathersjs/feathers/issues/2678)) ([d114557](https://github.com/feathersjs/feathers/commit/d114557721e73d6302aa88c11e3726dbcbd5c92b))





# [5.0.0-pre.26](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.25...v5.0.0-pre.26) (2022-06-22)


### Bug Fixes

* **cli:** Fix compilation folders that got mixed up ([fc4cb74](https://github.com/feathersjs/feathers/commit/fc4cb742f7f9164096d9319b13dfaaa5f54686a6))





# [5.0.0-pre.25](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.24...v5.0.0-pre.25) (2022-06-22)


### Bug Fixes

* **cli:** Generator fixes to work with the new guide ([#2674](https://github.com/feathersjs/feathers/issues/2674)) ([b773fa5](https://github.com/feathersjs/feathers/commit/b773fa5dbd7ff450cfb2f7b93e64882592262712))





# [5.0.0-pre.24](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.23...v5.0.0-pre.24) (2022-06-21)


### Bug Fixes

* **authentication-oauth:** Fix bug and properly set Grant defaults ([#2659](https://github.com/feathersjs/feathers/issues/2659)) ([cb93bb9](https://github.com/feathersjs/feathers/commit/cb93bb911fd92282424da2db805cd685b7e4a45b))
* **authentication:** Add safe dispatch data for authentication requests ([#2662](https://github.com/feathersjs/feathers/issues/2662)) ([d8104a1](https://github.com/feathersjs/feathers/commit/d8104a19ee9181e6a5ea81014af29ff9a3c28a8a))
* **schema:** Fix dispatch resovler hook to convert actually resolved data ([#2663](https://github.com/feathersjs/feathers/issues/2663)) ([f7e87db](https://github.com/feathersjs/feathers/commit/f7e87dbb9a0bc8d89aee47318dddbaa4d6ba5b91))


### Features

* **authentication-local:** Add passwordHash property resolver ([#2660](https://github.com/feathersjs/feathers/issues/2660)) ([b41279b](https://github.com/feathersjs/feathers/commit/b41279b55eea3771a6fa4983a37be2413287bbc6))
* **cli:** Add generators for new Knex SQL database adapter ([#2673](https://github.com/feathersjs/feathers/issues/2673)) ([0fb2c0f](https://github.com/feathersjs/feathers/commit/0fb2c0f629116f71184b8698c383af8cfd149688))
* **cli:** Add hook generator ([#2667](https://github.com/feathersjs/feathers/issues/2667)) ([24e4bc0](https://github.com/feathersjs/feathers/commit/24e4bc04a67fadee0e6a96a8389d788faba5c305))
* **cli:** Add support for JavaScript to the new CLI ([#2668](https://github.com/feathersjs/feathers/issues/2668)) ([ebac587](https://github.com/feathersjs/feathers/commit/ebac587f7d00dc7607c3f546352d79f79b89a5d4))
* **cli:** Add typed client to a generated app ([#2669](https://github.com/feathersjs/feathers/issues/2669)) ([5b801b5](https://github.com/feathersjs/feathers/commit/5b801b5017ddc3eaa95622b539f51d605916bc86))
* **cli:** Initial Feathers v5 CLI and Pinion generator ([#2578](https://github.com/feathersjs/feathers/issues/2578)) ([7f59ae7](https://github.com/feathersjs/feathers/commit/7f59ae7f1471895ba8a82aa4702f1a23f71b7682))
* **knex:** Add KnexJS SQL database adapter to core ([#2671](https://github.com/feathersjs/feathers/issues/2671)) ([9380fff](https://github.com/feathersjs/feathers/commit/9380fff58596e8bb90b8bb098d2795b7eadfec20))





# [5.0.0-pre.23](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.22...v5.0.0-pre.23) (2022-06-06)


### Bug Fixes

* **express:** Ensure Express options can be set before configuring REST transport ([#2655](https://github.com/feathersjs/feathers/issues/2655)) ([c9b8f74](https://github.com/feathersjs/feathers/commit/c9b8f74a0196acb99be44ac5e0fff3f1128288cd))
* **schema:** Always resolve dispatch in resolveAll and add getDispatch method ([#2645](https://github.com/feathersjs/feathers/issues/2645)) ([145b366](https://github.com/feathersjs/feathers/commit/145b366435695438fbc8db9fdb161162ca9049ad))
* **schema:** remove `default` from queryProperty schemas ([#2646](https://github.com/feathersjs/feathers/issues/2646)) ([940a2b6](https://github.com/feathersjs/feathers/commit/940a2b6868d2f77f81edb1661f6417ec2ea6e372))


### Features

* **client:** Improve client side custom method support ([#2654](https://github.com/feathersjs/feathers/issues/2654)) ([c138acf](https://github.com/feathersjs/feathers/commit/c138acf50affbe6b66177d084d3c7a3e9220f09f))
* **core:** Rename async hooks to around hooks, allow usual registration format ([#2652](https://github.com/feathersjs/feathers/issues/2652)) ([2a485a0](https://github.com/feathersjs/feathers/commit/2a485a07929184261f27437fc0fdfe5a44694834))





# [5.0.0-pre.22](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.21...v5.0.0-pre.22) (2022-05-24)


### Bug Fixes

* **schema:** Allows resolveData with different resolvers based on method ([#2644](https://github.com/feathersjs/feathers/issues/2644)) ([be71fa2](https://github.com/feathersjs/feathers/commit/be71fa2fe260e05b7dcc0d5f439e33f2e9ec2434))





# [5.0.0-pre.21](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.20...v5.0.0-pre.21) (2022-05-23)


### Bug Fixes

* **authentication-oauth:** Fix regression using incorrect callback and redirect_uri ([#2631](https://github.com/feathersjs/feathers/issues/2631)) ([43d8a08](https://github.com/feathersjs/feathers/commit/43d8a082d7e1807f8a431c44a1dbd9b04c3af0d2))
* **core:** Do not throw missing method error for regular hook methods ([#2636](https://github.com/feathersjs/feathers/issues/2636)) ([afe9a3b](https://github.com/feathersjs/feathers/commit/afe9a3b3d49897eff045ee237ca2937a6b975291))
* **schema:** Add Combine helper to allow merging schema types that use ([#2637](https://github.com/feathersjs/feathers/issues/2637)) ([06d03e9](https://github.com/feathersjs/feathers/commit/06d03e91abb1347576c2351c12322d01c58473e5))
* **typescript:** Make additional types generic to work with extended types ([#2625](https://github.com/feathersjs/feathers/issues/2625)) ([269fdec](https://github.com/feathersjs/feathers/commit/269fdecc5961092dc8608b3cbe16f433c80bfa96))


### Features

* **schema:** Add resolveAll hook ([#2643](https://github.com/feathersjs/feathers/issues/2643)) ([85527d7](https://github.com/feathersjs/feathers/commit/85527d71cb78852880696e5d96abdcdf24593934))
* **schema:** Add resolver for safe external data dispatching ([#2641](https://github.com/feathersjs/feathers/issues/2641)) ([72b980e](https://github.com/feathersjs/feathers/commit/72b980e05631136d30c8f1468dee45ec6a8d2503))
* **schema:** Add schema resolver converter functionality ([#2640](https://github.com/feathersjs/feathers/issues/2640)) ([26d9e05](https://github.com/feathersjs/feathers/commit/26d9e05327d6e0144466cd57d6fcc11ac7ecb06a))





# [5.0.0-pre.20](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.19...v5.0.0-pre.20) (2022-05-04)


### Bug Fixes

* **authentication-oauth:** Don't send origins in Grant's config, as it will be considered another provider ([#2617](https://github.com/feathersjs/feathers/issues/2617)) ([ae3dddd](https://github.com/feathersjs/feathers/commit/ae3dddd8a654924465512d56b4651413912c6932))
* **configuration:** Only validate the initial configuration against the schema ([#2622](https://github.com/feathersjs/feathers/issues/2622)) ([386c5e2](https://github.com/feathersjs/feathers/commit/386c5e2e67bfad4fb4333f2e3e17f7d7e09ac27e))
* **dependencies:** Lock monorepo package version numbers ([#2623](https://github.com/feathersjs/feathers/issues/2623)) ([5640c10](https://github.com/feathersjs/feathers/commit/5640c1020cc139994e695d658c08bad3494db507))


### Features

* **schema:** Add querySyntax helper to create full query schemas ([#2621](https://github.com/feathersjs/feathers/issues/2621)) ([2bbb103](https://github.com/feathersjs/feathers/commit/2bbb103b2f3e30fb0fff935f92ad3276a1a67e41))





# [5.0.0-pre.19](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.18...v5.0.0-pre.19) (2022-05-01)


### Bug Fixes

* **adapter-commons:** Clarify adapter query filtering ([#2607](https://github.com/feathersjs/feathers/issues/2607)) ([2dac771](https://github.com/feathersjs/feathers/commit/2dac771b0a3298d6dd25994d05186701b0617718))
* **adapter-tests:** Ensure multi tests can run standalone ([#2608](https://github.com/feathersjs/feathers/issues/2608)) ([d7243f2](https://github.com/feathersjs/feathers/commit/d7243f20e84d9dde428ad8dfc7f48388ca569e6e))
* **authentication-oauth:** Fix issue with overriding the default Grant configuration ([#2615](https://github.com/feathersjs/feathers/issues/2615)) ([b345857](https://github.com/feathersjs/feathers/commit/b3458578532f9750de2940aeb8afdc75cb0b46f2))
* **authentication-oauth:** Make oAuth authentication work with cookie-session ([#2614](https://github.com/feathersjs/feathers/issues/2614)) ([9f10bfc](https://github.com/feathersjs/feathers/commit/9f10bfc75083d5bcabea77cfb385aa3965cdf6d6))
* **client:** Fix @feathersjs/client types field ([#2596](https://github.com/feathersjs/feathers/issues/2596)) ([d719f54](https://github.com/feathersjs/feathers/commit/d719f54daee63daf9ed5cc762626ca15131086de))
* **express:** Fix typo in types reference in package.json ([#2613](https://github.com/feathersjs/feathers/issues/2613)) ([eacf1b3](https://github.com/feathersjs/feathers/commit/eacf1b3474e6d9da69b8671244c23a75cff87d95))
* **transport-commons:** Ensure socket queries are always plain objects ([#2597](https://github.com/feathersjs/feathers/issues/2597)) ([97313e1](https://github.com/feathersjs/feathers/commit/97313e121cfee4199f10012e95b8507557aa507e))


### Features

* **mongodb:** Add feathers-mongodb adapter as @feathersjs/mongodb ([#2610](https://github.com/feathersjs/feathers/issues/2610)) ([6d43734](https://github.com/feathersjs/feathers/commit/6d43734a53db02c435cafc52a22dca414e5d0940))
* **schema:** Allow hooks to run resolvers in sequence ([#2609](https://github.com/feathersjs/feathers/issues/2609)) ([d85c507](https://github.com/feathersjs/feathers/commit/d85c507c76d07e48fc8e7e28ff7de0ef435e0ef8))
* **typescript:** Improve adapter typings ([#2605](https://github.com/feathersjs/feathers/issues/2605)) ([3b2ca0a](https://github.com/feathersjs/feathers/commit/3b2ca0a6a8e03e8390272c4d7e930b4bffdaacf5))
* **typescript:** Improve params and query typeability ([#2600](https://github.com/feathersjs/feathers/issues/2600)) ([df28b76](https://github.com/feathersjs/feathers/commit/df28b7619161f1df5e700326f52cca1a92dc5d28))


### BREAKING CHANGES

* **adapter-commons:** Changes the common adapter base class to use `sanitizeQuery` and `sanitizeData`





# [5.0.0-pre.18](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.17...v5.0.0-pre.18) (2022-04-11)


### Bug Fixes

* **adapter-tests:** Add tests for pagination in multi updates ([#2472](https://github.com/feathersjs/feathers/issues/2472)) ([98a811a](https://github.com/feathersjs/feathers/commit/98a811ac605575ff812a08d0504729a5efe7a69c))
* **core:** Ensure that dynamically registered services are always set up ([#2593](https://github.com/feathersjs/feathers/issues/2593)) ([27cc7d0](https://github.com/feathersjs/feathers/commit/27cc7d08321861cd69e6b66e1fdfa43c50664820))
* **schema:** result resolver correctly resolves paginated find result ([#2594](https://github.com/feathersjs/feathers/issues/2594)) ([6511e45](https://github.com/feathersjs/feathers/commit/6511e45bd0624f1a629530719709f4b27fecbe0b))


### Features

* **authentication:** Add setup method for auth strategies ([#1611](https://github.com/feathersjs/feathers/issues/1611)) ([a3c3581](https://github.com/feathersjs/feathers/commit/a3c35814dccdbbf6de96f04f60b226ce206c6dbe))
* **configuration:** Allow app configuration to be validated against a schema ([#2590](https://github.com/feathersjs/feathers/issues/2590)) ([a268f86](https://github.com/feathersjs/feathers/commit/a268f86da92a8ada14ed11ab456aac0a4bba5bb0))
* **core:** Add app.setup and app.teardown hook support ([#2585](https://github.com/feathersjs/feathers/issues/2585)) ([ae4ebee](https://github.com/feathersjs/feathers/commit/ae4ebee5d39957651473007c4d3adb210160e040))
* **core:** Add app.teardown functionality ([#2570](https://github.com/feathersjs/feathers/issues/2570)) ([fcdf524](https://github.com/feathersjs/feathers/commit/fcdf524ae1995bb59265d39f12e98b7794bed023))
* **core:** Finalize app.teardown() functionality ([#2584](https://github.com/feathersjs/feathers/issues/2584)) ([1a166f3](https://github.com/feathersjs/feathers/commit/1a166f3ded811ecacf0ae8cb67880bc9fa2eeafa))
* **transport-commons:** add `context.http.response` ([#2524](https://github.com/feathersjs/feathers/issues/2524)) ([5bc9d44](https://github.com/feathersjs/feathers/commit/5bc9d447043c2e2b742c73ed28ecf3b3264dd9e5))





# [5.0.0-pre.17](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.16...v5.0.0-pre.17) (2022-02-15)


### Bug Fixes

* **express:** Fix application typings to work with typed configuration ([#2539](https://github.com/feathersjs/feathers/issues/2539)) ([b9dfaee](https://github.com/feathersjs/feathers/commit/b9dfaee834b13864c1ed4f2f6a244eb5bb70395b))
* **hooks:** Allow all built-in hooks to be used the async and regular way ([#2559](https://github.com/feathersjs/feathers/issues/2559)) ([8f9f631](https://github.com/feathersjs/feathers/commit/8f9f631e0ce89de349207db72def84e7ab496a4a))
* **queryProperty:** allow compound oneOf ([#2545](https://github.com/feathersjs/feathers/issues/2545)) ([3077d2d](https://github.com/feathersjs/feathers/commit/3077d2d896a38d579ce4d5b530e21ad332bcf221))
* **schema:** Properly handle resolver errors ([#2540](https://github.com/feathersjs/feathers/issues/2540)) ([31fbdff](https://github.com/feathersjs/feathers/commit/31fbdff8bd848ac7e0eda56e307ac34b1bfcf17f))





# [5.0.0-pre.16](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.15...v5.0.0-pre.16) (2022-01-12)


### Bug Fixes

* **authentication-oauth:** OAuth redirect lost sometimes due to session store race ([#2514](https://github.com/feathersjs/feathers/issues/2514)) ([#2515](https://github.com/feathersjs/feathers/issues/2515)) ([6109c44](https://github.com/feathersjs/feathers/commit/6109c44428c6b8f6bb4e089be760ea1a4ef3d01e))
* **schema:** Do not error for schemas without properties ([#2519](https://github.com/feathersjs/feathers/issues/2519)) ([96fdb47](https://github.com/feathersjs/feathers/commit/96fdb47d45fd88a8039aa9cc9ec8aebd98672b95))
* **schema:** Fix resolver data type and use new validation feature in test fixture ([#2523](https://github.com/feathersjs/feathers/issues/2523)) ([1093f12](https://github.com/feathersjs/feathers/commit/1093f124b60524cbd9050fcf07ddaf1d558973da))


### Features

* **express, koa:** make transports similar ([#2486](https://github.com/feathersjs/feathers/issues/2486)) ([26aa937](https://github.com/feathersjs/feathers/commit/26aa937c114fb8596dfefc599b1f53cead69c159))
* **schema:** Allow to use custom AJV and test with ajv-formats ([#2513](https://github.com/feathersjs/feathers/issues/2513)) ([ecfa4df](https://github.com/feathersjs/feathers/commit/ecfa4df29f029f6ca8517cacf518c14b46ffeb4e))
* **schema:** Improve schema typing, validation and extensibility ([#2521](https://github.com/feathersjs/feathers/issues/2521)) ([8c1b350](https://github.com/feathersjs/feathers/commit/8c1b35052792e82d13be03c06583534284fbae82))

# [5.0.0-pre.15](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.14...v5.0.0-pre.15) (2021-11-27)


### Bug Fixes

* **adapter-commons:** clean up in sort.ts and select function ([#2492](https://github.com/feathersjs/feathers/issues/2492)) ([c3ec8a4](https://github.com/feathersjs/feathers/commit/c3ec8a418bdc85506e3c5100015720a45454d8d3))
* **adapter-commons:** Fix sorting for embedded objects ([#2488](https://github.com/feathersjs/feathers/issues/2488)) ([9c22f70](https://github.com/feathersjs/feathers/commit/9c22f70a838cb6341775d91705a7527c8fc5590e))
* missing express types for Request, Response ([#2498](https://github.com/feathersjs/feathers/issues/2498)) ([ee67131](https://github.com/feathersjs/feathers/commit/ee67131bbaa24c54d3d781bdf8820015759ac488))
* **typescript:** Overall typing improvements ([#2478](https://github.com/feathersjs/feathers/issues/2478)) ([b8eb804](https://github.com/feathersjs/feathers/commit/b8eb804158556d9651a8607e3c3fda15e0bfd110))


### Features

* **authentication-oauth:** Allow dynamic oAuth redirect ([#2469](https://github.com/feathersjs/feathers/issues/2469)) ([b7143d4](https://github.com/feathersjs/feathers/commit/b7143d4c0fbe961e714f79512be04449b9bbd7d9))
* **core:** add `context.http` and move `statusCode` there ([#2496](https://github.com/feathersjs/feathers/issues/2496)) ([b701bf7](https://github.com/feathersjs/feathers/commit/b701bf77fb83048aa1dffa492b3d77dd53f7b72b))
* **core:** Improve legacy hooks integration ([08c8b40](https://github.com/feathersjs/feathers/commit/08c8b40999bf3889c61a4d4fad97a2c4f78bafc9))
* **transport-commons:** Ability to register routes with custom params ([#2482](https://github.com/feathersjs/feathers/issues/2482)) ([497990a](https://github.com/feathersjs/feathers/commit/497990ae4a980e5a52a1f0f932db12cd0e6e254a))





# [5.0.0-pre.14](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.13...v5.0.0-pre.14) (2021-10-13)

**Note:** Version bump only for package feathers





# [5.0.0-pre.13](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.12...v5.0.0-pre.13) (2021-10-13)

**Note:** Version bump only for package feathers





# [5.0.0-pre.12](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.11...v5.0.0-pre.12) (2021-10-12)

**Note:** Version bump only for package feathers





# [5.0.0-pre.11](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.10...v5.0.0-pre.11) (2021-10-06)


### Bug Fixes

* **core:** Allow to return a new hook context in basic hooks ([#2462](https://github.com/feathersjs/feathers/issues/2462)) ([422b6fc](https://github.com/feathersjs/feathers/commit/422b6fc11cf9e42f4234f0823a0b06a4df50982d))


### Features

* **schema:** Allow resolvers to validate a schema ([#2465](https://github.com/feathersjs/feathers/issues/2465)) ([7d9590b](https://github.com/feathersjs/feathers/commit/7d9590bbe12b94b8b5a7987684f5d4968e426481))





# [5.0.0-pre.10](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.9...v5.0.0-pre.10) (2021-09-19)


### Bug Fixes

* **authentication-local:** adds error handling for undefined/null password field ([#2444](https://github.com/feathersjs/feathers/issues/2444)) ([4323f98](https://github.com/feathersjs/feathers/commit/4323f9859a66a7fe3f7f15d81476bd81b735c226))


### Features

* **schema:** Initial version of schema definitions and resolvers ([#2441](https://github.com/feathersjs/feathers/issues/2441)) ([c57a5cd](https://github.com/feathersjs/feathers/commit/c57a5cd56699a121647be4506d8f967e6d72ecae))





# [5.0.0-pre.9](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.8...v5.0.0-pre.9) (2021-08-09)

**Note:** Version bump only for package feathers





# [5.0.0-pre.8](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.7...v5.0.0-pre.8) (2021-08-09)

**Note:** Version bump only for package feathers





# [5.0.0-pre.7](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.6...v5.0.0-pre.7) (2021-08-09)


### Bug Fixes

* **core:** Clean up readme ([eb3b4f2](https://github.com/feathersjs/feathers/commit/eb3b4f248c0816c92a2300cceed18a6f2518508a))
* **core:** Set version back to development ([b328767](https://github.com/feathersjs/feathers/commit/b3287676cd773e164fd646ba4cffbf81983a9157))





# [5.0.0-pre.6](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.5...v5.0.0-pre.6) (2021-08-08)


### Bug Fixes

* **koa:** Throw a NotFound Feathers error on missing paths ([#2415](https://github.com/feathersjs/feathers/issues/2415)) ([e013f98](https://github.com/feathersjs/feathers/commit/e013f98315d550ced6eacffd615c61bb0912b4ba))





# [5.0.0-pre.5](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.4...v5.0.0-pre.5) (2021-06-23)


### Bug Fixes

* **authentication-oauth:** Omit query from internal calls ([#2398](https://github.com/feathersjs/feathers/issues/2398)) ([04c7c83](https://github.com/feathersjs/feathers/commit/04c7c83eeaa6a7466c84b958071b468ed42f0b0f))
* **core:** Add list of protected methods that can not be used for custom methods ([#2390](https://github.com/feathersjs/feathers/issues/2390)) ([6584a21](https://github.com/feathersjs/feathers/commit/6584a216e5a7d5f2a45822be6bfcb91c35cc2252))
* **hooks:** Migrate built-in hooks and allow backwards compatibility ([#2358](https://github.com/feathersjs/feathers/issues/2358)) ([759c5a1](https://github.com/feathersjs/feathers/commit/759c5a19327a731af965c3604119393b3d09a406))
* **koa:** Use extended query parser for compatibility ([#2397](https://github.com/feathersjs/feathers/issues/2397)) ([b2944ba](https://github.com/feathersjs/feathers/commit/b2944bac3ec6d5ecc80dc518cd4e58093692db74))
* Update database adapter common repository urls ([#2380](https://github.com/feathersjs/feathers/issues/2380)) ([3f4db68](https://github.com/feathersjs/feathers/commit/3f4db68d6700c7d9023ecd17d0d39893f75a19fd))


### Features

* **typescript:** Allow to pass generic service options to adapter services ([#2392](https://github.com/feathersjs/feathers/issues/2392)) ([f9431f2](https://github.com/feathersjs/feathers/commit/f9431f242354f804cafb835519f98dd405ac4f0b))
* Support being a built-in CodeSandbox sandbox ([#2381](https://github.com/feathersjs/feathers/issues/2381)) ([a2ac25a](https://github.com/feathersjs/feathers/commit/a2ac25a26e80530f7c50b88ef15eef46ee2b0634))
* **adapter-commons:** Add support for params.adapter option and move memory adapter to @feathersjs/memory ([#2367](https://github.com/feathersjs/feathers/issues/2367)) ([a43e7da](https://github.com/feathersjs/feathers/commit/a43e7da22b6b981a96d1321736ea9a0cb924fb4f))





# [5.0.0-pre.4](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.3...v5.0.0-pre.4) (2021-05-13)


### Bug Fixes

* **transport-commons:** Fix route placeholder registration and improve radix router performance ([#2336](https://github.com/feathersjs/feathers/issues/2336)) ([4d84dfd](https://github.com/feathersjs/feathers/commit/4d84dfd092ce0510312e975d5cd57e04973fb311))
* **typescript:** Move Paginated type back for better compatibility ([#2350](https://github.com/feathersjs/feathers/issues/2350)) ([2917d05](https://github.com/feathersjs/feathers/commit/2917d05fffb4716d3c4cdaa5ac6a1aee0972e8a6))


### Features

* **koa:** KoaJS transport adapter ([#2315](https://github.com/feathersjs/feathers/issues/2315)) ([2554b57](https://github.com/feathersjs/feathers/commit/2554b57cf05731df58feeba9c12faab18e442107))





# [5.0.0-pre.3](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.2...v5.0.0-pre.3) (2021-04-21)


### Bug Fixes

* **typescript:** Improve TypeScript backwards compatibility ([#2310](https://github.com/feathersjs/feathers/issues/2310)) ([f33be73](https://github.com/feathersjs/feathers/commit/f33be73fc46a533efb15df9aab0658e3240d3897))


### Features

* **deno:** Feathers core build for Deno ([#2299](https://github.com/feathersjs/feathers/issues/2299)) ([dece8fb](https://github.com/feathersjs/feathers/commit/dece8fbc0e7601f1505ce8bbb1e4e69cc26e8f98))
* **dependencies:** Remove direct debug dependency ([#2296](https://github.com/feathersjs/feathers/issues/2296)) ([501d416](https://github.com/feathersjs/feathers/commit/501d4164d30c6a126906dc640cdfdc82207ba34a))





# [5.0.0-pre.2](https://github.com/feathersjs/feathers/compare/v5.0.0-beta.1...v5.0.0-pre.2) (2021-04-06)

**Note:** Version bump only for package feathers





# [5.0.0-beta.1](https://github.com/feathersjs/feathers/compare/v5.0.0-beta.0...v5.0.0-beta.1) (2021-04-03)


### Bug Fixes

* **adapter-tests:** Add test that verified paginated total ([#2273](https://github.com/feathersjs/feathers/issues/2273)) ([879bd6b](https://github.com/feathersjs/feathers/commit/879bd6b24f42e04eeeeba110ddddda3e1e1dea34))
* **dependencies:** Fix transport-commons dependency and update other dependencies ([#2284](https://github.com/feathersjs/feathers/issues/2284)) ([05b03b2](https://github.com/feathersjs/feathers/commit/05b03b27b40604d956047e3021d8053c3a137616))
* **feathers:** Always enable hooks on default service methods ([#2275](https://github.com/feathersjs/feathers/issues/2275)) ([827cc9b](https://github.com/feathersjs/feathers/commit/827cc9b752eecdaf63605d7dffd86f531b7e4af3))


### Features

* **adapter-commons:** Added mongoDB like search in embedded objects ([687e3c7](https://github.com/feathersjs/feathers/commit/687e3c7c36904221b2707d0220c0893e3cb1faa9))





# [5.0.0-beta.0](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.1...v5.0.0-beta.0) (2021-03-28)


### Bug Fixes

* **adapter-commons:** Always respect paginate.max ([#2267](https://github.com/feathersjs/feathers/issues/2267)) ([f588257](https://github.com/feathersjs/feathers/commit/f5882575536624ed3a32bb6e3ff1919fa17e366d))
* **transport-commons:** Do not error when adding an undefined connection to a channel ([#2268](https://github.com/feathersjs/feathers/issues/2268)) ([28114c4](https://github.com/feathersjs/feathers/commit/28114c495d6564868bb3ffbf619bf80b774dce4b))
* Resolve some type problems ([#2260](https://github.com/feathersjs/feathers/issues/2260)) ([a3d75fa](https://github.com/feathersjs/feathers/commit/a3d75fa29490e8a19412a12bc993ee7bb573068f))
* Update Grant usage and other dependencies ([#2264](https://github.com/feathersjs/feathers/issues/2264)) ([7b0f8fa](https://github.com/feathersjs/feathers/commit/7b0f8fad252419ed0ad0bf259cdf3104d322ab60))
* **adapter-commons:** Return missing overloads ([#2203](https://github.com/feathersjs/feathers/issues/2203)) ([bbe7e2a](https://github.com/feathersjs/feathers/commit/bbe7e2a131633e9a6e7aac7f7fa02a312bca63c7))
* **socketio-client:** Fix client transport-commons reference ([#2164](https://github.com/feathersjs/feathers/issues/2164)) ([3a42c54](https://github.com/feathersjs/feathers/commit/3a42c544058456b19c7e21827226541bfa6ad621))


### Features

* **core:** Public custom service methods ([#2270](https://github.com/feathersjs/feathers/issues/2270)) ([e65abfb](https://github.com/feathersjs/feathers/commit/e65abfb5388df6c19a11c565cf1076a29f32668d))
* Application service types default to any ([#1566](https://github.com/feathersjs/feathers/issues/1566)) ([d93ba9a](https://github.com/feathersjs/feathers/commit/d93ba9a17edd20d3397bb00f4f6e82e804e42ed6))
* Feathers v5 core refactoring and features ([#2255](https://github.com/feathersjs/feathers/issues/2255)) ([2dafb7c](https://github.com/feathersjs/feathers/commit/2dafb7ce14ba57406aeec13d10ca45b1e709bee9))
* **authentication-client:** Throw separate OauthError in authentication client ([#2189](https://github.com/feathersjs/feathers/issues/2189)) ([fa45ec5](https://github.com/feathersjs/feathers/commit/fa45ec520b21834e103e6fe4200b06dced56c0e6))
* **core:** Remove Uberproto ([#2178](https://github.com/feathersjs/feathers/issues/2178)) ([ddf8821](https://github.com/feathersjs/feathers/commit/ddf8821f53317e6a378657f7d66acb03a037ee47))
* **transport-commons:** New built-in high performance radix router ([#2177](https://github.com/feathersjs/feathers/issues/2177)) ([6d18065](https://github.com/feathersjs/feathers/commit/6d180651b4eb40289ecea3df3575f207aa6c5d1f))


### BREAKING CHANGES

* **core:** Services no longer extend Uberproto objects and
`service.mixin()` is no longer available.





# [5.0.0-pre.1](https://github.com/feathersjs/feathers/compare/v4.5.11...v5.0.0-pre.1) (2020-12-17)


### Features

* **memory:** Move feathers-memory into @feathersjs/memory ([#2153](https://github.com/feathersjs/feathers/issues/2153)) ([dd61fe3](https://github.com/feathersjs/feathers/commit/dd61fe371fb0502f78b8ccbe1f45a030e31ecff6))



# [5.0.0-pre.0](https://github.com/feathersjs/feathers/compare/v4.5.4...v5.0.0-pre.0) (2020-05-19)


### Bug Fixes

* **errors:** Format package.json with spaces ([cbd31c1](https://github.com/feathersjs/feathers/commit/cbd31c10c2c574de63d6ca5e55dbfb73a5fdd758))


### chore

* **configuration:** Remove environment variable substitution ([#1942](https://github.com/feathersjs/feathers/issues/1942)) ([caaa21f](https://github.com/feathersjs/feathers/commit/caaa21ffdc6a8dcac82fb403c91d9d4b781a6c0a))
* **package:** Remove @feathersjs/primus packages from core ([#1919](https://github.com/feathersjs/feathers/issues/1919)) ([d20b7d5](https://github.com/feathersjs/feathers/commit/d20b7d5a70f4d3306e294696156e8aa0337c35e9)), closes [#1899](https://github.com/feathersjs/feathers/issues/1899)


### Features

* **core:** Migrate @feathersjs/feathers to TypeScript ([#1963](https://github.com/feathersjs/feathers/issues/1963)) ([7812529](https://github.com/feathersjs/feathers/commit/7812529ff0f1008e21211f1d01efbc49795dbe55))
* **core:** use @feathers/hooks and add async type ([#1929](https://github.com/feathersjs/feathers/issues/1929)) ([a5c4756](https://github.com/feathersjs/feathers/commit/a5c47562eae8410c82fe2f6308f26f8e78b6a3e8))
* **transport-commons:** Remove legacy message format and unnecessary client timeouts ([#1939](https://github.com/feathersjs/feathers/issues/1939)) ([5538881](https://github.com/feathersjs/feathers/commit/5538881a08bc130de42c5984055729d8336f8615))


### BREAKING CHANGES

* **configuration:** Falls back to node-config instead of adding additional
functionality like path replacements and automatic environment variable insertion.
* **transport-commons:** Removes the old message format and client service timeout
* **package:** Remove primus packages to be moved into the ecosystem.





# [5.0.0-pre.0](https://github.com/feathersjs/feathers/compare/v4.5.4...v5.0.0-pre.0) (2020-05-19)

### Bug Fixes

* **authentication-oauth:** Updated typings for projects with strictNullChecks ([#1941](https://github.com/feathersjs/feathers/issues/1941)) ([be91206](https://github.com/feathersjs/feathers/commit/be91206e3dba1e65a81412b7aa636bece3ab4aa2))
* **errors:** Format package.json with spaces ([cbd31c1](https://github.com/feathersjs/feathers/commit/cbd31c10c2c574de63d6ca5e55dbfb73a5fdd758))


### chore

* **configuration:** Remove environment variable substitution ([#1942](https://github.com/feathersjs/feathers/issues/1942)) ([caaa21f](https://github.com/feathersjs/feathers/commit/caaa21ffdc6a8dcac82fb403c91d9d4b781a6c0a))
* **package:** Remove @feathersjs/primus packages from core ([#1919](https://github.com/feathersjs/feathers/issues/1919)) ([d20b7d5](https://github.com/feathersjs/feathers/commit/d20b7d5a70f4d3306e294696156e8aa0337c35e9)), closes [#1899](https://github.com/feathersjs/feathers/issues/1899)


### Features

* **core:** Migrate @feathersjs/feathers to TypeScript ([#1963](https://github.com/feathersjs/feathers/issues/1963)) ([7812529](https://github.com/feathersjs/feathers/commit/7812529ff0f1008e21211f1d01efbc49795dbe55))
* **core:** use @feathers/hooks and add async type ([#1929](https://github.com/feathersjs/feathers/issues/1929)) ([a5c4756](https://github.com/feathersjs/feathers/commit/a5c47562eae8410c82fe2f6308f26f8e78b6a3e8))
* **transport-commons:** Remove legacy message format and unnecessary client timeouts ([#1939](https://github.com/feathersjs/feathers/issues/1939)) ([5538881](https://github.com/feathersjs/feathers/commit/5538881a08bc130de42c5984055729d8336f8615))


### BREAKING CHANGES

* **configuration:** Falls back to node-config instead of adding additional
functionality like path replacements and automatic environment variable insertion.
* **transport-commons:** Removes the old message format and client service timeout
* **package:** Remove primus packages to be moved into the ecosystem.



## [4.5.11](https://github.com/feathersjs/feathers/compare/v4.5.10...v4.5.11) (2020-12-05)


### Bug Fixes

* **authentication-client:** Allow reAuthentication using specific strategy ([#2140](https://github.com/feathersjs/feathers/issues/2140)) ([2a2bbf7](https://github.com/feathersjs/feathers/commit/2a2bbf7f8ee6d32b9fac8afab3421286b06e6443))
* **socketio-client:** Throw an error and show a warning if someone tries to use socket.io-client v3 ([#2135](https://github.com/feathersjs/feathers/issues/2135)) ([cc3521c](https://github.com/feathersjs/feathers/commit/cc3521c935a1cbd690e29b7057998e3898f282db))
* **typescript:** Fix `data` property definition in @feathersjs/errors ([#2018](https://github.com/feathersjs/feathers/issues/2018)) ([ef1398c](https://github.com/feathersjs/feathers/commit/ef1398cd5b19efa50929e8c9511ca5684a18997f))





## [4.5.10](https://github.com/feathersjs/feathers/compare/v4.5.9...v4.5.10) (2020-11-08)


### Bug Fixes

* **authentication:** consistent response return between local and jwt strategy ([#2042](https://github.com/feathersjs/feathers/issues/2042)) ([8d25be1](https://github.com/feathersjs/feathers/commit/8d25be101a2593a9e789375c928a07780b9e28cf))
* **authentication-oauth:** session.destroy is undefined when use cookie-session package ([#2100](https://github.com/feathersjs/feathers/issues/2100)) ([46e84b8](https://github.com/feathersjs/feathers/commit/46e84b83f2acce985380243fc6d08c64e96f0068))
* **package:** Fix clean script in non Unix environments ([#2110](https://github.com/feathersjs/feathers/issues/2110)) ([09b62c0](https://github.com/feathersjs/feathers/commit/09b62c0c7e636caf620904ba87d61f168a020f05))
* **typescript:** Add user property to the Params. ([#2090](https://github.com/feathersjs/feathers/issues/2090)) ([1e94265](https://github.com/feathersjs/feathers/commit/1e942651fbaaf07fc66c159225fbc992a0174bf4))





## [4.5.9](https://github.com/feathersjs/feathers/compare/v4.5.8...v4.5.9) (2020-10-09)


### Bug Fixes

* **authentication-local:** Keep non-objects in protect hook ([#2085](https://github.com/feathersjs/feathers/issues/2085)) ([5a65e2e](https://github.com/feathersjs/feathers/commit/5a65e2e6cee0a15614f23ee2e0d3c25d3365027d))
* **authentication-oauth:** Always end session after oAuth flows are finished ([#2087](https://github.com/feathersjs/feathers/issues/2087)) ([d219d0d](https://github.com/feathersjs/feathers/commit/d219d0d89c5e45aa289dd67cb0c8bdc05044c846))
* **configuration:** Fix handling of config values that start with . or .. but are not actually relative paths; e.g. ".foo" or "..bar" ([#2065](https://github.com/feathersjs/feathers/issues/2065)) ([d07bf59](https://github.com/feathersjs/feathers/commit/d07bf5902e9c8c606f16b9523472972d3d2e9b49))
* **rest-client:** Handle non-JSON errors with fetch adapter ([#2086](https://github.com/feathersjs/feathers/issues/2086)) ([e24217a](https://github.com/feathersjs/feathers/commit/e24217ad1e784ad71cd9d64fe1727dd02f039991))





## [4.5.8](https://github.com/feathersjs/feathers/compare/v4.5.7...v4.5.8) (2020-08-12)


* **authentication-client:** Fix storage type so it works with all supported interfaces ([#2041](https://github.com/feathersjs/feathers/issues/2041)) ([6ee0e78](https://github.com/feathersjs/feathers/commit/6ee0e78d55cf1214f61458f386b94c350eec32af))





## [4.5.7](https://github.com/feathersjs/feathers/compare/v4.5.6...v4.5.7) (2020-07-24)


### Bug Fixes

* **authentication:** Add JWT getEntityQuery ([#2013](https://github.com/feathersjs/feathers/issues/2013)) ([e0e7fb5](https://github.com/feathersjs/feathers/commit/e0e7fb5162940fe776731283b40026c61d9c8a33))
* **typescript:** Revert add overload types for `find` service methods ([#1972](https://github.com/feathersjs/feathers/issues/1972))" ([#2025](https://github.com/feathersjs/feathers/issues/2025)) ([a9501ac](https://github.com/feathersjs/feathers/commit/a9501acb4d3ef58dfb87d62c57a9bf76569da281))





## [4.5.6](https://github.com/feathersjs/feathers/compare/v4.5.5...v4.5.6) (2020-07-12)


### Bug Fixes

* **authentication:** Omit query in JWT strategy ([#2011](https://github.com/feathersjs/feathers/issues/2011)) ([04ce7e9](https://github.com/feathersjs/feathers/commit/04ce7e98515fe9d495cd0e83e0da097e9bcd7382))





## [4.5.5](https://github.com/feathersjs/feathers/compare/v4.5.4...v4.5.5) (2020-07-11)


### Bug Fixes

* **authentication:** Include query params when authenticating via authenticate hook [#2009](https://github.com/feathersjs/feathers/issues/2009) ([4cdb7bf](https://github.com/feathersjs/feathers/commit/4cdb7bf2898385ddac7a1692bc9ac2f6cf5ad446))
* **authentication-oauth:** Updated typings for projects with strictNullChecks ([#1941](https://github.com/feathersjs/feathers/issues/1941)) ([be91206](https://github.com/feathersjs/feathers/commit/be91206e3dba1e65a81412b7aa636bece3ab4aa2))
* **typescript:** add overload types for `find` service methods ([#1972](https://github.com/feathersjs/feathers/issues/1972)) ([ef55af0](https://github.com/feathersjs/feathers/commit/ef55af088d05d9d36aba9d9f8d6c2c908a4f20dd))





## [4.5.4](https://github.com/feathersjs/feathers/compare/v4.5.3...v4.5.4) (2020-04-29)


### Bug Fixes

* **authentication-local:** Allow to hash passwords in array data ([#1936](https://github.com/feathersjs/feathers/issues/1936)) ([64705f5](https://github.com/feathersjs/feathers/commit/64705f5d9d4dc27f799da3a074efaf74379a3398))
* **authentication-oauth:** Add getEntity method to oAuth authentication and remove provider field for other calls ([#1935](https://github.com/feathersjs/feathers/issues/1935)) ([d925c1b](https://github.com/feathersjs/feathers/commit/d925c1bd193b5c19cb23a246f04fc46d0429fc75))





## [4.5.3](https://github.com/feathersjs/feathers/compare/v4.5.2...v4.5.3) (2020-04-17)


### Bug Fixes

* **authentication:** Remove entity from connection information on logout ([#1889](https://github.com/feathersjs/feathers/issues/1889)) ([b062753](https://github.com/feathersjs/feathers/commit/b0627530d61babe15dd84369d3093ccae4b780ca))
* **authentication-oauth:** Allow req.feathers to be used in oAuth authentication requests ([#1886](https://github.com/feathersjs/feathers/issues/1886)) ([854c9ca](https://github.com/feathersjs/feathers/commit/854c9cac9a9a5f8f89054a90feb24ab5c4766f5f))
* **errors:** Add 410 Gone to errors ([#1849](https://github.com/feathersjs/feathers/issues/1849)) ([6801428](https://github.com/feathersjs/feathers/commit/6801428f8fd17dbfebcdb6f1b0cd01433a4033dc))
* **typescript:** Add type keys to service pagination options. ([#1888](https://github.com/feathersjs/feathers/issues/1888)) ([859c601](https://github.com/feathersjs/feathers/commit/859c601519c7cb399e8b1667bb50073466812d5c))
* **typescript:** Use stricter type for HookContext 'method' prop ([#1896](https://github.com/feathersjs/feathers/issues/1896)) ([24a41b7](https://github.com/feathersjs/feathers/commit/24a41b74486ddadccad18f3ae63afdac5bd373c7))





## [4.5.2](https://github.com/feathersjs/feathers/compare/v4.5.1...v4.5.2) (2020-03-04)


### Bug Fixes

* Updated typings for express middleware ([#1839](https://github.com/feathersjs/feathers/issues/1839)) ([6b8e897](https://github.com/feathersjs/feathers/commit/6b8e8971a9dbb08913edd1be48826624645d9dc1))
* **authentication:** Improve JWT strategy configuration error message ([#1844](https://github.com/feathersjs/feathers/issues/1844)) ([2c771db](https://github.com/feathersjs/feathers/commit/2c771dbb22d53d4f7de3c3f514e57afa1a186322))
* **package:** update grant-profile to version 0.0.11 ([#1841](https://github.com/feathersjs/feathers/issues/1841)) ([5dcd2aa](https://github.com/feathersjs/feathers/commit/5dcd2aa3483059cc7a2546b145dd72b4705fe2fe))
* **test:** typo in password ([#1797](https://github.com/feathersjs/feathers/issues/1797)) ([dfba6ec](https://github.com/feathersjs/feathers/commit/dfba6ec2f21adf3aa739218cf870eaaaa5df6e9c))
* **typescript:** Make HookMap and HookObject generics. ([#1815](https://github.com/feathersjs/feathers/issues/1815)) ([d10145d](https://github.com/feathersjs/feathers/commit/d10145d91a09aef7bce5af80805a3c0fa9d94f26))





## [4.5.1](https://github.com/feathersjs/feathers/compare/v4.5.0...v4.5.1) (2020-01-24)

**Note:** Version bump only for package feathers





# [4.5.0](https://github.com/feathersjs/feathers/compare/v4.4.3...v4.5.0) (2020-01-18)


### Bug Fixes

* Add `params.authentication` type, remove `hook.connection` type ([#1732](https://github.com/feathersjs/feathers/issues/1732)) ([d46b7b2](https://github.com/feathersjs/feathers/commit/d46b7b2abac8862c0e4dbfce20d71b8b8a96692f))


### Features

* **authentication-oauth:** Set oAuth redirect URL dynamically and pass query the service ([#1737](https://github.com/feathersjs/feathers/issues/1737)) ([0b05f0b](https://github.com/feathersjs/feathers/commit/0b05f0b58a257820fa61d695a36f36455209f6a1))
* **rest-client:** Allow for customising rest clients ([#1780](https://github.com/feathersjs/feathers/issues/1780)) ([c5cfec7](https://github.com/feathersjs/feathers/commit/c5cfec7a4aafcaffaab0cdacb9b5d297ff20320f))





## [4.4.3](https://github.com/feathersjs/feathers/compare/v4.4.1...v4.4.3) (2019-12-06)


### Bug Fixes

* **adapter-commons:** Filter arrays in queries ([#1724](https://github.com/feathersjs/feathers/issues/1724)) ([872b669](https://github.com/feathersjs/feathers/commit/872b66906a806ab92ca41b5f6f504ff0af1ce79e))





## [4.4.1](https://github.com/feathersjs/feathers/compare/v4.4.0...v4.4.1) (2019-11-27)


### Bug Fixes

* Gracefully handle errors in publishers ([#1710](https://github.com/feathersjs/feathers/issues/1710)) ([0616306](https://github.com/feathersjs/feathers/commit/061630696762e9dbf1dc4e738094992ba16989fc))





# [4.4.0](https://github.com/feathersjs/feathers/compare/v4.3.11...v4.4.0) (2019-11-27)


### Bug Fixes

* **authentication-client:** Reset authentication promise on socket disconnect ([#1696](https://github.com/feathersjs/feathers/issues/1696)) ([3951626](https://github.com/feathersjs/feathers/commit/395162633ff22e95833a3c2900cb9464bb5b056f))
* **core:** Improve hook missing parameter message by adding the service name ([#1703](https://github.com/feathersjs/feathers/issues/1703)) ([2331c2a](https://github.com/feathersjs/feathers/commit/2331c2a3dd70d432db7d62a76ed805d359cbbba5))
* **rest-client:** Allow to customize getting the query ([#1594](https://github.com/feathersjs/feathers/issues/1594)) ([5f21272](https://github.com/feathersjs/feathers/commit/5f212729849414c4da6f0d51edd1986feca992ee))
* **transport-commons:** Allow to properly chain SocketIo client.off ([#1706](https://github.com/feathersjs/feathers/issues/1706)) ([a4aecbc](https://github.com/feathersjs/feathers/commit/a4aecbcd3578c1cf4ecffb3a58fb6d26e15ee513))
* **typescript:** Allow specific service typings for `Hook` and `HookContext` ([#1688](https://github.com/feathersjs/feathers/issues/1688)) ([f5d0ddd](https://github.com/feathersjs/feathers/commit/f5d0ddd9724bf5778355535d2103d59daaad6294))


### Features

* **authentication:** Add parseStrategies to allow separate strategies for creating JWTs and parsing headers ([#1708](https://github.com/feathersjs/feathers/issues/1708)) ([5e65629](https://github.com/feathersjs/feathers/commit/5e65629b924724c3e81d7c81df047e123d1c8bd7))
* **authentication-oauth:** Set oAuth redirect URL dynamically ([#1608](https://github.com/feathersjs/feathers/issues/1608)) ([1293e08](https://github.com/feathersjs/feathers/commit/1293e088abbb3d23f4a44680836645a8049ceaae))





## [4.3.11](https://github.com/feathersjs/feathers/compare/v4.3.10...v4.3.11) (2019-11-11)


### Bug Fixes

* **authentication:** Retain object references in authenticate hook ([#1675](https://github.com/feathersjs/feathers/issues/1675)) ([e1939be](https://github.com/feathersjs/feathers/commit/e1939be19d4e79d3f5e2fe69ba894a11c627ae99))
* **authentication-oauth:** Allow hash based redirects ([#1676](https://github.com/feathersjs/feathers/issues/1676)) ([ffe7cf3](https://github.com/feathersjs/feathers/commit/ffe7cf3fbb4e62d7689065cf7b61f25f602ce8cf))





## [4.3.10](https://github.com/feathersjs/feathers/compare/v4.3.9...v4.3.10) (2019-10-26)

**Note:** Version bump only for package feathers





## [4.3.9](https://github.com/feathersjs/feathers/compare/v4.3.8...v4.3.9) (2019-10-26)


### Bug Fixes

* Add jsonwebtoken TypeScript type dependency ([317c80a](https://github.com/feathersjs/feathers/commit/317c80a9205e8853bb830a12c3aa1a19e95f9abc))
* Only initialize default Express session if oAuth is actually used ([#1648](https://github.com/feathersjs/feathers/issues/1648)) ([9b9b43f](https://github.com/feathersjs/feathers/commit/9b9b43ff09af1080e4aaa537064bac37b881c9a2))
* Small type improvements ([#1624](https://github.com/feathersjs/feathers/issues/1624)) ([50162c6](https://github.com/feathersjs/feathers/commit/50162c6e562f0a47c6a280c4f01fff7c3afee293))





## [4.3.8](https://github.com/feathersjs/feathers/compare/v4.3.7...v4.3.8) (2019-10-14)


### Bug Fixes

* Remove adapter commons type alternatives ([#1620](https://github.com/feathersjs/feathers/issues/1620)) ([c9f3086](https://github.com/feathersjs/feathers/commit/c9f3086344420b57dbce7c4169cf550c97509f0d))





## [4.3.7](https://github.com/feathersjs/feathers/compare/v4.3.6...v4.3.7) (2019-10-14)


### Bug Fixes

* Improve authentication client default storage initialization ([#1613](https://github.com/feathersjs/feathers/issues/1613)) ([d7f5107](https://github.com/feathersjs/feathers/commit/d7f5107ef76297b4ca6db580afc5e2b372f5ee4d))
* improve Service and AdapterService types ([#1567](https://github.com/feathersjs/feathers/issues/1567)) ([baad6a2](https://github.com/feathersjs/feathers/commit/baad6a26f0f543b712ccb40359b3933ad3a21392))
* make __hooks writable and configurable ([#1520](https://github.com/feathersjs/feathers/issues/1520)) ([1c6c374](https://github.com/feathersjs/feathers/commit/1c6c3742ecf1cb813be56074da89e6736d03ffe8))
* Typings for express request and response properties ([#1609](https://github.com/feathersjs/feathers/issues/1609)) ([38cf8c9](https://github.com/feathersjs/feathers/commit/38cf8c950c1a4fb4a6d78d68d70e7fdd63b71c3c))





## [4.3.6](https://github.com/feathersjs/feathers/compare/v4.3.5...v4.3.6) (2019-10-07)


### Bug Fixes

* Check query  for NaN ([#1607](https://github.com/feathersjs/feathers/issues/1607)) ([f1a781f](https://github.com/feathersjs/feathers/commit/f1a781f))





## [4.3.5](https://github.com/feathersjs/feathers/compare/v4.3.4...v4.3.5) (2019-10-07)


### Bug Fixes

* Authentication type improvements and timeout fix ([#1605](https://github.com/feathersjs/feathers/issues/1605)) ([19854d3](https://github.com/feathersjs/feathers/commit/19854d3))
* Change this reference in client libraries to explicitly passed app ([#1597](https://github.com/feathersjs/feathers/issues/1597)) ([4e4d10a](https://github.com/feathersjs/feathers/commit/4e4d10a))
* Improve error message when authentication strategy is not allowed ([#1600](https://github.com/feathersjs/feathers/issues/1600)) ([317a312](https://github.com/feathersjs/feathers/commit/317a312))





## [4.3.4](https://github.com/feathersjs/feathers/compare/v4.3.3...v4.3.4) (2019-10-03)


### Bug Fixes

* Reset version number after every publish ([#1596](https://github.com/feathersjs/feathers/issues/1596)) ([f24f82f](https://github.com/feathersjs/feathers/commit/f24f82f))
* Typing improvements ([#1580](https://github.com/feathersjs/feathers/issues/1580)) ([7818aec](https://github.com/feathersjs/feathers/commit/7818aec))





## [4.3.3](https://github.com/feathersjs/feathers/compare/v4.3.2...v4.3.3) (2019-09-21)


### Bug Fixes

* check for undefined access token ([#1571](https://github.com/feathersjs/feathers/issues/1571)) ([976369d](https://github.com/feathersjs/feathers/commit/976369d))
* Small improvements in dependencies and code sturcture ([#1562](https://github.com/feathersjs/feathers/issues/1562)) ([42c13e2](https://github.com/feathersjs/feathers/commit/42c13e2))





## [4.3.2](https://github.com/feathersjs/feathers/compare/v4.3.1...v4.3.2) (2019-09-16)


### Bug Fixes

* Add info to express error handler logger type ([#1557](https://github.com/feathersjs/feathers/issues/1557)) ([3e1d26c](https://github.com/feathersjs/feathers/commit/3e1d26c))
* LocalStrategy authenticates without username ([#1560](https://github.com/feathersjs/feathers/issues/1560)) ([2b258fd](https://github.com/feathersjs/feathers/commit/2b258fd)), closes [#1559](https://github.com/feathersjs/feathers/issues/1559)





## [4.3.1](https://github.com/feathersjs/feathers/compare/v4.3.0...v4.3.1) (2019-09-09)


### Bug Fixes

* Fix regression in transport commons ([#1551](https://github.com/feathersjs/feathers/issues/1551)) ([ed9e934](https://github.com/feathersjs/feathers/commit/ed9e934))
* Omit standard protocol ports from the default hostname ([#1543](https://github.com/feathersjs/feathers/issues/1543)) ([ef16d29](https://github.com/feathersjs/feathers/commit/ef16d29))
* Use long-timeout for JWT expiration timers ([#1552](https://github.com/feathersjs/feathers/issues/1552)) ([65637ec](https://github.com/feathersjs/feathers/commit/65637ec))





# [4.3.0](https://github.com/feathersjs/feathers/compare/v4.3.0-pre.4...v4.3.0) (2019-08-27)


### Bug Fixes

* Only remove token on NotAuthenticated error in authentication client and handle error better ([#1525](https://github.com/feathersjs/feathers/issues/1525)) ([13a8758](https://github.com/feathersjs/feathers/commit/13a8758))





# [4.3.0-pre.4](https://github.com/feathersjs/feathers/compare/v4.3.0-pre.3...v4.3.0-pre.4) (2019-08-22)


### Bug Fixes

* Fix auth publisher mistake ([08bad61](https://github.com/feathersjs/feathers/commit/08bad61))





# [4.3.0-pre.3](https://github.com/feathersjs/feathers/compare/v4.3.0-pre.2...v4.3.0-pre.3) (2019-08-19)


### Bug Fixes

* Expire and remove authenticated real-time connections ([#1512](https://github.com/feathersjs/feathers/issues/1512)) ([2707c33](https://github.com/feathersjs/feathers/commit/2707c33))
* Update all dependencies ([7d53a00](https://github.com/feathersjs/feathers/commit/7d53a00))
* Use WeakMap to connect socket to connection ([#1509](https://github.com/feathersjs/feathers/issues/1509)) ([64807e3](https://github.com/feathersjs/feathers/commit/64807e3))


### Features

* Let strategies handle the connection ([#1510](https://github.com/feathersjs/feathers/issues/1510)) ([4329feb](https://github.com/feathersjs/feathers/commit/4329feb))





# [4.3.0-pre.2](https://github.com/feathersjs/feathers/compare/v4.3.0-pre.1...v4.3.0-pre.2) (2019-08-02)


### Bug Fixes

* @feathersjs/adapter-commons: `update` id is non-nullable ([#1468](https://github.com/feathersjs/feathers/issues/1468)) ([43ec802](https://github.com/feathersjs/feathers/commit/43ec802))
* Add getEntityId to JWT strategy and fix legacy Socket authentication ([#1488](https://github.com/feathersjs/feathers/issues/1488)) ([9a3b324](https://github.com/feathersjs/feathers/commit/9a3b324))
* Add method to reliably get default authentication service ([#1470](https://github.com/feathersjs/feathers/issues/1470)) ([e542cb3](https://github.com/feathersjs/feathers/commit/e542cb3))
* Do not error in authentication client on logout ([#1473](https://github.com/feathersjs/feathers/issues/1473)) ([8211b98](https://github.com/feathersjs/feathers/commit/8211b98))
* Improve Params typing ([#1474](https://github.com/feathersjs/feathers/issues/1474)) ([54a3aa7](https://github.com/feathersjs/feathers/commit/54a3aa7))





# [4.3.0-pre.1](https://github.com/feathersjs/feathers/compare/v4.0.0-pre.5...v4.3.0-pre.1) (2019-07-11)

**Note:** Version bump only for package feathers





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
