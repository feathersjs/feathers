# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [5.0.0-pre.27](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.26...v5.0.0-pre.27) (2022-07-13)


### Bug Fixes

* Freeze the resolver context ([#2685](https://github.com/feathersjs/feathers/issues/2685)) ([247dccb](https://github.com/feathersjs/feathers/commit/247dccb2eb72551962030321cb1c0ecb11b0181e))





# [5.0.0-pre.26](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.25...v5.0.0-pre.26) (2022-06-22)

**Note:** Version bump only for package @feathersjs/schema





# [5.0.0-pre.25](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.24...v5.0.0-pre.25) (2022-06-22)

**Note:** Version bump only for package @feathersjs/schema





# [5.0.0-pre.24](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.23...v5.0.0-pre.24) (2022-06-21)


### Bug Fixes

* **schema:** Fix dispatch resovler hook to convert actually resolved data ([#2663](https://github.com/feathersjs/feathers/issues/2663)) ([f7e87db](https://github.com/feathersjs/feathers/commit/f7e87dbb9a0bc8d89aee47318dddbaa4d6ba5b91))


### Features

* **cli:** Add typed client to a generated app ([#2669](https://github.com/feathersjs/feathers/issues/2669)) ([5b801b5](https://github.com/feathersjs/feathers/commit/5b801b5017ddc3eaa95622b539f51d605916bc86))





# [5.0.0-pre.23](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.22...v5.0.0-pre.23) (2022-06-06)


### Bug Fixes

* **schema:** Always resolve dispatch in resolveAll and add getDispatch method ([#2645](https://github.com/feathersjs/feathers/issues/2645)) ([145b366](https://github.com/feathersjs/feathers/commit/145b366435695438fbc8db9fdb161162ca9049ad))
* **schema:** remove `default` from queryProperty schemas ([#2646](https://github.com/feathersjs/feathers/issues/2646)) ([940a2b6](https://github.com/feathersjs/feathers/commit/940a2b6868d2f77f81edb1661f6417ec2ea6e372))


### Features

* **core:** Rename async hooks to around hooks, allow usual registration format ([#2652](https://github.com/feathersjs/feathers/issues/2652)) ([2a485a0](https://github.com/feathersjs/feathers/commit/2a485a07929184261f27437fc0fdfe5a44694834))





# [5.0.0-pre.22](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.21...v5.0.0-pre.22) (2022-05-24)


### Bug Fixes

* **schema:** Allows resolveData with different resolvers based on method ([#2644](https://github.com/feathersjs/feathers/issues/2644)) ([be71fa2](https://github.com/feathersjs/feathers/commit/be71fa2fe260e05b7dcc0d5f439e33f2e9ec2434))





# [5.0.0-pre.21](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.20...v5.0.0-pre.21) (2022-05-23)


### Bug Fixes

* **schema:** Add Combine helper to allow merging schema types that use ([#2637](https://github.com/feathersjs/feathers/issues/2637)) ([06d03e9](https://github.com/feathersjs/feathers/commit/06d03e91abb1347576c2351c12322d01c58473e5))
* **typescript:** Make additional types generic to work with extended types ([#2625](https://github.com/feathersjs/feathers/issues/2625)) ([269fdec](https://github.com/feathersjs/feathers/commit/269fdecc5961092dc8608b3cbe16f433c80bfa96))


### Features

* **schema:** Add resolveAll hook ([#2643](https://github.com/feathersjs/feathers/issues/2643)) ([85527d7](https://github.com/feathersjs/feathers/commit/85527d71cb78852880696e5d96abdcdf24593934))
* **schema:** Add resolver for safe external data dispatching ([#2641](https://github.com/feathersjs/feathers/issues/2641)) ([72b980e](https://github.com/feathersjs/feathers/commit/72b980e05631136d30c8f1468dee45ec6a8d2503))
* **schema:** Add schema resolver converter functionality ([#2640](https://github.com/feathersjs/feathers/issues/2640)) ([26d9e05](https://github.com/feathersjs/feathers/commit/26d9e05327d6e0144466cd57d6fcc11ac7ecb06a))





# [5.0.0-pre.20](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.19...v5.0.0-pre.20) (2022-05-04)


### Bug Fixes

* **dependencies:** Lock monorepo package version numbers ([#2623](https://github.com/feathersjs/feathers/issues/2623)) ([5640c10](https://github.com/feathersjs/feathers/commit/5640c1020cc139994e695d658c08bad3494db507))


### Features

* **schema:** Add querySyntax helper to create full query schemas ([#2621](https://github.com/feathersjs/feathers/issues/2621)) ([2bbb103](https://github.com/feathersjs/feathers/commit/2bbb103b2f3e30fb0fff935f92ad3276a1a67e41))





# [5.0.0-pre.19](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.18...v5.0.0-pre.19) (2022-05-01)


### Features

* **schema:** Allow hooks to run resolvers in sequence ([#2609](https://github.com/feathersjs/feathers/issues/2609)) ([d85c507](https://github.com/feathersjs/feathers/commit/d85c507c76d07e48fc8e7e28ff7de0ef435e0ef8))
* **typescript:** Improve adapter typings ([#2605](https://github.com/feathersjs/feathers/issues/2605)) ([3b2ca0a](https://github.com/feathersjs/feathers/commit/3b2ca0a6a8e03e8390272c4d7e930b4bffdaacf5))
* **typescript:** Improve params and query typeability ([#2600](https://github.com/feathersjs/feathers/issues/2600)) ([df28b76](https://github.com/feathersjs/feathers/commit/df28b7619161f1df5e700326f52cca1a92dc5d28))





# [5.0.0-pre.18](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.17...v5.0.0-pre.18) (2022-04-11)


### Bug Fixes

* **schema:** result resolver correctly resolves paginated find result ([#2594](https://github.com/feathersjs/feathers/issues/2594)) ([6511e45](https://github.com/feathersjs/feathers/commit/6511e45bd0624f1a629530719709f4b27fecbe0b))


### Features

* **configuration:** Allow app configuration to be validated against a schema ([#2590](https://github.com/feathersjs/feathers/issues/2590)) ([a268f86](https://github.com/feathersjs/feathers/commit/a268f86da92a8ada14ed11ab456aac0a4bba5bb0))





# [5.0.0-pre.17](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.16...v5.0.0-pre.17) (2022-02-15)


### Bug Fixes

* **hooks:** Allow all built-in hooks to be used the async and regular way ([#2559](https://github.com/feathersjs/feathers/issues/2559)) ([8f9f631](https://github.com/feathersjs/feathers/commit/8f9f631e0ce89de349207db72def84e7ab496a4a))
* **queryProperty:** allow compound oneOf ([#2545](https://github.com/feathersjs/feathers/issues/2545)) ([3077d2d](https://github.com/feathersjs/feathers/commit/3077d2d896a38d579ce4d5b530e21ad332bcf221))
* **schema:** Properly handle resolver errors ([#2540](https://github.com/feathersjs/feathers/issues/2540)) ([31fbdff](https://github.com/feathersjs/feathers/commit/31fbdff8bd848ac7e0eda56e307ac34b1bfcf17f))





# [5.0.0-pre.16](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.15...v5.0.0-pre.16) (2022-01-12)


### Bug Fixes

* **schema:** Do not error for schemas without properties ([#2519](https://github.com/feathersjs/feathers/issues/2519)) ([96fdb47](https://github.com/feathersjs/feathers/commit/96fdb47d45fd88a8039aa9cc9ec8aebd98672b95))
* **schema:** Fix resolver data type and use new validation feature in test fixture ([#2523](https://github.com/feathersjs/feathers/issues/2523)) ([1093f12](https://github.com/feathersjs/feathers/commit/1093f124b60524cbd9050fcf07ddaf1d558973da))


### Features

* **schema:** Allow to use custom AJV and test with ajv-formats ([#2513](https://github.com/feathersjs/feathers/issues/2513)) ([ecfa4df](https://github.com/feathersjs/feathers/commit/ecfa4df29f029f6ca8517cacf518c14b46ffeb4e))
* **schema:** Improve schema typing, validation and extensibility ([#2521](https://github.com/feathersjs/feathers/issues/2521)) ([8c1b350](https://github.com/feathersjs/feathers/commit/8c1b35052792e82d13be03c06583534284fbae82))





# [5.0.0-pre.15](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.14...v5.0.0-pre.15) (2021-11-27)


### Bug Fixes

* **typescript:** Overall typing improvements ([#2478](https://github.com/feathersjs/feathers/issues/2478)) ([b8eb804](https://github.com/feathersjs/feathers/commit/b8eb804158556d9651a8607e3c3fda15e0bfd110))





# [5.0.0-pre.14](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.13...v5.0.0-pre.14) (2021-10-13)

**Note:** Version bump only for package @feathersjs/schema





# [5.0.0-pre.13](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.12...v5.0.0-pre.13) (2021-10-13)

**Note:** Version bump only for package @feathersjs/schema





# [5.0.0-pre.12](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.11...v5.0.0-pre.12) (2021-10-12)

**Note:** Version bump only for package @feathersjs/schema





# [5.0.0-pre.11](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.10...v5.0.0-pre.11) (2021-10-06)


### Features

* **schema:** Allow resolvers to validate a schema ([#2465](https://github.com/feathersjs/feathers/issues/2465)) ([7d9590b](https://github.com/feathersjs/feathers/commit/7d9590bbe12b94b8b5a7987684f5d4968e426481))





# [5.0.0-pre.10](https://github.com/feathersjs/feathers/compare/v5.0.0-pre.9...v5.0.0-pre.10) (2021-09-19)


### Features

* **schema:** Initial version of schema definitions and resolvers ([#2441](https://github.com/feathersjs/feathers/issues/2441)) ([c57a5cd](https://github.com/feathersjs/feathers/commit/c57a5cd56699a121647be4506d8f967e6d72ecae))
