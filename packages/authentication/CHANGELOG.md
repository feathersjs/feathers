# Change Log

## [Unreleased](https://github.com/feathersjs/feathers-authentication/tree/HEAD)

[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.2.2...HEAD)

**Closed issues:**

- Validating custom express routes [\#498](https://github.com/feathersjs/feathers-authentication/issues/498)
- Payload won't include userId when logging in with stored localStorage token [\#496](https://github.com/feathersjs/feathers-authentication/issues/496)
- How to send oauth token authentication to another client server [\#493](https://github.com/feathersjs/feathers-authentication/issues/493)
- Unhandled Promise Rejection error. [\#489](https://github.com/feathersjs/feathers-authentication/issues/489)
- No Auth token on authentication resource [\#488](https://github.com/feathersjs/feathers-authentication/issues/488)
- How to verify JWT in feathers issued by another feathers instance ? [\#484](https://github.com/feathersjs/feathers-authentication/issues/484)
- hook.params.user [\#483](https://github.com/feathersjs/feathers-authentication/issues/483)
- Overriding JWT's expiresIn with a value more than 20d prevents users from signing in [\#458](https://github.com/feathersjs/feathers-authentication/issues/458)

**Merged pull requests:**

- Update feathers-socketio to the latest version 🚀 [\#503](https://github.com/feathersjs/feathers-authentication/pull/503) ([greenkeeper[bot]](https://github.com/integration/greenkeeper))
- Update socket.io-client to the latest version 🚀 [\#501](https://github.com/feathersjs/feathers-authentication/pull/501) ([greenkeeper[bot]](https://github.com/integration/greenkeeper))
- Fix issue with very large token timeout. [\#499](https://github.com/feathersjs/feathers-authentication/pull/499) ([asdacap](https://github.com/asdacap))
- Typo [\#492](https://github.com/feathersjs/feathers-authentication/pull/492) ([wdmtech](https://github.com/wdmtech))
- Update migrating.md [\#490](https://github.com/feathersjs/feathers-authentication/pull/490) ([MichaelErmer](https://github.com/MichaelErmer))
- Update semistandard to the latest version 🚀 [\#487](https://github.com/feathersjs/feathers-authentication/pull/487) ([greenkeeper[bot]](https://github.com/integration/greenkeeper))
- Update feathers-hooks to the latest version 🚀 [\#485](https://github.com/feathersjs/feathers-authentication/pull/485) ([greenkeeper[bot]](https://github.com/integration/greenkeeper))
- Update dependencies to enable Greenkeeper 🌴 [\#482](https://github.com/feathersjs/feathers-authentication/pull/482) ([greenkeeper[bot]](https://github.com/integration/greenkeeper))

## [v1.2.2](https://github.com/feathersjs/feathers-authentication/tree/v1.2.2) (2017-04-12)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.2.1...v1.2.2)

**Fixed bugs:**

- accessToken not being used when provided by client over socketio [\#400](https://github.com/feathersjs/feathers-authentication/issues/400)

**Closed issues:**

- Incompatible old client dependency [\#479](https://github.com/feathersjs/feathers-authentication/issues/479)
- Using feathers-authentication-client for an existing API? [\#478](https://github.com/feathersjs/feathers-authentication/issues/478)
- app.authenticate error : UnhandledPromiseRejectionWarning: Unhandled promise rejection \(rejection id: 2\): \* Error \* [\#476](https://github.com/feathersjs/feathers-authentication/issues/476)
- Make `socket.feathers` data available in authentication hooks [\#475](https://github.com/feathersjs/feathers-authentication/issues/475)
- Allow the authenticate hook to be called with no parameters [\#473](https://github.com/feathersjs/feathers-authentication/issues/473)
- Authenticate : How to return more infos ? [\#471](https://github.com/feathersjs/feathers-authentication/issues/471)

**Merged pull requests:**

- Use latest version of feathers-authentication-client [\#480](https://github.com/feathersjs/feathers-authentication/pull/480) ([daffl](https://github.com/daffl))
- Resolves \#475 - Socket params are made available to authentication hooks [\#477](https://github.com/feathersjs/feathers-authentication/pull/477) ([thomas-p-wilson](https://github.com/thomas-p-wilson))

## [v1.2.1](https://github.com/feathersjs/feathers-authentication/tree/v1.2.1) (2017-04-07)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.2.0...v1.2.1)

**Fixed bugs:**

- failureRedirect is never used when using with oauth2 [\#387](https://github.com/feathersjs/feathers-authentication/issues/387)

**Closed issues:**

- OAuth guides [\#470](https://github.com/feathersjs/feathers-authentication/issues/470)
- app.authenticate not working [\#466](https://github.com/feathersjs/feathers-authentication/issues/466)
- how can I logout using local authentication? [\#465](https://github.com/feathersjs/feathers-authentication/issues/465)
- How to do Socket.io Authentication [\#462](https://github.com/feathersjs/feathers-authentication/issues/462)
- Add event filtering by default \(socket.io\) [\#460](https://github.com/feathersjs/feathers-authentication/issues/460)
- Add ability to control if socket is marked as authenticated. [\#448](https://github.com/feathersjs/feathers-authentication/issues/448)
- Auth redirect issue [\#425](https://github.com/feathersjs/feathers-authentication/issues/425)
- E-mail verification step can be bypassed using Postman or Curl [\#391](https://github.com/feathersjs/feathers-authentication/issues/391)
- Example app [\#386](https://github.com/feathersjs/feathers-authentication/issues/386)

**Merged pull requests:**

- Allow the cookie to be set if action is not `remove` [\#474](https://github.com/feathersjs/feathers-authentication/pull/474) ([marshallswain](https://github.com/marshallswain))

## [v1.2.0](https://github.com/feathersjs/feathers-authentication/tree/v1.2.0) (2017-03-23)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.1.1...v1.2.0)

**Fixed bugs:**

- 1.0 authentication service hooks don't run when client uses feathers-socketio [\#455](https://github.com/feathersjs/feathers-authentication/issues/455)
- `hook.params.provider` is not set when calling `client.authenticate\(\)` [\#432](https://github.com/feathersjs/feathers-authentication/issues/432)
- remove method failed with JsonWebTokenError: invalid token [\#388](https://github.com/feathersjs/feathers-authentication/issues/388)

**Closed issues:**

- Token creation has side effect [\#454](https://github.com/feathersjs/feathers-authentication/issues/454)
- Question: When is userId set? [\#453](https://github.com/feathersjs/feathers-authentication/issues/453)
- How to authenticate SPA? More precisely how does the redirect works?  [\#451](https://github.com/feathersjs/feathers-authentication/issues/451)
- POST to auth/facebook for FacebookTokenStrategy 404? [\#447](https://github.com/feathersjs/feathers-authentication/issues/447)
- feathers-authentication 1.1.1 `No auth token` [\#445](https://github.com/feathersjs/feathers-authentication/issues/445)
- Another readme incorrect and maybe docs to [\#441](https://github.com/feathersjs/feathers-authentication/issues/441)
- Readme incorrect and maybe docs to [\#440](https://github.com/feathersjs/feathers-authentication/issues/440)
- npm version issue? [\#439](https://github.com/feathersjs/feathers-authentication/issues/439)
- setCookie express middleware only works inside hooks [\#438](https://github.com/feathersjs/feathers-authentication/issues/438)
- createJWT throws 'secret must provided' [\#437](https://github.com/feathersjs/feathers-authentication/issues/437)
- Not useful error message on NotAuthenticated error [\#436](https://github.com/feathersjs/feathers-authentication/issues/436)
- Passwordfeld in auth.local does not work as expected [\#435](https://github.com/feathersjs/feathers-authentication/issues/435)
- Authentication via REST returns token without finding user on db [\#430](https://github.com/feathersjs/feathers-authentication/issues/430)

**Merged pull requests:**

- Filter out all events [\#461](https://github.com/feathersjs/feathers-authentication/pull/461) ([daffl](https://github.com/daffl))
- Fix socket auth [\#459](https://github.com/feathersjs/feathers-authentication/pull/459) ([marshallswain](https://github.com/marshallswain))
- Fix \#454 Token create has side effect [\#456](https://github.com/feathersjs/feathers-authentication/pull/456) ([whollacsek](https://github.com/whollacsek))
- Windows compatible version of the original compile comand with public folder support. [\#442](https://github.com/feathersjs/feathers-authentication/pull/442) ([appurist](https://github.com/appurist))
- Add client.js back for consistency [\#433](https://github.com/feathersjs/feathers-authentication/pull/433) ([daffl](https://github.com/daffl))
- add string to authenticate \(typescript\) [\#431](https://github.com/feathersjs/feathers-authentication/pull/431) ([superbarne](https://github.com/superbarne))
- Add support for Bearer scheme in remove method [\#403](https://github.com/feathersjs/feathers-authentication/pull/403) ([boybundit](https://github.com/boybundit))

## [v1.1.1](https://github.com/feathersjs/feathers-authentication/tree/v1.1.1) (2017-03-02)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.1.0...v1.1.1)

**Closed issues:**

- Authentication over socket.io never answers [\#428](https://github.com/feathersjs/feathers-authentication/issues/428)

**Merged pull requests:**

- Remove lots of hardcoded values for config, and adds the `authenticate` hook [\#427](https://github.com/feathersjs/feathers-authentication/pull/427) ([myknbani](https://github.com/myknbani))

## [v1.1.0](https://github.com/feathersjs/feathers-authentication/tree/v1.1.0) (2017-03-01)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.2...v1.1.0)

**Fixed bugs:**

- Mongo update error after logging into Facebook [\#244](https://github.com/feathersjs/feathers-authentication/issues/244)

**Closed issues:**

- Feature Request: Anonymous Authentication Strategy Support [\#423](https://github.com/feathersjs/feathers-authentication/issues/423)
- Error is not thrown if token that is provided is invalid [\#421](https://github.com/feathersjs/feathers-authentication/issues/421)
- Request body 'token' parameter disappears [\#420](https://github.com/feathersjs/feathers-authentication/issues/420)
- Prefixing socket events [\#418](https://github.com/feathersjs/feathers-authentication/issues/418)
- Auth2 issue getting JWT token from server when different ports [\#416](https://github.com/feathersjs/feathers-authentication/issues/416)
- Cookie-based authentication with XHR is not possible [\#413](https://github.com/feathersjs/feathers-authentication/issues/413)
- JWT Authentication setup failing [\#411](https://github.com/feathersjs/feathers-authentication/issues/411)
- how to disable service for external usage in version 1.0 [\#410](https://github.com/feathersjs/feathers-authentication/issues/410)
- v1.0 is removed from npm? [\#408](https://github.com/feathersjs/feathers-authentication/issues/408)
- Make JWT data more configurable [\#407](https://github.com/feathersjs/feathers-authentication/issues/407)
- Possible typo [\#406](https://github.com/feathersjs/feathers-authentication/issues/406)
- Authentication with an existing database with existing hashed \(md5\) passwords [\#398](https://github.com/feathersjs/feathers-authentication/issues/398)
- can modify selected fields only [\#397](https://github.com/feathersjs/feathers-authentication/issues/397)
- \[Discussion\] Migrating to 1.0 - hook changes [\#396](https://github.com/feathersjs/feathers-authentication/issues/396)
- feathers-authentication 'local' strategy requires token? [\#394](https://github.com/feathersjs/feathers-authentication/issues/394)
- JWT for local auth. [\#390](https://github.com/feathersjs/feathers-authentication/issues/390)
- Feathers 'Twitter API' style [\#385](https://github.com/feathersjs/feathers-authentication/issues/385)
- Missing code in example app [\#383](https://github.com/feathersjs/feathers-authentication/issues/383)
- feathers-authentication errors with any view error, and redirects to /auth/failure [\#381](https://github.com/feathersjs/feathers-authentication/issues/381)
- what does app.service\('authentication'\).remove\(...\) mean? [\#379](https://github.com/feathersjs/feathers-authentication/issues/379)
- Rest Endpoints. [\#375](https://github.com/feathersjs/feathers-authentication/issues/375)
- cordova google-plus signUp with id\_token [\#373](https://github.com/feathersjs/feathers-authentication/issues/373)
- How to reconnect socket with cookie after page refresh ? [\#372](https://github.com/feathersjs/feathers-authentication/issues/372)
- Error: Could not find stored JWT and no authentication strategy was given [\#367](https://github.com/feathersjs/feathers-authentication/issues/367)
- "No auth token" using authenticate  strategy: 'jwt' \(v.1.0.0-beta-2\) [\#366](https://github.com/feathersjs/feathers-authentication/issues/366)
- Navigating to /auth/\<provider\> twice redirects to /auth/failed [\#344](https://github.com/feathersjs/feathers-authentication/issues/344)
- Meteor auth migration guide [\#334](https://github.com/feathersjs/feathers-authentication/issues/334)
- Auth 1.0 [\#330](https://github.com/feathersjs/feathers-authentication/issues/330)
- RSA token secret [\#309](https://github.com/feathersjs/feathers-authentication/issues/309)
- Add option to use bcrypt [\#300](https://github.com/feathersjs/feathers-authentication/issues/300)
- Better example of how to change hashing algorithm? \[Question\] [\#289](https://github.com/feathersjs/feathers-authentication/issues/289)
- issuer doesn't work [\#284](https://github.com/feathersjs/feathers-authentication/issues/284)
- passport auth question [\#274](https://github.com/feathersjs/feathers-authentication/issues/274)
- Add support for authenticating active users only [\#259](https://github.com/feathersjs/feathers-authentication/issues/259)
- 404 response from populateUser\(\) hook [\#258](https://github.com/feathersjs/feathers-authentication/issues/258)
- Responses hang when token.secret is undefined for local authentication [\#249](https://github.com/feathersjs/feathers-authentication/issues/249)
- Authentication without password [\#246](https://github.com/feathersjs/feathers-authentication/issues/246)
- Fix successRedirect to not override cookie path [\#243](https://github.com/feathersjs/feathers-authentication/issues/243)
- Deprecate verifyToken and populateUser hooks in favour of middleware [\#227](https://github.com/feathersjs/feathers-authentication/issues/227)
- Authenticating and creating [\#100](https://github.com/feathersjs/feathers-authentication/issues/100)
- Add a password service [\#83](https://github.com/feathersjs/feathers-authentication/issues/83)

**Merged pull requests:**

- Fix JWT options typo [\#415](https://github.com/feathersjs/feathers-authentication/pull/415) ([daffl](https://github.com/daffl))
- Prevent setCookie from mutating authOptions [\#414](https://github.com/feathersjs/feathers-authentication/pull/414) ([adrien-k](https://github.com/adrien-k))
- Typescript Definitions [\#412](https://github.com/feathersjs/feathers-authentication/pull/412) ([AbraaoAlves](https://github.com/AbraaoAlves))
- Docs for migrating to auth.hooks.authenticate hook [\#399](https://github.com/feathersjs/feathers-authentication/pull/399) ([petermikitsh](https://github.com/petermikitsh))
- Typo 'cookie.enable' should be 'cookie.enabled' [\#380](https://github.com/feathersjs/feathers-authentication/pull/380) ([whollacsek](https://github.com/whollacsek))
- Docs: Equalize usage of feathers-authenticate [\#378](https://github.com/feathersjs/feathers-authentication/pull/378) ([eikaramba](https://github.com/eikaramba))

## [v1.0.2](https://github.com/feathersjs/feathers-authentication/tree/v1.0.2) (2016-12-14)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.1...v1.0.2)

**Closed issues:**

- successRedirect not redirecting [\#364](https://github.com/feathersjs/feathers-authentication/issues/364)

**Merged pull requests:**

- adding a value for checking against oauth [\#374](https://github.com/feathersjs/feathers-authentication/pull/374) ([ekryski](https://github.com/ekryski))

## [v1.0.1](https://github.com/feathersjs/feathers-authentication/tree/v1.0.1) (2016-12-14)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v1.0.0...v1.0.1)

## [v1.0.0](https://github.com/feathersjs/feathers-authentication/tree/v1.0.0) (2016-12-14)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.12...v1.0.0)

**Fixed bugs:**

- restrictToOwner does not support multi patch, update and remove [\#228](https://github.com/feathersjs/feathers-authentication/issues/228)

**Closed issues:**

- auth.express.authenticate got undefined [\#363](https://github.com/feathersjs/feathers-authentication/issues/363)
- Non-standard header structure [\#361](https://github.com/feathersjs/feathers-authentication/issues/361)
- localEndpoint without local strategy  [\#359](https://github.com/feathersjs/feathers-authentication/issues/359)
- Using custom passport strategies [\#356](https://github.com/feathersjs/feathers-authentication/issues/356)
- Client-side app.on\('login'\) [\#355](https://github.com/feathersjs/feathers-authentication/issues/355)
- Payload limiting on `app.get\('user'\)`? [\#354](https://github.com/feathersjs/feathers-authentication/issues/354)
- Authentication token is missing  [\#352](https://github.com/feathersjs/feathers-authentication/issues/352)
- \[1.0\] The entity on the socket should pull from the strategy options. [\#348](https://github.com/feathersjs/feathers-authentication/issues/348)
- \[1.0\] Only the first failure is returned on auth failure when chaining multiple strategies [\#346](https://github.com/feathersjs/feathers-authentication/issues/346)
- Build 0.7.11 does not contain current code on NPMJS [\#342](https://github.com/feathersjs/feathers-authentication/issues/342)
-  feathers-authentication branch 0.8 did not work with payload \(tested on socket\) [\#264](https://github.com/feathersjs/feathers-authentication/issues/264)
- Add method for updating JWT [\#260](https://github.com/feathersjs/feathers-authentication/issues/260)
- 1.0 architecture considerations [\#226](https://github.com/feathersjs/feathers-authentication/issues/226)
- Features/RFC [\#213](https://github.com/feathersjs/feathers-authentication/issues/213)
- Support access\_token based OAuth2 providers [\#169](https://github.com/feathersjs/feathers-authentication/issues/169)
- Support openID [\#154](https://github.com/feathersjs/feathers-authentication/issues/154)
- Disable cookie by default if not using OAuth [\#152](https://github.com/feathersjs/feathers-authentication/issues/152)
- Add token service tests [\#144](https://github.com/feathersjs/feathers-authentication/issues/144)
- Add local service tests [\#143](https://github.com/feathersjs/feathers-authentication/issues/143)
- Add OAuth2 service tests [\#142](https://github.com/feathersjs/feathers-authentication/issues/142)
- Add OAuth2 integration tests [\#141](https://github.com/feathersjs/feathers-authentication/issues/141)
- Add integration tests for custom redirects [\#125](https://github.com/feathersjs/feathers-authentication/issues/125)
- Support mobile authentication via OAuth1 [\#47](https://github.com/feathersjs/feathers-authentication/issues/47)
- Support OAuth1 [\#42](https://github.com/feathersjs/feathers-authentication/issues/42)
- Password-less Local Auth with Email / SMS [\#7](https://github.com/feathersjs/feathers-authentication/issues/7)

**Merged pull requests:**

- migrating to semistandard [\#371](https://github.com/feathersjs/feathers-authentication/pull/371) ([ekryski](https://github.com/ekryski))
- Logout should always give a response. [\#369](https://github.com/feathersjs/feathers-authentication/pull/369) ([marshallswain](https://github.com/marshallswain))
- Clarify that the authenticate hook is required. [\#368](https://github.com/feathersjs/feathers-authentication/pull/368) ([marshallswain](https://github.com/marshallswain))
- Fix README example [\#365](https://github.com/feathersjs/feathers-authentication/pull/365) ([saiberz](https://github.com/saiberz))
- Remove additional deprecation notice [\#362](https://github.com/feathersjs/feathers-authentication/pull/362) ([porsager](https://github.com/porsager))
- fix typo [\#360](https://github.com/feathersjs/feathers-authentication/pull/360) ([osenvosem](https://github.com/osenvosem))
- Update feathers-primus to version 2.0.0 🚀 [\#358](https://github.com/feathersjs/feathers-authentication/pull/358) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Create .codeclimate.yml [\#357](https://github.com/feathersjs/feathers-authentication/pull/357) ([larkinscott](https://github.com/larkinscott))
- fixing redirect middleware [\#353](https://github.com/feathersjs/feathers-authentication/pull/353) ([ekryski](https://github.com/ekryski))
- Remove useless quotes [\#351](https://github.com/feathersjs/feathers-authentication/pull/351) ([bertho-zero](https://github.com/bertho-zero))
- A bunch of bug fixes [\#349](https://github.com/feathersjs/feathers-authentication/pull/349) ([ekryski](https://github.com/ekryski))
- fix\(docs/new-features\): syntax highlighting [\#347](https://github.com/feathersjs/feathers-authentication/pull/347) ([justingreenberg](https://github.com/justingreenberg))
- Update superagent to version 3.0.0 🚀 [\#345](https://github.com/feathersjs/feathers-authentication/pull/345) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Update feathers-memory to version 1.0.0 🚀 [\#343](https://github.com/feathersjs/feathers-authentication/pull/343) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- 1.0 Pre-release [\#336](https://github.com/feathersjs/feathers-authentication/pull/336) ([ekryski](https://github.com/ekryski))

## [v0.7.12](https://github.com/feathersjs/feathers-authentication/tree/v0.7.12) (2016-11-11)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.11...v0.7.12)

**Closed issues:**

- App.authenticate uses wrong `this` reference [\#341](https://github.com/feathersjs/feathers-authentication/issues/341)
- Getting more done in GitHub with ZenHub [\#331](https://github.com/feathersjs/feathers-authentication/issues/331)
- Need help to use feathers authentication storage in vue vuex [\#329](https://github.com/feathersjs/feathers-authentication/issues/329)
- How to get user id in hooks? [\#322](https://github.com/feathersjs/feathers-authentication/issues/322)
- I checked out my new feathersjs app in another machine, created a new user but I can't log in! [\#320](https://github.com/feathersjs/feathers-authentication/issues/320)
- restrict-to-owner throws error when user id is 0 [\#319](https://github.com/feathersjs/feathers-authentication/issues/319)
- Not providing sufficient details for an auth provider should not be an error. [\#318](https://github.com/feathersjs/feathers-authentication/issues/318)
- \[Question\] Is there a way to verify a user with password? [\#316](https://github.com/feathersjs/feathers-authentication/issues/316)
- 0.8.0 beta 1 bug - this is not defined [\#315](https://github.com/feathersjs/feathers-authentication/issues/315)
- Client: Document getJWT & verifyJWT [\#313](https://github.com/feathersjs/feathers-authentication/issues/313)
- Socket client should automatically auth on reconnect [\#310](https://github.com/feathersjs/feathers-authentication/issues/310)
- app.get\('token'\) doesn't work after a browser refresh. [\#303](https://github.com/feathersjs/feathers-authentication/issues/303)
- Problem issuing multiple jwt's for the same user [\#302](https://github.com/feathersjs/feathers-authentication/issues/302)
- restrict-to-owner does not allow Service.remove\(null\) from internal systems [\#301](https://github.com/feathersjs/feathers-authentication/issues/301)
- How to migrate from restrictToOwner to checkPermissions [\#299](https://github.com/feathersjs/feathers-authentication/issues/299)
- "username" cannot be used as local strategy usernameField [\#294](https://github.com/feathersjs/feathers-authentication/issues/294)
- Bad Hook API Design: Hooks are inconsistent and impure functions [\#288](https://github.com/feathersjs/feathers-authentication/issues/288)
- Mutliple 'user' models for authentication [\#282](https://github.com/feathersjs/feathers-authentication/issues/282)
- Client should ensure socket.io upgrade is complete before authenticating [\#275](https://github.com/feathersjs/feathers-authentication/issues/275)
- JWT is not sent after socket reconnection [\#272](https://github.com/feathersjs/feathers-authentication/issues/272)
- 401 after service is moved/refactored [\#270](https://github.com/feathersjs/feathers-authentication/issues/270)
- Client side auth should subscribe to user updates so that app.get\('user'\) is fresh [\#195](https://github.com/feathersjs/feathers-authentication/issues/195)
- Make oauth2 more general [\#179](https://github.com/feathersjs/feathers-authentication/issues/179)
- Add integration tests for custom service endpoints [\#145](https://github.com/feathersjs/feathers-authentication/issues/145)
- Create a `requireAuth` wrapper for `verifyToken`, `populateUser`, `restrictToAuth` [\#118](https://github.com/feathersjs/feathers-authentication/issues/118)

**Merged pull requests:**

- babel-core@6.18.2 breaks build 🚨 [\#339](https://github.com/feathersjs/feathers-authentication/pull/339) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- 👻😱 Node.js 0.10 is unmaintained 😱👻 [\#337](https://github.com/feathersjs/feathers-authentication/pull/337) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- restrictToOwner -Fix check for methodNotAllowed [\#335](https://github.com/feathersjs/feathers-authentication/pull/335) ([daffl](https://github.com/daffl))
- Implement login and logout events for REST authentication [\#325](https://github.com/feathersjs/feathers-authentication/pull/325) ([daffl](https://github.com/daffl))
- Socket.io authentication tests and login logout event [\#324](https://github.com/feathersjs/feathers-authentication/pull/324) ([daffl](https://github.com/daffl))
- Reorganization [\#321](https://github.com/feathersjs/feathers-authentication/pull/321) ([ekryski](https://github.com/ekryski))
- client: use Authentication class, make `getJWT` and `verifyJWT` async [\#317](https://github.com/feathersjs/feathers-authentication/pull/317) ([marshallswain](https://github.com/marshallswain))
- 0.8 client decode jwt [\#314](https://github.com/feathersjs/feathers-authentication/pull/314) ([marshallswain](https://github.com/marshallswain))
- Store config at `app.config` [\#312](https://github.com/feathersjs/feathers-authentication/pull/312) ([marshallswain](https://github.com/marshallswain))
- Cookies will match jwt expiry by default. [\#308](https://github.com/feathersjs/feathers-authentication/pull/308) ([marshallswain](https://github.com/marshallswain))
- Remove permissions hooks and middleware [\#307](https://github.com/feathersjs/feathers-authentication/pull/307) ([daffl](https://github.com/daffl))
- First cut for authentication middleware [\#305](https://github.com/feathersjs/feathers-authentication/pull/305) ([daffl](https://github.com/daffl))
- 0.8 - OAuth fixes [\#304](https://github.com/feathersjs/feathers-authentication/pull/304) ([marshallswain](https://github.com/marshallswain))

## [v0.7.11](https://github.com/feathersjs/feathers-authentication/tree/v0.7.11) (2016-09-28)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.10...v0.7.11)

**Closed issues:**

- Unable to authenticate with passport-google-oauth20 [\#295](https://github.com/feathersjs/feathers-authentication/issues/295)
- "Unauthorized" Response with Hook Data [\#291](https://github.com/feathersjs/feathers-authentication/issues/291)
- hashPassword in patch [\#286](https://github.com/feathersjs/feathers-authentication/issues/286)
- Mobile App Facebook Login [\#276](https://github.com/feathersjs/feathers-authentication/issues/276)
- Socket user should update automatically [\#266](https://github.com/feathersjs/feathers-authentication/issues/266)
- Get user outside a service [\#261](https://github.com/feathersjs/feathers-authentication/issues/261)

**Merged pull requests:**

- hashPassword fall-through if there's no password [\#287](https://github.com/feathersjs/feathers-authentication/pull/287) ([marshallswain](https://github.com/marshallswain))
- Update feathers-memory to version 0.8.0 🚀 [\#285](https://github.com/feathersjs/feathers-authentication/pull/285) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Allow multiple username fields for local auth [\#283](https://github.com/feathersjs/feathers-authentication/pull/283) ([sdbondi](https://github.com/sdbondi))

## [v0.7.10](https://github.com/feathersjs/feathers-authentication/tree/v0.7.10) (2016-08-31)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.9...v0.7.10)

**Fixed bugs:**

- restrictToOwner should not throw an error on mass deletions [\#175](https://github.com/feathersjs/feathers-authentication/issues/175)

**Closed issues:**

- Duplicate Email should be rejected by Default [\#281](https://github.com/feathersjs/feathers-authentication/issues/281)
- Auth0 & featherjs authorization only [\#277](https://github.com/feathersjs/feathers-authentication/issues/277)
- Cannot read property 'scope' of undefined [\#273](https://github.com/feathersjs/feathers-authentication/issues/273)
- Socker.js | Custom successHandler [\#271](https://github.com/feathersjs/feathers-authentication/issues/271)
- Use feathers-socketio? and rest&socket share session maybe?  [\#269](https://github.com/feathersjs/feathers-authentication/issues/269)
- Ability to invalidate old token/session when user login with another machine. [\#267](https://github.com/feathersjs/feathers-authentication/issues/267)
- 0.8 authentication before hooks - only ever getting a 401 Unauthorised [\#263](https://github.com/feathersjs/feathers-authentication/issues/263)
- REST Middleware breaks local auth [\#262](https://github.com/feathersjs/feathers-authentication/issues/262)
- 0.8: Token Service errors on token auth using client [\#254](https://github.com/feathersjs/feathers-authentication/issues/254)
- 0.8: Cookies, turning off feathers-session cookie also turns off feathers-jwt cookie. [\#253](https://github.com/feathersjs/feathers-authentication/issues/253)
- Any example of how to do refresh token? [\#248](https://github.com/feathersjs/feathers-authentication/issues/248)
- Custom Authentication Hooks [\#236](https://github.com/feathersjs/feathers-authentication/issues/236)
- Is there an Authenticated Event [\#235](https://github.com/feathersjs/feathers-authentication/issues/235)
- Error while using /auth/local [\#233](https://github.com/feathersjs/feathers-authentication/issues/233)
- Providing token to feathers.authentication doesn't work [\#230](https://github.com/feathersjs/feathers-authentication/issues/230)
- bundled hooks customize errors [\#215](https://github.com/feathersjs/feathers-authentication/issues/215)
- Hooks should support a callback for conditionally running [\#210](https://github.com/feathersjs/feathers-authentication/issues/210)
- restrictToRoles hook: More complex determination of "owner". [\#205](https://github.com/feathersjs/feathers-authentication/issues/205)
- verifyToken hook option to error [\#200](https://github.com/feathersjs/feathers-authentication/issues/200)
- Allow using restrictToOwner as an after hook [\#123](https://github.com/feathersjs/feathers-authentication/issues/123)

**Merged pull requests:**

- Manually supply an endpoint to the Client authenticate\(\) method [\#278](https://github.com/feathersjs/feathers-authentication/pull/278) ([mcnamee](https://github.com/mcnamee))
- Update mocha to version 3.0.0 🚀 [\#257](https://github.com/feathersjs/feathers-authentication/pull/257) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Don’t mix options when signing tokens [\#255](https://github.com/feathersjs/feathers-authentication/pull/255) ([marshallswain](https://github.com/marshallswain))
- Attempt to get token right away. [\#252](https://github.com/feathersjs/feathers-authentication/pull/252) ([marshallswain](https://github.com/marshallswain))
- Update async to version 2.0.0 🚀 [\#240](https://github.com/feathersjs/feathers-authentication/pull/240) ([greenkeeperio-bot](https://github.com/greenkeeperio-bot))
- Creates better way or returning data in a familiar format [\#234](https://github.com/feathersjs/feathers-authentication/pull/234) ([codingfriend1](https://github.com/codingfriend1))
- Throws an error if restriction methods are used outside of a find or get hook [\#232](https://github.com/feathersjs/feathers-authentication/pull/232) ([codingfriend1](https://github.com/codingfriend1))
- RestrictToOwner now takes an array [\#231](https://github.com/feathersjs/feathers-authentication/pull/231) ([sscaff1](https://github.com/sscaff1))
- Adds ability to limit queries unless authenticated and authorized [\#229](https://github.com/feathersjs/feathers-authentication/pull/229) ([codingfriend1](https://github.com/codingfriend1))

## [v0.7.9](https://github.com/feathersjs/feathers-authentication/tree/v0.7.9) (2016-06-20)
[Full Changelog](https://github.com/feathersjs/feathers-authentication/compare/v0.7.8...v0.7.9)

**Fixed bugs:**

- Calling logout should revoke/blacklist a JWT [\#133](https://github.com/feathersjs/feathers-authentication/issues/133)

**Closed issues:**

- Query email rather than oauth provider id on /auth/\<provider\> [\#223](https://github.com/feathersjs/feathers-authentication/issues/223)
- Cannot read property \'service\' of undefined [\#222](https://github.com/feathersjs/feathers-authentication/issues/222)

**Merged pull requests:**

- added support for hashing passwords when hook.data is an array [\#225](https://github.com/feathersjs/feathers-authentication/pull/225) ([eblin](https://github.com/eblin))
- jwt ssl warning [\#214](https://github.com/feathersjs/feathers-authentication/pull/214) ([aboutlo](https://github.com/aboutlo))

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


\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*