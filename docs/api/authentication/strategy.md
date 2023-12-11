---
outline: deep
---

# Authentication Strategies

An authentication strategy is any object or class that implements at least an [authenticate(data, params)]() method. They can be registered with the AuthenticationService to authenticate service calls and other requests. The following strategies already come with Feathers:

- [JWTStrategy](./jwt.md) in `@feathersjs/authentication`
- [LocalStrategy](./local.md) in `@feathersjs/authentication-local`
- [OAuthStrategy](./oauth.md) in `@feathersjs/authentication-oauth`

More details on how to customize existing strategies can be found in their API documentation. This section describes the common methods for all authentication strategies and how a custom authentication strategy can be implemented.

## setName(name)

Will be called with the `name` under which the strategy has been [registered on the authentication service](./service.md#register-name-strategy). Does not have to be implemented.

## setApplication(app)

Will be called with the [Feathers application](../application.md) instance. Does not have to be implemented.

## setAuthentication(service)

Will be called with the [Authentication service](./service.md) this strategy has been registered on. Does not have to be implemented.

## verifyConfiguration()

Synchronously verify the configuration for this strategy and throw an error if e.g. required fields are not set. Does not have to be implemented.

## authenticate(authentication, params)

Authenticate `authentication` data with additional `params`. `authenticate` should throw a `NotAuthenticated` if it failed or return an authentication result object.

## parse(req, res)

Parse a given plain Node HTTP request and response and return `null` or the authentication information it provides. Does not have to be implemented.

This is called by the authentication service. See [AuthService.parse](https://dove.feathersjs.com/api/authentication/service.html#parse-req-res-strategies)

## AuthenticationBaseStrategy

The `AuthenticationBaseStrategy` class provides a base class that already implements some of the strategy methods below with some common functionality:

- [setName](#setname-name) sets `this.name`
- [setApplication](#setapplication-app) sets `this.app`
- [setAuthentication](#setauthentication-service) sets `this.authentication`
- `configuration` getter returns `this.authentication.configuration[this.name]`
- `entityService` getter returns the entity (usually `/users`) service from `this.app`

## Examples

Examples for authentication strategies can be found in the [Cookbook](../../cookbook/):

- [Anonymous strategy](../../cookbook/authentication/anonymous.md)
