---
outline: deep
---

# Authentication Client

<Badges>

[![npm version](https://img.shields.io/npm/v/@feathersjs/authentication-client.svg?style=flat-square)](https://www.npmjs.com/package/@feathersjs/authentication-client)
[![Changelog](https://img.shields.io/badge/changelog-.md-blue.svg?style=flat-square)](https://github.com/feathersjs/feathers/blob/dove/packages/authentication-client/CHANGELOG.md)

</Badges>

```
npm install @feathersjs/authentication-client --save
```

The `@feathersjs/authentication-client` module allows you to easily authenticate a Feathers client against a Feathers server. It is not required, but makes it easier to implement authentication in your client by automatically storing and sending the access token and handling re-authenticating when a websocket disconnects.

## Usage

```ts
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'
import authentication from '@feathersjs/authentication-client'

const socket = io('http://api.feathersjs.com')
const app = feathers()

// Setup the transport (Rest, Socket, etc.) here
app.configure(socketio(socket))

// Available options are listed in the "Options" section
app.configure(authentication())
```

## Options

The following options are available for `app.configure(authentication(options))`:

- `storage` (default: `localStorage` if available, `MemoryStorage` otherwise) - The storage to store the access token. For React Native use `import { AsyncStorage } from 'react-native'`
- `path` (default: '/authentication') - The path of the authentication service
- `locationKey` (default: `'access_token'`) - The name of the window hash parameter to parse for an access token from the `window.location`. Usually used by the OAuth flow.
- `locationErrorKey` (default: `'error') - The name of the window hash parameter to parse for authentication errors. Usually used by the OAuth flow.
- `jwtStrategy` (default: `'jwt'`) - The access token authentication strategy
- `storageKey` (default: `'feathers-jwt'`) - Key for storing the token in `storage`
- `header` (default: `'Authorization'`) - Name of the accessToken header
- `scheme` (default: `'Bearer'`) - The HTTP header scheme
- Authentication (default: `AuthenticationClient`) - Allows to provide a [customized authentication client class](#customization)

<BlockQuote type="info">

Verifying or parsing the token on the client usually isn't necessary since the server does that on JWT authentication and returns with the token information but it can still be done manually with the [jwt-decode](https://www.npmjs.com/package/jwt-decode) package.

</BlockQuote>

## app.reAuthenticate([force])

`app.reAuthenticate() -> Promise` will try to authenticate using the access token from the storage or the window location (e.g. after a successful [OAuth](./oauth.md) login). This is normally called to either show your application (when successful) or showing a login page or redirecting to the appropriate OAuth link.

```js
try {
  await app.reAuthenticate()
  showDashboard()
} catch (error) {
  showLoginPage()
}
```

<BlockQuote type="danger">

`app.reAuthenticate()` has to be called when you want to use the token from storage. **There is no need to call it more than once**, so you’d typically only do it once when the application initializes. When successful, all subsequent requests will send their authentication information automatically.

</BlockQuote>

In some rare cases, for example making sure the user object returned by `app.get('authentication')` is up-to-date after it was changed on the server, you may force reauthentication via `app.reAuthenticate(true)`.

## app.authenticate(data)

`app.authenticate(data) -> Promise` will try to authenticate with a Feathers server by passing a `strategy` and other properties as credentials.

```ts
try {
  // Authenticate with the local email/password strategy
  await app.authenticate({
    strategy: 'local',
    email: 'my@email.com',
    password: 'my-password'
  })
  // Show e.g. logged in dashboard page
} catch (error: any) {
  // Show login page (potentially with `e.message`)
  console.error('Authentication error', e)
}
```

- `data {Object}` - of the format `{strategy [, ...otherProps]}`
  - `strategy {String}` - the name of the strategy to be used to authenticate. Required.
  - `...otherProps {Properties} ` vary depending on the chosen strategy. Above is an example of using the `local` strategy.

## app.logout()

Removes the access token from storage on the client. It also calls the `remove` method of the [authentication service](./service.md).

## app.get('authentication')

`app.get('authentication') -> Promise` is a Promise that resolves with the current authentication information. For most strategies this is the best place to **get the currently authenticated user**:

```js
// Returns the authenticated user
const { user } = await app.get('authentication')
// Gets the authenticated accessToken (JWT)
const { accessToken } = await app.get('authentication')
```

## app.authentication

Returns the instance of the [AuthenticationClient](#authenticationclient).

## AuthenticationClient

### service

`app.authentication.service` returns an instance of the authentication client service, normally `app.service('authentication')`.

### storage

`app.authentication.storage` returns the storage instance (e.g. window.LocalStorage, React Native AsyncStorage or an in-memory store).

### handleSocket(socket)

`app.authentication.handleSocket(socket) -> void` makes sure that a websocket real-time connection is always re-authenticated before making any other request.

### getFromLocation(location)

`app.authentication.getFromLocation(location) -> Promise` tries to retrieve an access token from `window.location`. This usually means the `access_token` in the hash set by the [OAuth authentication strategy](./oauth.md).

### setAccessToken(token)

`app.authentication.setAccessToken(token) -> Promise` sets the access token in the storage (normally `feathers-jwt` in `window.localStorage`).

### getAccessToken()

`app.authentication.getAccessToken() -> Promise` returns the access token from `storage`. If not found it will try to get the access token via [getFromLocation()]() or return `null` if neither was successful.

### removeAccessToken()

`app.authentication.removeAccessToken() -> Promise` removes the access token from the storage.

### reset()

`app.authentication.reset()` resets the authentication state without explicitly logging out. Should not be called directly.

### handleError()

`app.authentication.handleError(error, type: 'authenticate'|'logout') -> Promise` handles any error happening in the `authenticate` or `logout` method. By default it removes the access token if the error is a `NotAuthenticate` error. Otherwise it does nothing.

### reAuthenticate(force, strategy?)

`app.authentication.reAuthenticate(force = false, strategy) -> Promise` will re-authenticate with the current access token from [app.authentication.getAccessToken()](). If `force` is set to `true` it will always re-authenticate, with the default `false` only when not already authenticated.

`strategy` is an optional parameter which defaults to the configured `jwtStrategy`.

### authenticate()

The internal method called when using [app.authenticate()](#app-authenticate-data).

### logout()

The internal method called when using [app.logout()](#app-logout).

## Customization

The [AuthenticationClient]() can be extended to provide custom functionality and then passed during initialization:

```ts
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import io from 'socket.io-client'
import authentication, { AuthenticationClient } from '@feathersjs/authentication-client'

const socket = io('http://api.feathersjs.com')
const app = feathers()

class MyAuthenticationClient extends AuthenticationClient {
  getFromLocation(location) {
    // Do custom location things here
    return super.getFromLocation(location)
  }
}

// Setup the transport (Rest, Socket, etc.) here
app.configure(socketio(socket))

// Pass the custom authentication client class as the `Authentication` option
app.configure(
  authentication({
    Authentication: MyAuthenticationClient
  })
)
```

## Hooks

The following hooks are added to the client side application automatically (when calling `app.configure(authentication())`).

### authentication

Hook that ensures for every request that authentication is completed and successful. It also makes the authentication information available in the client side `params` (e.g. `params.user`).

### populateHeader

Adds the appropriate `Authorization` header for any REST request.
