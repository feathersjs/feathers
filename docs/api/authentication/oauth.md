# OAuth

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-oauth.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-oauth)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/crow/packages/authentication-oauth/CHANGELOG.md)

```
npm install @feathersjs/authentication-oauth --save
```

`@feathersjs/authentication-oauth` allows to authenticate with over 180 OAuth providers (Google, Facebook, GitHub etc.) using [grant](https://github.com/simov/grant), an OAuth middleware module for NodeJS.

## Configuration

The following settings are available:

- `redirect`: The URL of the frontend to redirect to with the access token (or error message). The [authentication client](./client.md) handles those redirects automatically. If not set, the authentication result will be sent as JSON instead.
- `origins`: A list of allowed URLs to make requests from. For example setting this option to`[ "https://feathersjs.com", "https://feathers.cloud" ]` would allow requests from those domains and redirect back to where the request came from. This can be used _instead_ of the `redirect` option to allow oAuth logins from multiple domains.
- `defaults`: Default [Grant configuration](https://github.com/simov/grant#configuration) used for all strategies. The following default options are set automatically:
  - `path` (default: `'/oauth'`) - The OAuth base path
- `<strategy-name>` (e.g. `twitter`): The [Grant configuration](https://github.com/simov/grant#configuration) used for a specific strategy.
- For both `defaults` and specific strategies, the following options are set automatically:
  - `host`: Set to `host` from the configuration
  - `protocol`: `'http'` for development, `'https'` for production (when `NODE_ENV=production`)
  - `transport`: Set to `'session'` (see [Grant response data](https://github.com/simov/grant#response-data-transport))
  - `callback`: Set to `'<defaults.path>/<name>/authenticate'`. This should not be changed.

> __Pro tip:__ Removing the `redirect` setting is a good way to troubleshoot OAuth authentication errors.

Standard OAuth authentication can be configured with those options in `config/default.json` like this:

```json
{
  "authentication": {
    "oauth": {
      "redirect": "/frontend",
      "google": {
        "key": "...",
        "secret": "...",
        "custom_params": { "access_type": "offline" }
      },
      "twitter": {
        "key": "...",
        "secret": "..."
      }
    }
  }
}
```

> __Note:__ All OAuth strategies will by default always look for configuration under `authentication.oauth.<name>`. If `authentication.oauth` is not set in the configuration, OAuth authentication will be disabled.

Here is a [list of all Grant configuration options](https://github.com/simov/grant#all-available-options) that are available:

Key | Location | Description
:---| :--- | :---
request_url | [oauth.json](https://github.com/simov/grant/blob/master/config/oauth.json) | OAuth1/step1
authorize_url | [oauth.json](https://github.com/simov/grant/blob/master/config/oauth.json) | OAuth1/step2 or OAuth2/step1
access_url | [oauth.json](https://github.com/simov/grant/blob/master/config/oauth.json) | OAuth1/step3 or OAuth2/step2
oauth | [oauth.json](https://github.com/simov/grant/blob/master/config/oauth.json) | OAuth version number
scope_delimiter | [oauth.json](https://github.com/simov/grant/blob/master/config/oauth.json) | string delimiter used for concatenating multiple scopes
protocol, host, path | `defaults` | used to generate `redirect_uri`
transport | `defaults` | [transport](#response-data-transport) to use to deliver the response data in your final `callback` route
state | `defaults` | toggle random `state` string generation for OAuth2
key | `[provider]` | OAuth app key, reserved aliases: `consumer_key` and `client_id`
secret | `[provider]` | OAuth app secret, reserved aliases: `consumer_secret` and `client_secret`
scope | `[provider]` | list of scopes to request
custom_params | `[provider]` | custom authorization [parameters](#custom-parameters) and their values
subdomain | `[provider]` | string to be [embedded](#subdomain-urls) in `request_url`, `authorize_url` and `access_url`
nonce | `[provider]` | toggle random `nonce` string generation for [OpenID Connect](#openid-connect) providers
callback | `[provider]` | final callback route on your server to receive the [response data](#response-data)
dynamic | `[provider]` | allow [dynamic override](#dynamic-override) of configuration
overrides | `[provider]` | [static overrides](#static-overrides) for a provider
response | `[provider]` | [limit](#limit-response-data) the response data
token_endpoint_auth_method | `[provider]` | authentication method for the [token endpoint](#token-endpoint-auth-method)
name | generated | provider's [name](#grant), used to generate `redirect_uri`
profile_url | [grant-profile](https://github.com/simov/grant-profile) | The URL to retrieve the user profile from  
[provider] | generated | provider's [name](#grant) as key
redirect_uri | generated | OAuth app [redirect URI](#redirect-uri), generated using `protocol`, `host`, `path` and `name`

## Usage

### Cookbook guides

For specific OAuth provider setup see the following [cookbook](../../cookbook/) guides:

- [Auth0](../../cookbook/authentication/auth0.md)
- [Facebook](../../cookbook/authentication/facebook.md)
- [Google](../../cookbook/authentication/google.md)

### Flow

There are two ways to initiate OAuth authentication:

1) Through the browser (most common)
    - User clicks on link to OAuth URL (`oauth/<provider>`)
    - Gets redirected to provider and authorizes the application
    - Callback to the [OauthStrategy](#oauthstrategy) which
        - Gets the users profile
        - Finds or creates the user (entity) for that profile
    - The [AuthenticationService](./service.md) creates an access token for that entity
    - Redirect to the `redirect` URL including the generated access token
    - The frontend (e.g. [authentication client](./client.md)) uses the returned access token to authenticate

2) With an existing access token, e.g. obtained through the Facebook mobile SDK
    - Authenticate normally with `{ strategy: '<name>', accessToken: 'oauth access token' }`.
    - Calls the [OauthStrategy](#oauthstrategy) which
        - Gets the users profile
        - Finds or creates the entity for that profile
    - Returns the authentication result

> __Note:__ If you are attempting to authenticate using an obtained access token, ensure that you have added the strategy (e.g. 'facebook') to your [authStrategies](./service.md#configuration).

### OAuth URLs

There are several URLs and redirects that are important for OAuth authentication:

- `http(s)://<host>/oauth/<provider>`: The main URL to initiate the OAuth flow. Link to this from the browser.
- `http(s)://<host>/oauth/<provider>/callback`: The callback path that should be set in the OAuth application settings
- `http(s)://<host>/oauth/<provider>/authenticate`: The internal redirect

In the browser any OAuth flow can be initiated with the following link:

```html
<a href="/oauth/github">Login with GitHub</a>
```

### Account linking

To _link an existing user_ the current access token can be added to the OAuth flow query using the `feathers_token` query parameter:

```html
<a href="/oauth/github?feathers_token=<your access token>">
  Login with GitHub
</a>
```

This will use the user (entity) of that access token to link the OAuth account to. Using the [authentication client](./client.md) you can get the current access token via `app.get('authentication')`:

```js
const { accessToken } = await app.get('authentication');
```

### Redirects

The `redirect` configuration option is used to redirect back to the frontend application after OAuth authentication was successful and an access token for the user has been created by the [authentication service](./service.md) or if authentication failed. It works cross domain and by default includes the access token or error message in the window location hash. The following configuration

```js
{
  "authentication": {
    "oauth": {
      "redirect": "https://app.mydomain.com/"
    }
  }
}
```

Will redirect to `https://app.mydomain.com/#access_token=<user jwt>` or `https://app.mydomain.com/#error=<some error message>`. Redirects can be customized with the [getRedirect()](#getredirect-data) method of the OAuth strategy. The [authentication client](./client.md) handles the default redirects automatically already.

> __Note:__ The redirect is using a hash instead of a query string by default because it is not logged server side and can be easily read on the client. You can force query based redirect by adding a `?` to the end of the `redirect` option.

If the `redirect` option is not set, the authentication result data will be sent as JSON instead.

Dynamic redirects to the same URL are possible by setting the `redirect` query parameter in the OAuth flow. For example, the following OAuth link:

```html
<a href="/oauth/github?redirect=dashboard">
  Login with GitHub
</a>
```

With the above configuration will redirect to `https://app.mydomain.com/dashboard` after the OAuth flow.

## Setup (Express)

`expressOauth` (for setup see the [AuthenticationService](./service.md)) sets up OAuth authentication on a [Feathers Express](../express.md) application and can take the following options:

- `authService`: The name of the authentication service
- `linkStrategy` (default: `'jwt'`): The name of the strategy to use for account linking
- `expressSession` (default: `require('express-session')()`): The [Express session](https://github.com/expressjs/session) middleware to use. Uses in-memory sessions by default but may need to be customized to a persistent storage when using multiple instances of the application. Other sessions stores can be used by setting the `expressSession` option using a different memory store, e.g. [connect-redis](https://github.com/tj/connect-redis) in the authentication configuration:

```js
const redis = require('redis')
const session = require('express-session')
const { expressOauth } = require('@feathersjs/authentication-oauth');

const RedisStore = require('connect-redis')(session)
const redisClient = redis.createClient()

app.configure(expressOauth({
  expressSession: session({
    store: new RedisStore({ client: redisClient }),
    secret: 'keyboard cat',
    resave: false,
  })
}));
```

> __Important:__  If not customized, Express OAuth uses the in-memory Express session store which will show a `connect.session() MemoryStore is not designed for a production environment, as it will leak memory, and will not scale past a single process.` warning in production.

## OAuthStrategy

### entityId

`oauthStrategy.entityId -> string` returns the name of the id property of the entity.

### getEntityQuery(profile, params)

`oauthStrategy.getEntityQuery(profile, params) -> Promise` returns the entity lookup query to find the entity for a profile. By default returns

```js
{
  [`${this.name}Id`]: profile.sub || profile.id
}
```

### getEntityData(profile, entity, params)

`oauthStrategy.getEntityData(profile, existing, params) -> Promise`  returns the data to either create a new or update an existing entity. `entity` is either the existing entity or `null` when creating a new entity.

### getProfile(data, params)

`oauthStrategy.getProfile(data, params) -> Promise` returns the user profile information from the OAuth provider that was used for the login. `data` is the OAuth callback information which normally contains e.g. the OAuth access token.

### getRedirect (data)

`oauthStrategy.getRedirect(data) -> Promise` returns the URL to redirect to after a successful OAuth login and entity lookup or creation. By default it redirects to `authentication.oauth.redirect` from the configuration with `#access_token=<access token for entity>` added to the end of the URL. The `access_token` hash is e.g. used by the [authentication client](./client.md) to log the user in after a successful OAuth login. The default redirects do work cross domain.

### getAllowedOrigin (params)

`oauthStrategy.getAllowedOrigin(params) -> Promise` returns the redirect base URL or throws an error if it is not allowed.

### getCurrentEntity(params)

`oauthStrategy.getCurrentEntity(params) -> Promise` returns the currently linked entity for the given `params`. It will either use the entity authenticated by `params.authentication` or return `null`.

### findEntity(profile, params)

`oauthStrategy.findEntity(profile, params) -> Promise` finds an entity for a given OAuth profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### createEntity(profile, params)

`oauthStrategy.createEntity(profile, params) -> Promise` creates a new entity for the given OAuth profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### updateEntity(entity, profile, params)

`oauthStrategy.updateEntity(entity, profile, params) -> Promise` updates an existing entity with the given profile. Uses `{ [${this.name}Id]: profile.id }` by default.

### authenticate(authentication, params)

`oauthStrategy.authenticate(authentication, params)` is the main endpoint implemented by any [authentication strategy](./strategy.md). It is usually called for authentication requests for this strategy by the [AuthenticationService](./service.md).

## Customization

Normally, any OAuth provider set up in the [configuration](#configuration) will be initialized with the default [OAuthStrategy](#oauthstrategy). The flow for a specific provider can be customized by extending `OAuthStrategy` class and registering it under that name on the [AuthenticationService](./service.md):

:::: tabs :options="{ useUrlFragment: false }"

::: tab "JavaScript"
```js
const { AuthenticationService, JWTStrategy } = require('@feathersjs/authentication');
const { OAuthStrategy } = require('@feathersjs/authentication-oauth');

class MyGithubStrategy extends OAuthStrategy {
  async getEntityData(profile) {
    // Include the `email` from the GitHub profile when creating
    // or updating a user that logged in with GitHub
    const baseData = await super.getEntityData(profile);

    return {
      ...baseData,
      email: profile.email
    };
  }
}

module.exports = app => {
  const authService = new AuthenticationService(app);

  authService.register('github', new MyGithubStrategy());

  // ...
  app.use('/authentication', authService);
}
```
:::

::: tab "TypeScript"
```typescript
import { Application } from '@feathersjs/feathers';
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication';
import { OAuthStrategy } from '@feathersjs/authentication-oauth';

class MyGithubStrategy extends OAuthStrategy {
  async getEntityData(profile: any) {
    // Include the `email` from the GitHub profile when creating
    // or updating a user that logged in with GitHub
    const baseData = await super.getEntityData(profile);

    return {
      ...baseData,
      email: profile.email
    };
  }
}

export default (app: Application) => {
  const authService = new AuthenticationService(app);

  authService.register('github', new MyGithubStrategy());

  // ...
  app.use('/authentication', authService);
}
```
:::

::::
