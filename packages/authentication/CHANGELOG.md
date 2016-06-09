# Change Log

## [v0.7.8](https://github.com/feathersjs/feathers-authentication/tree/v0.7.8) (2016-06-09)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.7...v0.7.8)

**Closed issues:**

- Feathers-authentication assumptions [\#220](https://github.com/feathersjs/feathers-authentication/issues/220)
- Server-side header option does not accept capital letters [\#218](https://github.com/feathersjs/feathers-authentication/issues/218)
- How to figure out why redirect to /auth/failure? [\#217](https://github.com/feathersjs/feathers-authentication/issues/217)
- Getting token via REST is not documented [\#216](https://github.com/feathersjs/feathers-authentication/issues/216)
- How to use Feathers Client to Authenticate Facebook/Instagram credentials [\#204](https://github.com/feathersjs/feathers-authentication/issues/204)
- Remove token from localstorage [\#203](https://github.com/feathersjs/feathers-authentication/issues/203)
- Check user password [\#193](https://github.com/feathersjs/feathers-authentication/issues/193)
- app.authenticate\(\): Warning: a promise was rejected with a non-error: \[object Object\] [\#191](https://github.com/feathersjs/feathers-authentication/issues/191)
- Authentication provider for Facebook Account Kit [\#189](https://github.com/feathersjs/feathers-authentication/issues/189)

**Merged pull requests:**

- Lowercase custom header [\#219](https://github.com/feathersjs/feathers-authentication/pull/219) ([mmwtsn](https://github.com/mmwtsn))
- mocha@2.5.0 breaks build 🚨 [\#212](https://github.com/feathersjs/feathers-authentication/pull/212) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Small refactoring to simplify structure and remove code duplication [\#209](https://github.com/feathersjs/feathers-authentication/pull/209) ([daffl](https://github.com/daffl))
- Use removeItem in the storage on logout [\#208](https://github.com/feathersjs/feathers-authentication/pull/208) ([daffl](https://github.com/daffl))
- Misspelled in a comment [\#201](https://github.com/feathersjs/feathers-authentication/pull/201) ([tryy3](https://github.com/tryy3))
- Update babel-plugin-add-module-exports to version 0.2.0 🚀 [\#199](https://github.com/feathersjs/feathers-authentication/pull/199) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))

## [v0.7.7](https://github.com/feathersjs/feathers-authentication/tree/v0.7.7) (2016-05-05)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.6...v0.7.7)

**Fixed bugs:**

- OAuth2 authentication callback failing due to missing property [\#196](https://github.com/feathersjs/feathers-authentication/issues/196)

**Merged pull requests:**

- properly handle optional `\_json` property [\#197](https://github.com/feathersjs/feathers-authentication/pull/197) ([nyaaao](https://github.com/nyaaao))

## [v0.7.6](https://github.com/feathersjs/feathers-authentication/tree/v0.7.6) (2016-05-03)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.5...v0.7.6)

**Fixed bugs:**

- Facebook Authentication should do a patch not an update. [\#174](https://github.com/feathersjs/feathers-authentication/issues/174)

**Closed issues:**

- Authenticated user  [\#192](https://github.com/feathersjs/feathers-authentication/issues/192)
- REST token revoke [\#185](https://github.com/feathersjs/feathers-authentication/issues/185)
- TypeError: Cannot read property 'service' of undefined [\#173](https://github.com/feathersjs/feathers-authentication/issues/173)
- Optionally Include password in the params.query object passed to User.find\(\) [\#171](https://github.com/feathersjs/feathers-authentication/issues/171)
- Pass more to local authentication params [\#165](https://github.com/feathersjs/feathers-authentication/issues/165)
- Support custom authentication strategies [\#157](https://github.com/feathersjs/feathers-authentication/issues/157)

**Merged pull requests:**

- Allow manipulation of params before checking credentials [\#186](https://github.com/feathersjs/feathers-authentication/pull/186) ([saiichihashimoto](https://github.com/saiichihashimoto))
- Update feathers to version 2.0.1 🚀 [\#184](https://github.com/feathersjs/feathers-authentication/pull/184) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- fix\(oauth2\): Use patch to update user in oauthCallback [\#183](https://github.com/feathersjs/feathers-authentication/pull/183) ([beevelop](https://github.com/beevelop))

## [v0.7.5](https://github.com/feathersjs/feathers-authentication/tree/v0.7.5) (2016-04-23)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.4...v0.7.5)

**Fixed bugs:**

- restrictToOwner and restrictToRoles have invalid type checking [\#172](https://github.com/feathersjs/feathers-authentication/issues/172)

**Closed issues:**

- user fails to signup with facebook if there is also local auth [\#168](https://github.com/feathersjs/feathers-authentication/issues/168)
- Unable to authenticate requests when using vanilla Socket.IO [\#166](https://github.com/feathersjs/feathers-authentication/issues/166)

## [v0.7.4](https://github.com/feathersjs/feathers-authentication/tree/v0.7.4) (2016-04-18)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.3...v0.7.4)

**Fixed bugs:**

- restrictToOwner and restrictToRoles hooks don't work with nested models [\#163](https://github.com/feathersjs/feathers-authentication/issues/163)
- Change restrictToOwner error when a request does not contain ID [\#160](https://github.com/feathersjs/feathers-authentication/issues/160)

**Closed issues:**

- authenticate\(\) can leak sensetive user data via token service [\#162](https://github.com/feathersjs/feathers-authentication/issues/162)
- onBeforeLogin Hook [\#161](https://github.com/feathersjs/feathers-authentication/issues/161)

**Merged pull requests:**

- Hook fixes [\#164](https://github.com/feathersjs/feathers-authentication/pull/164) ([ekryski](https://github.com/ekryski))

## [v0.7.3](https://github.com/feathersjs/feathers-authentication/tree/v0.7.3) (2016-04-16)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.2...v0.7.3)

## [v0.7.2](https://github.com/feathersjs/feathers-authentication/tree/v0.7.2) (2016-04-16)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.1...v0.7.2)

**Closed issues:**

- Auth doesn't work with non default local.userEndpoint [\#159](https://github.com/feathersjs/feathers-authentication/issues/159)
- Automatically add the hashPassword hook to local.userEndpoint [\#158](https://github.com/feathersjs/feathers-authentication/issues/158)
- Client authentication\(\) storage option not documented [\#155](https://github.com/feathersjs/feathers-authentication/issues/155)
- restrictToRoles availability inconsistency [\#153](https://github.com/feathersjs/feathers-authentication/issues/153)
- Does not populate user for other services [\#150](https://github.com/feathersjs/feathers-authentication/issues/150)

**Merged pull requests:**

- Steal Compatibility [\#156](https://github.com/feathersjs/feathers-authentication/pull/156) ([marshallswain](https://github.com/marshallswain))

## [v0.7.1](https://github.com/feathersjs/feathers-authentication/tree/v0.7.1) (2016-04-08)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.0...v0.7.1)

**Closed issues:**

- Documentation discrepancies [\#148](https://github.com/feathersjs/feathers-authentication/issues/148)
- bcrypt is hardcoded [\#146](https://github.com/feathersjs/feathers-authentication/issues/146)
- Update Docs, Guides, Examples for v0.7 [\#129](https://github.com/feathersjs/feathers-authentication/issues/129)
- populateUser: allow option to populate without db call. [\#92](https://github.com/feathersjs/feathers-authentication/issues/92)

**Merged pull requests:**

- Update feathers-memory to version 0.7.0 🚀 [\#149](https://github.com/feathersjs/feathers-authentication/pull/149) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- fix a typo [\#147](https://github.com/feathersjs/feathers-authentication/pull/147) ([chrjean](https://github.com/chrjean))
- Fix copy paste typo in queryWithCurrentUser hook. [\#140](https://github.com/feathersjs/feathers-authentication/pull/140) ([juodumas](https://github.com/juodumas))

## [v0.7.0](https://github.com/feathersjs/feathers-authentication/tree/v0.7.0) (2016-03-30)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.6.0...v0.7.0)

**Fixed bugs:**

- logout should de-authenticate a socket [\#136](https://github.com/feathersjs/feathers-authentication/issues/136)
- \[Security\] JsonWebToken Lifecycle Concerns; Set HttpOnly = true in JWT cookie [\#132](https://github.com/feathersjs/feathers-authentication/issues/132)
- restrictToRoles hook needs to throw an error and not scope the query [\#128](https://github.com/feathersjs/feathers-authentication/issues/128)
- restrictToOwner hook needs to throw an error and not scope the query [\#127](https://github.com/feathersjs/feathers-authentication/issues/127)
- \[security\] Generated tokens are broadcast to all socket clients \(by default\) [\#126](https://github.com/feathersjs/feathers-authentication/issues/126)
- \[oAuth\] User profile should be updated every time they are authenticated [\#124](https://github.com/feathersjs/feathers-authentication/issues/124)
- Logout should clear the cookie [\#122](https://github.com/feathersjs/feathers-authentication/issues/122)
- Want the default success/fail routes, not the sendFile [\#121](https://github.com/feathersjs/feathers-authentication/issues/121)

**Closed issues:**

- Make all hooks optional if used internally [\#138](https://github.com/feathersjs/feathers-authentication/issues/138)
- Throw errors for deprecated hooks and update documentation [\#134](https://github.com/feathersjs/feathers-authentication/issues/134)
- v6.0.0: How can I return the user object along with the token ? [\#131](https://github.com/feathersjs/feathers-authentication/issues/131)
- user field not getting populated [\#119](https://github.com/feathersjs/feathers-authentication/issues/119)
- Move to bcryptjs [\#112](https://github.com/feathersjs/feathers-authentication/issues/112)
- Bundled hooks should pull from auth config to avoid having to pass duplicate props. [\#93](https://github.com/feathersjs/feathers-authentication/issues/93)
- Customize the JWT payload [\#78](https://github.com/feathersjs/feathers-authentication/issues/78)
- Needs a test for verifying that a custom tokenEndpoint works. [\#59](https://github.com/feathersjs/feathers-authentication/issues/59)
- Finish test coverage for existing features. [\#9](https://github.com/feathersjs/feathers-authentication/issues/9)

**Merged pull requests:**

- 0.7 Release [\#139](https://github.com/feathersjs/feathers-authentication/pull/139) ([ekryski](https://github.com/ekryski))

## [v0.6.0](https://github.com/feathersjs/feathers-authentication/tree/v0.6.0) (2016-03-24)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.5.1...v0.6.0)

**Fixed bugs:**

- Token encoding is not using the idField option. [\#107](https://github.com/feathersjs/feathers-authentication/issues/107)
- Logging out breaks in React Native [\#105](https://github.com/feathersjs/feathers-authentication/issues/105)
- Updating User Attached to Params in Client [\#102](https://github.com/feathersjs/feathers-authentication/issues/102)
- local auth should not redirect by default [\#89](https://github.com/feathersjs/feathers-authentication/issues/89)

**Closed issues:**

- Id of user can't be 0 for auth [\#116](https://github.com/feathersjs/feathers-authentication/issues/116)
- how to authenticate user in the socket.io? [\#111](https://github.com/feathersjs/feathers-authentication/issues/111)
- Wrong Status Error [\#110](https://github.com/feathersjs/feathers-authentication/issues/110)
- TypeError: Cannot read property 'service' of undefined \(continued\) [\#108](https://github.com/feathersjs/feathers-authentication/issues/108)
- `idField` breaks from `tokenService.create\(\)` to `populateUser\(\)` after hook [\#103](https://github.com/feathersjs/feathers-authentication/issues/103)

**Merged pull requests:**

- Bcryptjs [\#137](https://github.com/feathersjs/feathers-authentication/pull/137) ([ekryski](https://github.com/ekryski))
- Allow user.id to be 0.  Fixes \#116 [\#117](https://github.com/feathersjs/feathers-authentication/pull/117) ([marshallswain](https://github.com/marshallswain))
- client should return a 401 error code when no token is provided [\#115](https://github.com/feathersjs/feathers-authentication/pull/115) ([ccummings](https://github.com/ccummings))
- v0.6 - Bugs fixes, new hooks, and hook tests [\#109](https://github.com/feathersjs/feathers-authentication/pull/109) ([ekryski](https://github.com/ekryski))
- primus client connect event is 'open' [\#106](https://github.com/feathersjs/feathers-authentication/pull/106) ([ahdinosaur](https://github.com/ahdinosaur))

## [v0.5.1](https://github.com/feathersjs/feathers-authentication/tree/v0.5.1) (2016-03-15)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.5.0...v0.5.1)

## [v0.5.0](https://github.com/feathersjs/feathers-authentication/tree/v0.5.0) (2016-03-14)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.4.1...v0.5.0)

**Fixed bugs:**

- Client should store token string and not the token object [\#95](https://github.com/feathersjs/feathers-authentication/issues/95)

**Closed issues:**

- using feathers-rest/client with feathers-authentication/client [\#94](https://github.com/feathersjs/feathers-authentication/issues/94)
- populateUser can pull defaults from config, if available. [\#91](https://github.com/feathersjs/feathers-authentication/issues/91)
- App level auth routes for multiple sub-routes [\#90](https://github.com/feathersjs/feathers-authentication/issues/90)
- POST to /auth/local never gets response [\#88](https://github.com/feathersjs/feathers-authentication/issues/88)
- populate-user.js do not get settings [\#86](https://github.com/feathersjs/feathers-authentication/issues/86)
- Add rate limiting [\#81](https://github.com/feathersjs/feathers-authentication/issues/81)

**Merged pull requests:**

- Finalizing client side authentication module [\#101](https://github.com/feathersjs/feathers-authentication/pull/101) ([daffl](https://github.com/daffl))
- Ten hours is only 36 seconds [\#99](https://github.com/feathersjs/feathers-authentication/pull/99) ([mileswilson](https://github.com/mileswilson))
- Fix examples [\#98](https://github.com/feathersjs/feathers-authentication/pull/98) ([mastertinner](https://github.com/mastertinner))
- fix html in templates [\#97](https://github.com/feathersjs/feathers-authentication/pull/97) ([mastertinner](https://github.com/mastertinner))
- update populateUser\(\) hook [\#87](https://github.com/feathersjs/feathers-authentication/pull/87) ([kulakowka](https://github.com/kulakowka))
- Customize the JWT payload [\#80](https://github.com/feathersjs/feathers-authentication/pull/80) ([enten](https://github.com/enten))

## [v0.4.1](https://github.com/feathersjs/feathers-authentication/tree/v0.4.1) (2016-02-28)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.4.0...v0.4.1)

**Fixed bugs:**

- app.logout\(\) fails [\#85](https://github.com/feathersjs/feathers-authentication/issues/85)

**Closed issues:**

- Username response ? [\#84](https://github.com/feathersjs/feathers-authentication/issues/84)
- User doesn't get populated after authentication with databases that don't use \_id  [\#71](https://github.com/feathersjs/feathers-authentication/issues/71)
- Support client usage in NodeJS [\#52](https://github.com/feathersjs/feathers-authentication/issues/52)
- Support async storage for React Native [\#51](https://github.com/feathersjs/feathers-authentication/issues/51)
- RequireAdmin on userService [\#36](https://github.com/feathersjs/feathers-authentication/issues/36)
- Create test for changing the `usernameField` [\#1](https://github.com/feathersjs/feathers-authentication/issues/1)

## [v0.4.0](https://github.com/feathersjs/feathers-authentication/tree/v0.4.0) (2016-02-27)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.3.5...v0.4.0)

**Closed issues:**

- Authentication not worked with hooks.remove\('password'\) [\#82](https://github.com/feathersjs/feathers-authentication/issues/82)

**Merged pull requests:**

- Refactoring for storage service [\#76](https://github.com/feathersjs/feathers-authentication/pull/76) ([ekryski](https://github.com/ekryski))

## [v0.3.5](https://github.com/feathersjs/feathers-authentication/tree/v0.3.5) (2016-02-25)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.3.4...v0.3.5)

**Merged pull requests:**

- Adding support for OAuth2 token based auth strategies. Closes \#46. [\#77](https://github.com/feathersjs/feathers-authentication/pull/77) ([ekryski](https://github.com/ekryski))

## [v0.3.4](https://github.com/feathersjs/feathers-authentication/tree/v0.3.4) (2016-02-25)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.3.3...v0.3.4)

## [v0.3.3](https://github.com/feathersjs/feathers-authentication/tree/v0.3.3) (2016-02-25)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.3.2...v0.3.3)

## [v0.3.2](https://github.com/feathersjs/feathers-authentication/tree/v0.3.2) (2016-02-24)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.3.1...v0.3.2)

**Merged pull requests:**

- bumping feathers-errors version [\#79](https://github.com/feathersjs/feathers-authentication/pull/79) ([ekryski](https://github.com/ekryski))

## [v0.3.1](https://github.com/feathersjs/feathers-authentication/tree/v0.3.1) (2016-02-23)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.3.0...v0.3.1)

**Closed issues:**

- Fix toLowerCase hook [\#74](https://github.com/feathersjs/feathers-authentication/issues/74)
- REST auth/local not working if socketio\(\) not set [\#72](https://github.com/feathersjs/feathers-authentication/issues/72)
- Support mobile authentication via OAuth2 [\#46](https://github.com/feathersjs/feathers-authentication/issues/46)

**Merged pull requests:**

- Fix toLowerCase hook [\#75](https://github.com/feathersjs/feathers-authentication/pull/75) ([enten](https://github.com/enten))

## [v0.3.0](https://github.com/feathersjs/feathers-authentication/tree/v0.3.0) (2016-02-19)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.2.4...v0.3.0)

**Fixed bugs:**

- Don't register successRedirect route if custom one is passed in [\#61](https://github.com/feathersjs/feathers-authentication/issues/61)

**Closed issues:**

- Specify the secret in one place instead of two [\#69](https://github.com/feathersjs/feathers-authentication/issues/69)
- support a failRedirect [\#62](https://github.com/feathersjs/feathers-authentication/issues/62)
- Document authentication updates [\#50](https://github.com/feathersjs/feathers-authentication/issues/50)

**Merged pull requests:**

- Config options [\#70](https://github.com/feathersjs/feathers-authentication/pull/70) ([ekryski](https://github.com/ekryski))

## [v0.2.4](https://github.com/feathersjs/feathers-authentication/tree/v0.2.4) (2016-02-17)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.2.3...v0.2.4)

**Closed issues:**

- Find "query" is replaced by token [\#64](https://github.com/feathersjs/feathers-authentication/issues/64)

**Merged pull requests:**

- Add module exports Babel module and test CommonJS compatibility [\#68](https://github.com/feathersjs/feathers-authentication/pull/68) ([daffl](https://github.com/daffl))

## [v0.2.3](https://github.com/feathersjs/feathers-authentication/tree/v0.2.3) (2016-02-15)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.2.2...v0.2.3)

**Closed issues:**

- How to forbid get and find on the userEndpoint?   [\#66](https://github.com/feathersjs/feathers-authentication/issues/66)
- userEndpoint problem in sub-app [\#63](https://github.com/feathersjs/feathers-authentication/issues/63)
- How to modify successRedirect in local authentication? [\#60](https://github.com/feathersjs/feathers-authentication/issues/60)

**Merged pull requests:**

- Removing assigning token to params.query for sockets. [\#67](https://github.com/feathersjs/feathers-authentication/pull/67) ([ekryski](https://github.com/ekryski))
- Fixing client query [\#65](https://github.com/feathersjs/feathers-authentication/pull/65) ([fastlorenzo](https://github.com/fastlorenzo))

## [v0.2.2](https://github.com/feathersjs/feathers-authentication/tree/v0.2.2) (2016-02-13)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.2.1...v0.2.2)

**Closed issues:**

- Custom tokenEndpoint failing [\#57](https://github.com/feathersjs/feathers-authentication/issues/57)
- TypeError: Cannot read property 'service' of undefined [\#56](https://github.com/feathersjs/feathers-authentication/issues/56)
- Login returns 500: Internal server error [\#54](https://github.com/feathersjs/feathers-authentication/issues/54)

**Merged pull requests:**

- Fixing token endpoint [\#58](https://github.com/feathersjs/feathers-authentication/pull/58) ([marshallswain](https://github.com/marshallswain))

## [v0.2.1](https://github.com/feathersjs/feathers-authentication/tree/v0.2.1) (2016-02-12)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.2.0...v0.2.1)

**Closed issues:**

- Custom local options not being respected. [\#55](https://github.com/feathersjs/feathers-authentication/issues/55)
- node can not require\("feathers-authentication"\).default [\#53](https://github.com/feathersjs/feathers-authentication/issues/53)

## [v0.2.0](https://github.com/feathersjs/feathers-authentication/tree/v0.2.0) (2016-02-12)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.1.2...v0.2.0)

**Closed issues:**

- Support graceful fallback to cookies [\#45](https://github.com/feathersjs/feathers-authentication/issues/45)
- Add a client side component for authentication [\#44](https://github.com/feathersjs/feathers-authentication/issues/44)
- Support OAuth2 [\#43](https://github.com/feathersjs/feathers-authentication/issues/43)
- Support token based authentication [\#41](https://github.com/feathersjs/feathers-authentication/issues/41)
- Support local authentication [\#40](https://github.com/feathersjs/feathers-authentication/issues/40)
- Only sign the JWT with user id. Not the whole user object [\#38](https://github.com/feathersjs/feathers-authentication/issues/38)
- Discussion: Securing token for socket.io auth [\#33](https://github.com/feathersjs/feathers-authentication/issues/33)
- Handling expired tokens [\#25](https://github.com/feathersjs/feathers-authentication/issues/25)
- Support multiple auth providers [\#6](https://github.com/feathersjs/feathers-authentication/issues/6)

**Merged pull requests:**

- Decoupling [\#49](https://github.com/feathersjs/feathers-authentication/pull/49) ([ekryski](https://github.com/ekryski))
- Adding an auth client [\#48](https://github.com/feathersjs/feathers-authentication/pull/48) ([ekryski](https://github.com/ekryski))
- Validate if provider [\#39](https://github.com/feathersjs/feathers-authentication/pull/39) ([mastertinner](https://github.com/mastertinner))

## [v0.1.2](https://github.com/feathersjs/feathers-authentication/tree/v0.1.2) (2016-02-04)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.1.1...v0.1.2)

**Closed issues:**

- Hooks should support incoming data as arrays of objects. [\#34](https://github.com/feathersjs/feathers-authentication/issues/34)
- Support authenticating with Username and Password via sockets [\#32](https://github.com/feathersjs/feathers-authentication/issues/32)

**Merged pull requests:**

- Check for params.provider in requireAuth hook [\#37](https://github.com/feathersjs/feathers-authentication/pull/37) ([marshallswain](https://github.com/marshallswain))
- safety check for data [\#35](https://github.com/feathersjs/feathers-authentication/pull/35) ([deanmcpherson](https://github.com/deanmcpherson))

## [v0.1.1](https://github.com/feathersjs/feathers-authentication/tree/v0.1.1) (2016-01-30)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.1.0...v0.1.1)

## [v0.1.0](https://github.com/feathersjs/feathers-authentication/tree/v0.1.0) (2016-01-25)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.0.8...v0.1.0)

**Closed issues:**

- Get the Travis build to work. [\#27](https://github.com/feathersjs/feathers-authentication/issues/27)
- Login not working [\#24](https://github.com/feathersjs/feathers-authentication/issues/24)
- Hooks should be configurable \(they should be functions\) [\#11](https://github.com/feathersjs/feathers-authentication/issues/11)
- Document the bundled hooks. [\#10](https://github.com/feathersjs/feathers-authentication/issues/10)

**Merged pull requests:**

- Migrate docs to book [\#31](https://github.com/feathersjs/feathers-authentication/pull/31) ([marshallswain](https://github.com/marshallswain))
- hashPassword: Async bcrypt usage needs a promise [\#30](https://github.com/feathersjs/feathers-authentication/pull/30) ([marshallswain](https://github.com/marshallswain))
- Removing extras from travis.yml [\#29](https://github.com/feathersjs/feathers-authentication/pull/29) ([marshallswain](https://github.com/marshallswain))
- Fixing build [\#28](https://github.com/feathersjs/feathers-authentication/pull/28) ([marshallswain](https://github.com/marshallswain))
- Adding nsp check [\#26](https://github.com/feathersjs/feathers-authentication/pull/26) ([marshallswain](https://github.com/marshallswain))

## [v0.0.8](https://github.com/feathersjs/feathers-authentication/tree/v0.0.8) (2016-01-16)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.0.7...v0.0.8)

**Merged pull requests:**

- Support services that use pagination. [\#23](https://github.com/feathersjs/feathers-authentication/pull/23) ([marshallswain](https://github.com/marshallswain))

## [v0.0.7](https://github.com/feathersjs/feathers-authentication/tree/v0.0.7) (2016-01-07)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.0.6...v0.0.7)

**Closed issues:**

- Password isn't removed from responses when using a mongoose service for users endpoint  [\#19](https://github.com/feathersjs/feathers-authentication/issues/19)
- next called twice using socket.io and using an unauthenticated service [\#17](https://github.com/feathersjs/feathers-authentication/issues/17)
- Switch to a callback-based field configuration? [\#15](https://github.com/feathersjs/feathers-authentication/issues/15)
- Cannot authenticate [\#14](https://github.com/feathersjs/feathers-authentication/issues/14)
- Allow require without `.default` [\#13](https://github.com/feathersjs/feathers-authentication/issues/13)
- Login validation [\#2](https://github.com/feathersjs/feathers-authentication/issues/2)

**Merged pull requests:**

- Adding separate route for refreshing a login token.  [\#21](https://github.com/feathersjs/feathers-authentication/pull/21) ([corymsmith](https://github.com/corymsmith))
- Converting user model to object when using mongoose service [\#20](https://github.com/feathersjs/feathers-authentication/pull/20) ([corymsmith](https://github.com/corymsmith))
- Fixing issue where next is called twice when hitting an unauthenticated service via socket.io [\#18](https://github.com/feathersjs/feathers-authentication/pull/18) ([corymsmith](https://github.com/corymsmith))
- Fixing usage of mongoose service [\#16](https://github.com/feathersjs/feathers-authentication/pull/16) ([corymsmith](https://github.com/corymsmith))

## [v0.0.6](https://github.com/feathersjs/feathers-authentication/tree/v0.0.6) (2015-11-22)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.0.5...v0.0.6)

**Closed issues:**

- Feathers Auth Configuration Error [\#12](https://github.com/feathersjs/feathers-authentication/issues/12)
- Make sure we're returning proper error responses. [\#8](https://github.com/feathersjs/feathers-authentication/issues/8)

## [v0.0.5](https://github.com/feathersjs/feathers-authentication/tree/v0.0.5) (2015-11-19)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.0.4...v0.0.5)

## [v0.0.4](https://github.com/feathersjs/feathers-authentication/tree/v0.0.4) (2015-11-19)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.0.3...v0.0.4)

## [v0.0.3](https://github.com/feathersjs/feathers-authentication/tree/v0.0.3) (2015-11-18)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.6...v0.0.3)

**Merged pull requests:**

- allow runtime auth via socket.io [\#4](https://github.com/feathersjs/feathers-authentication/pull/4) ([randomnerd](https://github.com/randomnerd))

## [v1.0.6](https://github.com/feathersjs/feathers-authentication/tree/v1.0.6) (2015-11-02)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.5...v1.0.6)

## [v1.0.5](https://github.com/feathersjs/feathers-authentication/tree/v1.0.5) (2015-11-02)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.4...v1.0.5)

## [v1.0.4](https://github.com/feathersjs/feathers-authentication/tree/v1.0.4) (2015-11-02)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.3...v1.0.4)

## [v1.0.3](https://github.com/feathersjs/feathers-authentication/tree/v1.0.3) (2015-10-12)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.2...v1.0.3)

## [v1.0.2](https://github.com/feathersjs/feathers-authentication/tree/v1.0.2) (2015-10-08)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.1...v1.0.2)

## [v1.0.1](https://github.com/feathersjs/feathers-authentication/tree/v1.0.1) (2015-10-08)


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*